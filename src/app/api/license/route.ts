import { NextResponse, NextRequest } from 'next/server'
import { appendEvent, blobConfigured, getAccessCodes, getUser, upsertUser } from '@/lib/blob-registry'
import { checkCaktoSubscription, caktoConfigured } from '@/lib/cakto'
import { accessOf, validateUserSession } from '@/lib/user-auth'

export const runtime = 'nodejs'
export const maxDuration = 30

/**
 * Validação de acesso — agora EXIGE CONTA AUTENTICADA (sessão válida neste
 * aparelho). A ativação é vinculada à conta logada:
 *
 * 1. CÓDIGO — env ACCESS_CODES + códigos criados no painel admin (Blob).
 * 2. E-MAIL DA COMPRA (recomendado) — consulta a API pública da Cakto e
 *    verifica se existe assinatura ATIVA para o e-mail informado no produto
 *    configurado (CAKTO_PRODUCT_ID). Credenciais da Cakto ficam 100% no
 *    servidor — nunca no navegador.
 *
 * Toda ativação válida é registrada na CONTA do usuário (Vercel Blob) e
 * aparece no painel admin. Contas bloqueadas/revogadas NÃO ativam.
 */

/* ------------------------------------------------------------------ */
/* Códigos estáticos (env) + códigos do painel admin (Blob)            */
/* ------------------------------------------------------------------ */

function envCodes(): string[] {
  return (process.env.ACCESS_CODES ?? '')
    .split(',')
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean)
}

async function allowedCodes(): Promise<string[]> {
  const env = envCodes()
  let extra: string[] = []
  if (blobConfigured()) {
    try {
      extra = await getAccessCodes()
    } catch {
      extra = []
    }
  }
  return Array.from(new Set([...env, ...extra]))
}

/** GET /api/license — indica quais formas de validação o servidor suporta */
export async function GET() {
  return NextResponse.json({
    configured: envCodes().length > 0,
    cakto: caktoConfigured(),
  })
}

/* ------------------------------------------------------------------ */
/* POST /api/license                                                   */
/* ------------------------------------------------------------------ */

export async function POST(req: NextRequest) {
  // A ativação exige conta autenticada neste aparelho (um dispositivo por vez)
  const check = await validateUserSession(req)
  if (!check.ok) {
    const messages: Record<string, string> = {
      auth: 'Entre na sua conta para ativar o acesso.',
      device: 'Esta conta está em uso em outro aparelho. Entre novamente aqui.',
      banned: 'Conta bloqueada — não é possível ativar. Fale com o suporte.',
      revoked: 'Acesso revogado — não é possível ativar. Fale com o suporte.',
    }
    const status = check.reason === 'banned' || check.reason === 'revoked' ? 403 : 401
    return NextResponse.json(
      { valid: false, message: messages[check.reason ?? 'auth'] },
      { status },
    )
  }
  const account = check.user!

  let body: { code?: unknown; email?: unknown }
  try {
    body = (await req.json()) as typeof body
  } catch {
    return NextResponse.json({ valid: false, message: 'Requisição inválida' }, { status: 400 })
  }

  /** Ativa a CONTA logada (fonte confiável — servidor) */
  const activateAccount = async (ident: string, source: 'cakto_email' | 'code') => {
    await upsertUser(
      account.id,
      { status: 'active', ident, activatedAt: Date.now(), source },
      { serverAction: true },
    )
    void appendEvent({
      type: source === 'cakto_email' ? 'activation_email' : 'activation_code',
      email: account.email,
      message:
        source === 'cakto_email'
          ? `Assinatura ativada por e-mail (Cakto): ${account.email}`
          : `Assinatura ativada por código: ${ident} — conta ${account.email ?? account.id}`,
      source: 'app',
    })
  }

  /* ---------- 1) Validação por e-mail da compra (Cakto) ---------- */
  const rawEmail = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (rawEmail) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
      return NextResponse.json(
        { valid: false, message: 'Digite o e-mail usado na compra.' },
        { status: 200 },
      )
    }
    const result = await checkCaktoSubscription(rawEmail)

    if (result.valid && blobConfigured()) {
      try {
        await activateAccount(rawEmail, 'cakto_email')
      } catch {
        /* não bloqueia a ativação do usuário */
      }
      const updated = await getUser(account.id)
      return NextResponse.json(
        { ...result, access: updated ? accessOf(updated) : undefined },
        { status: 200 },
      )
    }

    return NextResponse.json(result, { status: 200 })
  }

  /* ---------- 2) Validação por código ---------- */
  const code = typeof body.code === 'string' ? body.code.trim().toUpperCase() : ''
  if (!code) {
    return NextResponse.json(
      { valid: false, message: 'Informe o e-mail da compra ou o código de acesso' },
      { status: 400 },
    )
  }

  const codes = await allowedCodes()

  if (codes.length > 0) {
    if (codes.includes(code)) {
      if (blobConfigured()) {
        try {
          await activateAccount(code, 'code')
        } catch {
          /* não bloqueia a ativação */
        }
        const updated = await getUser(account.id)
        return NextResponse.json(
          { valid: true, plan: 'mensal', access: updated ? accessOf(updated) : undefined },
        )
      }
      return NextResponse.json({ valid: true, plan: 'mensal' })
    }
    return NextResponse.json(
      { valid: false, message: 'Código não reconhecido. Confira o e-mail de compra ou fale com o suporte.' },
      { status: 200 },
    )
  }

  // Sem códigos configurados: FALHA FECHADA — nenhum acesso é concedido por
  // código (a ativação real exige código cadastrado ou e-mail da Cakto).
  return NextResponse.json({
    valid: false,
    message:
      'Códigos de acesso não estão ativos neste servidor. Use o e-mail da compra (Cakto) ou fale com o suporte.',
  })
}
