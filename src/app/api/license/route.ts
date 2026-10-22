import { NextResponse, NextRequest } from 'next/server'
import { appendEvent, blobConfigured, getAccessCodes, upsertUser } from '@/lib/blob-registry'
import { checkCaktoSubscription, caktoConfigured } from '@/lib/cakto'

export const runtime = 'nodejs'
export const maxDuration = 30

/**
 * Validação de acesso — duas formas:
 *
 * 1. CÓDIGO — env ACCESS_CODES + códigos criados no painel admin (Blob).
 * 2. E-MAIL DA COMPRA (recomendado) — consulta a API pública da Cakto e
 *    verifica se existe assinatura ATIVA para o e-mail informado no produto
 *    configurado (CAKTO_PRODUCT_ID). Credenciais da Cakto ficam 100% no
 *    servidor — nunca no navegador.
 *
 * Toda ativação válida é registrada no cadastro central de usuários
 * (Vercel Blob) para o painel admin.
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
  let body: { code?: unknown; email?: unknown }
  try {
    body = (await req.json()) as typeof body
  } catch {
    return NextResponse.json({ valid: false, message: 'Requisição inválida' }, { status: 400 })
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

    // registro central: assinante ativo (painel admin)
    if (result.valid && blobConfigured()) {
      try {
        await upsertUser(crypto.randomUUID(), {
          email: rawEmail,
          ident: rawEmail,
          status: 'active',
          source: 'cakto_email',
          activatedAt: Date.now(),
        })
        void appendEvent({
          type: 'activation_email',
          email: rawEmail,
          message: `Assinatura ativada por e-mail (Cakto): ${rawEmail}`,
          source: 'app',
        })
      } catch {
        /* não bloqueia a ativação do usuário */
      }
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
          await upsertUser(crypto.randomUUID(), {
            ident: code,
            status: 'active',
            source: 'code',
            activatedAt: Date.now(),
          })
          void appendEvent({
            type: 'activation_code',
            message: `Assinatura ativada por código: ${code}`,
            source: 'app',
          })
        } catch {
          /* não bloqueia a ativação */
        }
      }
      return NextResponse.json({ valid: true, plan: 'mensal' })
    }
    return NextResponse.json(
      { valid: false, message: 'Código não reconhecido. Confira o e-mail de compra ou fale com o suporte.' },
      { status: 200 },
    )
  }

  // Modo demonstração: valida apenas o formato do código
  const formatOk = /^SPP-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code)
  return NextResponse.json({
    valid: formatOk,
    message: formatOk
      ? undefined
      : 'Formato inválido. O código tem o formato SPP-XXXX-XXXX-XXXX (verifique o e-mail de compra).',
  })
}
