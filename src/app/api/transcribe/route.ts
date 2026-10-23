import { NextResponse, NextRequest } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import { aiChatVision } from '@/lib/ai-gateway'

export const runtime = 'nodejs'
export const maxDuration = 60

/** Imagens por requisição (lote) e limite de tamanho por imagem em base64. */
const MAX_IMAGES = 3
const MAX_IMAGE_CHARS = 3_500_000 // ~2,6 MB por imagem em base64

const TRANSCRIBE_PROMPT =
  'Transcreva TODO o texto visível destas imagens de um material de estudo para concursos, em texto puro, ' +
  'na ordem em que as páginas aparecem, separando as páginas por uma linha em branco. ' +
  'Preserve a numeração de questões, enunciados, alternativas (A–E), trechos de lei, tabelas simples e rodapés. ' +
  'Não comente, não resuma e não omita nada.'

function hasValidAccess(req: NextRequest): boolean {
  const codes = (process.env.ACCESS_CODES ?? '')
    .split(',')
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean)
  if (codes.length === 0) return true
  const provided = (req.headers.get('x-access-code') ?? '').trim().toUpperCase()
  return provided.length > 0 && codes.includes(provided)
}

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
function viaGatewayVision(images: string[]): Promise<string> {
  return aiChatVision(TRANSCRIBE_PROMPT, images)
}

/**
 * POST /api/transcribe
 * Recebe um lote de páginas (data URLs JPEG) de um PDF escaneado e devolve o texto transcrito.
 */
export async function POST(req: NextRequest) {
  if (!hasValidAccess(req)) {
    return NextResponse.json(
      { error: 'Acesso inválido. Ative sua assinatura para usar a leitura por IA.' },
      { status: 401 },
    )
  }

  let body: { images?: unknown }
  try {
    body = (await req.json()) as typeof body
  } catch {
    return NextResponse.json({ error: 'Requisição inválida' }, { status: 400 })
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

  const errors: string[] = []
  for (const provider of [viaZaiVision, viaGatewayVision]) {
    try {
      const text = await provider(images)
      if (text.trim()) return NextResponse.json({ text })
      errors.push('resposta vazia')
    } catch (err) {
      errors.push(err instanceof Error ? err.message : String(err))
    }
  }

  console.error('[transcribe] provedores falharam:', errors)
  const aiUnavailable = errors.some(
    (m) => m.includes('IA não configurada') || m.includes('Provedor de IA respondeu') || m.includes('Failed to make API request') || m.includes('Configuration file not found'),
  )
  return NextResponse.json(
    {
      error: aiUnavailable
        ? 'Serviço de leitura por IA temporariamente indisponível. Tente novamente em alguns minutos.'
        : 'Não foi possível transcrever este lote de páginas.',
    },
    { status: aiUnavailable ? 503 : 500 },
  )
}
