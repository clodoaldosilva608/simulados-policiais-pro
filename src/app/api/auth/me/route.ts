import { NextRequest, NextResponse } from 'next/server'
import { storageReady, upsertUser } from '@/lib/blob-registry'
import { accessOf, validateUserSession } from '@/lib/user-auth'
import { planLimitsFor } from '@/lib/content'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/auth/me — sessão atual + status de acesso + limites do plano.
 * Também funciona como HEARTBEAT (atualiza lastSeen no registro central).
 *
 * Códigos:
 *  200 {authenticated:true, access, planLimits} — tudo ok neste aparelho
 *  401 {reason:'auth'}   — sem sessão / expirada
 *  401 {reason:'device'} — conta em uso em OUTRO aparelho (um por vez)
 *  403 {reason:'banned'|'revoked'}
 */
export async function GET(req: NextRequest) {
  if (!storageReady()) {
    return NextResponse.json({ ok: false, reason: 'auth' }, { status: 401 })
  }

  const check = await validateUserSession(req)

  if (!check.ok) {
    const messages: Record<string, string> = {
      auth: 'Sessão encerrada. Entre na sua conta.',
      device: 'Esta conta está sendo usada em outro aparelho. Entre novamente aqui para transferir o acesso.',
      banned: 'Esta conta está bloqueada. Fale com o suporte.',
      revoked: 'O acesso desta conta foi revogado. Fale com o suporte.',
    }
    const status = check.reason === 'banned' || check.reason === 'revoked' ? 403 : 401
    return NextResponse.json(
      { ok: false, reason: check.reason, message: messages[check.reason ?? 'auth'] },
      { status },
    )
  }

  const user = check.user!
  try {
    await upsertUser(user.id, {}, { serverAction: true }) // heartbeat (lastSeen)
  } catch {
    /* heartbeat não deve quebrar a leitura */
  }

  const access = accessOf(user)
  // LIMITES DO PLANO: assinante/teste = ilimitado; grátis = config dinâmica
  // (editável no painel admin) ou plano customizado atribuído à conta.
  const premium = access.status === 'active' || access.status === 'trial'
  const limits = premium ? null : await planLimitsFor(user.customPlanId)

  return NextResponse.json({
    ok: true,
    authenticated: true,
    user: {
      name: user.name,
      email: user.email,
      photo: user.photo,
      createdAt: user.createdAt,
      device: user.device,
      platform: user.platform,
    },
    access,
    planLimits: limits
      ? {
          simuladosPerMonth: limits.freeSimuladosPerMonth,
          questionsPerDay: limits.freeQuestionsPerDay,
          comments: limits.freeComments,
          planName: limits.planName,
        }
      : null,
  })
}
