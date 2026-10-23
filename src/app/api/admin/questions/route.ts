import { NextRequest, NextResponse } from 'next/server'
import { adminFromRequest } from '@/lib/admin-auth'
import { appendEvent, blobConfigured } from '@/lib/blob-registry'
import { deleteQuestion, listQuestions, upsertQuestion } from '@/lib/content'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** GET /api/admin/questions — lista completa (painel). */
export async function GET(req: NextRequest) {
  if (!adminFromRequest(req)) {
    return NextResponse.json({ ok: false, error: 'nao-autenticado' }, { status: 401 })
  }
  if (!blobConfigured()) {
    return NextResponse.json({ ok: false, error: 'armazenamento-nao-configurado' }, { status: 503 })
  }
  const questions = await listQuestions()
  return NextResponse.json({ ok: true, questions })
}

/**
 * POST /api/admin/questions — CRUD do banco de questões.
 * body: {action:'save', question} | {action:'delete', id} | {action:'toggle', id}
 */
export async function POST(req: NextRequest) {
  if (!adminFromRequest(req)) {
    return NextResponse.json({ ok: false, error: 'nao-autenticado' }, { status: 401 })
  }
  if (!blobConfigured()) {
    return NextResponse.json({ ok: false, error: 'armazenamento-nao-configurado' }, { status: 503 })
  }

  let body: { action?: unknown; question?: unknown; id?: unknown }
  try {
    body = (await req.json()) as typeof body
  } catch {
    return NextResponse.json({ ok: false, error: 'requisicao-invalida' }, { status: 400 })
  }

  const action = typeof body.action === 'string' ? body.action : ''

  if (action === 'save') {
    const result = await upsertQuestion(
      (body.question ?? {}) as Record<string, unknown>,
    )
    if ('error' in result) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 })
    }
    void appendEvent({ type: 'admin_question_saved', message: `Questão salva (${result.banca} • ${result.materia})`, source: 'admin' })
    return NextResponse.json({ ok: true, question: result })
  }

  if (action === 'delete') {
    const id = typeof body.id === 'string' ? body.id : ''
    if (!id) return NextResponse.json({ ok: false, error: 'id-ausente' }, { status: 400 })
    const removed = await deleteQuestion(id)
    if (!removed) return NextResponse.json({ ok: false, error: 'questao-nao-encontrada' }, { status: 404 })
    void appendEvent({ type: 'admin_question_deleted', message: 'Questão excluída do banco', source: 'admin' })
    return NextResponse.json({ ok: true })
  }

  if (action === 'toggle') {
    const id = typeof body.id === 'string' ? body.id : ''
    if (!id) return NextResponse.json({ ok: false, error: 'id-ausente' }, { status: 400 })
    const all = await listQuestions()
    const target = all.find((q) => q.id === id)
    if (!target) return NextResponse.json({ ok: false, error: 'questao-nao-encontrada' }, { status: 404 })
    const result = await upsertQuestion({ ...target, active: !target.active })
    if ('error' in result) return NextResponse.json({ ok: false, error: result.error }, { status: 400 })
    return NextResponse.json({ ok: true, question: result })
  }

  return NextResponse.json({ ok: false, error: 'acao-desconhecida' }, { status: 400 })
}
