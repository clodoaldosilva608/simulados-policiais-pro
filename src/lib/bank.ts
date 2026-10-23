'use client'

import type { OptionKey, Question, SimuladoPack, Subject } from '@/data/simulado'

/**
 * BANCO DE QUESTÕES (lado do aluno) — filtros estilo Qconcursos + conversão
 * das questões do servidor em um SimuladoPack para reutilizar TODO o fluxo de
 * exame já existente (prova/estudo, comentários, caderno de erros, métricas).
 */

export interface BankQuestionDto {
  id: string
  banca: string
  concurso: string
  nivel: string
  materia: string
  assunto?: string
  ano: number
  tipo: 'multipla' | 'certo_errado'
  statement: string
  options: string[]
  answer: number
  comment?: string
}

export interface BankPreviewDto {
  id: string
  banca: string
  concurso: string
  nivel: string
  materia: string
  assunto?: string
  ano: number
  tipo: 'multipla' | 'certo_errado'
  statement: string
  optionsCount: number
  hasComment: boolean
}

export interface BankFacets {
  bancas: string[]
  materias: string[]
  concursos: string[]
  niveis: string[]
  anos: number[]
}

export interface BankFilters {
  banca?: string
  materia?: string
  concurso?: string
  nivel?: string
  ano?: number
  q?: string
}

function qs(filters: BankFilters, extra: Record<string, string | number> = {}): string {
  const sp = new URLSearchParams()
  if (filters.banca) sp.set('banca', filters.banca)
  if (filters.materia) sp.set('materia', filters.materia)
  if (filters.concurso) sp.set('concurso', filters.concurso)
  if (filters.nivel) sp.set('nivel', filters.nivel)
  if (filters.ano) sp.set('ano', String(filters.ano))
  if (filters.q) sp.set('q', filters.q)
  for (const [k, v] of Object.entries(extra)) sp.set(k, String(v))
  return sp.toString()
}

/** Busca questões aleatórias completas (para montar a prática). */
export async function fetchSampleQuestions(filters: BankFilters, n: number): Promise<{ total: number; questions: BankQuestionDto[] }> {
  const res = await fetch(`/api/questions?${qs(filters, { sample: n })}`, { cache: 'no-store' })
  if (!res.ok) return { total: 0, questions: [] }
  const data = (await res.json()) as { total?: number; questions?: BankQuestionDto[] }
  return { total: data.total ?? 0, questions: data.questions ?? [] }
}

/** Listagem paginada (previews) + valores dos filtros. */
export async function fetchBankList(
  filters: BankFilters,
  opts: { limit?: number; offset?: number; facets?: boolean } = {},
): Promise<{ total: number; questions: BankPreviewDto[]; facets?: BankFacets }> {
  const res = await fetch(
    `/api/questions?${qs(filters, { limit: opts.limit ?? 20, offset: opts.offset ?? 0, facets: opts.facets ? 1 : 0 })}`,
    { cache: 'no-store' },
  )
  if (!res.ok) return { total: 0, questions: [] }
  const data = (await res.json()) as { total?: number; questions?: BankPreviewDto[]; facets?: BankFacets }
  return { total: data.total ?? 0, questions: data.questions ?? [], facets: data.facets }
}

