import { createHmac, scryptSync, timingSafeEqual } from 'crypto'
import type { NextRequest } from 'next/server'

/**
 * Autenticação DEDICADA do painel admin (/admin).
 *
 * • Credenciais: ADMIN_USERNAME + ADMIN_PASSWORD_HASH (formato
 *   "scrypt$saltHex$keyHex") — nunca há senha em texto plano no código.
 * • Sessão: token HMAC-SHA256 (payload {u, exp}) assinado com
 *   ADMIN_SESSION_SECRET, entregue em cookie httpOnly com 12h de validade.
 * • Também aceita "Authorization: Bearer <token>" (útil para testes de API).
 *
 * Sem as env vars configuradas, o login admin fica DESATIVADO (falha fechada).
 */

const COOKIE_NAME = 'spp_admin'
export const SESSION_TTL_MS = 12 * 60 * 60 * 1000

interface SessionPayload {
  u: string
  exp: number
}

/* ------------------------------------------------------------------ */
/* Credenciais                                                         */
/* ------------------------------------------------------------------ */

function hashFormatOk(hash: string): boolean {
  // formato: "scrypt:<saltBase64url>:<keyBase64url>" (base64url evita problemas
  // de expansão de "$" em .env e variáveis de ambiente)
  return /^scrypt:[A-Za-z0-9_-]+:[A-Za-z0-9_-]+$/.test(hash)
}

export function adminConfigured(): boolean {
  return Boolean(
    process.env.ADMIN_PASSWORD_HASH &&
      hashFormatOk(process.env.ADMIN_PASSWORD_HASH) &&
      process.env.ADMIN_SESSION_SECRET,
  )
}

export function verifyAdminCredentials(username: string, password: string): boolean {
  if (!adminConfigured()) return false
  const expectedUser = (process.env.ADMIN_USERNAME ?? 'admin').trim().toLowerCase()
  if (username.trim().toLowerCase() !== expectedUser) return false

  const [, saltB64, keyB64] = process.env.ADMIN_PASSWORD_HASH!.split(':')
  try {
    const salt = Buffer.from(saltB64, 'base64url')
    const expected = Buffer.from(keyB64, 'base64url')
    const candidate = scryptSync(password, salt, expected.length)
    return timingSafeEqual(candidate, expected)
  } catch {
    return false
  }
}

/* ------------------------------------------------------------------ */
/* Sessão (token HMAC assinado)                                        */
/* ------------------------------------------------------------------ */

function b64url(input: string | Buffer): string {
  return Buffer.from(input).toString('base64url')
}

export function createSessionToken(username: string): string {
  const payload: SessionPayload = {
    u: username,
    exp: Date.now() + SESSION_TTL_MS,
  }
  const body = b64url(JSON.stringify(payload))
  const sig = createHmac('sha256', process.env.ADMIN_SESSION_SECRET!).update(body).digest('base64url')
  return `${body}.${sig}`
}

export function verifySessionToken(token: string | undefined | null): { username: string } | null {
  if (!token || !process.env.ADMIN_SESSION_SECRET) return null
  const [body, sig] = token.split('.')
  if (!body || !sig) return null
  const expected = createHmac('sha256', process.env.ADMIN_SESSION_SECRET).update(body).digest('base64url')
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString()) as SessionPayload
    if (!payload?.exp || Date.now() > payload.exp) return null
    return { username: payload.u }
  } catch {
    return null
  }
}

/* ------------------------------------------------------------------ */
/* Extração da sessão na requisição                                    */
/* ------------------------------------------------------------------ */

export function adminFromRequest(req: NextRequest): { username: string } | null {
  const bearer = req.headers.get('authorization')
  if (bearer?.startsWith('Bearer ')) {
    const session = verifySessionToken(bearer.slice(7).trim())
    if (session) return session
  }
  return verifySessionToken(req.cookies.get(COOKIE_NAME)?.value)
}

export function sessionCookieHeader(token: string): string {
  return [
    `${COOKIE_NAME}=${token}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    `Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`,
  ].join('; ')
}

export function clearCookieHeader(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`
}

/* ------------------------------------------------------------------ */
/* Rate limit simples de login (por IP, em memória da instância)       */
/* ------------------------------------------------------------------ */

const attempts = new Map<string, { count: number; resetAt: number }>()
const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 8

export function loginRateLimit(ip: string): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now()
  const entry = attempts.get(ip)
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true, retryAfterSec: 0 }
  }
  entry.count += 1
  if (entry.count > MAX_ATTEMPTS) {
    return { allowed: false, retryAfterSec: Math.ceil((entry.resetAt - now) / 1000) }
  }
  return { allowed: true, retryAfterSec: 0 }
}

export function resetRateLimit(ip: string): void {
  attempts.delete(ip)
}
