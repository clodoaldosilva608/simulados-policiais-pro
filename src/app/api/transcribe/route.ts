import { NextResponse, NextRequest } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import { aiChatVision, type AiCallConfig } from '@/lib/ai-gateway'
import { aiRouteGuard } from '@/lib/user-auth'

export const runtime = 'nodejs'
export const maxDuration = 150

/** Imagens por requisição (lote) e limite de tamanho por imagem em base64. */
const MAX_IMAGES = 3
const MAX_IMAGE_CHARS = 3_500_000 // ~2,6 MB por imagem em base64

const TRANSCRIBE_PROMPT =
  'Transcreva TODO o texto visível destas imagens de um material de estudo para concursos, em texto puro, ' +
  'na ordem em que as páginas aparecem, separando as páginas por uma linha em branco. ' +
  'Preserve a numeração de questões, enunciados, alternativas (A–E), trechos de lei, tabelas simples e rodapés. ' +
  'Não comente, não resuma e não omita nada.'

// Segurança: transcrição exige CONTA AUTENTICADA + limite por conta.
// (Antes usava ACCESS_CODES via header — aberta quando a env não existia.)

/** Provedor 1: SDK do ambiente (Z.ai) — usado em desenvolvimento/preview */
async function viaZaiVision(images: string[]): Promise<string> {
  const zai = await ZAI.create()
  const content: unknown[] = [{ type: 'text', text: TRANSCRIBE_PROMPT }]
  for (const url of images) content.push({ type: 'image_url', image_url: { url } })
  const completion = await zai.chat.completions.createVision({
    messages: [{ role: 'user', content }],
  })
  return completion.choices[0]?.message?.content ?? ''
}

/** Provedor 2: gateway OpenAI-compatível (produção/Vercel) */
function viaGatewayVision(images: string[], cfg?: AiCallConfig): Promise<string> {
  return aiChatVision(TRANSCRIBE_PROMPT, images, cfg)
}

/**
 * POST /api/transcribe
 * Recebe um lote de páginas (data URLs JPEG) de um PDF escaneado e devolve o texto transcrito.
 * Opcionalmente usa a chave de IA do aluno (Google AI Studio) enviada no corpo.
 */
export async function POST(req: NextRequest) {
  const guard = await aiRouteGuard(req, 'transcribe', 30)
  if (!guard.ok) {
    return NextResponse.json({ error: guard.message }, { status: guard.status })
  }

  let body: { images?: unknown; apiKey?: unknown; model?: unknown }
  try {
    body = (await req.json()) as typeof body
  } catch {
    return NextResponse.json({ error: 'Requisição inválida' }, { status: 400 })
  }

  const userCfg: AiCallConfig = {}
  if (typeof body.apiKey === 'string' && body.apiKey.trim()) {
    userCfg.apiKey = body.apiKey.trim().slice(0, 300)
  }
  if (typeof body.model === 'string' && body.model.trim()) {
    userCfg.model = body.model.trim().slice(0, 80)
  }

  const images = Array.isArray(body.images)
    ? body.images.filter((x): x is string => typeof x === 'string' && x.startsWith('data:image/'))
    : []

  if (images.length === 0 || images.length > MAX_IMAGES) {
    return NextResponse.json({ error: `Envie de 1 a ${MAX_IMAGES} imagens por requisição` }, { status: 400 })
  }
  if (images.some((img) => img.length > MAX_IMAGE_CHARS)) {
    return NextResponse.json({ error: 'Imagem muito grande' }, { status: 413 })
  }

  const errors: { message: string; status?: number }[] = []
  const providers: { run: () => Promise<string> }[] = [
    ...(userCfg.apiKey ? [{ run: () => viaGatewayVision(images, userCfg) }] : []),
    { run: () => viaZaiVision(images) },
    { run: () => viaGatewayVision(images) },
  ]
  for (const provider of providers) {
    try {
      const text = await provider.run()
      if (text.trim()) return NextResponse.json({ text })
      errors.push({ message: 'resposta vazia' })
    } catch (err) {
      const status =
        err instanceof Error && typeof (err as Error & { status?: number }).status === 'number'
          ? (err as Error & { status?: number }).status
          : undefined
      errors.push({ message: err instanceof Error ? err.message : String(err), status })
    }
  }

  console.error('[transcribe] provedores falharam:', errors.map((e) => e.message))
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
      e.message.includes('Failed to make API request') ||
      e.message.includes('Configuration file not found'),
  )

  if (keyRejected) {
    return NextResponse.json(
      {
        error:
          'Sua chave de IA foi recusada pelo Google. Abra Menu → Configurações da IA, confira a chave e toque em "Testar chave".',
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
        ? 'Serviço de leitura por IA temporariamente indisponível. Configure a SUA chave gratuita em Menu → Configurações da IA para ler PDFs sem depender do serviço do app.'
        : 'Não foi possível transcrever este lote de páginas.',
    },
    { status: aiUnavailable ? 503 : 500 },
  )
}
