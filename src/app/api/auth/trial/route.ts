import { NextRequest, NextResponse } from 'next/server'
import { appendEvent, blobConfigured, getUser } from '@/lib/blob-registry'
import { accessOf, rateLimit, startTrialFor, clientIp, validateUserSession } from '@/lib/user-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/auth/trial — inicia o teste grátis de 7 dias da CONTA autenticada.
 * Requisitos: sessão válida NESTE aparelho + aparelho que nunca usou teste.
 */
export async function POST(req: NextRequest) {
  if (!blobConfigured()) {
    return NextResponse.json(
      { ok: false, message: 'Armazenamento de contas não configurado neste ambiente.' },
      { status: 503 },
    )
  }

  const ip = clientIp(req)
  if (!rateLimit(`trial:${ip}`, 10, 60 * 60_000)) {
    return NextResponse.json({ ok: false, message: 'Muitas tentativas. Tente mais tarde.' }, { status: 429 })
  }

  const check = await validateUserSession(req)
  if (!check.ok) {
    const messages: Record<string, string> = {
      auth: 'Entre na sua conta primeiro.',
      device: 'Esta conta está em uso em outro aparelho.',
      banned: 'Conta bloqueada. Fale com o suporte.',
      revoked: 'Acesso revogado. Fale com o suporte.',
    }
    const status = check.reason === 'banned' || check.reason === 'revoked' ? 403 : 401
    return NextResponse.json(
      { ok: false, message: messages[check.reason ?? 'auth'] },
      { status },
    )
  }

  const user = check.user!
  const result = await startTrialFor(user, check.session?.dvc)

  if (!result.ok) {
    const messages: Record<string, string> = {
      aparelho: 'Este aparelho já utilizou o teste grátis. Assine para continuar estudando.',
      bloqueado: 'Não foi possível iniciar o teste nesta conta. Fale com o suporte.',
      assinante: 'Você já tem assinatura ativa.',
    }
    return NextResponse.json(
      { ok: false, reason: result.reason, message: messages[result.reason ?? ''] ?? 'Não foi possível iniciar o teste.' },
      { status: result.reason === 'aparelho' ? 403 : 400 },
    )
  }

  const updated = (await getUser(user.id)) ?? user
  void appendEvent({
    type: 'trial_start',
    email: user.email,
    message: `Teste grátis iniciado por ${user.email}`,
    source: 'app',
  })

  return NextResponse.json({ ok: true, access: accessOf(updated) })
}
