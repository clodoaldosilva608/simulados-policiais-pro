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
