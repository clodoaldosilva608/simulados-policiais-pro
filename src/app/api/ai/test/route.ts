import { NextResponse, NextRequest } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import { aiChatText } from '@/lib/ai-gateway'

export const runtime = 'nodejs'
export const maxDuration = 60

const GEMINI_OPENAI_BASE = 'https://generativelanguage.googleapis.com/v1beta/openai'
const GEMINI_NATIVE_BASE = 'https://generativelanguage.googleapis.com/v1beta'

const PING = 'Responda apenas: OK'

/** Extrai a mensagem de erro do corpo do Google (objeto ou array). */
async function googleErrorDetail(res: Response): Promise<string> {
  try {
    const raw = (await res.json()) as unknown
    const body = Array.isArray(raw) ? (raw[0] as Record<string, unknown>) : (raw as Record<string, unknown>)
    const err = body?.error as { message?: string; status?: string } | string | undefined
    const msg =
      typeof err === 'string'
        ? err
        : err?.message || (typeof body?.message === 'string' ? body.message : '')
    const code = typeof err === 'object' && err?.status ? ` [${err.status}]` : ''
    return typeof msg === 'string' ? `${msg}${code}`.slice(0, 300) : ''
  } catch {
    return ''
  }
}

function errMessage(err: unknown): string {
  if (err instanceof Error) return err.name === 'TimeoutError' || err.name === 'AbortError' ? 'tempo esgotado' : err.message
  return String(err)
}

