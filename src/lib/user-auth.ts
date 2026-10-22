import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto'
import type { NextRequest } from 'next/server'
import {
  findUserByEmail,
  getUser,
  listUsers,
  readJson,
  upsertUser,
  writeJson,
  type RegistryUser,
} from '@/lib/blob-registry'
import { SITE } from '@/config/site'

/**
 * Contas autenticadas do app (alunos) — e-mail + senha com vínculo de
 * DISPOSITIVO ÚNICO (um aparelho por vez).
 *
 * • Contas vivem no MESMO registro central do painel admin (users/{id}.json),
 *   com campos novos: authEmail, passwordHash, activeDevice.
 * • Índice e-mail → id em `index/auth-emails.json` (login O(1) + e-mail único).
 * • Índice anti-fraude `index/device-trials.json`: cada APARELHO só pode usar
 *   o teste grátis uma única vez (impossível criar contas infinitas p/ testar).
 * • Sessão: token HMAC-SHA256 {uid, dvc, exp} em cookie httpOnly (30 dias).
 *   O token carrega o deviceUid do login; se a conta for acessada em outro
 *   aparelho, o antigo deixa de validar (409/device) — um por vez.
 * • Senhas com scrypt (salt aleatório por conta), comparação timingSafe.
 */

const EMAIL_INDEX = 'index/auth-emails.json'
const DEVICE_TRIALS = 'index/device-trials.json'

export const USER_COOKIE = 'spp_user'
export const USER_SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 dias

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/* ------------------------------------------------------------------ */
/* Senhas (scrypt)                                                     */
/* ------------------------------------------------------------------ */

export function hashPassword(password: string): string {
  const salt = randomBytes(16)
  const key = scryptSync(password, salt, 32)
  return `scrypt:${salt.toString('base64url')}:${key.toString('base64url')}`
}

export function verifyPassword(password: string, hash: string): boolean {
  const m = /^scrypt:([A-Za-z0-9_-]+):([A-Za-z0-9_-]+)$/.exec(hash)
  if (!m) return false
  try {
    const salt = Buffer.from(m[1], 'base64url')
    const expected = Buffer.from(m[2], 'base64url')
    const candidate = scryptSync(password, salt, expected.length)
    return timingSafeEqual(candidate, expected)
  } catch {
    return false
  }
}

/* ------------------------------------------------------------------ */
/* Sessão (HMAC, cookie httpOnly)                                      */
/* ------------------------------------------------------------------ */

interface UserSessionPayload {
  uid: string
  /** deviceUid vinculado no login */
  dvc: string
  exp: number
}

function sessionSecret(): string | undefined {
  return process.env.USER_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET || undefined
}

function b64url(input: string | Buffer): string {
  return Buffer.from(input).toString('base64url')
}

export function createUserSessionToken(uid: string, deviceUid: string): string {
  const payload: UserSessionPayload = { uid, dvc: deviceUid, exp: Date.now() + USER_SESSION_TTL_MS }
  const body = b64url(JSON.stringify(payload))
  const sig = createHmac('sha256', sessionSecret()!).update(body).digest('base64url')
  return `${body}.${sig}`
}

export function verifyUserSessionToken(token: string | undefined | null): UserSessionPayload | null {
  const secret = sessionSecret()
  if (!token || !secret) return null
  const [body, sig] = token.split('.')
  if (!body || !sig) return null
  const expected = createHmac('sha256', secret).update(body).digest('base64url')
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString()) as UserSessionPayload
    if (!payload?.uid || !payload?.dvc || !payload?.exp || Date.now() > payload.exp) return null
    return payload
  } catch {
    return null
  }
}

export function userSessionFromRequest(req: NextRequest): UserSessionPayload | null {
  const bearer = req.headers.get('authorization')
  if (bearer?.startsWith('Bearer ')) {
    const session = verifyUserSessionToken(bearer.slice(7).trim())
    if (session) return session
  }
  return verifyUserSessionToken(req.cookies.get(USER_COOKIE)?.value)
}

