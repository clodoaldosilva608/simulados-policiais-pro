import { put, get, list, del } from '@vercel/blob'

/**
 * Registro central de usuários — armazenamento em Vercel Blob.
 *
 * Cada usuário é um arquivo JSON `users/{id}.json` (id = UUID v4, caminho
 * não-adivinhável). Eventos de compra/ativação ficam em `events/{id}.json`
 * (limitados a MAX_EVENTS) e os códigos de acesso gerenciados pelo admin
 * em `config/access-codes.json`.
 *
 * O token BLOB_READ_WRITE_TOKEN fica 100% no servidor — nunca no cliente.
 */

export type UserStatus = 'trial' | 'active' | 'expired' | 'canceled'

export interface RegistryUser {
  id: string
  name?: string
  email?: string
  /** e-mail da compra ou código usado na ativação */
  ident?: string
  status: UserStatus
  source?: 'trial' | 'cakto_email' | 'cakto_webhook' | 'code' | 'admin' | 'sync'
  trialStartedAt?: number
  trialExtendedDays?: number
  activatedAt?: number
  canceledAt?: number
  /** acesso concedido manualmente pelo admin (não depende da Cakto) */
  adminGrant?: boolean
  /** acesso manual já revogado pelo admin — cliente não pode reativar */
  adminRevoked?: boolean
  banned?: boolean
  notes?: string
  device?: string
  platform?: string
  /* ---------- conta autenticada (e-mail + senha) ---------- */
  /** e-mail de LOGIN normalizado (índice único) — igual ao campo email */
  authEmail?: string
  /** hash scrypt (formato "scrypt:<saltB64url>:<keyB64url>") — nunca em texto plano */
  passwordHash?: string
  /** foto de perfil (data URL JPEG/PNG redimensionada no cliente, ≤ ~160 KB) */
  photo?: string
  /** aparelho ÚNICO atualmente vinculado (deviceUid) — um dispositivo por vez */
  activeDevice?: string
  /** quando o vínculo de aparelho foi definido */
  activeDeviceAt?: number
  /** timestamps (ms) dos simulados gerados no MÊS corrente — cota do plano grátis (podada na escrita) */
  genLog?: number[]
  /** plano customizado atribuído pelo admin (id em index/plans.json) */
  customPlanId?: string
  createdAt: number
  updatedAt: number
  lastSeen: number
}

export interface RegistryEvent {
  id: string
  type: string
  at: number
  email?: string
  message?: string
  source?: string
}

const PREFIX_USERS = 'users/'
const PREFIX_EVENTS = 'events/'
const CODES_PATH = 'config/access-codes.json'
const MAX_EVENTS = 250

export function blobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN)
}

/* ------------------------------------------------------------------ */
/* Primitivas JSON sobre o Blob                                        */
/* ------------------------------------------------------------------ */

export async function readJson<T>(pathname: string): Promise<T | null> {
  try {
    // SDK v2: get() retorna { stream, blob (metadados), headers }
    const { stream } = await get(pathname, { access: 'private', useCache: false })
    const text = await streamToText(stream)
    return JSON.parse(text) as T
  } catch (err) {
    console.error('[blob-registry] readJson falhou:', pathname, err)
    return null
  }
}

async function streamToText(stream: unknown): Promise<string> {
  const s = stream as { getReader?: () => { read: () => Promise<{ done: boolean; value?: unknown }> } }
  if (s?.getReader) {
    const reader = s.getReader()
    const chunks: Buffer[] = []
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(Buffer.from(value as ArrayBufferLike))
    }
    return Buffer.concat(chunks).toString()
  }
  const chunks: Buffer[] = []
  for await (const c of stream as AsyncIterable<unknown>) chunks.push(Buffer.from(c as ArrayBufferLike))
  return Buffer.concat(chunks).toString()
}

export async function writeJson(pathname: string, data: unknown): Promise<void> {
  await put(pathname, JSON.stringify(data), {
    access: 'private',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  })
}

async function listAll(prefix: string, cap = 2000): Promise<string[]> {
  const paths: string[] = []
  let cursor: string | undefined
  try {
    do {
      const page = await list({ prefix, cursor, limit: 1000 })
      for (const b of page.blobs) paths.push(b.pathname)
      cursor = page.hasMore ? page.cursor : undefined
    } while (cursor && paths.length < cap)
  } catch {
    return paths
  }
  return paths
}

/* ------------------------------------------------------------------ */
/* Usuários                                                            */
/* ------------------------------------------------------------------ */

export function userPath(id: string): string {
  return PREFIX_USERS + id.replace(/[^a-zA-Z0-9_-]/g, '') + '.json'
}

export async function getUser(id: string): Promise<RegistryUser | null> {
  return readJson<RegistryUser>(userPath(id))
}

export async function listUsers(): Promise<RegistryUser[]> {
  const paths = await listAll(PREFIX_USERS)
  const users: RegistryUser[] = []
  for (const p of paths) {
    const u = await readJson<RegistryUser>(p)
    if (u && u.id) users.push(u)
  }
  return users.sort((a, b) => (b.lastSeen || b.updatedAt) - (a.lastSeen || a.updatedAt))
}

export async function findUserByEmail(email: string): Promise<RegistryUser | null> {
  const norm = email.trim().toLowerCase()
  if (!norm) return null
  const users = await listUsers()
  return users.find((u) => (u.email ?? '').trim().toLowerCase() === norm) ?? null
}

