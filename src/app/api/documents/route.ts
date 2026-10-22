import { NextResponse, NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { extractPdfText, chunkText } from '@/lib/pdf-text'
import type { QuestionStyle } from '@/lib/question-gen'

export const runtime = 'nodejs'
export const maxDuration = 300

const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25 MB

/** GET /api/documents — lista os simulados enviados */
export async function GET() {
  try {
    const docs = await db.document.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { questions: true } } },
    })
    return NextResponse.json({
      documents: docs.map((d) => ({
        id: d.id,
        title: d.title,
        fileName: d.fileName,
        fileSize: d.fileSize,
        pages: d.pages,
        charCount: d.charCount,
        style: d.style,
        status: d.status,
        error: d.error,
        chunksTotal: d.chunksTotal,
        chunksDone: d.chunksDone,
        createdAt: d.createdAt.toISOString(),
        questionsCount: d._count.questions,
      })),
    })
  } catch (err) {
    console.error('[documents:GET]', err)
    return NextResponse.json({ error: 'Erro ao listar documentos' }, { status: 500 })
  }
}

/** POST /api/documents — upload de PDF, extração de texto e criação do documento */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file')
    const rawTitle = formData.get('title')
    const styleRaw = formData.get('style')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Arquivo não enviado' }, { status: 400 })
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Arquivo muito grande (máximo 25 MB)' }, { status: 413 })
    }

    const isPdf =
      file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    if (!isPdf) {
      return NextResponse.json({ error: 'Envie apenas arquivos PDF' }, { status: 400 })
    }

    const style: QuestionStyle = styleRaw === 'certo_errado' ? 'certo_errado' : 'multipla'
    const fallbackTitle = file.name.replace(/\.pdf$/i, '').replace(/[_-]+/g, ' ').trim()
    const title =
      typeof rawTitle === 'string' && rawTitle.trim()
        ? rawTitle.trim().slice(0, 120)
        : (fallbackTitle || 'Simulado de PDF').slice(0, 120)

    // Extração de texto
    const buffer = new Uint8Array(await file.arrayBuffer())
    let extraction
    try {
      extraction = await extractPdfText(buffer)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao ler o PDF'
      return NextResponse.json({ error: message }, { status: 422 })
    }

    const chunks = chunkText(extraction.text)
    if (chunks.length === 0) {
      return NextResponse.json(
        { error: 'O PDF não possui conteúdo de texto aproveitável' },
        { status: 422 }
      )
    }

    const doc = await db.document.create({
      data: {
        title,
        fileName: file.name,
        fileSize: file.size,
        pages: extraction.pages,
        charCount: extraction.text.length,
        style,
        status: 'processing',
        chunks: JSON.stringify(chunks),
        chunksTotal: chunks.length,
        chunksDone: 0,
      },
    })

    return NextResponse.json({
      id: doc.id,
      title: doc.title,
      pages: doc.pages,
      charCount: doc.charCount,
      style: doc.style,
      status: doc.status,
      chunksTotal: doc.chunksTotal,
      chunksDone: doc.chunksDone,
      questionsCount: 0,
    })
  } catch (err) {
    console.error('[documents:POST]', err)
    return NextResponse.json(
      { error: 'Erro inesperado ao processar o PDF' },
      { status: 500 }
    )
  }
}
