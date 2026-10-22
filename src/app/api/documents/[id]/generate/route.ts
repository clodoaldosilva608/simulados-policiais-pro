import { NextResponse, NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { generateQuestionsForChunk, type QuestionStyle } from '@/lib/question-gen'

export const runtime = 'nodejs'
export const maxDuration = 300

type RouteParams = { params: Promise<{ id: string }> }

const QUESTIONS_PER_CHUNK: Record<QuestionStyle, number> = {
  multipla: 5,
  certo_errado: 6,
}

/**
 * POST /api/documents/[id]/generate
 * Processa o próximo bloco de texto pendente (1 chamada de IA por requisição).
 * O cliente chama em loop até status === 'ready' | 'error'.
 */
export async function POST(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const doc = await db.document.findUnique({ where: { id } })

    if (!doc) {
      return NextResponse.json({ error: 'Simulado não encontrado' }, { status: 404 })
    }
    if (doc.status === 'ready') {
      return NextResponse.json({ status: 'ready', chunksDone: doc.chunksDone, chunksTotal: doc.chunksTotal })
    }
    if (doc.status === 'error') {
      return NextResponse.json({ status: 'error', error: doc.error, chunksDone: doc.chunksDone, chunksTotal: doc.chunksTotal })
    }

    // Blocos de texto
    let chunks: string[] = []
    try {
      const parsed = JSON.parse(typeof doc.chunks === 'string' ? doc.chunks : '[]')
      if (Array.isArray(parsed)) chunks = parsed.filter((c): c is string => typeof c === 'string')
    } catch {
      /* chunks inválidos */
    }
    if (chunks.length === 0) {
      await db.document.update({ where: { id }, data: { status: 'error', error: 'Conteúdo do PDF indisponível' } })
      return NextResponse.json({ status: 'error', error: 'Conteúdo do PDF indisponível' })
    }

    const index = doc.chunksDone
    if (index >= chunks.length) {
      const updated = await db.document.update({ where: { id }, data: { status: 'ready' } })
      return NextResponse.json({ status: updated.status, chunksDone: updated.chunksDone, chunksTotal: updated.chunksTotal })
    }

    const style = (doc.style === 'certo_errado' ? 'certo_errado' : 'multipla') as QuestionStyle
    const count = QUESTIONS_PER_CHUNK[style]

    let created = 0
    try {
      const generated = await generateQuestionsForChunk(chunks[index], style, count)

      // Número sequencial global para as questões
      const last = await db.question.findFirst({ orderBy: { number: 'desc' }, select: { number: true } })
      let nextNumber = (last?.number ?? 0) + 1

      for (const g of generated) {
        let textRef: string | null = null
        if (g.textBlock) {
          textRef = `t${index + 1}-${created + 1}`
          await db.textBlock.create({
            data: {
              documentId: doc.id,
              refId: textRef,
              title: g.textBlock.title,
              paragraphs: JSON.stringify(g.textBlock.paragraphs),
              source: g.textBlock.source ?? null,
            },
          })
        }
        await db.question.create({
          data: {
            documentId: doc.id,
            number: nextNumber++,
            topic: g.topic,
            statement: g.statement,
            options: JSON.stringify(g.options),
            answer: g.answer,
            comment: g.comment,
            textRef,
          },
        })
        created++
      }

      const chunksDone = index + 1
      const isLast = chunksDone >= chunks.length
      const totalQuestions = await db.question.count({ where: { documentId: doc.id } })

      // Se todos os blocos processados mas nenhuma questão foi gerada, marca erro
      const status = isLast && totalQuestions === 0 ? 'error' : isLast ? 'ready' : 'processing'
      const error = status === 'error' ? 'A IA não retornou questões aproveitáveis deste PDF' : null

      const updated = await db.document.update({
        where: { id },
        data: { chunksDone, status, error },
      })

      return NextResponse.json({
        status: updated.status,
        chunksDone: updated.chunksDone,
        chunksTotal: updated.chunksTotal,
        created,
      })
    } catch (err) {
      // Falha na IA para este bloco: pula o bloco e segue; se ao final não houver questões, marca erro
      console.error(`[generate] bloco ${index + 1}/${chunks.length} falhou:`, err)
      const chunksDone = index + 1
      const isLast = chunksDone >= chunks.length
      const totalQuestions = await db.question.count({ where: { documentId: doc.id } })
      const status = isLast && totalQuestions === 0 ? 'error' : isLast ? 'ready' : 'processing'
      const error = status === 'error' ? 'Falha na geração de questões por IA para este PDF' : null

      const updated = await db.document.update({
        where: { id },
        data: { chunksDone, status, error },
      })
      return NextResponse.json({
        status: updated.status,
        chunksDone: updated.chunksDone,
        chunksTotal: updated.chunksTotal,
        created: 0,
        skipped: true,
      })
    }
  } catch (err) {
    console.error('[generate]', err)
    return NextResponse.json({ error: 'Erro inesperado na geração' }, { status: 500 })
  }
}