export type UserPatch = Partial<Omit<RegistryUser, 'id' | 'createdAt' | 'updatedAt' | 'lastSeen'>>

/**
 * Cria ou mescla um usuário.
 *
 * • Chamadas do CLIENTE (opts.serverAction !== true): restritas — não podem
 *   reativar acesso revogado, desbloquear, derrubar assinante ativo ou
 *   alterar campos administrativos (o patch do cliente nem contém tais campos,
 *   validado nas rotas).
 * • Chamadas do SERVIDOR (admin/webhook/sync): confiáveis — o patch é aplicado
 *   integralmente.
 */
export async function upsertUser(
  id: string,
  patch: UserPatch,
  opts: { heartbeat?: boolean; serverAction?: boolean } = {},
): Promise<RegistryUser> {
  const now = Date.now()
  const existing = await getUser(id)
  const next: RegistryUser = existing
    ? { ...existing, ...patch }
    : {
        id,
        status: 'trial',
        createdAt: now,
        updatedAt: now,
        lastSeen: now,
        ...patch,
      }

  if (existing) {
    // mesclas seguras: e-mail/ident/nome preenchem vazio
    if (!next.email && existing.email) next.email = existing.email
    if (!next.ident && existing.ident) next.ident = existing.ident
    if (!next.name && existing.name) next.name = existing.name

    if (opts.serverAction) {
      // servidor (admin/webhook/sync): patch confiável
      if (patch.status === 'active' && !next.banned) {
        next.status = 'active'
        if (patch.activatedAt) next.activatedAt = patch.activatedAt
        if (patch.source) next.source = patch.source
      }
    } else {
      // cliente: restrições de proteção
      const revogado = existing.adminRevoked || existing.banned
      if (existing.status === 'active' && next.status && next.status !== 'active') {
        // cliente não derruba um assinante ativo
        next.status = 'active'
      } else if (revogado && next.status === 'active') {
        // cliente não reativa acesso revogado/bloqueado
        next.status = 'expired'
      } else if (next.status === 'active' && !next.banned) {
        if (patch.activatedAt) next.activatedAt = patch.activatedAt
        if (patch.source) next.source = patch.source
      }
    }
  }

  next.updatedAt = now
  if (opts.heartbeat !== false) next.lastSeen = now

  await writeJson(userPath(next.id), next)
  return next
}

export async function deleteUser(id: string): Promise<void> {
  try {
    await del(userPath(id))
  } catch {
    /* já removido */
  }
}

/* ------------------------------------------------------------------ */
/* Eventos (compras, ativações, ações do admin)                        */
/* ------------------------------------------------------------------ */

function eventPath(id: string): string {
  return PREFIX_EVENTS + id.replace(/[^a-zA-Z0-9_-]/g, '') + '.json'
}

export async function appendEvent(
  evt: Omit<RegistryEvent, 'id' | 'at'> & { at?: number },
): Promise<void> {
  const full: RegistryEvent = { id: crypto.randomUUID(), at: evt.at ?? Date.now(), ...evt }
  try {
    await writeJson(eventPath(full.id), full)
    // poda simples: mantém apenas os MAX_EVENTS mais recentes
    const paths = await listAll(PREFIX_EVENTS)
    if (paths.length > MAX_EVENTS) {
      const all = await Promise.all(paths.map((p) => readJson<RegistryEvent>(p)))
      const sorted = all
        .filter((e): e is RegistryEvent => Boolean(e && e.id))
        .sort((a, b) => b.at - a.at)
      const toDelete = sorted.slice(MAX_EVENTS)
      if (toDelete.length > 0) {
        await del(toDelete.map((e) => eventPath(e.id))).catch(() => {})
      }
    }
  } catch {
    /* eventos nunca devem quebrar o fluxo principal */
  }
}

export async function listEvents(limit = 120): Promise<RegistryEvent[]> {
  const paths = await listAll(PREFIX_EVENTS)
  const events: RegistryEvent[] = []
  for (const p of paths) {
    const e = await readJson<RegistryEvent>(p)
    if (e && e.id) events.push(e)
  }
  return events.sort((a, b) => b.at - a.at).slice(0, limit)
}

/* ------------------------------------------------------------------ */
/* Códigos de acesso gerenciados pelo admin                            */
/* ------------------------------------------------------------------ */

interface CodesFile {
  codes: { code: string; createdAt: number; note?: string }[]
}

export async function getAccessCodes(): Promise<string[]> {
  const file = await readJson<CodesFile>(CODES_PATH)
  return file?.codes?.map((c) => c.code.toUpperCase()) ?? []
}

export async function addAccessCode(code: string, note?: string): Promise<void> {
  const clean = code.trim().toUpperCase()
  if (!clean) return
  const file = (await readJson<CodesFile>(CODES_PATH)) ?? { codes: [] }
  if (!file.codes.some((c) => c.code === clean)) {
    file.codes.push({ code: clean, createdAt: Date.now(), note })
    await writeJson(CODES_PATH, file)
  }
}

export async function removeAccessCode(code: string): Promise<void> {
  const clean = code.trim().toUpperCase()
  const file = (await readJson<CodesFile>(CODES_PATH)) ?? { codes: [] }
  const next = file.codes.filter((c) => c.code !== clean)
  if (next.length !== file.codes.length) {
    await writeJson(CODES_PATH, { codes: next })
  }
}

export function generateAccessCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const block = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `SPP-${block()}-${block()}-${block()}`
}
