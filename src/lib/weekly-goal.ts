'use client'

import type { LocalAttempt } from '@/lib/local-db'

/**
 * META SEMANAL DE QUESTÕES — gamificação leve: o aluno define quantas
 * questões quer responder por semana (ex.: 200/semana) e acompanha a
 * barra de progresso. A semana começa na segunda-feira (padrão concurseiro)
 * e o objetivo fica salvo no aparelho (local-first).
 */

const KEY = 'spp-meta-semanal-v1'

export const DEFAULT_WEEKLY_GOAL = 200
export const WEEKLY_GOAL_PRESETS = [50, 100, 200, 300]

export function loadWeeklyGoal(): number {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return DEFAULT_WEEKLY_GOAL
    const n = Number(JSON.parse(raw))
    if (!Number.isFinite(n)) return DEFAULT_WEEKLY_GOAL
    return Math.min(1000, Math.max(10, Math.round(n)))
  } catch {
    return DEFAULT_WEEKLY_GOAL
  }
}

export function saveWeeklyGoal(goal: number): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(Math.min(1000, Math.max(10, Math.round(goal)))))
  } catch {
    /* persistência é opcional */
  }
}

/** Início da semana corrente: segunda-feira, 00:00 local */
export function startOfWeek(now: Date = new Date()): Date {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dow = d.getDay() // 0=dom, 1=seg...
  const diff = dow === 0 ? 6 : dow - 1
  d.setDate(d.getDate() - diff)
  return d
}

/** Quantidade de questões respondidas na semana corrente (todas as provas) */
export function answeredThisWeek(attempts: LocalAttempt[], now: Date = new Date()): number {
  const start = startOfWeek(now).getTime()
  let total = 0
  for (const a of attempts) {
    const t = new Date(a.createdAt).getTime()
    if (t < start) continue
    const ans = typeof a.answered === 'number' ? a.answered : a.total
    total += Math.min(Math.max(ans, 0), a.total)
  }
  return total
}

/** Rótulo curto do período (ex.: "seg 21 → dom 27") */
export function weekRangeLabel(now: Date = new Date()): string {
  const start = startOfWeek(now)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  const fmt = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
  return `${fmt(start)} → ${fmt(end)}`
}
