import { NextResponse, NextRequest } from 'next/server'
import {
  adminConfigured,
  createSessionToken,
  loginRateLimit,
  resetRateLimit,
  sessionCookieHeader,
  verifyAdminCredentials,
} from '@/lib/admin-auth'
import { appendEvent, blobConfigured } from '@/lib/blob-registry'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Login dedicado do painel admin (/admin) — sessão própria, 12h, httpOnly. */
export async function POST(req: NextRequest) {
  if (!adminConfigured()) {
    return NextResponse.json(
      { ok: false, message: 'Autenticação do admin não configurada no servidor (env ADMIN_*).' },
      { status: 503 },
    )
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
  const { allowed, retryAfterSec } = loginRateLimit(ip)
  if (!allowed) {
    return NextResponse.json(
      { ok: false, message: `Muitas tentativas. Tente novamente em ${Math.ceil(retryAfterSec / 60)} min.` },
      { status: 429 },
    )
  }

  let body: { username?: unknown; password?: unknown }
  try {
    body = (await req.json()) as typeof body
  } catch {
    return NextResponse.json({ ok: false, message: 'Requisição inválida' }, { status: 400 })
  }

  const username = typeof body.username === 'string' ? body.username : ''
  const password = typeof body.password === 'string' ? body.password : ''

  if (!verifyAdminCredentials(username, password)) {
    return NextResponse.json(
      { ok: false, message: 'Usuário ou senha incorretos.' },
      { status: 401 },
    )
  }

  resetRateLimit(ip)
  if (blobConfigured()) {
    void appendEvent({ type: 'admin_login', message: 'Login no painel administrativo' })
  }

  const token = createSessionToken(username)
  return NextResponse.json(
    { ok: true, username },
    { headers: { 'Set-Cookie': sessionCookieHeader(token) } },
  )
}
