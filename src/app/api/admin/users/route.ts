import { NextResponse, NextRequest } from 'next/server'
import { adminFromRequest } from '@/lib/admin-auth'
import {
  appendEvent,
  blobConfigured,
  deleteUser,
  getUser,
  upsertUser,
} from '@/lib/blob-registry'
import {
  changeAccountEmail,
  claimEmailFor,
  createUserSessionToken,
  findAccountIdByEmail,
  hashPassword,
  purgeAccountRefs,
  userCookieHeader,
} from '@/lib/user-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Ações do admin sobre usuários:
 *  extend_trial (+N dias), grant (acesso vitalício), revoke, cancel,
 *  ban, unban, save_note, delete,
 *  create (nova conta), update (nome/e-mail/notas), set_password (reset),
 *  set_status (plano: trial/active/expired/canceled), set_plan (plano custom),
 *  impersonate (sessão de suporte na conta do aluno).
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
  | 'create'
  | 'update'
  | 'set_password'
  | 'set_status'
  | 'set_plan'
  | 'impersonate'

const DAY = 86400000

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  if (!adminFromRequest(req)) {
    return NextResponse.json({ ok: false, error: 'nao-autenticado' }, { status: 401 })
  }
  if (!blobConfigured()) {
    return NextResponse.json({ ok: false, error: 'armazenamento-nao-configurado' }, { status: 503 })
  }

  let body: {
    id?: unknown
    action?: unknown
    days?: unknown
    note?: unknown
    email?: unknown
    password?: unknown
    name?: unknown
    status?: unknown
    planId?: unknown
    startTrial?: unknown
  }
  try {
    body = (await req.json()) as typeof body
  } catch {
    return NextResponse.json({ ok: false, error: 'requisicao-invalida' }, { status: 400 })
  }

  const id = typeof body.id === 'string' ? body.id : ''
  const action = typeof body.action === 'string' ? (body.action as Action) : ''
  const days = Math.max(0, Math.min(365, Math.floor(Number(body.days) || 0)))
  const note = typeof body.note === 'string' ? body.note.slice(0, 500) : undefined

  if (!action || (action !== 'create' && !id)) {
    return NextResponse.json({ ok: false, error: 'parametros-ausentes' }, { status: 400 })
  }

  const user = await getUser(id)
  if (!user && !['create', 'delete'].includes(action)) {
    return NextResponse.json({ ok: false, error: 'usuario-nao-encontrado' }, { status: 404 })
  }

  const label = user?.email ?? user?.ident ?? user?.id
  let message = ''

  switch (action) {
    /* ---------------- CRIAR CONTA ---------------- */
    case 'create': {
      const email = String(body.email ?? '').trim().toLowerCase()
      const password = String(body.password ?? '')
      const name = typeof body.name === 'string' ? body.name.trim().slice(0, 80) : ''
      const status = ['trial', 'active', 'expired'].includes(String(body.status)) ? String(body.status) : 'trial'
      if (!EMAIL_RE.test(email)) {
        return NextResponse.json({ ok: false, error: 'E-mail inválido.' }, { status: 400 })
      }
      if (password.length < 6) {
        return NextResponse.json({ ok: false, error: 'Senha muito curta (mín. 6 caracteres).' }, { status: 400 })
      }
      const taken = await findAccountIdByEmail(email)
      if (taken) {
        return NextResponse.json({ ok: false, error: 'E-mail já cadastrado.' }, { status: 409 })
      }
      const newId = crypto.randomUUID()
      await upsertUser(
        newId,
        {
          email,
          authEmail: email,
          passwordHash: hashPassword(password),
          name: name || undefined,
          status: status === 'active' ? 'active' : status === 'expired' ? 'expired' : 'trial',
          trialStartedAt: status === 'trial' ? Date.now() : undefined,
          adminGrant: status === 'active' ? true : undefined,
          source: 'admin',
        },
        { heartbeat: false, serverAction: true },
      )
      await claimEmailFor(email, newId)
      void appendEvent({
        type: 'admin_user_created',
        email,
        message: `Conta criada pelo admin (${status}) — ${email}`,
        source: 'admin',
      })
      return NextResponse.json({ ok: true, id: newId, message: `Conta ${email} criada.` })
    }

    /* ---------------- EDITAR DADOS ---------------- */
    case 'update': {
      const email = String(body.email ?? '').trim().toLowerCase()
      if (email && email !== (user!.email ?? '').toLowerCase()) {
        if (!EMAIL_RE.test(email)) {
          return NextResponse.json({ ok: false, error: 'E-mail inválido.' }, { status: 400 })
        }
        const res = await changeAccountEmail(id, email)
        if (!res.ok) return NextResponse.json({ ok: false, error: res.error }, { status: 409 })
      }
      const patch: Record<string, unknown> = {}
      if (typeof body.name === 'string') patch.name = body.name.trim().slice(0, 80)
      if (note !== undefined) patch.notes = note
      if (Object.keys(patch).length > 0) {
        await upsertUser(id, patch, { heartbeat: false, serverAction: true })
      }
      message = 'Dados atualizados'
      break
    }

    /* ---------------- RESET DE SENHA ---------------- */
    case 'set_password': {
      const password = String(body.password ?? '')
      if (password.length < 6) {
        return NextResponse.json({ ok: false, error: 'Senha muito curta (mín. 6 caracteres).' }, { status: 400 })
      }
      await upsertUser(id, { passwordHash: hashPassword(password) }, { heartbeat: false, serverAction: true })
      message = 'Senha redefinida pelo admin'
      break
    }

    /* ---------------- STATUS / PLANO ---------------- */
    case 'set_status': {
      const status = String(body.status ?? '')
      if (!['trial', 'active', 'expired', 'canceled'].includes(status)) {
        return NextResponse.json({ ok: false, error: 'status-invalido' }, { status: 400 })
      }
      const patch: Record<string, unknown> = { status }
      if (status === 'trial') patch.trialStartedAt = Date.now()
      if (status === 'active') {
        patch.adminGrant = true
        patch.adminRevoked = false
        patch.activatedAt = Date.now()
      } else patch.adminGrant = false
      if (status === 'canceled') patch.canceledAt = Date.now()
      await upsertUser(id, patch, { heartbeat: false, serverAction: true })
      message = `Status alterado para ${status}`
      break
    }

    case 'set_plan': {
      const planId = typeof body.planId === 'string' ? body.planId : ''
      await upsertUser(id, { customPlanId: planId || undefined }, { heartbeat: false, serverAction: true })
      message = planId ? 'Plano customizado atribuído' : 'Plano customizado removido (volta ao padrão)'
      break
    }

    /* ---------------- IMPERSONAÇÃO (suporte) ---------------- */
    case 'impersonate': {
      if (!user!.passwordHash) {
        return NextResponse.json({ ok: false, error: 'Conta sem senha (legado) — não é possível entrar.' }, { status: 400 })
      }
      // token de sessão do ALUNO: carrega o aparelho vinculado da própria conta
      // (passa na regra 1-aparelho-por-vez sem desvincular o aluno)
      const token = createUserSessionToken(id, user!.activeDevice ?? 'admin-support')
      void appendEvent({
        type: 'admin_impersonation',
        email: user!.email,
        message: `Admin entrou na conta de ${label} (suporte)`,
        source: 'admin',
      })
      return NextResponse.json(
        { ok: true, message: `Sessão aberta como ${label}.` },
        { headers: { 'Set-Cookie': userCookieHeader(token) } },
      )
    }

    /* ---------------- AÇÕES EXISTENTES ---------------- */
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
