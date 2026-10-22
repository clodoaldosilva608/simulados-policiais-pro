import { NextResponse, NextRequest } from 'next/server'
import { adminFromRequest, adminConfigured } from '@/lib/admin-auth'
import {
  blobConfigured,
  listUsers,
  listEvents,
  getAccessCodes,
  type RegistryUser,
} from '@/lib/blob-registry'
import { caktoConfigured } from '@/lib/cakto'
import { SITE } from '@/config/site'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export type EffStatus = 'trial' | 'active' | 'expired' | 'canceled' | 'banned'

export interface AdminUserView extends RegistryUser {
  effStatus: EffStatus
  trialEndsAt?: number
}

/** Status efetivo: considera teste expirado, bloqueio e concessão admin */
export function effectiveStatus(u: RegistryUser): EffStatus {
  if (u.banned) return 'banned'
  if (u.adminGrant || u.status === 'active') return 'active'
  if (u.status === 'trial' && u.trialStartedAt) {
    const end = u.trialStartedAt + (u.trialExtendedDays ?? 0) * 86400000 + SITE.trialDays * 86400000
    return Date.now() < end ? 'trial' : 'expired'
  }
  if (u.status === 'canceled') return 'canceled'
  return 'expired'
}

export async function GET(req: NextRequest) {
  if (!adminFromRequest(req)) {
    return NextResponse.json({ ok: false, error: 'nao-autenticado' }, { status: 401 })
  }
  if (!blobConfigured()) {
    return NextResponse.json({ ok: false, error: 'armazenamento-nao-configurado' }, { status: 503 })
  }

  const now = Date.now()
  const DAY = 86400000

  const raw = await listUsers()
  const users: AdminUserView[] = raw.map((u) => {
    const trialEndsAt =
      u.status === 'trial' && u.trialStartedAt
        ? u.trialStartedAt + (u.trialExtendedDays ?? 0) * DAY + SITE.trialDays * DAY
        : undefined
    return { ...u, trialEndsAt, effStatus: effectiveStatus(u) }
  })

  const count = (s: EffStatus) => users.filter((u) => u.effStatus === s).length
  const actives = count('active')
  const total = users.length
  const paidEver = actives + count('canceled')
  const mrrCents = actives * 1790

  // inscrições dos últimos 14 dias (por dia)
  const byDay: { day: string; count: number }[] = []
  for (let i = 13; i >= 0; i--) {
    const start = new Date(now - i * DAY)
    start.setHours(0, 0, 0, 0)
    const end = start.getTime() + DAY
    const c = users.filter((u) => u.createdAt >= start.getTime() && u.createdAt < end).length
    byDay.push({
      day: `${String(start.getDate()).padStart(2, '0')}/${String(start.getMonth() + 1).padStart(2, '0')}`,
      count: c,
    })
  }

  const new7d = users.filter((u) => u.createdAt >= now - 7 * DAY).length
  const trialExpiringSoon = users.filter(
    (u) =>
      u.effStatus === 'trial' &&
      u.trialEndsAt !== undefined &&
      u.trialEndsAt - now < 2 * DAY &&
      u.trialEndsAt > now,
  ).length

  const events = await listEvents(120)
  const codes = await getAccessCodes()

  return NextResponse.json({
    ok: true,
    generatedAt: now,
    stats: {
      total,
      trial: count('trial'),
      active: actives,
      expired: count('expired'),
      canceled: count('canceled'),
      banned: count('banned'),
      new7d,
      trialExpiringSoon,
      mrrCents,
      revenueMonthCents: mrrCents,
      conversionPct: total > 0 ? Math.round((paidEver / total) * 100) : 0,
      byDay,
    },
    users,
    events,
    config: {
      adminAuth: adminConfigured(),
      blob: blobConfigured(),
      cakto: caktoConfigured(),
      checkoutUrl: SITE.checkoutUrl,
      trialDays: SITE.trialDays,
      price: SITE.price,
      accessCodes: codes,
      accessCodesEnv: (process.env.ACCESS_CODES ?? '')
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean),
    },
  })
}
