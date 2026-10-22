import { NextResponse, NextRequest } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

type RouteParams = { params: Promise<{ id: string }> }

/** GET /api/documents/[id]/attempts — histórico de tentativas */
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const attempts = await db.attempt.findMany({
      where: { documentId: id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })
    return NextResponse.json({
      attempts: attempts.map((a) => ({
        name: a.name,
        mode: a.mode,
        correct: a.correct,
        total: a.total,
        pct: a.pct,
        timeUsedMs: a.timeUsedMs,
        createdAt: a.createdAt.toISOString(),
      })),
    })
  } catch (err) {
    console.error('[attempts:GET]', err)
    return NextResponse.json({ error: 'Erro ao carregar tentativas' }, { status: 500 })
  }
}

/** POST /api/documents/[id]/attempts — registra uma tentativa finalizada */
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = (await req.json()) as {
      name?: string
      mode?: string
      correct?: number
      total?: number
      pct?: number
      timeUsedMs?: number
    }

    const doc = await db.document.findUnique({ where: { id }, select: { id: true } })
    if (!doc) {
      return NextResponse.json({ error: 'Simulado não encontrado' }, { status: 404 })
    }

    const attempt = await db.attempt.create({
      data: {
        documentId: id,
        name: (body.name ?? '').slice(0, 80),
        mode: body.mode === 'estudo' ? 'estudo' : 'prova',
        correct: Math.max(0, Math.round(body.correct ?? 0)),
        total: Math.max(0, Math.round(body.total ?? 0)),
        pct: Math.max(0, Math.min(100, Math.round(body.pct ?? 0))),
        timeUsedMs: Math.max(0, Math.round(body.timeUsedMs ?? 0)),
      },
    })

    return NextResponse.json({ id: attempt.id, ok: true })
  } catch (err) {
    console.error('[attempts:POST]', err)
    return NextResponse.json({ error: 'Erro ao salvar tentativa' }, { status: 500 })
  }
}
