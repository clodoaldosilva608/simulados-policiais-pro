'use client'

import { useEffect, useState } from 'react'
import { FREE_PLAN } from '@/config/site'
import type { AccessInfo } from '@/lib/session'

/**
 * PLANO DO ALUNO + CONTADORES DE USO
 *
 * • Derivação do plano a partir do status do servidor (/api/auth/me):
 *   - assinante ativo  → premium (tudo liberado)
 *   - teste grátis     → premium temporário (7 dias com tudo liberado)
 *   - expirado/cancelado → PLANO GRÁTIS (limites do FREE_PLAN)
 *
 * • Uso (simulados gerados no mês, questões respondidas no dia) fica em
 *   localStorage com virada automática de mês/dia e evento global para
 *   reatividade entre telas (painel, exame, upload).
 *
 * Os limites são reforçados no servidor apenas para a GERAÇÃO de simulados
 * (o recurso com custo real de IA) em /api/usage/simulado.
 */

export type PlanId = 'free' | 'premium'

export interface PlanInfo {
  plan: PlanId
  /** true durante o teste grátis de 7 dias (acesso completo temporário) */
  trial: boolean
  /** dias cheios restantes do teste (null fora do teste) */
  trialDaysLeft: number | null
}

export function planFromAccess(access: AccessInfo | null | undefined): PlanInfo {
  const status = access?.status
  if (status === 'active') return { plan: 'premium', trial: false, trialDaysLeft: null }
  if (status === 'trial') {
    return { plan: 'premium', trial: true, trialDaysLeft: access?.trialDaysLeft ?? null }
  }
  // 'expired' (teste acabou) e 'canceled' (assinatura cancelada) → plano grátis
  return { plan: 'free', trial: false, trialDaysLeft: null }
}

/* ------------------------------------------------------------------ */
/* Uso: simulados gerados no mês / questões respondidas no dia         */
/* ------------------------------------------------------------------ */

interface UsageState {
  /** 'YYYY-MM' */
  month: string
  simulados: number
  /** 'YYYY-MM-DD' */
  day: string
  answered: number
}

const USAGE_KEY = 'spp-usage-v1'
export const USAGE_EVENT = 'spp-usage-changed'

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
function dayKey(d: Date): string {
  return `${monthKey(d)}-${String(d.getDate()).padStart(2, '0')}`
}

function readUsage(): UsageState {
  const now = new Date()
  const fresh: UsageState = { month: monthKey(now), simulados: 0, day: dayKey(now), answered: 0 }
  if (typeof window === 'undefined') return fresh
  try {
    const raw = window.localStorage.getItem(USAGE_KEY)
    if (!raw) return fresh
    const p = JSON.parse(raw) as Partial<UsageState>
    return {
      month: fresh.month,
      simulados: p.month === fresh.month ? Math.max(0, Math.floor(p.simulados ?? 0)) : 0,
      day: fresh.day,
      answered: p.day === fresh.day ? Math.max(0, Math.floor(p.answered ?? 0)) : 0,
    }
  } catch {
    return fresh
  }
}

function writeUsage(u: UsageState): void {
  try {
    window.localStorage.setItem(USAGE_KEY, JSON.stringify(u))
  } catch {
    /* armazenamento indisponível */
  }
  try {
    window.dispatchEvent(new Event(USAGE_EVENT))
  } catch {
    /* evento é otimização de reatividade */
  }
}

export interface UsageSnapshot {
  simuladosThisMonth: number
  answeredToday: number
  simuladosLeft: number
  questionsLeft: number
}

export function usageSnapshot(): UsageSnapshot {
  const u = readUsage()
  return {
    simuladosThisMonth: u.simulados,
    answeredToday: u.answered,
    simuladosLeft: Math.max(0, FREE_PLAN.simuladosPerMonth - u.simulados),
    questionsLeft: Math.max(0, FREE_PLAN.questionsPerDay - u.answered),
  }
}

/** Registra a geração de 1 novo simulado (upload de PDF concluído ou aleatório sorteado) */
export function recordSimuladoGenerated(): void {
  const u = readUsage()
  writeUsage({ ...u, simulados: u.simulados + 1 })
}

/** Registra questões respondidas (chamado na 1ª resposta de cada questão) */
export function recordAnswered(n = 1): void {
  const u = readUsage()
  writeUsage({ ...u, answered: u.answered + Math.max(1, n) })
}

/** Hook reativo: re-lê o uso no mount, a cada registro e ao voltar para o app */
export function useUsage(): UsageSnapshot {
  const [snap, setSnap] = useState<UsageSnapshot>(() => usageSnapshot())
  useEffect(() => {
    const update = () => setSnap(usageSnapshot())
    update()
    window.addEventListener(USAGE_EVENT, update)
    document.addEventListener('visibilitychange', update)
    return () => {
      window.removeEventListener(USAGE_EVENT, update)
      document.removeEventListener('visibilitychange', update)
    }
  }, [])
  return snap
}
