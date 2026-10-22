import { NextResponse, NextRequest } from 'next/server'
import { adminFromRequest } from '@/lib/admin-auth'
import {
  appendEvent,
  blobConfigured,
  findUserByEmail,
  listUsers,
  upsertUser,
  type RegistryUser,
} from '@/lib/blob-registry'
import { listAllCaktoSubscriptions, refId, type CaktoSubscription } from '@/lib/cakto'

export const runtime = 'nodejs'
export const maxDuration = 60
export const dynamic = 'force-dynamic'

/**
 * Sincroniza assinantes da Cakto com o registro central:
 * importa TODAS as assinaturas do produto configurado, cria usuários novos
 * (fonte "sync") e rebaixa para "canceled" quem estava ativo via Cakto e
 * não está mais. Não mexe em acesso concedido manualmente (adminGrant).
 */

function emailOf(sub: CaktoSubscription): string {
  return (sub.customer?.email ?? '').trim().toLowerCase()
}

export async function POST(req: NextRequest) {
  if (!adminFromRequest(req)) {
    return NextResponse.json({ ok: false, error: 'nao-autenticado' }, { status: 401 })
  }
  if (!blobConfigured()) {
    return NextResponse.json({ ok: false, error: 'armazenamento-nao-configurado' }, { status: 503 })
  }

  const { subscriptions, error } = await listAllCaktoSubscriptions()
  if (error && subscriptions.length === 0) {
    return NextResponse.json(
      { ok: false, error: 'falha-consulta-cakto', detail: error },
      { status: 502 },
    )
  }

  const withEmail = subscriptions.filter((s) => emailOf(s))
  const activeSet = new Set(['active', 'trial'])
  let created = 0
  let updated = 0
  let reactivated = 0
  let canceled = 0

  for (const sub of withEmail) {
    const email = emailOf(sub)
    const isActive = activeSet.has((sub.status ?? '').toLowerCase())
    const existing = await findUserByEmail(email)

    if (existing) {
      const isManual = Boolean(existing.adminGrant)
      const wasActive = existing.status === 'active'
      if (isActive) {
        if (!wasActive && !isManual) {
          await upsertUser(
            existing.id,
            {
              status: 'active',
              source: 'sync',
              activatedAt: existing.activatedAt ?? Date.now(),
              adminRevoked: false,
            },
            { heartbeat: false, serverAction: true },
          )
          reactivated++
        } else {
          await upsertUser(existing.id, {}, { heartbeat: false, serverAction: true })
        }
      } else if (
        wasActive &&
        !isManual &&
        ['cakto_email', 'cakto_webhook', 'sync'].includes(existing.source ?? '')
      ) {
        // assinante ativo no registro cuja assinatura na Cakto não está mais ativa
        await upsertUser(existing.id, { status: 'canceled', canceledAt: Date.now() }, { heartbeat: false, serverAction: true })
        canceled++
      }
      updated++
    } else {
      const novo: Partial<RegistryUser> = {
        email,
        name: sub.customer?.name?.slice(0, 80) || undefined,
        ident: email,
        status: isActive ? 'active' : 'canceled',
        source: 'sync',
        activatedAt: isActive ? Date.now() : undefined,
        canceledAt: isActive ? undefined : Date.now(),
        device: undefined,
        platform: 'Cakto',
      }
      await upsertUser(crypto.randomUUID(), novo, { heartbeat: false, serverAction: true })
      created++
    }
  }

  void appendEvent({
    type: 'cakto_sync',
    message: `Sincronização Cakto: ${withEmail.length} assinaturas, ${created} novos, ${reactivated} reativados, ${canceled} cancelados`,
    source: 'admin',
  })

  const users = await listUsers()
  return NextResponse.json({
    ok: true,
    subscriptionsTotal: subscriptions.length,
    productMatched: withEmail.filter((s) => refId(s.product)).length,
    created,
    updated,
    reactivated,
    canceled,
    usersTotal: users.length,
  })
}
