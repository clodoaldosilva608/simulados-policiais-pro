import { extractText, getDocumentProxy } from 'unpdf'

export interface PdfExtraction {
  pages: number
  text: string
}

/** Limpa o texto extraído: normaliza espaços, hifenização e ruídos de layout */
export function cleanPdfText(raw: string): string {
  return raw
    .replace(/\r/g, '\n')
    .replace(/\u00a0/g, ' ')
    // palavras hifenizadas no fim da linha: "consti-\ntitucional" → "constitucional"
    .replace(/(\p{L})-\n(\p{L})/gu, '$1$2')
    .replace(/[ \t]+/g, ' ')
    .replace(/ ?\n ?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/** Quebra o texto em blocos de estudo priorizando limites de parágrafo */
export function chunkText(text: string, targetSize = 7000, maxChunks = 10): string[] {
  const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
  const chunks: string[] = []
  let current = ''

  for (const p of paragraphs) {
    // Parágrafo gigante: corta por frases
    if (p.length > targetSize) {
      if (current) {
        chunks.push(current)
        current = ''
      }
      const sentences = p.split(/(?<=[.!?])\s+/)
      let buf = ''
      for (const s of sentences) {
        if ((buf + ' ' + s).length > targetSize && buf) {
          chunks.push(buf.trim())
          buf = s
        } else {
          buf = buf ? `${buf} ${s}` : s
        }
      }
      if (buf.trim()) current = buf.trim()
      continue
    }

    if ((current + '\n\n' + p).length > targetSize && current) {
      chunks.push(current)
      current = p
    } else {
      current = current ? `${current}\n\n${p}` : p
    }
  }
  if (current.trim()) chunks.push(current.trim())

  // Limita o número de blocos amostrando uniformemente o documento
  if (chunks.length > maxChunks) {
    const sampled: string[] = []
    const step = (chunks.length - 1) / (maxChunks - 1)
    for (let i = 0; i < maxChunks; i++) {
      sampled.push(chunks[Math.round(i * step)])
    }
    return sampled
  }

  return chunks
}

/** Extrai o texto de um PDF (buffer) — lança erro se não houver texto extraível */
export async function extractPdfText(data: Uint8Array): Promise<PdfExtraction> {
  const pdf = await getDocumentProxy(data)
  const { totalPages, text } = await extractText(pdf, { mergePages: true })
  const cleaned = cleanPdfText(Array.isArray(text) ? text.join('\n\n') : text)

  if (cleaned.length < 200) {
    throw new Error(
      'Não foi possível extrair texto suficiente deste PDF. Ele pode ser digitalizado (imagem) ou protegido.'
    )
  }

  return { pages: totalPages, text: cleaned }
}
