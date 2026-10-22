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
const DB_VERSION = 1

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
  name: 'documents' | 'attempts',
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
