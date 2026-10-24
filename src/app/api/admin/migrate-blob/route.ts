import { NextRequest, NextResponse } from 'next/server'
import { adminFromRequest } from '@/lib/admin-auth'
import { writeJson, blobConfigured } from '@/lib/blob-registry'
import { get, list } from '@vercel/blob'

export const runtime = 'nodejs'
export const maxDuration = 60
export const dynamic = 'force-dynamic'

/**
 * MIGRAÇÃO BLOB → BACKEND ATIVO (Postgres).
 *
 * Cenário: a store Blob `simulados-registry` foi suspensa por cota e o app
 * migrou para Postgres. Quando a Blob reativar (reset do ciclo ou upgrade),
 * este endpoint traz de volta os dados antigos — lendo a Blob DIRETAMENTE
 * (sem passar pelas primitivas do registry, que hoje apontam para o Postgres):
 *
 *   • users/*.json            → gravação fiel por id (dado antigo é autoridade
 *                               para os usuários que existem lá; usuários novos
 *                               criados no Postgres permanecem intactos)
 *   • events/*.json           → por id (idempotente)
 *   • config/access-codes.json→ UNIÃO dos códigos (antigos + novos)
 *   • content/questions.json  → mesclagem por id (versão da Blob vence; novas
 *                               da Blob entram; atuais do Postgres permanecem)
 *   • materials/popups/plans/app-config → copiados apenas se ausentes/vazios
 *
 * GET  = simulação (dry-run) — mostra o que seria importado, sem escrever.
 * POST = executa a migração.
 */

const OTHER_FILES = [
  'content/materials.json',
  'content/popups.json',
  'index/plans.json',
  'config/app-config.json',
]

/** Leitura BRUTA da Blob (ignora o backend ativo). */
async function blobRead<T>(pathname: string): Promise<T | null> {
  const res = await get(pathname, { access: 'private', useCache: false })
  if (!res) return null
  const text = await blobStreamToText(res.stream)
  try {
    return JSON.parse(text) as T
  } catch {
    return null
  }
}

