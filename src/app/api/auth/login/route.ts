import { NextRequest, NextResponse } from 'next/server'
import { appendEvent, blobConfigured } from '@/lib/blob-registry'
import {
  accessOf,
  authenticate,
  bindDevice,
  clientIp,
  createUserSessionToken,
  rateLimit,
  userCookieHeader,
} from '@/lib/user-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const clean = (s: unknown, n: number) =>
  typeof s === 'string' && s.trim() ? s.trim().slice(0, n) : undefined

/**
 * POST /api/auth/login — autentica e-mail + senha e vincula ESTE aparelho à
 * conta. Se a conta já estava ativa em outro aparelho, o vínculo transfere
 * (um único dispositivo por vez): o aparelho anterior perde a sessão no
 * próximo heartbeat.
 */
export async function POST(req: NextRequest) {
  if (!blobConfigured()) {
    return NextResponse.json(
      { ok: false, message: 'Armazenamento de contas não configurado neste ambiente.' },
      { status: 503 },
    )
  }

  const ip = clientIp(req)
  if (!rateLimit(`login:${ip}`, 8, 15 * 60_000)) {
    return NextResponse.json(
      { ok: false, message: 'Muitas tentativas de login. Aguarde 15 minutos.' },
      { status: 429 },
    )
  }

  let body: Record<string, unknown>
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ ok: false, message: 'Requisição inválida.' }, { status: 400 })
  }

  const email = typeof body.email === 'string' ? body.email : ''
  const password = typeof body.password === 'string' ? body.password : ''
  const deviceUid = clean(body.deviceUid, 64)

  const auth = await authenticate(email, password)
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, message: 'E-mail ou senha incorretos.' },
      { status: 401 },
    )
  }
  const { user } = auth
  if (user.banned) {
    return NextResponse.json(
      { ok: false, message: 'Esta conta está bloqueada. Fale com o suporte.' },
      { status: 403 },
    )
  }
  if (user.adminRevoked) {
    return NextResponse.json(
      { ok: false, message: 'O acesso desta conta foi revogado. Fale com o suporte.' },
      { status: 403 },
    )
  }

  const bound = deviceUid
    ? await bindDevice(user.id, deviceUid, clean(body.device, 60), clean(body.platform, 30))
    : user
  const token = createUserSessionToken(user.id, deviceUid ?? 'sem-aparelho')

  void appendEvent({
    type: 'login',
    email: user.email,
    message: `Login realizado: ${user.email}`,
    source: 'app',
  })

  return NextResponse.json(
    {
      ok: true,
      user: { name: bound.name, email: bound.email, photo: bound.photo, createdAt: bound.createdAt },
      access: accessOf(bound),
    },
    { headers: { 'Set-Cookie': userCookieHeader(token) } },
  )
}
