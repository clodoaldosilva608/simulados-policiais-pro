export interface Row {
  banca: string
  concurso: string
  nivel: string
  materia: string
  assunto: string
  ano: number
  tipo: 'multipla' | 'certo_errado'
  statement: string
  a?: string
  b?: string
  c?: string
  d?: string
  e?: string
  /** letra correta (A-E) ou CERTO/ERRADO */
  answer: string
  comment: string
}
