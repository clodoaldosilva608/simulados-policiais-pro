import { NextRequest, NextResponse } from 'next/server'
import { appendEvent, storageReady, deleteUser } from '@/lib/blob-registry'
import { clearUserCookieHeader, purgeEmailRef, rateLimit, validateUserSession } from '@/lib/user-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/auth/delete-account — EXCLUSÃO DA PRÓPRIA CONTA (LGPD).
 *
 * Remove a conta do registro central (nome, e-mail, foto, aparelho, status)
 * e libera o E-MAIL para cadastros futuros. O índice anti-fraude de teste
 * grátis por APARELHO é preservado — excluir a conta não rende um novo teste
 * de 7 dias no mesmo aparelho.
 * O histórico de estudos vive APENAS no aparelho (IndexedDB/localStorage) e
 * é apagado pelo cliente após a confirmação.
 *
 * IMPORTANTE: a exclusão da conta NÃO cancela a cobrança da assinatura
 * (isso é feito na plataforma de pagamento Cakto).
 */
export async function POST(req: NextRequest) {
  if (!storageReady()) {
    return NextResponse.json(
      { ok: false, message: 'Armazenamento de contas não configurado neste ambiente.' },
      { status: 503 },
    )
  }

  const check = await validateUserSession(req)
  if (!check.ok || !check.user) {
    return NextResponse.json({ ok: false, message: 'Sessão encerrada. Entre novamente.' }, { status: 401 })
  }
  const user = check.user

  if (!rateLimit(`del:${user.id}`, 5, 15 * 60_000)) {
    return NextResponse.json({ ok: false, message: 'Muitas tentativas. Aguarde alguns minutos.' }, { status: 429 })
  }

  try {
    await deleteUser(user.id)
  } catch {
    return NextResponse.json(
      { ok: false, message: 'Não foi possível excluir agora. Tente novamente.' },
      { status: 500 },
    )
  }
  // Libera apenas o e-mail (índice) — o aparelho continua marcado como
  // "já usou o teste grátis" (anti-fraude). Best-effort.
  await purgeEmailRef(user.id, user.email ?? user.authEmail)

  void appendEvent({
    type: 'account_deleted',
    email: user.email,
    message: `Conta excluída pelo próprio aluno (LGPD)${user.email ? ` — ${user.email}` : ''}`,
    source: 'app',
  })

  // Resposta com Set-Cookie para encerrar a sessão neste aparelho
  return new NextResponse(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'content-type': 'application/json',
      'set-cookie': clearUserCookieHeader(),
    },
  })
}
