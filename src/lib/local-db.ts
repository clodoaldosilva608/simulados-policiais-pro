'use client'

import type { Question, TextBlock } from '@/data/types'

/**
 * BANCO DE DADOS LOCAL (IndexedDB)
 *
 * Todo o conteúdo do usuário (PDFs enviados, questões geradas, tentativas e
 * histórico) fica salvo APENAS no aparelho/navegador — nada vai para nuvem.
 * Isso mantém o app 100% compatível com hospedagem estática/serverless
 * (Vercel) e preserva a privacidade do material de estudo.
 */

const DB_NAME = 'simulados-policiais-pro'
const DB_VERSION = 2

export type LocalDocStyle = 'multipla' | 'certo_errado'
export type LocalDocStatus = 'processing' | 'ready' | 'error'

export interface LocalDocument {
  id: string
  title: string
  fileName: string
  fileSize: number
  pages: number
  charCount: number
  style: LocalDocStyle
  status: LocalDocStatus
  error: string | null
  /** blocos de texto extraídos do PDF (para retomar geração) */
  chunks: string[]
  chunksDone: number
  chunksTotal: number
  /** ISO date */
  createdAt: string
  questions: Question[]
  textBlocks: Record<string, TextBlock>
}

export interface LocalAttempt {
  id: string
  docId: string
  name: string
  /** Título do simulado (exibido no histórico/dashboard) */
  title?: string
  /**
   * Desempenho por DISCIPLINA desta tentativa (chave = nome exibido da
   * disciplina, ex.: "Direito Constitucional") — base das métricas por
   * disciplina do painel do aluno.
   */
  bySubject?: Record<string, { correct: number; answered: number }>
  mode: 'prova' | 'estudo'
  correct: number
  /** Questões respondidas (podem ser menos que o total em modo prova) */
  answered?: number
  total: number
  pct: number
  timeUsedMs: number
  createdAt: string
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB indisponível neste navegador'))
      return
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains('documents')) {
        db.createObjectStore('documents', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('attempts')) {
        const store = db.createObjectStore('attempts', { keyPath: 'id' })
        store.createIndex('byDoc', 'docId', { unique: false })
      }
      if (!db.objectStoreNames.contains('errors')) {
        db.createObjectStore('errors', { keyPath: 'id' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error('Falha ao abrir o banco local'))
  })
}

function reqAsPromise<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error('Falha na operação local'))
  })
}

async function withStore<T>(
  name: 'documents' | 'attempts' | 'errors',
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T> | void,
): Promise<T | undefined> {
  const db = await openDb()
  try {
    const tx = db.transaction(name, mode)
    const store = tx.objectStore(name)
    const result = fn(store)
    const done = new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error ?? new Error('Falha na transação local'))
      tx.onabort = () => reject(tx.error ?? new Error('Transação local abortada'))
    })
    const [value] = await Promise.all([
      result instanceof IDBRequest ? reqAsPromise(result) : Promise.resolve(undefined),
      done,
    ])
    return value
  } finally {
    db.close()
  }
}

/** Lista resumida dos simulados de PDF salvos localmente */
export async function listLocalDocuments(): Promise<
  {
    id: string
    title: string
    fileName: string
    fileSize: number
    pages: number
    charCount: number
    style: string
    status: LocalDocStatus
    error: string | null
    chunksTotal: number
    chunksDone: number
    createdAt: string
    questionsCount: number
  }[]
> {
  try {
    const docs = (await withStore('documents', 'readonly', (s) => s.getAll() as IDBRequest<LocalDocument[]>)) ?? []
    return docs
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .map((d) => ({
        id: d.id,
        title: d.title,
        fileName: d.fileName,
        fileSize: d.fileSize,
        pages: d.pages,
        charCount: d.charCount,
        style: d.style,
        status: d.status,
        error: d.error,
        chunksTotal: d.chunksTotal,
        chunksDone: d.chunksDone,
        createdAt: d.createdAt,
        questionsCount: d.questions?.length ?? 0,
      }))
  } catch {
    return []
  }
}

export async function getLocalDocument(id: string): Promise<LocalDocument | null> {
  try {
    const doc = await withStore('documents', 'readonly', (s) => s.get(id) as IDBRequest<LocalDocument | undefined>)
    return doc ?? null
  } catch {
    return null
  }
}

export async function putLocalDocument(doc: LocalDocument): Promise<void> {
  await withStore('documents', 'readwrite', (s) => s.put(doc))
}

