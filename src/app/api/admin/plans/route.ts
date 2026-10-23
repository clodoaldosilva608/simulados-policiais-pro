import { NextRequest, NextResponse } from 'next/server'
import { adminFromRequest } from '@/lib/admin-auth'
import { appendEvent, blobConfigured } from '@/lib/blob-registry'
import { deleteCustomPlan, listCustomPlans, upsertCustomPlan } from '@/lib/content'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * /api/admin/plans — CRUD de planos customizados (atribuíveis a usuários).
 * GET | POST {action:'save', plan} | POST {action:'delete', id}
 */

export async function GET(req: NextRequest) {
  if (!adminFromRequest(req)) {
    return NextResponse.json({ ok: false, error: 'nao-autenticado' }, { status: 401 })
  }
  const plans = await listCustomPlans()
  return NextResponse.json({ ok: true, plans })
}

export async function POST(req: NextRequest) {
  if (!adminFromRequest(req)) {
    return NextResponse.json({ ok: false, error: 'nao-autenticado' }, { status: 401 })
  }
  if (!blobConfigured()) {
    return NextResponse.json({ ok: false, error: 'armazenamento-nao-configurado' }, { status: 503 })
  }

  try {
    const body = (await req.json()) as { action?: string; plan?: Record<string, unknown>; id?: string }

    if (body.action === 'save') {
      const result = await upsertCustomPlan(body.plan ?? {})
      if ('error' in result) return NextResponse.json({ ok: false, error: result.error }, { status: 400 })
      void appendEvent({ type: 'admin_plan_saved', message: `Plano "${result.name}" salvo (${result.simuladosPerMonth} simulados/mês, ${result.questionsPerDay} questões/dia)`, source: 'admin' })
      return NextResponse.json({ ok: true, plan: result })
    }

    if (body.action === 'delete') {
      if (!body.id) return NextResponse.json({ ok: false, error: 'id-ausente' }, { status: 400 })
      const removed = await deleteCustomPlan(body.id)
      if (!removed) return NextResponse.json({ ok: false, error: 'plano-nao-encontrado' }, { status: 404 })
      void appendEvent({ type: 'admin_plan_deleted', message: 'Plano customizado excluído', source: 'admin' })
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ ok: false, error: 'acao-desconhecida' }, { status: 400 })
  } catch {
    return NextResponse.json({ ok: false, error: 'requisicao-invalida' }, { status: 400 })
  }
}
