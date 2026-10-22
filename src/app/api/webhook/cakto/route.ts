import { NextResponse, NextRequest } from 'next/server'

export const runtime = 'nodejs'

/**
 * Webhook da Cakto (opcional — automação futura).
 *
 * A Cakto dispara eventos como subscription.created, subscription.renewed,
 * subscription.canceled etc. Nesta versão o app não mantém estado no servidor
 * (banco de dados é local no aparelho do cliente), então o webhook apenas
 * registra o evento em logs — útil para auditoria e para, no futuro, emitir
 * códigos de acesso automaticamente (ex.: gravar em um KV e expor em
 * /api/license).
 *
 * Configuração na Cakto: Integrações → Webhook → URL do app + /api/webhook/cakto
 * Segurança opcional: defina CAKTO_WEBHOOK_SECRET e a Cakto envia o header
 * "x-cakto-secret"; requests sem o segredo são rejeitados.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.CAKTO_WEBHOOK_SECRET
  if (secret && req.headers.get('x-cakto-secret') !== secret) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
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
