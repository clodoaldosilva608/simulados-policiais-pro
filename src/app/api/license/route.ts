import { NextResponse, NextRequest } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 30

/**
 * Validação de acesso — duas formas:
 *
 * 1. CÓDIGO (ACCESS_CODES no ambiente) — lista estática de códigos.
 * 2. E-MAIL DA COMPRA (recomendado) — consulta a API pública da Cakto e
 *    verifica se existe assinatura ATIVA para o e-mail informado no produto
 *    configurado (CAKTO_PRODUCT_ID). Credenciais da Cakto ficam 100% no
 *    servidor (CAKTO_CLIENT_ID / CAKTO_CLIENT_SECRET) — nunca no navegador.
 *
 * Sem ACCESS_CODES, o formato SPP-XXXX-XXXX-XXXX é aceito em modo demonstração.
 */

/* ------------------------------------------------------------------ */
/* Códigos estáticos (fallback/alternativa manual)                     */
/* ------------------------------------------------------------------ */

function allowedCodes(): string[] {
  return (process.env.ACCESS_CODES ?? '')
    .split(',')
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean)
}

/** GET /api/license — indica quais formas de validação o servidor suporta */
export async function GET() {
  return NextResponse.json({
    configured: allowedCodes().length > 0,
    cakto: Boolean(
      process.env.CAKTO_CLIENT_ID &&
        process.env.CAKTO_CLIENT_SECRET &&
        process.env.CAKTO_PRODUCT_ID,
    ),
  })
}

/* ------------------------------------------------------------------ */
/* Cakto — token OAuth2 com cache em memória                           */
/* ------------------------------------------------------------------ */

let cachedToken: { value: string; expiresAt: number } | null = null

async function caktoToken(): Promise<string | null> {
  const clientId = process.env.CAKTO_CLIENT_ID
  const clientSecret = process.env.CAKTO_CLIENT_SECRET
  if (!clientId || !clientSecret) return null

  if (cachedToken && Date.now() < cachedToken.expiresAt) return cachedToken.value

  try {
    const res = await fetch('https://api.cakto.com.br/public_api/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret }),
      cache: 'no-store',
    })
    if (!res.ok) return null
    const data = (await res.json()) as { access_token?: string; expires_in?: number }
    if (!data.access_token) return null
    const ttl = Math.min(Math.max(data.expires_in ?? 3600, 60), 36000)
    cachedToken = { value: data.access_token, expiresAt: Date.now() + (ttl - 120) * 1000 }
    return data.access_token
  } catch {
    return null
  }
}

interface CaktoSubscription {
  id: string
  status: string
  amount?: string | number
  customer?: { id?: string; email?: string; name?: string } | null
  product?: { id?: string; name?: string } | string | null
  offer?: { id?: string; name?: string } | string | null
}

const ACTIVE_STATUSES = new Set(['active', 'trial'])

/** extrai id de produto/oferta aceitando objeto ou string */
function refId(ref: CaktoSubscription['product']): string {
  if (!ref) return ''
  if (typeof ref === 'string') return ref
  return ref.id ?? ''
}

/**
 * Consulta assinaturas na Cakto pelo e-mail e verifica acesso válido
 * no produto configurado. Retorna o plano quando aprovado.
 */
async function checkCaktoSubscription(
  email: string,
): Promise<{ valid: boolean; plan?: string; message?: string }> {
  const token = await caktoToken()
  const productId = (process.env.CAKTO_PRODUCT_ID ?? '').trim()
  if (!token || !productId) {
    return {
      valid: false,
      message:
        'Verificação de assinatura temporariamente indisponível. Use seu código de acesso ou fale com o suporte.',
    }
  }

  const url =
    'https://api.cakto.com.br/public_api/subscriptions/?search=' +
    encodeURIComponent(email) +
    '&limit=25'

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (!res.ok) {
      return {
        valid: false,
        message: 'Não foi possível consultar sua assinatura agora. Tente novamente em instantes.',
      }
    }
    const data = (await res.json()) as { results?: CaktoSubscription[] }
    const results = Array.isArray(data.results) ? data.results : []
    const norm = email.trim().toLowerCase()

    const match = results.find((sub) => {
      const subEmail = (sub.customer?.email ?? '').trim().toLowerCase()
      if (subEmail !== norm) return false
      if (refId(sub.product) && productId && refId(sub.product) !== productId) return false
      return ACTIVE_STATUSES.has(sub.status)
    })

    if (match) {
      return { valid: true, plan: 'mensal' }
    }

    const canceled = results.find(
      (sub) =>
        (sub.customer?.email ?? '').trim().toLowerCase() === norm &&
        (!refId(sub.product) || refId(sub.product) === productId),
    )
    if (canceled) {
      return {
        valid: false,
        message:
          'Sua assinatura não está ativa (cancelada, expirada ou pagamento pendente). Reative no e-mail da Cakto ou assine novamente.',
      }
    }
    return {
      valid: false,
      message:
        'Não encontramos uma assinatura ativa para este e-mail. Verifique o e-mail usado na compra na Cakto.',
    }
  } catch {
    return {
      valid: false,
      message: 'Falha de conexão com o serviço de assinaturas. Tente novamente em instantes.',
    }
  }
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

  const codes = allowedCodes()

  if (codes.length > 0) {
    if (codes.includes(code)) {
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
