/**
 * Cliente da API pública da Cakto — 100% server-side.
 * Credenciais: CAKTO_CLIENT_ID / CAKTO_CLIENT_SECRET / CAKTO_PRODUCT_ID.
 */

let cachedToken: { value: string; expiresAt: number } | null = null

export function caktoConfigured(): boolean {
  return Boolean(
    process.env.CAKTO_CLIENT_ID && process.env.CAKTO_CLIENT_SECRET && process.env.CAKTO_PRODUCT_ID,
  )
}

export async function caktoToken(): Promise<string | null> {
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

export interface CaktoSubscription {
  id: string
  status: string
  amount?: string | number
  customer?: { id?: string; email?: string; name?: string } | null
  product?: { id?: string; name?: string } | string | null
  offer?: { id?: string; name?: string } | string | null
  created_at?: string
  next_billing_at?: string | null
}

export const ACTIVE_STATUSES = new Set(['active', 'trial'])

/** extrai id de produto/oferta aceitando objeto ou string */
export function refId(ref: CaktoSubscription['product']): string {
  if (!ref) return ''
  if (typeof ref === 'string') return ref
  return ref.id ?? ''
}

/**
 * Consulta assinaturas na Cakto pelo e-mail e verifica acesso válido
 * no produto configurado. Retorna o plano quando aprovado.
 */
export async function checkCaktoSubscription(
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

/**
 * Lista TODAS as assinaturas da Cakto (paginando) — usada pelo painel admin
 * para importar automaticamente os assinantes recorrentes do produto.
 */
export async function listAllCaktoSubscriptions(
  maxPages = 5,
): Promise<{ subscriptions: CaktoSubscription[]; error?: string }> {
  const token = await caktoToken()
  if (!token) return { subscriptions: [], error: 'sem-credenciais' }
  const productId = (process.env.CAKTO_PRODUCT_ID ?? '').trim()

  const all: CaktoSubscription[] = []
  for (let page = 1; page <= maxPages; page++) {
    try {
      const res = await fetch(
        `https://api.cakto.com.br/public_api/subscriptions/?limit=100&page=${page}`,
        { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' },
      )
      if (!res.ok) break
      const data = (await res.json()) as { results?: CaktoSubscription[] }
      const batch = Array.isArray(data.results) ? data.results : []
      if (batch.length === 0) break
      all.push(...batch)
      if (batch.length < 100) break
    } catch {
      break
    }
  }

  // filtra apenas o produto configurado (quando identificável)
  const filtered = productId
    ? all.filter((s) => !refId(s.product) || refId(s.product) === productId)
    : all
  return { subscriptions: filtered }
}
