import { NextResponse, NextRequest } from 'next/server'
import { appendEvent, blobConfigured, findUserByEmail, upsertUser } from '@/lib/blob-registry'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Webhook da Cakto — recebe eventos de compra/assinatura.
 *
 * Configuração na Cakto:
 *   URL: https://simuladospoliciais.vercel.app/api/webhook/cakto?secret=<CAKTO_WEBHOOK_SECRET>
 *
 * Segurança: a Cakto pode entregar o segredo via query "secret" (padrão usado
 * nas integrações da conta) e/ou header "x-cakto-secret". Aceitamos ambos.
 *
 * Além de auditar, os eventos alimentam o REGISTRO CENTRAL de usuários
 * (painel admin): aprovação ativa/renova, cancelamento/inadimplência/
 * reembolso cancela — sempre por e-mail do comprador.
 */

/** procura recursivamente o primeiro e-mail no payload da Cakto */
function findEmail(obj: unknown, depth = 0): string | undefined {
  if (depth > 6 || obj === null || typeof obj !== 'object') return undefined
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) {
      return v.trim().toLowerCase()
    }
    if (typeof v === 'object' && v !== null) {
      const found = findEmail(v, depth + 1)
      if (found) return found
    }
    void k
  }
  return undefined
}

const CANCEL_EVENTS = new Set([
  'purchase_refused',
  'subscription_canceled',
  'subscription_renewal_refused',
  'subscription_paused',
  'refund',
  'chargeback',
])

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
    const email = findEmail(body)
    console.log(`[cakto:webhook] ${event}`, JSON.stringify(body).slice(0, 500))

    if (blobConfigured()) {
      // cadastro central: reflete o estado da assinatura
      if (email) {
        try {
          const existing = await findUserByEmail(email)
          if (event === 'purchase_approved' || event === 'subscription_created' || event === 'subscription_renewed' || event === 'subscription_resumed' || event === 'subscription_late_recovered') {
            await upsertUser(
              existing?.id ?? crypto.randomUUID(),
              {
                email,
                ident: email,
                status: 'active',
                source: 'cakto_webhook',
                activatedAt: existing?.activatedAt ?? Date.now(),
                canceledAt: undefined,
                adminRevoked: false,
              },
              { heartbeat: false, serverAction: true },
            )
          } else if (CANCEL_EVENTS.has(event)) {
            // bloqueia apenas quem não tem concessão manual do admin
            if (!existing || !existing.adminGrant) {
              await upsertUser(
                existing?.id ?? crypto.randomUUID(),
                {
                  email,
                  ident: email,
                  status: 'canceled',
                  source: 'cakto_webhook',
                  canceledAt: Date.now(),
                },
                { heartbeat: false, serverAction: true },
              )
            }
          }
        } catch (err) {
          console.error('[cakto:webhook] registro:', err)
        }
      }

      void appendEvent({
        type: `cakto_${event}`,
        email,
        message: `Cakto: ${event}${email ? ` — ${email}` : ''}`,
        source: 'webhook',
      })
    }

    return NextResponse.json({ received: true })
  } catch {
    return NextResponse.json({ received: true })
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, webhook: 'cakto' })
}