export async function deleteLocalDocument(id: string): Promise<void> {
  await withStore('documents', 'readwrite', (s) => {
    s.delete(id)
  })
  await withStore('attempts', 'readwrite', (s) => {
    const idx = s.index('byDoc')
    const req = idx.openCursor(IDBKeyRange.only(id))
    req.onsuccess = () => {
      const cursor = req.result
      if (cursor) {
        cursor.delete()
        cursor.continue()
      }
    }
  })
}

export async function addLocalAttempt(attempt: LocalAttempt): Promise<void> {
  try {
    await withStore('attempts', 'readwrite', (s) => s.put(attempt))
  } catch {
    /* histórico é opcional */
  }
}

/** Todas as tentativas (todas as provas) — base das métricas do painel */
export async function listAllLocalAttempts(): Promise<LocalAttempt[]> {
  try {
    const list =
      (await withStore('attempts', 'readonly', (s) => s.getAll() as IDBRequest<LocalAttempt[]>)) ?? []
    return list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  } catch {
    return []
  }
}

export async function hasAttemptWithId(id: string): Promise<boolean> {
  try {
    const found = await withStore('attempts', 'readonly', (s) =>
      s.get(id) as IDBRequest<LocalAttempt | undefined>,
    )
    return Boolean(found)
  } catch {
    return false
  }
}

export async function listLocalAttempts(docId: string): Promise<LocalAttempt[]> {
  try {
    const list =
      (await withStore('attempts', 'readonly', (s) =>
        s.index('byDoc').getAll(docId) as IDBRequest<LocalAttempt[]>,
      )) ?? []
    return list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  } catch {
    return []
  }
}

/**
 * CADERNO DE ERROS — toda questão respondida incorretamente entra aqui
 * para o aluno revisar e responder de novo mais tarde, com REPETIÇÃO
 * ESPAÇADA: a cada acerto na revisão a questão volta depois de 3, 7 e 15
 * dias (revisão cientificamente otimizada) até ficar dominada.
 */

/** Intervalos da repetição espaçada (dias) por nível de revisão */
export const REVIEW_INTERVALS_DAYS = [3, 7, 15] as const

export interface WrongQuestion {
  /** `${docId}:${questionId}` */
  id: string
  docId: string
  docTitle: string
  questionId: number
  /** Nome de exibição da disciplina */
  subject: string
  statement: string
  textRef?: string
  /** Texto base associado à questão (quando houver), para contexto na revisão */
  textBlock?: { title: string; paragraphs: string[]; source?: string }
  style: 'multipla' | 'certo_errado'
  options: { key: OptionKey; html: string }[]
  answer: OptionKey
  comment: string
  timesMissed: number
  timesCorrectReview: number
  /** ISO date da última vez que errou */
  lastMissedAt: string
  /**
   * Nível da repetição espaçada: 0 = aguardando 1ª revisão (disponível
   * agora), 1..2 = já revisada e agendada para voltar em 7/15 dias,
   * 3 = dominada (não volta mais). Registros antigos (antes da repetição
   * espaçada) chegam sem o campo — migram via reviewStatusOf().
   */
  reviewStage?: number
  /** ISO date da próxima revisão programada (null quando disponível agora) */
  nextReviewAt?: string | null
}

export type WrongQuestionInput = Omit<WrongQuestion, 'timesMissed' | 'timesCorrectReview'>

export type ReviewStatus = 'due' | 'scheduled' | 'mastered'

/**
 * Estado da questão na repetição espaçada:
 * • due       — precisa de revisão hoje (nunca revisada ou prazo vencido)
 * • scheduled — agendada para voltar depois (3/7/15 dias)
 * • mastered  — dominada após as 3 revisões espaçadas (não volta mais)
 */
export function reviewStatusOf(q: WrongQuestion, now: number = Date.now()): ReviewStatus {
  // Migração de registros antigos: dominada era "acertou na revisão ≥ 1"
  const stage = q.reviewStage ?? (q.timesCorrectReview > 0 ? 3 : 0)
  if (stage >= 3) return 'mastered'
  if (!q.nextReviewAt) return 'due'
  return new Date(q.nextReviewAt).getTime() <= now ? 'due' : 'scheduled'
}

/** Dias restantes até a próxima revisão (mínimo 1) */
export function daysUntilReview(q: WrongQuestion, now: number = Date.now()): number {
  if (!q.nextReviewAt) return 0
  const diff = new Date(q.nextReviewAt).getTime() - now
  return Math.max(1, Math.ceil(diff / 86_400_000))
}

