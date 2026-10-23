import { NextRequest, NextResponse } from 'next/server'
import { adminFromRequest } from '@/lib/admin-auth'
import {
  blobConfigured,
  listUsers,
  readJson,
  writeJson,
} from '@/lib/blob-registry'
import { claimEmailFor } from '@/lib/user-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * BACKUP COMPLETO DO REGISTRO CENTRAL (proteção contra perda da store).
 *
 * • GET  — baixa JSON com TODAS as contas (incl. hash de senha), índices de
 *          e-mail/aparelho, códigos de acesso e arquivos de conteúdo
 *          (questões/materiais/pop-ups/planos/config). Guardar offline.
 * • POST — RESTAURA contas a partir de um backup (upsert idempotente por id;
 *          recria o índice de e-mail). Nunca apaga dados existentes.
 *
 * Requer sessão de admin. O download contém hashes scrypt — NÃO compartilhar.
 */

interface BackupPayload {
  version: 1
  generatedAt: number
  users: unknown[]
  emailIndex: Record<string, string>
  deviceTrials: Record<string, string>
  accessCodes: string[]
  content: Record<string, unknown>
}

const EMAIL_INDEX = 'index/auth-emails.json'
const DEVICE_TRIALS = 'index/device-trials.json'
const CONTENT_PATHS: [string, string][] = [
  ['questions', 'index/questions.json'],
  ['materials', 'index/materials.json'],
  ['popups', 'index/popups.json'],
  ['plans', 'index/plans.json'],
  ['appConfig', 'index/app-config.json'],
]

export async function GET(req: NextRequest) {
  if (!adminFromRequest(req)) {
    return NextResponse.json({ ok: false, error: 'nao-autenticado' }, { status: 401 })
  }
  if (!blobConfigured()) {
    return NextResponse.json({ ok: false, error: 'armazenamento-nao-configurado' }, { status: 503 })
  }

  const users = await listUsers()
  const emailIndex = (await readJson<Record<string, string>>(EMAIL_INDEX)) ?? {}
  const deviceTrials = (await readJson<Record<string, string>>(DEVICE_TRIALS)) ?? {}
  const accessCodesRaw = await readJson<{ codes?: { code: string }[] }>('config/access-codes.json')
  const accessCodes = accessCodesRaw?.codes?.map((c) => c.code) ?? []
  const content: Record<string, unknown> = {}
  for (const [key, path] of CONTENT_PATHS) {
    const data = await readJson<unknown>(path)
    if (data) content[key] = data
  }

  const payload: BackupPayload = {
    version: 1,
    generatedAt: Date.now(),
    users,
    emailIndex,
    deviceTrials,
    accessCodes,
    content,
  }

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="spp-backup-${new Date()
        .toISOString()
        .slice(0, 10)}.json"`,
    },
  })
}

export async function POST(req: NextRequest) {
  if (!adminFromRequest(req)) {
    return NextResponse.json({ ok: false, error: 'nao-autenticado' }, { status: 401 })
  }
  if (!blobConfigured()) {
    return NextResponse.json({ ok: false, error: 'armazenamento-nao-configurado' }, { status: 503 })
  }

  let body: Partial<BackupPayload>
  try {
    body = (await req.json()) as Partial<BackupPayload>
  } catch {
    return NextResponse.json({ ok: false, error: 'json-invalido' }, { status: 400 })
  }

  const users = Array.isArray(body.users) ? body.users : []
  let restored = 0
  const errors: string[] = []

  for (const raw of users) {
    const u = raw as { id?: string; email?: string; authEmail?: string; passwordHash?: string }
    if (!u?.id || !u.passwordHash) {
      if (errors.length < 5) errors.push('registro sem id/passwordHash ignorado')
      continue
    }
    try {
      const { email, authEmail, ...rest } = u as Record<string, unknown> & {
        id: string
        email?: string
        authEmail?: string
      }
      await writeJson(`users/${String(u.id).replace(/[^a-zA-Z0-9_-]/g, '')}.json`, {
        ...rest,
        id: u.id,
        email,
        authEmail: authEmail ?? email,
      })
      if (typeof email === 'string' && email) {
        await claimEmailFor(email, u.id)
      }
      restored++
    } catch (err) {
      if (errors.length < 5) errors.push(`falha ao restaurar ${u.email ?? u.id}`)
      void err
    }
  }

  return NextResponse.json({ ok: true, restored, errors })
}
