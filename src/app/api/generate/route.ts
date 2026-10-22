import { NextResponse, NextRequest } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import {
  buildPrompt,
  parseGeneratedQuestions,
  questionsPerChunk,
  type QuestionStyle,
} from '@/lib/question-gen'

export const runtime = 'nodejs'
export const maxDuration = 60

const MAX_CHUNK = 20_000

function normalizeStyle(v: unknown): QuestionStyle {
  return v === 'certo_errado' ? 'certo_errado' : 'multipla'
}

function hasValidAccess(req: NextRequest): boolean {
  // Quando ACCESS_CODES está configurado, exige um código válido no header.
  // Sem ACCESS_CODES (ex.: preview local), a geração fica liberada.
  const codes = (process.env.ACCESS_CODES ?? '')
    .split(',')
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean)
  if (codes.length === 0) return true
  const provided = (req.headers.get('x-access-code') ?? '').trim().toUpperCase()
  return provided.length > 0 && codes.includes(provided)
}

/** Provedor 1: SDK do ambiente (Z.ai) — 2 tentativas */
async function viaZai(chunk: string, style: QuestionStyle, count: number): Promise<string> {
  const zai = await ZAI.create()
  const prompt = buildPrompt(chunk, style, count)
  let lastError: unknown = null
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content:
              'Você é um elaborador de questões de concursos. Responde SEMPRE apenas com JSON válido, sem markdown e sem explicações.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.4,
      })
      return completion.choices[0]?.message?.content ?? ''
    } catch (err) {
      lastError = err
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Falha na IA')
}

/** Provedor 2: API OpenAI-compatível (para Vercel, via AI_API_KEY) */
async function viaOpenAI(chunk: string, style: QuestionStyle, count: number): Promise<string> {
  const apiKey = process.env.AI_API_KEY
  if (!apiKey) throw new Error('IA não configurada')
  const base = (process.env.AI_API_BASE ?? 'https://api.openai.com/v1').replace(/\/+$/, '')
  const model = process.env.AI_MODEL ?? 'gpt-4o-mini'

  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      messages: [
        {
          role: 'system',
          content:
            'Você é um elaborador de questões de concursos. Responde SEMPRE apenas com JSON válido, sem markdown e sem explicações.',
        },
        { role: 'user', content: buildPrompt(chunk, style, count) },
      ],
    }),
  })
  if (!res.ok) throw new Error(`Provedor de IA respondeu ${res.status}`)
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] }
  return data.choices?.[0]?.message?.content ?? ''
}

/**
 * POST /api/generate
 * Recebe UM bloco de texto do PDF (extraído no cliente) e devolve questões.
 */
export async function POST(req: NextRequest) {
  if (!hasValidAccess(req)) {
    return NextResponse.json(
      { error: 'Acesso inválido. Ative sua assinatura para gerar simulados.' },
      { status: 401 },
    )
  }

  let body: { chunk?: unknown; style?: unknown; count?: unknown }
  try {
    body = (await req.json()) as typeof body
  } catch {
    return NextResponse.json({ error: 'Requisição inválida' }, { status: 400 })
  }

  const chunk = typeof body.chunk === 'string' ? body.chunk.trim().slice(0, MAX_CHUNK) : ''
  if (chunk.length < 100) {
    return NextResponse.json({ error: 'Bloco de texto muito curto' }, { status: 400 })
  }

  const style = normalizeStyle(body.style)
  const count =
    typeof body.count === 'number' && body.count >= 1 && body.count <= 12
      ? Math.floor(body.count)
      : questionsPerChunk(style)

  const errors: string[] = []
  for (const provider of [viaZai, viaOpenAI]) {
    try {
      const raw = await provider(chunk, style, count)
      const questions = parseGeneratedQuestions(raw, style)
      return NextResponse.json({ questions })
    } catch (err) {
      errors.push(err instanceof Error ? err.message : String(err))
    }
  }

  console.error('[generate] provedores falharam:', errors)
  const aiUnavailable = errors.some(
    (m) => m.includes('IA não configurada') || m.includes('Provedor de IA respondeu') || m.includes('Falha na IA'),
  )
  return NextResponse.json(
    {
      error: aiUnavailable
        ? 'Serviço de IA temporariamente indisponível. Tente novamente em alguns minutos.'
        : 'Não foi possível gerar questões para este bloco.',
    },
    { status: aiUnavailable ? 503 : 500 },
  )
}
