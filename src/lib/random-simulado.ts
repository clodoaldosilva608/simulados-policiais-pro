'use client'

import { STATIC_PACKS, isCertErrado } from '@/data/simulado'
import { getLocalDocument, listLocalDocuments, localDocToPack } from '@/lib/local-db'
import type { Question, QuestionFormat, SimuladoPack, TextBlock } from '@/data/types'

/**
 * SIMULADO ALEATÓRIO — monta uma prova inédita sorteando questões de TODAS
 * as fontes do aparelho: provas oficiais embutidas (PF, PC, PM, PRF, Polícia
 * Penal), o simulado inédito do app e os simulados gerados dos PDFs do aluno.
 * 100% local: o sorteio acontece no navegador.
 */

export type RandomFormat = QuestionFormat | 'misto'

export interface RandomOptions {
  /** Quantidade de questões da prova */
  count: number
  /** Formato: Certo/Errado, A–E ou misto */
  format: RandomFormat
}

interface PoolItem {
  q: Question
  pack: SimuladoPack
  format: QuestionFormat
}

function shuffle<T>(list: T[]): T[] {
  const arr = [...list]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/** Coleta todas as questões disponíveis no aparelho (provas + PDFs prontos) */
async function collectPool(format: RandomFormat): Promise<PoolItem[]> {
  const pool: PoolItem[] = []
  for (const pack of STATIC_PACKS) {
    for (const q of pack.questions) {
      const fmt: QuestionFormat = isCertErrado(q) ? 'certo_errado' : 'multipla_escolha'
      if (format === 'misto' || fmt === format) pool.push({ q, pack, format: fmt })
    }
  }
  try {
    const docs = await listLocalDocuments()
    for (const d of docs) {
      if (d.status !== 'ready') continue
      const doc = await getLocalDocument(d.id)
      if (!doc || doc.questions.length === 0) continue
      const pack = localDocToPack(doc)
      for (const q of pack.questions) {
        const fmt: QuestionFormat = isCertErrado(q) ? 'certo_errado' : 'multipla_escolha'
        if (format === 'misto' || fmt === format) pool.push({ q, pack, format: fmt })
      }
    }
  } catch {
    /* PDFs são opcionais — segue só com as provas embutidas */
  }
  return pool
}

/**
 * Monta o pack do simulado aleatório. Retorna null quando não há questões
 * disponíveis para o formato escolhido.
 */
export async function buildRandomPack(opts: RandomOptions): Promise<SimuladoPack | null> {
  const pool = await collectPool(opts.format)
  if (pool.length === 0) return null

  // Sorteio + dedupe defensivo (mesmo enunciado não entra duas vezes)
  const seen = new Set<string>()
  const picked: PoolItem[] = []
  for (const item of shuffle(pool)) {
    const key = `${item.q.statement.slice(0, 160)}::${item.q.answer}`
    if (seen.has(key)) continue
    seen.add(key)
    picked.push(item)
    if (picked.length >= opts.count) break
  }
  if (picked.length === 0) return null

  // textBlocks remapeados por pack de origem (evita colisão de ids entre provas)
  const textBlocks: Record<string, TextBlock> = {}
  const subjectNames = new Map<string, string>()
  const questions: Question[] = picked.map((item) => {
    const { q, pack } = item
    subjectNames.set(q.subjectId, pack.subjects.find((s) => s.id === q.subjectId)?.name ?? q.subjectId)
    if (q.textRef && pack.textBlocks[q.textRef]) {
      const newRef = `${pack.id}:${q.textRef}`
      textBlocks[newRef] = pack.textBlocks[q.textRef]
      return { ...q, textRef: newRef }
    }
    return { ...q }
  })

  const count = questions.length
  const subjects = [...subjectNames.entries()].map(([id, name]) => ({ id, name, professor: '' }))

  return {
    id: `random-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: 'Simulado aleatório',
    subtitle:
      opts.format === 'certo_errado'
        ? `Sorteado • ${count} questões Certo/Errado`
        : opts.format === 'multipla_escolha'
          ? `Sorteado • ${count} questões A, B, C, D, E`
          : `Sorteado • ${count} questões de todos os formatos`,
    footer:
      'Prova montada automaticamente com questões sorteadas das provas oficiais e dos seus PDFs salvos neste aparelho. Sempre confira o conteúdo com a fonte oficial de estudo.',
    durationMinutes: Math.max(15, count * 3),
    passPct: 70,
    subjects,
    textBlocks,
    questions,
    questionFormat: opts.format === 'misto' ? undefined : opts.format,
    ineditas: true,
  }
}
