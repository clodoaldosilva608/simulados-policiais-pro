import { NextRequest, NextResponse } from 'next/server'
import { adminFromRequest } from '@/lib/admin-auth'
import { appendEvent, blobConfigured } from '@/lib/blob-registry'
import { deletePopup, listPopups, upsertPopup } from '@/lib/content'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * /api/admin/popups — CRUD dos pop-ups da aplicação (painel).
 * GET | POST {action:'save', popup} | POST {action:'delete'|'toggle', id}
 */

export async function GET(req: NextRequest) {
  if (!adminFromRequest(req)) {
    return NextResponse.json({ ok: false, error: 'nao-autenticado' }, { status: 401 })
  }
  const popups = await listPopups()
  return NextResponse.json({ ok: true, popups })
}

export async function POST(req: NextRequest) {
  if (!adminFromRequest(req)) {
    return NextResponse.json({ ok: false, error: 'nao-autenticado' }, { status: 401 })
  }
  if (!blobConfigured()) {
    return NextResponse.json({ ok: false, error: 'armazenamento-nao-configurado' }, { status: 503 })
  }

  try {
    const body = (await req.json()) as { action?: string; popup?: Record<string, unknown>; id?: string }

    if (body.action === 'save') {
      const result = await upsertPopup(body.popup ?? {})
      if ('error' in result) return NextResponse.json({ ok: false, error: result.error }, { status: 400 })
      void appendEvent({
        type: 'admin_popup_saved',
        message: `Pop-up "${result.title}" salvo (telas: ${result.screens.join(', ')})`,
        source: 'admin',
      })
      return NextResponse.json({ ok: true, popup: result })
    }

    if (body.action === 'delete') {
      if (!body.id) return NextResponse.json({ ok: false, error: 'id-ausente' }, { status: 400 })
      const removed = await deletePopup(body.id)
      if (!removed) return NextResponse.json({ ok: false, error: 'popup-nao-encontrado' }, { status: 404 })
      void appendEvent({ type: 'admin_popup_deleted', message: 'Pop-up excluído', source: 'admin' })
      return NextResponse.json({ ok: true })
    }

    if (body.action === 'toggle') {
      if (!body.id) return NextResponse.json({ ok: false, error: 'id-ausente' }, { status: 400 })
      const all = await listPopups()
      const target = all.find((p) => p.id === body.id)
      if (!target) return NextResponse.json({ ok: false, error: 'popup-nao-encontrado' }, { status: 404 })
      const result = await upsertPopup({ ...target, active: !target.active })
      if ('error' in result) return NextResponse.json({ ok: false, error: result.error }, { status: 400 })
      return NextResponse.json({ ok: true, popup: result })
    }

    return NextResponse.json({ ok: false, error: 'acao-desconhecida' }, { status: 400 })
  } catch {
    return NextResponse.json({ ok: false, error: 'requisicao-invalida' }, { status: 400 })
  }
}