/** Converte questões do banco em um pack de simulado (reaproveita o fluxo de exame). */
export function bankToPack(questions: BankQuestionDto[], filtersUsed: BankFilters): SimuladoPack {
  const subjects: Subject[] = []
  for (const q of questions) {
    if (!subjects.some((s) => s.id === q.materia)) {
      subjects.push({ id: q.materia, name: q.materia, professor: '' })
    }
  }
  const packQuestions: Question[] = questions.map((q, i) => ({
    id: i + 1,
    subjectId: q.materia,
    statement: q.statement,
    options: q.options.map((text, j) => ({ key: ('abcde'[j] ?? 'a') as OptionKey, html: text })),
    answer: ('abcde'[q.answer] ?? 'a') as OptionKey,
    comment: q.comment ?? '',
  }))
  const bancas = [...new Set(questions.map((q) => q.banca))]
  const label =
    (filtersUsed.materia ? filtersUsed.materia : bancas.length === 1 ? bancas[0] : 'Banco de Questões') || 'Banco de Questões'
  return {
    id: `bank-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: `Prática — ${label}`,
    subtitle: `${questions.length} questões${filtersUsed.banca ? ` • ${filtersUsed.banca}` : ''}${
      filtersUsed.concurso ? ` • ${filtersUsed.concurso}` : ''
    }`,
    footer:
      'Questões do banco oficial do app, organizadas por banca, matéria e concurso. Responda quantas quiser — a cota diária do seu plano é respeitada.',
    durationMinutes: Math.max(10, questions.length * 3),
    passPct: 70,
    subjects,
    textBlocks: {},
    questions: packQuestions,
    questionFormat: questions[0]?.tipo === 'certo_errado' ? 'certo_errado' : 'multipla_escolha',
    ineditas: true,
  }
}

/* ------------------------------------------------------------------ */
/* Materiais de estudo                                                 */
/* ------------------------------------------------------------------ */

export interface MaterialDto {
  id: string
  title: string
  description?: string
  kind: string
  materia?: string
  concurso?: string
  banca?: string
  ano?: number
  url: string
  fileName?: string
  fileSize?: number
}

export async function fetchMaterials(): Promise<MaterialDto[]> {
  try {
    const res = await fetch('/api/materials', { cache: 'no-store' })
    if (!res.ok) return []
    const data = (await res.json()) as { materials?: MaterialDto[] }
    return data.materials ?? []
  } catch {
    return []
  }
}

/* ------------------------------------------------------------------ */
/* Pop-ups (frequência por usuário no cliente)                         */
/* ------------------------------------------------------------------ */

export interface PopupDto {
  id: string
  title: string
  body: string
  ctaLabel?: string
  ctaUrl?: string
  screens: string[]
  frequency: 'once' | 'session' | 'daily' | 'always'
  delaySec?: number
  tone?: string
}

const POPUP_KEY = 'spp-popups-v1'
const POPUP_SESSION_KEY = 'spp-popups-session-v1'

interface PopupTrack {
  [id: string]: { count: number; lastDay?: string; lastSession?: string }
}

function todayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function sessionKey(): string {
  try {
    let k = window.sessionStorage.getItem(POPUP_SESSION_KEY)
    if (!k) {
      k = Math.random().toString(36).slice(2, 10)
      window.sessionStorage.setItem(POPUP_SESSION_KEY, k)
    }
    return k
  } catch {
    return 'nosession'
  }
}

function readTrack(): PopupTrack {
  try {
    return JSON.parse(window.localStorage.getItem(POPUP_KEY) ?? '{}') as PopupTrack
  } catch {
    return {}
  }
}

function writeTrack(t: PopupTrack): void {
  try {
    window.localStorage.setItem(POPUP_KEY, JSON.stringify(t))
  } catch {
    /* armazenamento indisponível */
  }
}

/** Decide se o pop-up pode aparecer agora, conforme a frequência configurada. */
export function popupAllowed(p: PopupDto): boolean {
  const t = readTrack()
  const entry = t[p.id] ?? { count: 0 }
  const today = todayKey()
  const sess = sessionKey()
  switch (p.frequency) {
    case 'once':
      return entry.count === 0
    case 'session':
      return entry.lastSession !== sess
    case 'daily':
      return entry.lastDay !== today
    default:
      return true // 'always'
  }
}

/** Registra a exibição do pop-up. */
export function markPopupShown(p: PopupDto): void {
  const t = readTrack()
  const entry = t[p.id] ?? { count: 0 }
  entry.count += 1
  entry.lastDay = todayKey()
  entry.lastSession = sessionKey()
  t[p.id] = entry
  writeTrack(t)
}

/** Busca pop-ups elegíveis para uma tela (ativos + na janela de datas). */
export async function fetchPopups(screen: string): Promise<PopupDto[]> {
  try {
    const res = await fetch(`/api/popups?screen=${encodeURIComponent(screen)}`, { cache: 'no-store' })
    if (!res.ok) return []
    const data = (await res.json()) as { popups?: PopupDto[] }
    return data.popups ?? []
  } catch {
    return []
  }
}
