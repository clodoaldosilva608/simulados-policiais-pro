import { NextResponse, NextRequest } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import { aiChatText, type AiCallConfig } from '@/lib/ai-gateway'
import { aiRouteGuard } from '@/lib/user-auth'
import { personaPrompt } from '@/lib/ai-settings'
import {
  buildPrompt,
  parseGeneratedQuestions,
  questionsPerChunk,
  type QuestionStyle,
} from '@/lib/question-gen'

export const runtime = 'nodejs'
export const maxDuration = 150

const MAX_CHUNK = 20_000

function normalizeStyle(v: unknown): QuestionStyle {
  return v === 'certo_errado' ? 'certo_errado' : 'multipla'
}

// Segurança: geração de questões exige CONTA AUTENTICADA + limite por conta.
// (Antes usava ACCESS_CODES via header — aberta quando a env não existia.)

/** Configuração da IA vinda do corpo da requisição (chave do aluno, etc.) */
interface GenerateAiConfig extends AiCallConfig {
  instructions?: string
  commentDetail?: string
  persona?: unknown
}

function configFromBody(body: Record<string, unknown>): GenerateAiConfig {
  const apiKey = typeof body.apiKey === 'string' ? body.apiKey.trim().slice(0, 300) : ''
  const model = typeof body.model === 'string' ? body.model.trim().slice(0, 80) : ''
  const temperature =
    typeof body.temperature === 'number' && body.temperature >= 0 && body.temperature <= 1
      ? body.temperature
      : undefined
  return {
    ...(apiKey ? { apiKey } : {}),
    ...(model ? { model } : {}),
    ...(temperature !== undefined ? { temperature } : {}),
  }
}

function systemPrompt(persona: unknown): string {
  const personaText =
    typeof persona === 'string' && ['professor', 'direto', 'coach'].includes(persona)
      ? personaPrompt(persona as 'professor' | 'direto' | 'coach')
      : personaPrompt('professor')
  return (
    'Você é um elaborador de questões de concursos. ' +
    personaText +
    ' Responda SEMPRE apenas com JSON válido, sem markdown e sem explicações.'
  )
}

/** Provedor 1: chave do ALUNO (Google AI Studio / Gemini OpenAI-compat) */
async function viaUserKey(
  chunk: string,
  style: QuestionStyle,
  count: number,
  cfg: GenerateAiConfig,
): Promise<string> {
  if (!cfg.apiKey) throw new Error('sem chave do aluno')
  return aiChatText(
    [
      { role: 'system', content: systemPrompt(cfg.persona) },
      {
        role: 'user',
        content: buildPrompt(chunk, style, count, {
          commentDetail: cfg.commentDetail,
          instructions: cfg.instructions,
        }),
      },
    ],
    cfg,
  )
}

/** Provedor 2: SDK do ambiente (Z.ai) — desenvolvimento/preview */
async function viaZai(
  chunk: string,
  style: QuestionStyle,
  count: number,
  persona: unknown,
): Promise<string> {
  const zai = await ZAI.create()
  const prompt = buildPrompt(chunk, style, count)
  let lastError: unknown = null
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt(persona) },
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

/** Provedor 3: gateway OpenAI-compatível do app (produção, AI_API_BASE + AI_API_KEY) */
async function viaOpenAI(
  chunk: string,
  style: QuestionStyle,
  count: number,
  persona: unknown,
): Promise<string> {
  return aiChatText([
    { role: 'system', content: systemPrompt(persona) },
    { role: 'user', content: buildPrompt(chunk, style, count) },
  ])
}

/**
 * POST /api/generate
 * Recebe UM bloco de texto do PDF (extraído no cliente) e devolve questões.
 * Opcionalmente recebe a chave de IA do aluno (Google AI Studio) e as
 * preferências de comportamento configuradas na aba "Configurações da IA".
 */
export async function POST(req: NextRequest) {
  const guard = await aiRouteGuard(req, 'generate', 40)
  if (!guard.ok) {
    return NextResponse.json({ error: guard.message }, { status: guard.status })
  }

  let body: Record<string, unknown>
  try {
    body = (await req.json()) as Record<string, unknown>
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

  const cfg = {
    ...configFromBody(body),
    instructions: typeof body.instructions === 'string' ? body.instructions.slice(0, 600) : '',
    commentDetail: typeof body.commentDetail === 'string' ? body.commentDetail.slice(0, 20) : 'medio',
    persona: body.persona,
  }

  const errors: { message: string; status?: number }[] = []
  const providers: { name: string; run: () => Promise<string> }[] = [
    ...(cfg.apiKey ? [{ name: 'chave-do-aluno', run: () => viaUserKey(chunk, style, count, cfg) }] : []),
    { name: 'zai', run: () => viaZai(chunk, style, count, cfg.persona) },
    { name: 'gateway-do-app', run: () => viaOpenAI(chunk, style, count, cfg.persona) },
  ]

  for (const provider of providers) {
    try {
      const raw = await provider.run()
      const questions = parseGeneratedQuestions(raw, style)
      return NextResponse.json({ questions })
    } catch (err) {
      const status =
        err instanceof Error && typeof (err as Error & { status?: number }).status === 'number'
          ? (err as Error & { status?: number }).status
          : undefined
      errors.push({ message: err instanceof Error ? err.message : String(err), status })
    }
  }

  console.error('[generate] provedores falharam:', errors.map((e) => e.message))
  const joinedErrors = errors.map((e) => e.message).join(' | ')
  const keyRejected = errors.some(
    (e) =>
      e.status === 401 ||
      e.status === 403 ||
      (e.status === 400 && /api key|API_KEY_INVALID/i.test(e.message)),
  )
  const quota = errors.some((e) => e.status === 429)
  // Modelo descontinuado pela Google (todos os fallbacks da cadeia falharam)
  const modelRetired = /no longer available|is no longer available/i.test(joinedErrors)
  const aiUnavailable = errors.some(
    (e) =>
      e.message.includes('IA não configurada') ||
      e.message.includes('Provedor de IA respondeu') ||
      e.message.includes('Falha na IA') ||
      e.message.includes('Failed to make API request') ||
      e.message.includes('Configuration file not found'),
  )

  if (keyRejected) {
    return NextResponse.json(
      {
        error:
          'Sua chave de IA foi recusada pelo Google. Abra Menu → Configurações da IA, confira se a chave foi colada por completo (começa com "AIza" ou "AQ.") e toque em "Testar chave".',
      },
      { status: 403 },
    )
  }
  if (modelRetired) {
    return NextResponse.json(
      {
        error:
          'O modelo de IA escolhido foi descontinuado pelo Google. Abra Menu → Configurações da IA e escolha outro modelo (ex.: Gemini 3 Flash).',
      },
      { status: 400 },
    )
  }
  if (quota) {
    return NextResponse.json(
      {
        error:
          'A cota gratuita da sua chave acabou por agora. Aguarde alguns minutos ou escolha outro modelo nas Configurações da IA.',
      },
      { status: 429 },
    )
  }
  return NextResponse.json(
    {
      error: aiUnavailable
        ? 'Serviço de IA temporariamente indisponível. Configure a SUA chave gratuita em Menu → Configurações da IA para gerar sem depender do serviço do app.'
        : 'Não foi possível gerar questões para este bloco.',
    },
    { status: aiUnavailable ? 503 : 500 },
  )
}
