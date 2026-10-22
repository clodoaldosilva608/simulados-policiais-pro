import { NextResponse, NextRequest } from 'next/server'
import { blobConfigured, upsertUser, type UserStatus } from '@/lib/blob-registry'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Registro central de usuários (público, chamado pelo app).
 * Recebe o estado da licença local do usuário (trial/ativa) e mescla no
 * registro do servidor. Campos administrativos NUNCA são aceitos aqui
 * (banned/adminGrant/notes são preservados pelo upsert).
 */

const clean = (s: unknown, n: number) =>
  typeof s === 'string' && s.trim() ? s.trim().slice(0, n) : undefined

const num = (v: unknown): number | undefined => {
  const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : NaN
  return Number.isFinite(n) && n > 0 && n < 4102444800000 ? Math.floor(n) : undefined
}

const emailOk = (e?: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e ?? '')

/** rate limit simples por IP (memória da instância) */
const hits = new Map<string, { n: number; reset: number }>()

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const e = hits.get(ip)
  if (!e || now > e.reset) {
    hits.set(ip, { n: 1, reset: now + 60_000 })
    return false
  }
  e.n += 1
  return e.n > 60
}

export async function POST(req: NextRequest) {
  if (!blobConfigured()) {
    return NextResponse.json({ ok: true, stored: false })
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false }, { status: 429 })
  }

  let body: Record<string, unknown>
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const uid = clean(body.uid, 64)
  if (!uid || !/^[a-zA-Z0-9_-]{8,64}$/.test(uid)) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const emailRaw = clean(body.email, 120)?.toLowerCase()
  const status = clean(body.status, 20) as UserStatus | undefined
  const statusOk: UserStatus | undefined =
    status && ['trial', 'active', 'expired', 'canceled'].includes(status) ? status : undefined

  // fontes aceitas do cliente (spoofing de 'sync'/'cakto_webhook'/'admin' é recusado)
  const sourceRaw = clean(body.source, 30)
  const sourceOk =
    sourceRaw && ['trial', 'cakto_email', 'code'].includes(sourceRaw) ? sourceRaw : undefined

  const patch: Parameters<typeof upsertUser>[1] = {
    email: emailOk(emailRaw) ? emailRaw : undefined,
    name: clean(body.name, 80),
    ident: clean(body.ident, 160),
    status: statusOk,
    source: sourceOk,
    trialStartedAt: num(body.trialStartedAt),
    activatedAt: num(body.activatedAt),
    device: clean(body.device, 60),
    platform: clean(body.platform, 30),
  }

  try {
    const user = await upsertUser(uid, patch)
    return NextResponse.json({ ok: true, stored: true, status: user.status })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
