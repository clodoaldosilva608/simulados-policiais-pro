export type OptionKey = 'a' | 'b' | 'c' | 'd' | 'e'

export interface QuestionOption {
  key: OptionKey
  html: string
}

export interface Question {
  id: number
  subjectId: string
  textRef?: string
  statement: string
  options: QuestionOption[]
  answer: OptionKey
  comment: string
}

export interface TextBlock {
  id: string
  title: string
  paragraphs: string[]
  source?: string
}

export interface Subject {
  id: string
  name: string
  professor: string
}

export type ExamMode = 'prova' | 'estudo'

export interface ExamState {
  name: string
  mode: ExamMode
  startedAt: number
  finished: boolean
  finishedAt: number | null
  current: number
  answers: Record<number, OptionKey>
  marked: number[]
}

export interface SubjectResult {
  subject: Subject
  correct: number
  total: number
  pct: number
}

export interface ExamResult {
  correct: number
  total: number
  pct: number
  answered: number
  unanswered: number
  bySubject: SubjectResult[]
}

/**
 * Pacote completo de um simulado — pode ser o estático (embutido no app)
 * ou gerado dinamicamente a partir de um PDF enviado pelo usuário.
 */
export interface SimuladoPack {
  /** Identificador: 'pcpe-agente' para o embutido ou o id do Document no banco */
  id: string
  title: string
  subtitle: string
  /** Nota de rodapé exibida na tela de abertura */
  footer?: string
  durationMinutes: number
  passPct: number
  subjects: Subject[]
  textBlocks: Record<string, TextBlock>
  questions: Question[]
}

/** Resumo de um documento da biblioteca (listagem) */
export interface DocumentSummary {
  id: string
  title: string
  fileName: string
  fileSize: number
  pages: number
  charCount: number
  style: string
  status: 'processing' | 'ready' | 'error'
  error: string | null
  chunksTotal: number
  chunksDone: number
  createdAt: string
  questionsCount: number
}
