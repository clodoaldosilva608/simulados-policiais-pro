import { createHash } from 'crypto'
import { NextResponse, NextRequest } from 'next/server'
import {
  appendEvent,
  blobConfigured,
  findUserByEmail,
  readJson,
  upsertUser,
  writeJson,
} from '@/lib/blob-registry'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Webhook da Cakto — recebe eventos de compra/assinatura.
 *
 * Configuração na Cakto:
 *   URL: https://simuladospoliciais.vercel.app/api/webhook/cakto?secret=<CAKTO_WEBHOOK_SECRET>
 *
 * Segurança (FECHADO POR PADRÃO):
 *  • Sem CAKTO_WEBHOOK_SECRET configurado, o webhook NÃO processa nada (503).
 *  • Com o segredo, ele deve vir na query "secret" ou no header "x-cakto-secret".
 *
 * Idempotência: cada corpo recebido ganha um hash SHA-256 registrado por 7
 * dias — reentregas/replays da Cakto NÃO reprocessam (evita duplicar eventos
 * e estados na conta do aluno).
 *
 * Além de auditar, os eventos alimentam o REGISTRO CENTRAL de usuários
 * (painel admin): aprovação ativa/renova, cancelamento/inadimplência/
 * reembolso cancela — sempre por e-mail do comprador.
 */

const PROCESSED_INDEX = 'index/cakto-processed.json'
const RETENTION_MS = 7 * 86400000

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

/**
 * Devolve true se este hash de corpo JÁ foi processado nos últimos 7 dias
 * (e registra agora a primeira vez). Best-effort: falha de índice nunca
 * bloqueia a compra do aluno.
 */
async function markProcessed(hash: string): Promise<boolean> {
  try {
    const all = (await readJson<Record<string, number>>(PROCESSED_INDEX)) ?? {}
    const now = Date.now()
    if (all[hash] && now - all[hash] < RETENTION_MS) return true
    const next: Record<string, number> = {}
    for (const [k, v] of Object.entries(all)) {
      if (now - v < RETENTION_MS) next[k] = v
    }
    next[hash] = now
    await writeJson(PROCESSED_INDEX, next)
  } catch {
    /* índice é otimização — segue o processamento */
  }
  return false
}

export async function POST(req: NextRequest) {
  const secret = process.env.CAKTO_WEBHOOK_SECRET

  // FAIL-CLOSED: sem segredo configurado, nada é processado por anônimos
  // (antes o webhook ficava aberto e qualquer um forjava uma assinatura "pro").
  if (!secret) {
    return NextResponse.json(
      { error: 'Webhook não configurado neste ambiente' },
      { status: 503 },
    )
  }

  const urlSecret = req.nextUrl.searchParams.get('secret')
  const headerSecret = req.headers.get('x-cakto-secret')
  if (urlSecret !== secret && headerSecret !== secret) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  let raw: string
  try {
    raw = await req.text()
  } catch {
    return NextResponse.json({ received: true })
  }
  if (!raw) return NextResponse.json({ received: true })

  // Idempotência por conteúdo (reentrega = mesmo corpo)
  const hash = createHash('sha256').update(raw).digest('hex')
  if (await markProcessed(hash)) {
    return NextResponse.json({ received: true, duplicate: true })
  }

  let body: Record<string, unknown>
  try {
    body = JSON.parse(raw) as Record<string, unknown>
  } catch {
    return NextResponse.json({ received: true })
  }

  const event = typeof body.event === 'string' ? body.event : 'unknown'
  const email = findEmail(body)
  console.log(`[cakto:webhook] ${event}`, raw.slice(0, 500))

  if (blobConfigured() && email) {
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

    void appendEvent({
      type: `cakto_${event}`,
      email,
      message: `Cakto: ${event}${email ? ` — ${email}` : ''}`,
      source: 'webhook',
    })
  }

  return NextResponse.json({ received: true })
}

export async function GET() {
  // Health-check mínimo: NÃO revela se o segredo está configurado
  return NextResponse.json({ ok: true, webhook: 'cakto' })
}