/** Registra (ou atualiza) as questões erradas na finalização de uma prova */
export async function recordWrongQuestions(entries: WrongQuestionInput[]): Promise<void> {
  if (entries.length === 0) return
  try {
    await withStore('errors', 'readwrite', (s) => {
      for (const entry of entries) {
        const req = s.get(entry.id)
        req.onsuccess = () => {
          const existing = req.result as WrongQuestion | undefined
          if (existing) {
            s.put({
              ...existing,
              ...entry,
              timesMissed: (existing.timesMissed ?? 0) + 1,
              lastMissedAt: entry.lastMissedAt,
              // Errou de novo na prova: volta para a fila imediata da repetição espaçada
              reviewStage: 0,
              nextReviewAt: null,
            })
          } else {
            s.put({
              ...entry,
              timesMissed: 1,
              timesCorrectReview: 0,
              reviewStage: 0,
              nextReviewAt: null,
            })
          }
        }
      }
    })
  } catch {
    /* caderno é opcional */
  }
}

/** Todas as questões erradas (mais recentes primeiro) */
export async function listWrongQuestions(): Promise<WrongQuestion[]> {
  try {
    const list =
      (await withStore('errors', 'readonly', (s) => s.getAll() as IDBRequest<WrongQuestion[]>)) ?? []
    return list.sort((a, b) => (a.lastMissedAt < b.lastMissedAt ? 1 : -1))
  } catch {
    return []
  }
}

export async function countWrongQuestions(): Promise<number> {
  try {
    return (await withStore('errors', 'readonly', (s) => s.count() as IDBRequest<number>)) ?? 0
  } catch {
    return 0
  }
}

/** Questões que precisam de revisão HOJE (nunca revisadas ou prazo vencido) */
export async function countDueWrongQuestions(): Promise<number> {
  try {
    const list =
      (await withStore('errors', 'readonly', (s) => s.getAll() as IDBRequest<WrongQuestion[]>)) ?? []
    return list.filter((q) => reviewStatusOf(q) === 'due').length
  } catch {
    return 0
  }
}

/**
 * Resultado da revisão com REPETIÇÃO ESPAÇADA:
 * • Acertou  → sobe de nível e agenda o retorno (3 → 7 → 15 dias); após o
 *   acerto no nível 15 dias a questão fica DOMINADA e não volta mais.
 * • Errou    → volta para o início da fila (disponível para revisar agora).
 */
export async function markWrongQuestionResult(id: string, correct: boolean): Promise<void> {
  try {
    await withStore('errors', 'readwrite', (s) => {
      const req = s.get(id)
      req.onsuccess = () => {
        const existing = req.result as WrongQuestion | undefined
        if (!existing) return
        const stage = existing.reviewStage ?? (existing.timesCorrectReview > 0 ? 3 : 0)
        if (correct) {
          const nextStage = Math.min(stage + 1, 3)
          const intervalDays = REVIEW_INTERVALS_DAYS[Math.min(stage, 2)]
          const next = new Date(Date.now() + intervalDays * 86_400_000).toISOString()
          s.put({
            ...existing,
            timesCorrectReview: existing.timesCorrectReview + 1,
            reviewStage: nextStage,
            nextReviewAt: nextStage >= 3 ? null : next,
          })
        } else {
          s.put({
            ...existing,
            timesMissed: existing.timesMissed + 1,
            reviewStage: 0,
            nextReviewAt: null,
          })
        }
      }
    })
  } catch {
    /* opcional */
  }
}

export async function removeWrongQuestion(id: string): Promise<void> {
  try {
    await withStore('errors', 'readwrite', (s) => {
      s.delete(id)
    })
  } catch {
    /* opcional */
  }
}

export async function clearWrongQuestions(): Promise<void> {
  try {
    await withStore('errors', 'readwrite', (s) => {
      s.clear()
    })
  } catch {
    /* opcional */
  }
}

/** Converte um documento local no formato SimuladoPack usado nas telas */
export function localDocToPack(doc: LocalDocument) {
  const subjectIds: string[] = []
  for (const q of doc.questions) {
    if (!subjectIds.includes(q.subjectId)) subjectIds.push(q.subjectId)
  }
  return {
    id: doc.id,
    title: doc.title,
    subtitle:
      doc.style === 'certo_errado'
        ? 'Gerado do seu PDF • Estilo Certo/Errado'
        : 'Gerado do seu PDF • Múltipla escolha',
    footer: `Questões geradas por inteligência artificial a partir do PDF “${doc.title}”, salvas apenas neste aparelho. Sempre confira o conteúdo com a fonte oficial de estudo.`,
    durationMinutes: Math.max(20, Math.ceil(doc.questions.length * 3)),
    passPct: 70,
    subjects: subjectIds.map((sid) => ({ id: sid, name: sid, professor: '' })),
    textBlocks: doc.textBlocks ?? {},
    questions: doc.questions,
  }
}