async function blobStreamToText(stream: unknown): Promise<string> {
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

/** Lista caminhos sob um prefixo, direto na Blob. */
async function blobListPaths(prefix: string, cap = 3000): Promise<string[]> {
  const paths: string[] = []
  let cursor: string | undefined
  do {
    const page = await list({ prefix, cursor, limit: 1000 })
    for (const b of page.blobs) paths.push(b.pathname)
    cursor = page.hasMore ? page.cursor : undefined
  } while (cursor && paths.length < cap)
  return paths
}

async function blobCounts(): Promise<{
  reachable: boolean
  reason?: string
  users: number
  events: number
  codes: number
  questions: number
}> {
  const out = { reachable: false, reason: undefined as string | undefined, users: 0, events: 0, codes: 0, questions: 0 }
  try {
    const [users, events] = await Promise.all([
      blobListPaths('users/'),
      blobListPaths('events/', 1000),
    ])
    out.users = users.length
    out.events = events.length
    const codes = await blobRead<{ codes?: unknown[] }>('config/access-codes.json')
    out.codes = codes?.codes?.length ?? 0
    const qs = await blobRead<{ questions?: unknown[] }>('content/questions.json')
    out.questions = qs?.questions?.length ?? 0
    out.reachable = true
  } catch (err) {
    out.reason = (err as Error)?.message?.slice(0, 200) ?? String(err)
  }
  return out
}

export async function GET(req: NextRequest) {
  if (!adminFromRequest(req)) {
    return NextResponse.json({ ok: false, error: 'nao-autenticado' }, { status: 401 })
  }
  if (!blobConfigured()) {
    return NextResponse.json({ ok: true, reachable: false, reason: 'BLOB_READ_WRITE_TOKEN ausente', users: 0, events: 0, codes: 0, questions: 0 })
  }
  const counts = await blobCounts()
  return NextResponse.json({
    ok: true,
    mode: 'dry-run',
    ...counts,
    dica: counts.reachable
      ? `Blob legível: ${counts.users} usuários, ${counts.events} eventos, ${counts.codes} códigos, ${counts.questions} questões prontos para importar. Clique em "Importar dados da Blob" para executar.`
      : `Blob ainda inacessível (${counts.reason ?? 'indisponível'}). Tente de novo quando a store reativar (reset do ciclo ou upgrade em vercel.com → Storage).`,
  })
}

export async function POST(req: NextRequest) {
  if (!adminFromRequest(req)) {
    return NextResponse.json({ ok: false, error: 'nao-autenticado' }, { status: 401 })
  }
  if (!blobConfigured()) {
    return NextResponse.json({ ok: false, message: 'Token da Blob ausente no servidor.' }, { status: 200 })
  }

  const result = {
    users: 0,
    events: 0,
    codes: 0,
    questionsMerged: 0,
    othersCopied: 0,
  }

  try {
    /* ---------- usuários (gravação fiel) ---------- */
    const userPaths = await blobListPaths('users/')
    for (const p of userPaths) {
      const u = await blobRead<Record<string, unknown>>(p)
      if (u && u.id) {
        await writeJson(p, u)
        result.users++
      }
    }

    /* ---------- eventos ---------- */
    const eventPaths = await blobListPaths('events/', 1000)
    for (const p of eventPaths) {
      const e = await blobRead<Record<string, unknown>>(p)
      if (e && e.id) {
        await writeJson(p, e)
        result.events++
      }
    }

    /* ---------- códigos de acesso (união) ---------- */
    const blobCodes = await blobRead<{ codes?: { code: string; createdAt: number; note?: string }[] }>(
      'config/access-codes.json',
    )
    if (blobCodes?.codes?.length) {
      const current = (await readJsonSafe('config/access-codes.json')) ?? { codes: [] }
      const have = new Set((current.codes ?? []).map((c) => c.code))
      let added = 0
      for (const c of blobCodes.codes) {
        if (c?.code && !have.has(c.code)) {
          current.codes!.push(c)
          have.add(c.code)
          added++
        }
      }
      if (added > 0) await writeJson('config/access-codes.json', current)
      result.codes = added
    }

    /* ---------- questões (mesclagem por id; Blob vence) ---------- */
    const blobQ = await blobRead<{ questions?: Record<string, unknown>[] }>('content/questions.json')
    if (blobQ?.questions?.length) {
      const current = (await readJsonSafe('content/questions.json')) ?? { questions: [] }
      const byId = new Map<string, Record<string, unknown>>()
      for (const q of current.questions ?? []) {
        if (typeof q.id === 'string') byId.set(q.id, q)
      }
      let merged = 0
      for (const q of blobQ.questions) {
        if (typeof q.id !== 'string') continue
        byId.set(q.id, q)
        merged++
      }
      await writeJson('content/questions.json', { questions: Array.from(byId.values()) })
      result.questionsMerged = merged
    }

    /* ---------- demais configs (somente se ausentes/vazias) ---------- */
    for (const path of OTHER_FILES) {
      const local = await readJsonSafe(path)
      const isEmpty =
        !local ||
        (Array.isArray(local) && local.length === 0) ||
        (typeof local === 'object' && Object.keys(local).length === 0)
      if (isEmpty) {
        const remote = await blobRead<Record<string, unknown>>(path)
        if (remote) {
          await writeJson(path, remote)
          result.othersCopied++
        }
      }
    }

    return NextResponse.json({
      ok: true,
      ...result,
      message: `Migração concluída: ${result.users} usuários, ${result.events} eventos, ${result.codes} códigos novos, ${result.questionsMerged} questões mescladas, ${result.othersCopied} configs copiadas.`,
    })
  } catch (err) {
    return NextResponse.json({
      ok: false,
      ...result,
      error: (err as Error)?.message?.slice(0, 300) ?? 'erro na migração',
      message:
        'A Blob continua inacessível (provavelmente ainda suspensa por cota). Tente novamente quando a store reativar.',
    })
  }
}

/** readJson com tipagem simples local (evita importar tipos internos). */
async function readJsonSafe(path: string): Promise<{ codes?: { code: string }[]; questions?: Record<string, unknown>[] } | null> {
  const { readJson } = await import('@/lib/blob-registry')
  return readJson(path)
}
