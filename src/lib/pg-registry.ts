/**
 * BACKEND POSTGRES (Supabase) para o registro central — contorno à store
 * Blob suspensa por cota (out/2026).
 *
 * Document-store mínimo sobre uma tabela JSONB:
 *   registry_docs(path TEXT PRIMARY KEY, value JSONB, updated_at TIMESTAMPTZ)
 *
 * Mantém a MESMA semântica de caminhos do Blob ("users/{id}.json",
 * "config/access-codes.json", ...), então `blob-registry.ts` troca de
 * backend apenas escolhendo as primitivas daqui quando uma URL Postgres
 * está configurada (POSTGRES_URL | POSTGRES_PRISMA_URL | DATABASE_URL).
 *
 * A tabela é criada on-demand (idempotente) — sem migração manual.
 */
import { Pool, type PoolClient } from 'pg'

let pool: Pool | null = null
let ensurePromise: Promise<void> | null = null

export function pgUrl(): string | null {
  return (
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.DATABASE_URL ||
    null
  )
}

export function pgConfigured(): boolean {
  return Boolean(pgUrl())
}

function getPool(): Pool {
  if (pool) return pool
  const raw = pgUrl() as string
  const isLocal = /localhost|127\.0\.0\.1/.test(raw)
  // Remove sslmode do URL — ele sobrescreve nossa opção ssl explícita e causa
  // "self-signed certificate in certificate chain" com o pooler do Supabase.
  let url = raw
  try {
    const u = new URL(raw)
    u.searchParams.delete('sslmode')
    url = u.toString()
  } catch {
    url = raw.replace(/([?&])sslmode=[^&]*/, '$1')
  }
  pool = new Pool({
    connectionString: url,
    max: 3, // serverless: poucas conexões por instância
    ssl: isLocal ? undefined : { rejectUnauthorized: false },
    connectionTimeoutMillis: 8_000,
    idleTimeoutMillis: 10_000,
    keepAlive: true,
  })
  return pool
}

/** Cria a tabela se não existir (uma vez por instância). */
async function ensureTable(): Promise<void> {
  if (!ensurePromise) {
    ensurePromise = (async () => {
      await getPool().query(`
        CREATE TABLE IF NOT EXISTS registry_docs (
          path TEXT PRIMARY KEY,
          value JSONB NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `)
    })().catch((err) => {
      ensurePromise = null // permite retry na próxima chamada
      throw err
    })
  }
  return ensurePromise
}

export async function pgRead<T>(pathname: string): Promise<T | null> {
  await ensureTable()
  const res = await getPool().query(
    'SELECT value FROM registry_docs WHERE path = $1 LIMIT 1',
    [pathname],
  )
  if (res.rowCount === 0) return null
  return res.rows[0].value as T
}

export async function pgWrite(pathname: string, data: unknown): Promise<void> {
  await ensureTable()
  await getPool().query(
    `INSERT INTO registry_docs (path, value, updated_at)
     VALUES ($1, $2::jsonb, now())
     ON CONFLICT (path) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
    [pathname, JSON.stringify(data)],
  )
}

export async function pgList(prefix: string, cap = 2000): Promise<string[]> {
  await ensureTable()
  const res = await getPool().query(
    'SELECT path FROM registry_docs WHERE path LIKE $1 ORDER BY path LIMIT $2',
    [prefix + '%', cap],
  )
  return res.rows.map((r) => r.path as string)
}

export async function pgDel(pathnames: string | string[]): Promise<void> {
  await ensureTable()
  const arr = Array.isArray(pathnames) ? pathnames : [pathnames]
  if (arr.length === 0) return
  await getPool().query('DELETE FROM registry_docs WHERE path = ANY($1::text[])', [arr])
}

/** Sonda de diagnóstico: conecta, garante tabela, faz roundtrip write/read/del. */
export async function pgDiag(): Promise<{
  ok: boolean
  ops: { op: string; ok: boolean; message: string }[]
}> {
  const ops: { op: string; ok: boolean; message: string }[] = []
  const probe = 'diag/pg-probe.json'
  let client: PoolClient | null = null
  try {
    client = await getPool().connect()
    ops.push({ op: 'connect', ok: true, message: 'Conexão Postgres OK' })
  } catch (err) {
    ops.push({ op: 'connect', ok: false, message: (err as Error)?.message ?? String(err) })
    return { ok: false, ops }
  } finally {
    client?.release()
  }
  try {
    await pgWrite(probe, { ok: 1, at: Date.now() })
    ops.push({ op: 'put', ok: true, message: 'escrita OK' })
    const back = await pgRead<{ ok: number }>(probe)
    ops.push({ op: 'get', ok: back?.ok === 1, message: back?.ok === 1 ? 'leitura OK (roundtrip)' : 'dado não conferiu' })
    await pgDel(probe)
    ops.push({ op: 'del', ok: true, message: 'remoção OK' })
    return { ok: ops.every((o) => o.ok), ops }
  } catch (err) {
    ops.push({ op: 'roundtrip', ok: false, message: (err as Error)?.message ?? String(err) })
    return { ok: false, ops }
  }
}
