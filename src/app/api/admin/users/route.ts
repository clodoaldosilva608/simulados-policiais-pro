import { NextResponse, NextRequest } from 'next/server'
import { adminFromRequest } from '@/lib/admin-auth'
import {
  appendEvent,
  blobConfigured,
  deleteUser,
  getUser,
  upsertUser,
} from '@/lib/blob-registry'
import { purgeAccountRefs } from '@/lib/user-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Ações do admin sobre um usuário:
 *  extend_trial (+N dias), grant (acesso vitalício), revoke, cancel,
 *  ban, unban, save_note, delete.
 */

type Action =
  | 'extend_trial'
  | 'grant'
  | 'revoke'
  | 'cancel'
  | 'ban'
  | 'unban'
  | 'save_note'
  | 'delete'

const DAY = 86400000

export async function POST(req: NextRequest) {
  if (!adminFromRequest(req)) {
    return NextResponse.json({ ok: false, error: 'nao-autenticado' }, { status: 401 })
  }
  if (!blobConfigured()) {
    return NextResponse.json({ ok: false, error: 'armazenamento-nao-configurado' }, { status: 503 })
  }

  let body: { id?: unknown; action?: unknown; days?: unknown; note?: unknown }
  try {
    body = (await req.json()) as typeof body
  } catch {
    return NextResponse.json({ ok: false, error: 'requisicao-invalida' }, { status: 400 })
  }

  const id = typeof body.id === 'string' ? body.id : ''
  const action = typeof body.action === 'string' ? (body.action as Action) : ''
  const days = Math.max(0, Math.min(365, Math.floor(Number(body.days) || 0)))
  const note = typeof body.note === 'string' ? body.note.slice(0, 500) : undefined

  if (!id || !action) {
    return NextResponse.json({ ok: false, error: 'parametros-ausentes' }, { status: 400 })
  }

  const user = await getUser(id)
  if (!user && action !== 'delete') {
    return NextResponse.json({ ok: false, error: 'usuario-nao-encontrado' }, { status: 404 })
  }

  const label = user?.email ?? user?.ident ?? user?.id
  let message = ''

  switch (action) {
    case 'extend_trial': {
      if (days <= 0) {
        return NextResponse.json({ ok: false, error: 'dias-invalidos' }, { status: 400 })
      }
      await upsertUser(
        id,
        { trialExtendedDays: (user?.trialExtendedDays ?? 0) + days },
        { heartbeat: false, serverAction: true },
      )
      message = `Teste estendido em ${days} dia(s)`
      break
    }
    case 'grant': {
      await upsertUser(
        id,
        {
          adminGrant: true,
          adminRevoked: false,
          status: 'active',
          source: 'admin',
          activatedAt: Date.now(),
          canceledAt: undefined,
        },
        { heartbeat: false, serverAction: true },
      )
      message = 'Acesso concedido manualmente (vitalício)'
      break
    }
    case 'revoke': {
      await upsertUser(
        id,
        { adminGrant: false, adminRevoked: true, status: 'expired' },
        { heartbeat: false, serverAction: true },
      )
      message = 'Acesso manual revogado'
      break
    }
    case 'cancel': {
      await upsertUser(id, { status: 'canceled', canceledAt: Date.now(), adminGrant: false }, { heartbeat: false, serverAction: true })
      message = 'Assinatura marcada como cancelada'
      break
    }
    case 'ban': {
      await upsertUser(id, { banned: true }, { heartbeat: false, serverAction: true })
      message = 'Usuário bloqueado'
      break
    }
    case 'unban': {
      await upsertUser(id, { banned: false }, { heartbeat: false, serverAction: true })
      message = 'Usuário desbloqueado'
      break
    }
    case 'save_note': {
      await upsertUser(id, { notes: note ?? '' }, { heartbeat: false, serverAction: true })
      message = 'Observação salva'
      break
    }
    case 'delete': {
      await deleteUser(id)
      await purgeAccountRefs(id, user?.email ?? user?.authEmail) // libera e-mail + aparelho
      void appendEvent({
        type: 'user_deleted',
        email: user?.email,
        message: `Usuário ${label ?? id} excluído pelo admin`,
        source: 'admin',
      })
      return NextResponse.json({ ok: true })
    }
    default:
      return NextResponse.json({ ok: false, error: 'acao-desconhecida' }, { status: 400 })
  }

  void appendEvent({
    type: `admin_${action}`,
    email: user?.email,
    message: `${message} — ${label ?? id}`,
    source: 'admin',
  })

  return NextResponse.json({ ok: true, message })
}
