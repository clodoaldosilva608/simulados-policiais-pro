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
  /** Metadados de origem (exibidos no estilo Qconcursos: [ano] [cargo] [banca]) */
  banca?: string
  ano?: number
  concurso?: string
  nivel?: string
  assunto?: string
}

/** Formato de resposta do simulado */
export type QuestionFormat = 'certo_errado' | 'multipla_escolha'

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
  /** Anotações livres por questão (ESPAÇO LIVRE, estilo Qconcursos) */
  notes: Record<number, string>
  /** Alternativas riscadas (RISCAR) por questão — id da questão → letras */
  eliminated: Record<number, OptionKey[]>
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
 * Pacote completo de um simulado — pode ser o estático (embutido no app),
 * uma prova oficial da área policial ou gerado dinamicamente a partir de um PDF.
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
  /** Formato predominante das questões (deriva do nº de opções quando ausente) */
  questionFormat?: QuestionFormat
  /** Carreira policial (PF, PC, PM, PRF, Polícia Penal...) */
  carreira?: string
  /** Banca organizadora */
  banca?: string
  /** Ano de aplicação */
  ano?: number
  /** true quando as questões são de prova oficial real */
  oficial?: boolean
  /** true quando as questões são inéditas no estilo da banca (não oficiais) */
  ineditas?: boolean
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
