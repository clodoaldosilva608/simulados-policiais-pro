/**
 * Configuração central do produto.
 *
 * ASSINATURA (Cakto):
 * 1. Crie o produto "Assinatura Simulados Policiais Pro" em https://app.cakto.com.br
 *    com valor recorrente de R$ 17,90/mês.
 * 2. Copie o link de checkout e defina a variável de ambiente
 *    NEXT_PUBLIC_CAKTO_CHECKOUT_URL (Vercel → Settings → Environment Variables).
 * 3. Configure a "entrega do produto" na Cakto para enviar ao cliente um
 *    CÓDIGO DE ACESSO (ex.: SPP-XXXX-XXXX-XXXX).
 * 4. Cadastre os códigos válidos na variável de ambiente ACCESS_CODES
 *    (separados por vírgula) — eles são validados em /api/license.
 */
export const SITE = {
  name: 'Simulados Policiais Pro',
  shortName: 'Simulados Pro',
  tagline: 'Provas policiais oficiais + qualquer PDF virando simulado, direto no seu celular',
  price: 'R$ 17,90',
  period: '/mês',
  /** Dias de teste grátis (sem cartão) */
  trialDays: 7,
  /** Link de checkout da Cakto (define via env NEXT_PUBLIC_CAKTO_CHECKOUT_URL) */
  checkoutUrl: (process.env.NEXT_PUBLIC_CAKTO_CHECKOUT_URL ?? '') as string,
  supportEmail: 'suporte@simuladospoliciais.pro',
} as const

/** true quando o link de pagamento da Cakto já foi configurado */
export function checkoutConfigured(): boolean {
  return typeof SITE.checkoutUrl === 'string' && SITE.checkoutUrl.startsWith('http')
}
