/**
 * Configurações da IA — preferências do aluno salvas no localStorage
 * (chave `spp-ai-settings-v1`). Módulo isomórfico: helpers de prompt desta
 * tela também são usados pelas rotas de API no servidor.
 *
 * • apiKey: chave PESSOAL do aluno criada no Google AI Studio
 *   (https://aistudio.google.com/apikey). Fica salva APENAS neste aparelho
 *   e é enviada ao servidor somente durante a geração (nunca armazenada lá).
 *   Com a própria chave, o aluno usa a cota gratuita do Gemini e não depende
 *   do serviço de IA do app.
 * • model: modelo do Gemini usado na geração (OpenAI-compat do Google).
 * • temperature: criatividade (0 = mais previsível, 1 = mais criativa).
 * • persona: como a IA deve se comportar/comentar as questões.
 * • commentDetail: tamanho do comentário da resposta.
 * • instructions: instruções livres do aluno (ex.: "sempre citar a lei").
 */

const STORAGE_KEY = 'spp-ai-settings-v1'

export type AiPersona = 'professor' | 'direto' | 'coach'
export type AiCommentDetail = 'resumido' | 'medio' | 'detalhado'

export interface AiSettings {
  apiKey: string
  model: string
  temperature: number
  persona: AiPersona
  commentDetail: AiCommentDetail
  instructions: string
}

export const AI_MODELS: { id: string; label: string; hint: string }[] = [
  { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', hint: 'Recomendado • rápido e com boa cota grátis' },
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', hint: 'Mais inteligente • cota grátis menor' },
  { id: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash-Lite', hint: 'O mais econômico • cota grátis maior' },
  { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', hint: 'Máxima qualidade • cota grátis limitada' },
]

export const AI_PERSONAS: { id: AiPersona; label: string; description: string; prompt: string }[] = [
  {
    id: 'professor',
    label: 'Professor de concurso',
    description: 'Explica com precisão, cita a base do conteúdo e destaca pegadinhas de banca.',
    prompt:
      'Tom: professor experiente de concursos — explique com precisão técnica, cite a base do conteúdo ' +
      '(lei, artigo ou trecho do material) e destaque pegadinhas comuns de banca.',
  },
  {
    id: 'direto',
    label: 'Direto ao ponto',
    description: 'Comentários curtos e objetivos, focados no que define a resposta.',
    prompt:
      'Tom: direto e objetivo — comentários curtos, sem enrolação, focando apenas no ponto-chave ' +
      'que define a resposta correta.',
  },
  {
    id: 'coach',
    label: 'Coach motivador',
    description: 'Linguagem leve e encorajadora para manter o ritmo dos estudos.',
    prompt:
      'Tom: coach motivador — linguagem leve e encorajadora, celebrando o acerto e mostrando com ' +
      'gentileza o que revisar para melhorar.',
  },
]

export const AI_COMMENT_DETAILS: { id: AiCommentDetail; label: string; rule: string }[] = [
  {
    id: 'resumido',
    label: 'Resumido',
    rule: 'O campo "comment" deve ter 1 frase curta e direta com o essencial para entender a resposta.',
  },
  {
    id: 'medio',
    label: 'Médio',
    rule: 'O campo "comment" deve ter 2 a 4 frases explicando por que a alternativa correta é correta, citando a base do texto.',
  },
  {
    id: 'detalhado',
    label: 'Detalhado',
    rule: 'O campo "comment" deve ser detalhado (4 a 6 frases): explique por que a correta é correta E por que as principais alternativas erradas estão erradas.',
  },
]

export const DEFAULT_AI_SETTINGS: AiSettings = {
  apiKey: '',
  model: 'gemini-2.0-flash',
  temperature: 0.4,
  persona: 'professor',
  commentDetail: 'medio',
  instructions: '',
}

export function getAiSettings(): AiSettings {
  if (typeof window === 'undefined') return DEFAULT_AI_SETTINGS
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_AI_SETTINGS
    const parsed = JSON.parse(raw) as Partial<AiSettings>
    const persona = AI_PERSONAS.some((p) => p.id === parsed.persona)
      ? (parsed.persona as AiPersona)
      : DEFAULT_AI_SETTINGS.persona
    const commentDetail = AI_COMMENT_DETAILS.some((c) => c.id === parsed.commentDetail)
      ? (parsed.commentDetail as AiCommentDetail)
      : DEFAULT_AI_SETTINGS.commentDetail
    const temperature =
      typeof parsed.temperature === 'number' && parsed.temperature >= 0 && parsed.temperature <= 1
        ? parsed.temperature
        : DEFAULT_AI_SETTINGS.temperature
    return {
      apiKey: typeof parsed.apiKey === 'string' ? parsed.apiKey.trim() : '',
      model: typeof parsed.model === 'string' && parsed.model.trim() ? parsed.model.trim() : DEFAULT_AI_SETTINGS.model,
      temperature,
      persona,
      commentDetail,
      instructions: typeof parsed.instructions === 'string' ? parsed.instructions.slice(0, 600) : '',
    }
  } catch {
    return DEFAULT_AI_SETTINGS
  }
}

/** Salva apenas os campos informados (merge sobre o que já existe). */
export function saveAiSettings(patch: Partial<AiSettings>): AiSettings {
  const next = { ...getAiSettings(), ...patch }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    /* armazenamento indisponível */
  }
  return next
}

export function clearApiKey(): AiSettings {
  return saveAiSettings({ apiKey: '' })
}

/** Máscara para exibir a chave salva (ex.: AIzaSy••••••••3f9K) */
export function maskApiKey(key: string): string {
  if (!key) return ''
  if (key.length <= 12) return `${key.slice(0, 4)}${'•'.repeat(Math.max(key.length - 4, 2))}`
  return `${key.slice(0, 8)}${'•'.repeat(8)}${key.slice(-4)}`
}

export function personaLabel(id: AiPersona): string {
  return AI_PERSONAS.find((p) => p.id === id)?.label ?? 'Professor de concurso'
}

export function personaPrompt(id: AiPersona): string {
  return AI_PERSONAS.find((p) => p.id === id)?.prompt ?? AI_PERSONAS[0].prompt
}

export function commentDetailRule(id: AiCommentDetail): string {
  return AI_COMMENT_DETAILS.find((c) => c.id === id)?.rule ?? AI_COMMENT_DETAILS[1].rule
}

/** Texto curto do status da chave para badges no menu/upload. */
export function keyStatusText(settings: AiSettings): string {
  return settings.apiKey ? 'Chave configurada' : 'Sem chave própria'
}
