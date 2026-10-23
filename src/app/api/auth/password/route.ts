import { NextRequest, NextResponse } from 'next/server'
import { blobConfigured, upsertUser } from '@/lib/blob-registry'
import { hashPassword, rateLimit, validateUserSession, verifyPassword } from '@/lib/user-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/auth/password — troca a senha da conta logada.
 * Exige a senha atual (segurança) e a nova com no mínimo 6 caracteres.
 */
export async function POST(req: NextRequest) {
  if (!blobConfigured()) {
    return NextResponse.json(
      { ok: false, message: 'Armazenamento de contas não configurado neste ambiente.' },
      { status: 503 },
    )
  }

  const check = await validateUserSession(req)
  if (!check.ok) {
    return NextResponse.json({ ok: false, message: 'Sessão encerrada. Entre novamente.' }, { status: 401 })
  }

  // Rate limit por conta: no máximo 5 tentativas a cada 15 min
  if (!rateLimit(`pwd:${check.user!.id}`, 5, 15 * 60_000)) {
    return NextResponse.json(
      { ok: false, message: 'Muitas tentativas. Aguarde alguns minutos.' },
      { status: 429 },
    )
  }

  let body: Record<string, unknown>
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ ok: false, message: 'Requisição inválida.' }, { status: 400 })
  }

  const current = typeof body.currentPassword === 'string' ? body.currentPassword : ''
  const next = typeof body.newPassword === 'string' ? body.newPassword : ''

  if (!current || !next) {
    return NextResponse.json(
      { ok: false, message: 'Preencha a senha atual e a nova senha.' },
      { status: 400 },
    )
  }
  if (next.length < 6) {
    return NextResponse.json(
      { ok: false, message: 'A nova senha deve ter pelo menos 6 caracteres.' },
      { status: 400 },
    )
  }
  if (next === current) {
    return NextResponse.json(
      { ok: false, message: 'A nova senha precisa ser diferente da atual.' },
      { status: 400 },
    )
  }

  const user = check.user!
  if (!user.passwordHash || !verifyPassword(current, user.passwordHash)) {
    return NextResponse.json({ ok: false, message: 'Senha atual incorreta.' }, { status: 400 })
  }

  try {
    await upsertUser(user.id, { passwordHash: hashPassword(next) }, { serverAction: true })
    return NextResponse.json({ ok: true, message: 'Senha alterada com sucesso!' })
  } catch {
    return NextResponse.json(
      { ok: false, message: 'Não foi possível salvar agora. Tente novamente.' },
      { status: 500 },
    )
  }
}
