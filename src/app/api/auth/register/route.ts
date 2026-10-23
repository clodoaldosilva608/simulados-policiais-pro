import { NextRequest, NextResponse } from 'next/server'
import { appendEvent, blobConfigured, getUser } from '@/lib/blob-registry'
import {
  accessOf,
  clientIp,
  createUserSessionToken,
  rateLimit,
  registerAccount,
  startTrialFor,
  userCookieHeader,
} from '@/lib/user-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const clean = (s: unknown, n: number) =>
  typeof s === 'string' && s.trim() ? s.trim().slice(0, n) : undefined

/**
 * POST /api/auth/register — cria a CONTA (e-mail + senha) e já inicia o
 * teste grátis de 7 dias por padrão (startTrial: false pula o teste).
 * O teste exige conta cadastrada — não existe acesso anônimo.
 */
export async function POST(req: NextRequest) {
  if (!blobConfigured()) {
    return NextResponse.json(
      { ok: false, message: 'Armazenamento de contas não configurado neste ambiente.' },
      { status: 503 },
    )
  }

  const ip = clientIp(req)
  if (!rateLimit(`reg:${ip}`, 10, 15 * 60_000)) {
    return NextResponse.json(
      { ok: false, message: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' },
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
  const wantTrial = body.startTrial !== false

  const result = await registerAccount({
    email,
    password,
    name: clean(body.name, 80),
    deviceUid,
    device: clean(body.device, 60),
    platform: clean(body.platform, 30),
  })

  if (!result.ok) {
    const messages: Record<string, string> = {
      email_invalido: 'Digite um e-mail válido para criar sua conta.',
      senha_curta: 'A senha deve ter pelo menos 6 caracteres.',
      email_em_uso: 'Este e-mail já tem uma conta. Use a aba “Entrar” com sua senha.',
    }
    return NextResponse.json(
      { ok: false, error: result.error, message: messages[result.error] },
      { status: result.error === 'email_em_uso' ? 409 : 400 },
    )
  }

  // Teste grátis de 7 dias vinculado à conta + ao aparelho (1 por aparelho)
  let trial: { started: boolean; reason?: string } = { started: false }
  if (wantTrial && deviceUid) {
    const t = await startTrialFor(result.user, deviceUid)
    trial = t.ok ? { started: true } : { started: false, reason: t.reason }
  }

  const user = (await getUser(result.user.id)) ?? result.user
  const token = createUserSessionToken(user.id, deviceUid ?? 'sem-aparelho')

  void appendEvent({
    type: 'account_created',
    email: user.email,
    message: `Conta criada: ${user.email}${trial.started ? ' (teste grátis iniciado)' : ''}`,
    source: 'app',
  })
  if (trial.started) {
    void appendEvent({
      type: 'trial_start',
      email: user.email,
      message: `Teste grátis iniciado por ${user.email}`,
      source: 'app',
    })
  }

  return NextResponse.json(
    {
      ok: true,
      user: { name: user.name, email: user.email, photo: user.photo, createdAt: user.createdAt },
      access: accessOf(user),
      trial,
    },
    { headers: { 'Set-Cookie': userCookieHeader(token) } },
  )
}