/** Lista os modelos Gemini disponíveis para a chave (dica quando algo falha). */
async function listGeminiModels(apiKey: string): Promise<string[]> {
  try {
    const res = await fetch(`${GEMINI_NATIVE_BASE}/models?pageSize=200`, {
      headers: { 'x-goog-api-key': apiKey },
      signal: AbortSignal.timeout(15_000),
    })
    if (!res.ok) return []
    const data = (await res.json()) as { models?: { name?: string }[] }
    return (data.models ?? [])
      .map((m) => (m.name ?? '').replace(/^models\//, ''))
      .filter((n) => n.includes('gemini'))
      .slice(0, 20)
  } catch {
    return []
  }
}

/** Mensagem amigável em PT-BR a partir do erro bruto do Google. */
function friendlyError(joined: string, model: string, models: string[]): string {
  if (/API key not valid|API_KEY_INVALID/i.test(joined)) {
    return 'Chave recusada pelo Google: a chave é inválida ou foi colada incompleta. Crie uma nova no Google AI Studio e cole aqui.'
  }
  if (/location is not supported/i.test(joined)) {
    return 'O Google recusou a chamada por causa da localização da conexão. Tente novamente mais tarde ou use outra rede (Wi-Fi/4G).'
  }
  if (/RESOURCE_EXHAUSTED|quota/i.test(joined)) {
    return 'A cota gratuita deste modelo acabou por agora. Aguarde alguns minutos ou escolha outro modelo.'
  }
  if (/SERVICE_DISABLED|not enabled|has not been used/i.test(joined)) {
    return 'O projeto da chave não tem a API do Gemini habilitada. Crie uma chave nova diretamente no Google AI Studio (botão acima) e ela já vem pronta.'
  }
  if (/PERMISSION_DENIED|restricted/i.test(joined)) {
    return 'A chave foi recusada por restrição de permissão. No AI Studio, crie a chave sem restrições de API ou escolha "Generative Language API".'
  }
  if (/not found|NOT_FOUND|not supported|does not exist|unsupported|no longer available/i.test(joined)) {
    const hint = models.length ? ` Modelos disponíveis na sua chave: ${models.slice(0, 6).join(', ')}.` : ''
    return `O modelo "${model}" não está disponível para a sua chave — os modelos 2.0/2.5 foram descontinuados pela Google para chaves novas. Escolha outro modelo nesta tela.${hint}`
  }
  if (/safety|blocked|SAFETY/i.test(joined)) {
    return 'O Google bloqueou a resposta por filtros de segurança. Tente novamente.'
  }
  return `O Google recusou o teste da chave: ${joined.slice(0, 220) || 'erro desconhecido'}.`
}

/**
 * POST /api/ai/test
 * Valida a chave de IA do aluno (Google AI Studio) de verdade: faz uma chamada
 * mínima ao Gemini pelo MESMO caminho usado na geração (OpenAI-compat) e, se
 * falhar, tenta o endpoint nativo — devolvendo a mensagem real do Google.
 * Sem chave no corpo, testa o provedor de IA do app (Z.ai/gateway).
 */
export async function POST(req: NextRequest) {
  let body: { apiKey?: unknown; model?: unknown }
  try {
    body = (await req.json()) as typeof body
  } catch {
    return NextResponse.json({ error: 'Requisição inválida' }, { status: 400 })
  }

  const apiKey = typeof body.apiKey === 'string' ? body.apiKey.trim().slice(0, 300) : ''
  const model = typeof body.model === 'string' && body.model.trim() ? body.model.trim().slice(0, 80) : 'gemini-3-flash-preview'

  // Sem chave própria: valida o provedor do app para saber se ele consegue gerar.
  if (!apiKey) {
    try {
      const zai = await ZAI.create()
      const completion = await zai.chat.completions.create({
        messages: [{ role: 'user', content: PING }],
      })
      const text = completion.choices[0]?.message?.content ?? ''
      if (text.trim()) return NextResponse.json({ ok: true, source: 'app', provider: 'zai' })
      return NextResponse.json({
        ok: false,
        error: 'O serviço de IA do app respondeu vazio. Configure a sua chave gratuita do Google AI Studio para gerar sem depender dele.',
      })
    } catch {
      try {
        const text = await aiChatText([{ role: 'user', content: PING }])
        if (text.trim()) return NextResponse.json({ ok: true, source: 'app', provider: 'gateway' })
      } catch {
        /* cai no erro abaixo */
      }
      return NextResponse.json({
        ok: false,
        error: 'O serviço de IA do app está indisponível agora. Configure a SUA chave gratuita do Google AI Studio para gerar sem depender dele.',
      })
    }
  }

  const detail: string[] = []
  const models = await listGeminiModels(apiKey)

  // Caminho 1 — OpenAI-compat (exatamente como a geração usa a chave do aluno)
  try {
    const res = await fetch(`${GEMINI_OPENAI_BASE}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, messages: [{ role: 'user', content: PING }], max_tokens: 5 }),
      signal: AbortSignal.timeout(30_000),
    })
    if (res.ok) {
      return NextResponse.json({ ok: true, via: 'openai-compat', model, models })
    }
    detail.push(`OpenAI-compat ${res.status}: ${(await googleErrorDetail(res)) || 'sem detalhe'}`)
  } catch (err) {
    detail.push(`OpenAI-compat: ${errMessage(err)}`)
  }

  // Caminho 2 — API nativa do Gemini (generateContent + x-goog-api-key)
  try {
    const res = await fetch(`${GEMINI_NATIVE_BASE}/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: PING }] }],
        generationConfig: {
          maxOutputTokens: 8,
          // Flash/Lite "pensam" por padrão — desligamos para o ping ser rápido.
          ...( /flash/i.test(model) && !/pro/i.test(model) ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
        },
      }),
      signal: AbortSignal.timeout(30_000),
    })
    if (res.ok) {
      return NextResponse.json({ ok: true, via: 'native-rest', model, models })
    }
    detail.push(`Nativo ${res.status}: ${(await googleErrorDetail(res)) || 'sem detalhe'}`)
  } catch (err) {
    detail.push(`Nativo: ${errMessage(err)}`)
  }

  const joined = detail.join(' | ')
  console.error('[ai/test] chave do aluno rejeitada:', joined.slice(0, 400))
  return NextResponse.json({
    ok: false,
    error: friendlyError(joined, model, models),
    detail: joined.slice(0, 500),
    models,
  })
}
