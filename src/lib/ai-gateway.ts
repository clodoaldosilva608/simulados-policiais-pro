/**
 * Gateway de IA para produção (Vercel).
 *
 * Duas fontes de credencial, nesta ordem de prioridade quando informadas:
 *  1. CHAVE DO ALUNO (BYOK) — passada por requisição via `cfg.apiKey`
 *     (criada no Google AI Studio → https://aistudio.google.com/apikey).
 *     Funciona com chaves no formato clássico ("AIza...") e no novo formato
 *     ("AQ...."). Usamos a API NATIVA do Gemini (generativelanguage
 *     .googleapis.com/v1beta) com cadeia de fallback de modelos: quando a
 *     Google descontinua ou sobrecarrega um modelo, a chamada tenta sozinha
 *     o próximo modelo da cadeia. A chave transita apenas na requisição e
 *     NUNCA é armazenada no servidor.
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

const GEMINI_NATIVE_BASE = 'https://generativelanguage.googleapis.com/v1beta'
const GEMINI_OPENAI_BASE = 'https://generativelanguage.googleapis.com/v1beta/openai'
const BASE = (process.env.AI_API_BASE ?? 'https://api.openai.com/v1').replace(/\/+$/, '')

/**
 * Modelo padrão do aluno e cadeia de fallback (out/2026): os modelos 2.0/2.5
 * foram descontinuados pela Google para chaves novas — a cadeia cobre modelos
 * aposentados (404), sobrecarregados (503) ou sem cota (429). Só entram na
 * cadeia modelos rápidos e confiáveis (o "flash-latest" ficou de fora porque
 * costuma estar sobrecarregado e pendurar a chamada).
 */
const USER_KEY_DEFAULT_MODEL = 'gemini-3-flash-preview'
const USER_KEY_MODEL_FALLBACKS = ['gemini-3.1-flash-lite', 'gemini-flash-lite-latest']

export interface AiCallConfig {
  /** Chave do aluno (Google AI Studio) para esta requisição. */
  apiKey?: string
  /** Modelo explícito (ex.: gemini-3-flash-preview). */
  model?: string
  /** Criatividade 0–1 (padrão 0.4). */
  temperature?: number
  /** Limite de tokens de saída (opcional). */
  maxTokens?: number
}

export function aiConfigured(): boolean {
  return Boolean(process.env.AI_API_KEY)
}

/** Cadeia de modelos a tentar para a chave do aluno (máx. 3 tentativas). */
function userModelChain(model?: string): string[] {
  const primary = model?.trim() || USER_KEY_DEFAULT_MODEL
  return [primary, ...USER_KEY_MODEL_FALLBACKS.filter((m) => m !== primary)].slice(0, 3)
}

/** Vale a pena tentar o próximo modelo da cadeia para este erro? */
function shouldFallbackModel(status: number | undefined, message: string): boolean {
  // 404: modelo descontinuado • 503: sobrecarregado • 429: cota esgotada
  if (status === 404 || status === 503 || status === 429) return true
  if (status === 400 && /no longer available|not found|not supported|unsupported/i.test(message)) return true
  // Timeout do modelo (não do prazo global): um modelo lento não deve matar a
  // chamada — tentamos o próximo da cadeia com o tempo restante.
  if (!status && /aborted|timeout|tempo esgotado/i.test(message)) return true
  return false
}

/* ------------------------------------------------------------------ */
/* Caminho do APP (variáveis de ambiente) — igual ao comportamento     */
/* anterior, OpenAI-compatível.                                        */
/* ------------------------------------------------------------------ */

function envHeaders(): Record<string, string> {
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
  return headers
}

async function envPost(path: string, body: unknown, timeoutMs: number): Promise<string> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: envHeaders(),
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    if (!res.ok) {
      const detail = await providerErrorDetail(res)
      const err = new Error(`Provedor de IA respondeu ${res.status}${detail ? `: ${detail}` : ''}`)
      ;(err as Error & { status?: number }).status = res.status
      throw err
    }
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] }
    return data.choices?.[0]?.message?.content ?? ''
  } finally {
    clearTimeout(timer)
  }
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

/* ------------------------------------------------------------------ */
/* Caminho do ALUNO (BYOK) — API nativa do Gemini + cadeia de modelos  */
/* ------------------------------------------------------------------ */

