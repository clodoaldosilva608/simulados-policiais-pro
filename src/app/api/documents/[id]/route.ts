import { NextResponse, NextRequest } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

type RouteParams = { params: Promise<{ id: string }> }

interface OptionJson {
  key: string
  html: string
}

/** GET /api/documents/[id] — detalhe completo (pacote do simulado) */
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const doc = await db.document.findUnique({
      where: { id },
      include: {
        questions: { orderBy: { number: 'asc' } },
        textBlocks: true,
      },
    })

    if (!doc) {
      return NextResponse.json({ error: 'Simulado não encontrado' }, { status: 404 })
    }

    const textBlocks: Record<string, { refId: string; title: string; paragraphs: string[]; source?: string }> = {}
    for (const tb of doc.textBlocks) {
      let paragraphs: string[] = []
      try {
        const parsed = JSON.parse(tb.paragraphs)
        if (Array.isArray(parsed)) paragraphs = parsed.filter((p): p is string => typeof p === 'string')
      } catch {
        /* ignora bloco inválido */
      }
      textBlocks[tb.refId] = {
        refId: tb.refId,
        title: tb.title,
        paragraphs,
        source: tb.source ?? undefined,
      }
    }

    const questions = doc.questions.map((q) => {
      let options: OptionJson[] = []
      try {
        const parsed = JSON.parse(q.options)
        if (Array.isArray(parsed)) {
          options = parsed.filter(
            (o): o is OptionJson =>
              typeof o === 'object' && o !== null &&
              typeof (o as OptionJson).key === 'string' &&
              typeof (o as OptionJson).html === 'string'
          )
        }
      } catch {
        /* ignora questão inválida */
      }
      return {
        id: q.number,
        subjectId: q.topic,
        textRef: q.textRef ?? undefined,
        statement: q.statement,
        options,
        answer: q.answer,
        comment: q.comment,
      }
    })

    return NextResponse.json({
      document: {
        id: doc.id,
        title: doc.title,
        fileName: doc.fileName,
        style: doc.style,
        status: doc.status,
        pages: doc.pages,
        charCount: doc.charCount,
        createdAt: doc.createdAt.toISOString(),
      },
      questions,
      textBlocks,
    })
  } catch (err) {
    console.error('[document:GET]', err)
    return NextResponse.json({ error: 'Erro ao carregar o simulado' }, { status: 500 })
  }
}

/** DELETE /api/documents/[id] — exclui o simulado e seus dados */
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    await db.document.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[document:DELETE]', err)
    return NextResponse.json({ error: 'Erro ao excluir o simulado' }, { status: 500 })
  }
}
