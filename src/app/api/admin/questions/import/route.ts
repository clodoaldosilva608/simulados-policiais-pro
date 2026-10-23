import { NextRequest, NextResponse } from 'next/server'
import { adminFromRequest } from '@/lib/admin-auth'
import { appendEvent, blobConfigured } from '@/lib/blob-registry'
import { bulkInsertQuestions } from '@/lib/content'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/questions/import — importação em massa.
 *
 * Aceita JSON {questions:[...]} OU CSV (multipart form file "file" ou campo
 * texto "csv"). Colunas do CSV (cabeçalho obrigatório, separador ; ou ,):
 *   banca;concurso;nivel;materia;assunto;ano;tipo;statement;a;b;c;d;e;answer;comment
 * tipo: "multipla" ou "certo_errado" (a/b = Certo/Errado). answer = letra (A-E).
 */

function parseCsvLine(line: string, sep: string): string[] {
  const out: string[] = []
  let cur = ''
  let quoted = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') {
        cur += '"'
        i++
      } else quoted = !quoted
    } else if (ch === sep && !quoted) {
      out.push(cur)
      cur = ''
    } else cur += ch
  }
  out.push(cur)
  return out.map((s) => s.trim())
}

function csvToQuestions(csv: string): Record<string, unknown>[] {
  const lines = csv.split(/\r?\n/).filter((l) => l.trim().length > 0)
  if (lines.length < 2) return []
  const headerLine = lines[0]
  const sep = (headerLine.match(/;/g)?.length ?? 0) >= (headerLine.match(/,/g)?.length ?? 0) ? ';' : ','
  const header = parseCsvLine(headerLine, sep).map((h) => h.toLowerCase().replace(/\s+/g, '_'))
  const idx = (name: string) => header.indexOf(name)
  const out: Record<string, unknown>[] = []
  for (const line of lines.slice(1)) {
    const cols = parseCsvLine(line, sep)
    const get = (name: string) => {
      const i = idx(name)
      return i >= 0 ? (cols[i] ?? '') : ''
    }
    const tipo = String(get('tipo')).toLowerCase().includes('certo') ? 'certo_errado' : 'multipla'
    const options =
      tipo === 'certo_errado'
        ? ['Certo', 'Errado']
        : [get('a'), get('b'), get('c'), get('d'), get('e')].filter((o) => o.length > 0)
    const answerLetter = String(get('answer') || 'a').trim().toLowerCase()
    const answerIndex =
      tipo === 'certo_errado'
        ? answerLetter === 'certo' || answerLetter === 'a' || answerLetter === '1' || answerLetter === 'true'
          ? 0
          : 1
        : Math.max(0, 'abcde'.indexOf(answerLetter))
    out.push({
      banca: get('banca'),
      concurso: get('concurso'),
      nivel: get('nivel'),
      materia: get('materia'),
      assunto: get('assunto'),
      ano: Number(get('ano')) || new Date().getFullYear(),
      tipo,
      statement: get('statement'),
      options,
      answer: answerIndex,
      comment: get('comment'),
    })
  }
  return out
}

export async function POST(req: NextRequest) {
  if (!adminFromRequest(req)) {
    return NextResponse.json({ ok: false, error: 'nao-autenticado' }, { status: 401 })
  }
  if (!blobConfigured()) {
    return NextResponse.json({ ok: false, error: 'armazenamento-nao-configurado' }, { status: 503 })
  }

  const contentType = req.headers.get('content-type') ?? ''

  try {
    let inputs: Record<string, unknown>[] = []

    if (contentType.includes('application/json')) {
      const body = (await req.json()) as { questions?: unknown; csv?: unknown }
      if (Array.isArray(body.questions)) {
        inputs = body.questions as Record<string, unknown>[]
      } else if (typeof body.csv === 'string' && body.csv.trim()) {
        inputs = csvToQuestions(body.csv)
      }
    } else if (contentType.includes('multipart/form-data')) {
      const form = await req.formData()
      const file = form.get('file')
      if (file && typeof file !== 'string') {
        const text = await file.text()
        inputs = csvToQuestions(text)
      } else {
        const csv = typeof form.get('csv') === 'string' ? String(form.get('csv')) : ''
        inputs = csvToQuestions(csv)
      }
    }

    if (inputs.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'Nenhuma questão reconhecida no arquivo/envio.' },
        { status: 400 },
      )
    }

    const result = await bulkInsertQuestions(inputs)
    void appendEvent({
      type: 'admin_questions_imported',
      message: `${result.inserted} questões importadas${result.errors.length ? ` (${result.errors.length}+ rejeitadas)` : ''}`,
      source: 'admin',
    })
    return NextResponse.json({ ok: true, ...result })
  } catch {
    return NextResponse.json({ ok: false, error: 'Falha ao processar a importação.' }, { status: 400 })
  }
}