/** Chamada POST à API nativa do Gemini com a chave do aluno. */
async function geminiNative(model: string, apiKey: string, body: unknown, timeoutMs: number): Promise<string> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(`${GEMINI_NATIVE_BASE}/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    if (!res.ok) {
      const detail = await providerErrorDetail(res)
      const err = new Error(`Provedor de IA respondeu ${res.status}${detail ? `: ${detail}` : ''}`)
      ;(err as Error & { status?: number }).status = res.status
      throw err
    }
    const data = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] }
    const parts = data.candidates?.[0]?.content?.parts ?? []
    return parts
      .map((p) => p.text ?? '')
      .join('')
      .trim()
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Chamada com a cadeia de modelos + orçamento de tempo compartilhado.
 * - Tenta o modelo escolhido e, em erros recuperáveis (404/429/503), o próximo
 *   da cadeia, respeitando o prazo total (as rotas têm maxDuration de 60s).
 * - Modelos Flash/Lite da família 3.x "pensam" por padrão e podem estourar o
 *   tempo: enviamos thinkingBudget 0 para respostas diretas; se o modelo
 *   recusar o campo, tentamos de novo sem ele.
 */
async function userKeyNativeChain(
  buildBody: (withThinking: boolean) => Record<string, unknown>,
  apiKey: string,
  cfg: AiCallConfig,
  deadlineMs: number,
): Promise<string> {
  const startedAt = Date.now()
  const chain = userModelChain(cfg.model)
  let lastErr: Error | null = null
  for (const model of chain) {
    const remaining = deadlineMs - (Date.now() - startedAt)
    if (remaining < 8_000) break // sem tempo para mais uma tentativa
    const timeout = Math.min(60_000, remaining)
    const isFlash = /flash/i.test(model) && !/pro/i.test(model)
    try {
      const text = await geminiNative(model, apiKey, buildBody(isFlash), timeout)
      if (text) return text
      lastErr = new Error(`Provedor de IA respondeu vazio (${model})`)
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error(String(err))
      const status = (err as Error & { status?: number }).status
      // Modelo recusou o thinkingBudget? Repete o MESMO modelo sem o campo.
      if (isFlash && status === 400 && /thinking/i.test(lastErr.message)) {
        try {
          const text = await geminiNative(model, apiKey, buildBody(false), timeout)
          if (text) return text
          lastErr = new Error(`Provedor de IA respondeu vazio (${model})`)
        } catch (retryErr) {
          lastErr = retryErr instanceof Error ? retryErr : new Error(String(retryErr))
        }
      }
      if (!shouldFallbackModel((lastErr as Error & { status?: number }).status, lastErr.message)) break
    }
  }
  throw lastErr ?? new Error('Falha na IA do Google')
}

/** Fallback secundário: endpoint OpenAI-compatível do Gemini. */
async function geminiOpenaiCompat(model: string, apiKey: string, body: unknown, timeoutMs: number): Promise<string> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(`${GEMINI_OPENAI_BASE}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    if (!res.ok) {
      const detail = await providerErrorDetail(res)
      const err = new Error(`Provedor de IA respondeu ${res.status}${detail ? `: ${detail}` : ''}`)
      ;(err as Error & { status?: number }).status = res.status
      throw err
    }
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] }
    return data.choices?.[0]?.message?.content ?? ''
  } finally {
    clearTimeout(timer)
  }
}

function dataUrlToInlineData(url: string): { inlineData: { mimeType: string; data: string } } | null {
  const m = url.match(/^data:([^;]+);base64,(.+)$/s)
  if (!m) return null
  return { inlineData: { mimeType: m[1], data: m[2] } }
}

/**
 * Chamada de TEXTO com a chave do aluno: percorre a cadeia de modelos na API
 * nativa e, se todos falharem, tenta uma última vez pelo OpenAI-compat.
 */
