/**
 * Configuração central do produto.
 *
 * ASSINATURA (Cakto):
 * • Produto já criado via API pública da Cakto:
 *   "Simulados Policiais Pro — Assinatura Mensal" (R$ 17,90/mês recorrente,
 *   Pix + Pix Automático + Cartão) — oferta v5zisya / produto 75a063ec-c313-4377-9087-c580ac50a97f
 * • Checkout: https://pay.cakto.com.br/v5zisya
 * • Ativação no app: e-mail da compra validado em tempo real contra a API
 *   da Cakto (assinaturas ativas) em /api/license — ou código SPP-… como alternativa.
 * • Webhook (opcional/auditoria): aponte a Cakto para /api/webhook/cakto
 *   e defina CAKTO_WEBHOOK_SECRET. Credenciais da Cakto ficam no servidor:
 *   CAKTO_CLIENT_ID / CAKTO_CLIENT_SECRET / CAKTO_PRODUCT_ID.
 */
export const SITE = {
  name: 'Simulados Policiais Pro',
  shortName: 'Simulados Pro',
  tagline: 'Provas policiais oficiais + qualquer PDF virando simulado, direto no seu celular',
  price: 'R$ 17,90',
  period: '/mês',
  /** Dias de teste grátis (sem cartão) */
  trialDays: 7,
  /** Link de checkout da Cakto (env NEXT_PUBLIC_CAKTO_CHECKOUT_URL sobrepõe) */
  checkoutUrl:
    (process.env.NEXT_PUBLIC_CAKTO_CHECKOUT_URL ?? '') || 'https://pay.cakto.com.br/v5zisya',
  /** Atendimento oficial — Gmail do suporte (pedidos de alteração de e-mail, dúvidas, pagamentos) */
  supportEmail: 'suportesimuladospoliciais@gmail.com',
} as const

/**
 * PLANO GRÁTIS (após o teste grátis de 7 dias) — o aluno continua usando o
 * app com limites que evidenciam o valor da assinatura:
 * • Poucos simulados gerados por mês (PDF→simulado e aleatório somados)
 * • Cota diária de questões
 * • Sem comentários de professor nas questões (exclusivo do assinante)
 * Usados tanto no cliente (UI/quota) quanto no servidor (/api/usage/simulado).
 */
export const FREE_PLAN = {
  /** Novos simulados gerados por mês (upload de PDF + simulado aleatório) */
  simuladosPerMonth: 5,
  /** Questões que o aluno pode responder por dia (1ª resposta de cada questão conta)
   *  NOTA: o valor EFETIVO vem da config dinâmica do painel admin (/api/config);
   *  este é o padrão offline. Plano customizado atribuído à conta sobrescreve. */
  questionsPerDay: 15,
} as const

/** true quando o link de pagamento da Cakto já foi configurado */
export function checkoutConfigured(): boolean {
  return typeof SITE.checkoutUrl === 'string' && SITE.checkoutUrl.startsWith('http')
}
