import ZAI from 'z-ai-web-dev-sdk'

export type QuestionStyle = 'multipla' | 'certo_errado'

export interface GeneratedOption {
  key: string
  html: string
}

export interface GeneratedTextBlock {
  title: string
  paragraphs: string[]
  source?: string
}

export interface GeneratedQuestion {
  topic: string
  statement: string
  textBlock?: GeneratedTextBlock | null
  options: GeneratedOption[]
  answer: string
  comment: string
}

/** Escapa HTML e converte formatação markdown simples para HTML seguro */
export function sanitizeToHtml(text: string): string {
  let out = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
    .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>')
    .replace(/_([^_\n]+)_/g, '<em>$1</em>')
  // quebras de linha manuais viram <br />
  out = out.replace(/\n/g, '<br />')
  return out.trim()
}

function extractJson(raw: string): unknown {
  // remove cercas de código e texto ao redor
  let s = raw.trim()
  s = s.replace(/```(?:json)?/gi, '').trim()
  const first = s.indexOf('{')
  const last = s.lastIndexOf('}')
  if (first === -1 || last === -1 || last <= first) throw new Error('Resposta da IA sem JSON válido')
  return JSON.parse(s.slice(first, last + 1))
}

function validKeys(n: number): string[] {
  return ['a', 'b', 'c', 'd', 'e'].slice(0, n)
}

/** Valida e normaliza uma questão vinda da IA */
function normalizeQuestion(
  q: unknown,
  style: QuestionStyle,
  index: number,
): GeneratedQuestion | null {
  if (typeof q !== 'object' || q === null) return null
  const obj = q as Record<string, unknown>

  const statementRaw = typeof obj.statement === 'string' ? obj.statement.trim() : ''
  if (statementRaw.length < 15) return null

  const commentRaw = typeof obj.comment === 'string' ? obj.comment.trim() : ''
  const topicRaw = typeof obj.topic === 'string' && obj.topic.trim() ? obj.topic.trim() : 'Geral'
  const topic = topicRaw.slice(0, 60)

  let options: GeneratedOption[]
  let answer: string

  if (style === 'certo_errado') {
    options = [
      { key: 'a', html: 'Certo' },
      { key: 'b', html: 'Errado' },
    ]
    const ans = typeof obj.answer === 'string' ? obj.answer.trim().toLowerCase() : ''
    // aceita "certo"/"errado" explícitos também
    if (ans === 'a' || ans === 'certo') answer = 'a'
    else if (ans === 'b' || ans === 'errado' || ans === 'errada') answer = 'b'
    else return null
  } else {
    const rawOptions = Array.isArray(obj.options) ? obj.options : []
    const cleaned: GeneratedOption[] = []
    for (const ro of rawOptions) {
      if (typeof ro !== 'object' || ro === null) continue
      const roObj = ro as Record<string, unknown>
      const key = typeof roObj.key === 'string' ? roObj.key.trim().toLowerCase() : ''
      const html = typeof roObj.html === 'string' ? roObj.html.trim() : ''
      if (!html) continue
      cleaned.push({ key, html })
    }
    if (cleaned.length < 4 || cleaned.length > 5) return null
    const keys = validKeys(cleaned.length)
    options = cleaned.map((o, i) => ({ key: keys[i], html: o.html }))
    const ans = typeof obj.answer === 'string' ? obj.answer.trim().toLowerCase() : ''
    if (!keys.includes(ans)) return null
    answer = ans
  }

  // Bloco de texto opcional
  let textBlock: GeneratedTextBlock | null = null
  const tb = obj.textBlock
  if (typeof tb === 'object' && tb !== null) {
    const tbObj = tb as Record<string, unknown>
    const title = typeof tbObj.title === 'string' ? tbObj.title.trim() : ''
    const paragraphs = Array.isArray(tbObj.paragraphs)
      ? tbObj.paragraphs.filter((p): p is string => typeof p === 'string' && p.trim().length > 0)
      : []
    if (title && paragraphs.length > 0) {
      textBlock = {
        title: title.slice(0, 120),
        paragraphs: paragraphs.slice(0, 8).map((p) => p.trim().slice(0, 1200)),
        source: typeof tbObj.source === 'string' ? tbObj.source.trim().slice(0, 200) : undefined,
      }
    }
  }

  return {
    topic,
    statement: sanitizeToHtml(statementRaw),
    textBlock,
    options: options.map((o) => ({
      key: o.key,
      html: style === 'certo_errado' ? o.html : sanitizeToHtml(o.html),
    })),
    answer,
    comment: sanitizeToHtml(commentRaw || 'Comentário não disponível para esta questão.'),
  }
}

function buildPrompt(chunk: string, style: QuestionStyle, count: number): string {
  const styleRule =
    style === 'certo_errado'
      ? `Elabore ${count} AFIRMATIVAS no estilo Certo/Errado (banca CEBRASPE): cada questão é uma afirmação que o candidato julga como Certa ou Errada. O campo "options" deve conter exatamente duas alternativas: [{"key":"a","html":"Certo"},{"key":"b","html":"Errado"}] e o "answer" deve ser "a" (Certo) ou "b" (Errado). Varie entre afirmativas certas e erradas.`
      : `Elabore ${count} questões de múltipla escolha com exatamente 5 alternativas (a–e), apenas UMA correta. Distratores devem ser plausíveis e baseados em confusões comuns sobre o conteúdo.`

  return `Você é um elaborador profissional de questões para concursos públicos brasileiros. Com base EXCLUSIVAMENTE no CONTEUDO abaixo, elabore questões inéditas de alta qualidade que ajudem um estudante a fixar o conteúdo.

${styleRule}

REGRAS IMPORTANTES:
- Base-se somente no conteúdo fornecido; não invente leis, números ou fatos que não estejam no texto.
- Cada questão deve ter um "topic" curto identificando o assunto (ex.: "Direito Constitucional", "Estatística", "Crédito Rural").
- O campo "comment" deve explicar por que a alternativa correta é correta, citando a base do texto (2 a 4 frases).
- Se um trecho do conteúdo for um texto de apoio longo necessário para as questões (ex.: caso, fragmento, tabela descrita), inclua "textBlock" com "title" e "paragraphs" (array de strings); caso contrário use null.
- Enunciados claros, com no mínimo 15 caracteres, sem referências como "acima" ou "no texto anterior".
- NÃO copie literalmente frases do conteúdo como enunciado; reformule.

FORMATO DE RESPOSTA: retorne APENAS um JSON válido, sem markdown, sem texto antes ou depois, no formato:
{"questions":[{"topic":"...","statement":"...","textBlock":null,"options":[{"key":"a","html":"..."},...],"answer":"a","comment":"..."}]}

CONTEUDO:
"""
${chunk}
"""`
}

/** Gera questões a partir de um bloco de texto usando IA. Tenta 2 vezes. */
export async function generateQuestionsForChunk(
  chunk: string,
  style: QuestionStyle,
  count: number,
): Promise<GeneratedQuestion[]> {
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

      const raw = completion.choices[0]?.message?.content ?? ''
      const parsed = extractJson(raw) as { questions?: unknown }
      if (!parsed || !Array.isArray(parsed.questions)) throw new Error('JSON sem array de questões')

      const valid: GeneratedQuestion[] = []
      for (const q of parsed.questions) {
        const nq = normalizeQuestion(q, style, valid.length)
        if (nq) valid.push(nq)
      }
      if (valid.length === 0) throw new Error('Nenhuma questão válida retornada pela IA')
      return valid
    } catch (err) {
      lastError = err
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Falha ao gerar questões com IA')
}
