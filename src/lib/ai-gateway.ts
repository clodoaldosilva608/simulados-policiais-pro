/**
 * Gateway de IA OpenAI-compatível para produção (Vercel).
 *
 * Duas fontes de credencial, nesta ordem de prioridade quando informadas:
 *  1. CHAVE DO ALUNO (BYOK) — passada por requisição via `cfg.apiKey`
 *     (criada no Google AI Studio → https://aistudio.google.com/apikey).
 *     Usamos o endpoint OpenAI-compatível do Gemini:
 *     https://generativelanguage.googleapis.com/v1beta/openai/
 *     A chave transita apenas na requisição e NUNCA é armazenada no servidor.
 *  2. PROVEDOR DO APP — variáveis de ambiente:
 *     - AI_API_BASE   (ex.: https://gateway.exemplo.ai/v1)
 *     - AI_API_KEY    (Bearer token do gateway)
 *     - AI_API_TOKEN  (opcional — header X-Token, gateways com sessão)
 *     - AI_CHAT_ID    (opcional — header X-Chat-Id)
 *     - AI_USER_ID    (opcional — header X-User-Id)
 *     - AI_MODEL      (opcional — padrão "gpt-4o-mini")
 *
 * Sem nenhuma das duas, o provedor reporta "IA não configurada" e a rota
 * tenta o próximo provedor (SDK Z.ai no ambiente de desenvolvimento).
 */

const GEMINI_OPENAI_BASE = 'https://generativelanguage.googleapis.com/v1beta/openai'
const BASE = (process.env.AI_API_BASE ?? 'https://api.openai.com/v1').replace(/\/+$/, '')

export interface AiCallConfig {
  /** Chave do aluno (Google AI Studio) para esta requisição. */
  apiKey?: string
  /** Modelo explícito (ex.: gemini-2.0-flash). */
  model?: string
  /** Criatividade 0–1 (padrão 0.4). */
  temperature?: number
  /** Limite de tokens de saída (opcional). */
  maxTokens?: number
}

export function aiConfigured(): boolean {
  return Boolean(process.env.AI_API_KEY)
}

function providerHeaders(cfg?: AiCallConfig): { headers: Record<string, string>; base: string; model: string } {
  const userKey = cfg?.apiKey?.trim()
  if (userKey) {
    return {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userKey}` },
      base: GEMINI_OPENAI_BASE,
      model: cfg?.model?.trim() || 'gemini-2.0-flash',
    }
  }
  const envKey = process.env.AI_API_KEY
  if (!envKey) throw new Error('IA não configurada')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${envKey}`,
    'X-Z-AI-From': 'Z',
  }
  if (process.env.AI_API_TOKEN) headers['X-Token'] = process.env.AI_API_TOKEN
  if (process.env.AI_CHAT_ID) headers['X-Chat-Id'] = process.env.AI_CHAT_ID
  if (process.env.AI_USER_ID) headers['X-User-Id'] = process.env.AI_USER_ID
  return { headers, base: BASE, model: cfg?.model?.trim() || process.env.AI_MODEL || 'gpt-4o-mini' }
}

/** Extrai a mensagem de erro do corpo do provedor (Google/OpenAI devolvem JSON). */
async function providerErrorDetail(res: Response): Promise<string> {
  try {
    // Google pode devolver o erro como ARRAY: [{"error":{"message":"..."}}]
    const raw = (await res.json()) as unknown
    const body = Array.isArray(raw) ? (raw[0] as Record<string, unknown>) : (raw as Record<string, unknown>)
    const err = body?.error as { message?: string } | string | undefined
    const msg =
      typeof err === 'string'
        ? err
        : err?.message || (typeof body?.message === 'string' ? body.message : '')
    return typeof msg === 'string' ? msg.slice(0, 300) : ''
  } catch {
    return ''
  }
}

async function postChat(path: string, body: unknown, timeoutMs: number, cfg?: AiCallConfig): Promise<string> {
  const { headers, base } = providerHeaders(cfg)
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(`${base}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    if (!res.ok) {
      const detail = await providerErrorDetail(res)
      const err = new Error(`Provedor de IA respondeu ${res.status}${detail ? `: ${detail}` : ''}`)
      // Status HTTP real ajuda as rotas a dar mensagens precisas ao aluno.
      ;(err as Error & { status?: number }).status = res.status
      throw err
    }
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] }
    return data.choices?.[0]?.message?.content ?? ''
  } finally {
    clearTimeout(timer)
  }
}

/** Chamada de texto — geração de questões. */
export function aiChatText(
  messages: { role: string; content: string }[],
  cfg?: AiCallConfig,
): Promise<string> {
  const { model } = providerHeaders(cfg)
  return postChat(
    '/chat/completions',
    {
      model,
      temperature: typeof cfg?.temperature === 'number' ? Math.min(Math.max(cfg.temperature, 0), 1) : 0.4,
      messages,
      ...(cfg?.maxTokens ? { max_tokens: cfg.maxTokens } : {}),
    },
    55_000,
    cfg,
  )
}

/** Chamada de visão — OCR/transcrição de páginas de PDF em imagem (data URLs). */
export function aiChatVision(
  prompt: string,
  imageDataUrls: string[],
  cfg?: AiCallConfig,
): Promise<string> {
  const { model, base } = providerHeaders(cfg)
  const content: unknown[] = [{ type: 'text', text: prompt }]
  for (const url of imageDataUrls) {
    content.push({ type: 'image_url', image_url: { url } })
  }
  // Gemini (OpenAI-compat) usa /chat/completions para visão também; o gateway
  // interno do ambiente mantém o endpoint dedicado /chat/completions/vision.
  const path = base === GEMINI_OPENAI_BASE ? '/chat/completions' : '/chat/completions/vision'
  return postChat(
    path,
    {
      model,
      messages: [{ role: 'user', content }],
    },
    58_000,
    cfg,
  )
}