async function userKeyText(
  system: string,
  user: string,
  cfg: AiCallConfig,
): Promise<string> {
  const apiKey = cfg.apiKey!.trim()
  const temperature = typeof cfg.temperature === 'number' ? Math.min(Math.max(cfg.temperature, 0), 1) : 0.4
  const buildBody = (withThinking: boolean): Record<string, unknown> => {
    const generationConfig: Record<string, unknown> = {
      temperature,
      ...(cfg.maxTokens ? { maxOutputTokens: cfg.maxTokens } : {}),
    }
    if (withThinking) generationConfig.thinkingConfig = { thinkingBudget: 0 }
    const body: Record<string, unknown> = {
      contents: [{ role: 'user', parts: [{ text: user }] }],
      generationConfig,
    }
    if (system) body.systemInstruction = { parts: [{ text: system }] }
    return body
  }
  const openaiBody = {
    model: cfg.model?.trim() || USER_KEY_DEFAULT_MODEL,
    temperature,
    ...(cfg.maxTokens ? { max_tokens: cfg.maxTokens } : {}),
    messages: [
      ...(system ? [{ role: 'system', content: system }] : []),
      { role: 'user', content: user },
    ],
  }

  try {
    return await userKeyNativeChain(buildBody, apiKey, cfg, 130_000)
  } catch (err) {
    // Última tentativa: endpoint OpenAI-compatível (mesmo modelo escolhido),
    // só se ainda houver folga no orçamento da função.
    if (err instanceof Error && err.name !== 'TimeoutError' && err.name !== 'AbortError') {
      try {
        const text = await geminiOpenaiCompat(openaiBody.model, apiKey, openaiBody, 8_000)
        if (text) return text
      } catch (compatErr) {
        throw compatErr instanceof Error ? compatErr : err
      }
    }
    throw err instanceof Error ? err : new Error(String(err))
  }
}

/** Chamada de VISÃO (OCR) com a chave do aluno: imagens viram inlineData. */
async function userKeyVision(
  prompt: string,
  imageDataUrls: string[],
  cfg: AiCallConfig,
): Promise<string> {
  const apiKey = cfg.apiKey!.trim()
  const imageParts = imageDataUrls
    .map((url) => dataUrlToInlineData(url))
    .filter((p): p is NonNullable<ReturnType<typeof dataUrlToInlineData>> => p !== null)
  const buildBody = (withThinking: boolean): Record<string, unknown> => {
    const body: Record<string, unknown> = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }, ...imageParts],
        },
      ],
    }
    if (withThinking) {
      body.generationConfig = { thinkingConfig: { thinkingBudget: 0 } }
    }
    return body
  }
  const openaiBody = {
    model: cfg.model?.trim() || USER_KEY_DEFAULT_MODEL,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          ...imageDataUrls.map((url) => ({ type: 'image_url', image_url: { url } })),
        ],
      },
    ],
  }

  try {
    return await userKeyNativeChain(buildBody, apiKey, cfg, 130_000)
  } catch (err) {
    if (err instanceof Error && err.name !== 'TimeoutError' && err.name !== 'AbortError') {
      try {
        const text = await geminiOpenaiCompat(openaiBody.model, apiKey, openaiBody, 8_000)
        if (text) return text
      } catch (compatErr) {
        throw compatErr instanceof Error ? compatErr : err
      }
    }
    throw err instanceof Error ? err : new Error(String(err))
  }
}

/* ------------------------------------------------------------------ */
/* API pública (mesma assinatura de antes)                             */
/* ------------------------------------------------------------------ */

/** Chamada de texto — geração de questões. */
export function aiChatText(
  messages: { role: string; content: string }[],
  cfg?: AiCallConfig,
): Promise<string> {
  const userKey = cfg?.apiKey?.trim()
  if (userKey) {
    const system = messages.find((m) => m.role === 'system')?.content ?? ''
    const user = messages
      .filter((m) => m.role !== 'system')
      .map((m) => m.content)
      .join('\n\n')
    return userKeyText(system, user, cfg!)
  }
  const model = cfg?.model?.trim() || process.env.AI_MODEL || 'gpt-4o-mini'
  return envPost(
    '/chat/completions',
    {
      model,
      temperature: typeof cfg?.temperature === 'number' ? Math.min(Math.max(cfg.temperature, 0), 1) : 0.4,
      messages,
      ...(cfg?.maxTokens ? { max_tokens: cfg.maxTokens } : {}),
    },
    55_000,
  )
}

/** Chamada de visão — OCR/transcrição de páginas de PDF em imagem (data URLs). */
export function aiChatVision(
  prompt: string,
  imageDataUrls: string[],
  cfg?: AiCallConfig,
): Promise<string> {
  if (cfg?.apiKey?.trim()) {
    return userKeyVision(prompt, imageDataUrls, cfg)
  }
  // Gateway interno do ambiente mantém o endpoint dedicado /chat/completions/vision.
  const content: unknown[] = [{ type: 'text', text: prompt }]
  for (const url of imageDataUrls) {
    content.push({ type: 'image_url', image_url: { url } })
  }
  return envPost(
    '/chat/completions/vision',
    {
      model: cfg?.model?.trim() || process.env.AI_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'user', content }],
    },
    58_000,
  )
}
