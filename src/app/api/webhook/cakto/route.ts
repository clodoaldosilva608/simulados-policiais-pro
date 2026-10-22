import { NextResponse, NextRequest } from 'next/server'

export const runtime = 'nodejs'

/**
 * Webhook da Cakto — recebe eventos de compra/assinatura.
 *
 * Configuração na Cakto:
 *   URL: https://simuladospoliciais.vercel.app/api/webhook/cakto?secret=<CAKTO_WEBHOOK_SECRET>
 *
 * Segurança: a Cakto pode entregar o segredo via query "secret" (padrão usado
 * nas integrações da conta) e/ou header "x-cakto-secret". Aceitamos ambos.
 * Sem CAKTO_WEBHOOK_SECRET definido no ambiente, o endpoint aceita os eventos
 * (útil apenas para testes — defina o segredo antes de vender de verdade).
 *
 * O app não mantém estado no servidor (banco de dados é local no aparelho do
 * cliente), então os eventos são registrados em logs para auditoria — e no
 * futuro podem disparar automações (ex.: e-mails, códigos de acesso).
 */
export async function POST(req: NextRequest) {
  const secret = process.env.CAKTO_WEBHOOK_SECRET
  if (secret) {
    const urlSecret = req.nextUrl.searchParams.get('secret')
    const headerSecret = req.headers.get('x-cakto-secret')
    if (urlSecret !== secret && headerSecret !== secret) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
  }

  try {
    const body = (await req.json()) as Record<string, unknown>
    const event = typeof body.event === 'string' ? body.event : 'unknown'
    console.log(`[cakto:webhook] ${event}`, JSON.stringify(body).slice(0, 500))
    return NextResponse.json({ received: true })
  } catch {
    return NextResponse.json({ received: true })
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, webhook: 'cakto' })
}
