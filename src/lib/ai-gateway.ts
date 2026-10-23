/**
 * Gateway de IA OpenAI-compatível para produção (Vercel).
 *
 * Configuração via variáveis de ambiente:
 *  - AI_API_BASE   (ex.: https://gateway.exemplo.ai/v1)
 *  - AI_API_KEY    (Bearer token do gateway)
 *  - AI_API_TOKEN  (opcional — header X-Token, exigido por gateways com sessão)
 *  - AI_CHAT_ID    (opcional — header X-Chat-Id)
 *  - AI_USER_ID    (opcional — header X-User-Id)
 *  - AI_MODEL      (opcional — padrão "gpt-4o-mini")
 *
 * Sem AI_API_KEY o provedor reporta "IA não configurada" e a rota tenta o
 * próximo provedor (SDK Z.ai no ambiente de desenvolvimento).
 */

const BASE = (process.env.AI_API_BASE ?? 'https://api.openai.com/v1').replace(/\/+$/, '')

export function aiConfigured(): boolean {
  return Boolean(process.env.AI_API_KEY)
}

export function aiGatewayHeaders(): Record<string, string> {
  const apiKey = process.env.AI_API_KEY
  if (!apiKey) throw new Error('IA não configurada')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
    'X-Z-AI-From': 'Z',
  }
  if (process.env.AI_API_TOKEN) headers['X-Token'] = process.env.AI_API_TOKEN
  if (process.env.AI_CHAT_ID) headers['X-Chat-Id'] = process.env.AI_CHAT_ID
  if (process.env.AI_USER_ID) headers['X-User-Id'] = process.env.AI_USER_ID
  return headers
}

async function postChat(path: string, body: unknown, timeoutMs: number): Promise<string> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: aiGatewayHeaders(),
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    if (!res.ok) throw new Error(`Provedor de IA respondeu ${res.status}`)
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] }
    return data.choices?.[0]?.message?.content ?? ''
  } finally {
    clearTimeout(timer)
  }
}

/** Chamada de texto — geração de questões. */
export function aiChatText(messages: { role: string; content: string }[]): Promise<string> {
  return postChat(
    '/chat/completions',
    {
      model: process.env.AI_MODEL ?? 'gpt-4o-mini',
      temperature: 0.4,
      messages,
    },
    55_000,
  )
}

/** Chamada de visão — OCR/transcrição de páginas de PDF em imagem (data URLs). */
export function aiChatVision(prompt: string, imageDataUrls: string[]): Promise<string> {
  const content: unknown[] = [{ type: 'text', text: prompt }]
  for (const url of imageDataUrls) {
    content.push({ type: 'image_url', image_url: { url } })
  }
  return postChat(
    '/chat/completions/vision',
    {
      model: process.env.AI_MODEL ?? 'gpt-4o-mini',
      messages: [{ role: 'user', content }],
    },
    58_000,
  )
}