export function userCookieHeader(token: string): string {
  return [
    `${USER_COOKIE}=${token}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    `Max-Age=${Math.floor(USER_SESSION_TTL_MS / 1000)}`,
  ].join('; ')
}

export function clearUserCookieHeader(): string {
  return `${USER_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`
}

/* ------------------------------------------------------------------ */
/* Validação de sessão + status de acesso                              */
/* ------------------------------------------------------------------ */

export type SessionReject = 'auth' | 'device' | 'banned' | 'revoked'

export interface SessionCheck {
  ok: boolean
  reason?: SessionReject
  user?: RegistryUser
  session?: UserSessionPayload
}

export function accessOf(user: RegistryUser): {
  status: 'active' | 'trial' | 'expired' | 'canceled'
  trialDaysLeft: number | null
} {
  if (user.adminGrant || user.status === 'active') return { status: 'active', trialDaysLeft: null }
  if (user.status === 'trial' && user.trialStartedAt) {
    const end = user.trialStartedAt + (user.trialExtendedDays ?? 0) * 86400000 + SITE.trialDays * 86400000
    if (Date.now() < end) {
      const left = Math.max(0, Math.ceil((end - Date.now()) / 86400000))
      return { status: 'trial', trialDaysLeft: left }
    }
    return { status: 'expired', trialDaysLeft: 0 }
  }
  return { status: user.status === 'canceled' ? 'canceled' : 'expired', trialDaysLeft: null }
}

export async function validateUserSession(req: NextRequest): Promise<SessionCheck> {
  const session = userSessionFromRequest(req)
  if (!session) return { ok: false, reason: 'auth' }
  const user = await getUser(session.uid)
  if (!user || !user.passwordHash) return { ok: false, reason: 'auth' }
  if (user.banned) return { ok: false, reason: 'banned', user }
  if (user.adminRevoked) return { ok: false, reason: 'revoked', user }
  // REGRA DE OURO: um único aparelho por vez
  if (user.activeDevice && user.activeDevice !== session.dvc) {
    return { ok: false, reason: 'device', user, session }
  }
  return { ok: true, user, session }
}

/* ------------------------------------------------------------------ */
/* Índices (e-mail único / teste grátis por aparelho)                  */
/* ------------------------------------------------------------------ */

type EmailIndex = Record<string, string>
type DeviceTrials = Record<string, string>

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function emailValid(email: string): boolean {
  return EMAIL_RE.test(normalizeEmail(email))
}

async function readIndex<T>(path: string): Promise<T> {
  return (await readJson<T>(path)) ?? ({} as T)
}

async function findAccountIdByEmail(email: string): Promise<string | null> {
  const norm = normalizeEmail(email)
  if (!norm) return null
  const idx = await readIndex<EmailIndex>(EMAIL_INDEX)
  if (idx[norm]) return idx[norm]
  // fallback (migração): varre usuários legados criados antes das contas
  const legacy = await findUserByEmail(norm)
  return legacy?.id ?? null
}

async function claimEmail(email: string, id: string): Promise<void> {
  const norm = normalizeEmail(email)
  const idx = await readIndex<EmailIndex>(EMAIL_INDEX)
  if (idx[norm] && idx[norm] !== id) return // já reivindicado por outra conta
  idx[norm] = id
  await writeJson(EMAIL_INDEX, idx)
}

export async function deviceHasTrial(deviceUid: string): Promise<boolean> {
  const trials = await readIndex<DeviceTrials>(DEVICE_TRIALS)
  return Boolean(trials[deviceUid])
}

async function markDeviceTrial(deviceUid: string, userId: string): Promise<void> {
  const trials = await readIndex<DeviceTrials>(DEVICE_TRIALS)
  if (trials[deviceUid]) return
  trials[deviceUid] = userId
  await writeJson(DEVICE_TRIALS, trials)
}

/* ------------------------------------------------------------------ */
/* Criar conta / autenticar                                            */
/* ------------------------------------------------------------------ */

export type RegisterResult =
  | { ok: true; user: RegistryUser }
  | { ok: false; error: 'email_invalido' | 'senha_curta' | 'email_em_uso' }

export async function registerAccount(opts: {
  email: string
  password: string
  name?: string
  deviceUid?: string
  device?: string
  platform?: string
}): Promise<RegisterResult> {
  const email = normalizeEmail(opts.email)
  if (!EMAIL_RE.test(email)) return { ok: false, error: 'email_invalido' }
  if (!opts.password || opts.password.length < 6) return { ok: false, error: 'senha_curta' }

  const existingId = await findAccountIdByEmail(email)
  if (existingId) {
    const existing = await getUser(existingId)
    if (existing?.passwordHash) return { ok: false, error: 'email_em_uso' }
    // ADOÇÃO: usuário legado (criado antes das contas, ex.: ativação por
    // e-mail Cakto) ganha senha mantendo trial/assinatura/history.
    const patch: Partial<RegistryUser> = {
      email,
      authEmail: email,
      passwordHash: hashPassword(opts.password),
    }
    if (opts.name && !existing?.name) patch.name = opts.name.trim().slice(0, 80)
    if (opts.deviceUid) {
      patch.activeDevice = opts.deviceUid
      patch.activeDeviceAt = Date.now()
    }
    if (opts.device) patch.device = opts.device.slice(0, 60)
    if (opts.platform) patch.platform = opts.platform.slice(0, 30)
    const user = await upsertUser(existingId, patch, { serverAction: true })
    await claimEmail(email, user.id)
    return { ok: true, user }
  }

  const id = crypto.randomUUID()
  const user = await upsertUser(
    id,
    {
      email,
      authEmail: email,
      passwordHash: hashPassword(opts.password),
      name: opts.name?.trim().slice(0, 80) || undefined,
      status: 'trial', // sem trialStartedAt → efetivamente sem acesso até trial/assinatura
      activeDevice: opts.deviceUid,
      activeDeviceAt: opts.deviceUid ? Date.now() : undefined,
      device: opts.device?.slice(0, 60),
      platform: opts.platform?.slice(0, 30),
    },
    { serverAction: true },
  )
  await claimEmail(email, id)
  return { ok: true, user }
}

export async function authenticate(
  email: string,
  password: string,
): Promise<{ ok: true; user: RegistryUser } | { ok: false; error: 'credenciais' }> {
  const id = await findAccountIdByEmail(email)
  if (!id) return { ok: false, error: 'credenciais' }
  const user = await getUser(id)
  if (!user?.passwordHash || !verifyPassword(password, user.passwordHash)) {
    return { ok: false, error: 'credenciais' }
  }
  return { ok: true, user }
}

/** Vincula o aparelho à conta (tomada de posse: um dispositivo por vez) */
export async function bindDevice(
  userId: string,
  deviceUid: string,
  device?: string,
  platform?: string,
): Promise<RegistryUser> {
  return upsertUser(
    userId,
    {
      activeDevice: deviceUid,
      activeDeviceAt: Date.now(),
      device: device?.slice(0, 60),
      platform: platform?.slice(0, 30),
    },
    { serverAction: true },
  )
}

/**
 * Inicia o teste grátis de 7 dias para uma CONTA autenticada.
 * Anti-fraude: um único teste por aparelho e por conta.
 */
export async function startTrialFor(
  user: RegistryUser,
  deviceUid?: string,
): Promise<{ ok: boolean; reason?: 'ativo' | 'aparelho' | 'bloqueado' | 'assinante' }> {
  if (user.banned || user.adminRevoked) return { ok: false, reason: 'bloqueado' }
  if (user.adminGrant || user.status === 'active') return { ok: false, reason: 'assinante' }
  const current = accessOf(user)
  if (current.status === 'trial') return { ok: true } // já em teste
  if (deviceUid && (await deviceHasTrial(deviceUid))) return { ok: false, reason: 'aparelho' }
  await upsertUser(
    user.id,
    { status: 'trial', trialStartedAt: Date.now(), source: 'trial' },
    { serverAction: true },
  )
  if (deviceUid) await markDeviceTrial(deviceUid, user.id)
  return { ok: true }
}

/* ------------------------------------------------------------------ */
/* Rate limits (memória da instância)                                  */
/* ------------------------------------------------------------------ */

const buckets = new Map<string, { n: number; reset: number }>()

export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now()
  const e = buckets.get(key)
  if (!e || now > e.reset) {
    buckets.set(key, { n: 1, reset: now + windowMs })
    return true
  }
  e.n += 1
  return e.n <= max
}

export function clientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
}
