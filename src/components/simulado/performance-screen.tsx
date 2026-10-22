'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  Crown,
  FileText,
  History,
  Target,
  XCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { SITE } from '@/config/site'
import type { LocalAttempt } from '@/lib/local-db'
import { TrialCountdown } from './trial-countdown'

export interface PerfStats {
  attempts: number
  answered: number
  correct: number
  wrong: number
  pct: number
  subjects: { name: string; correct: number; answered: number; pct: number }[]
}

export type PerfTab = 'resumo' | 'historico'

interface PerformanceScreenProps {
  initialTab: PerfTab
  stats: PerfStats | null
  /** Todas as tentativas concluídas (mais recentes primeiro) */
  attempts: LocalAttempt[]
  accountName?: string
  accountEmail?: string
  licenseBadge: { active: boolean; trialDaysLeft: number | null; trialEndsAt?: string | null }
  onBack: () => void
  onSubscribe: () => void
}

function pctColor(pct: number): string {
  return pct >= 70 ? 'text-emerald-700' : pct >= 50 ? 'text-amber-700' : 'text-red-700'
}

function formatWhen(iso: string): string {
  const d = new Date(iso)
  const dia = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
  const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  return `${dia} • ${hora}`
}

function formatDuration(ms: number): string {
  const totalMin = Math.round(ms / 60_000)
  if (totalMin < 1) return 'menos de 1 min'
  if (totalMin < 60) return `${totalMin} min`
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof CheckCircle2
  label: string
  value: string
  tone: 'emerald' | 'red' | 'amber' | 'slate'
}) {
  const tones: Record<typeof tone, string> = {
    emerald: 'bg-emerald-50 text-emerald-700',
    red: 'bg-red-50 text-red-700',
    amber: 'bg-amber-50 text-amber-700',
    slate: 'bg-slate-100 text-slate-700',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-bold leading-tight text-slate-900">{value}</p>
        <p className="truncate text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
      </div>
    </div>
  )
}

export function PerformanceScreen({
  initialTab,
  stats,
  attempts,
  accountName,
  accountEmail,
  licenseBadge,
  onBack,
  onSubscribe,
}: PerformanceScreenProps) {
  const [tab, setTab] = useState<PerfTab>(initialTab)

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900 text-white shadow-lg">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3.5">
          <Button
            onClick={onBack}
            variant="ghost"
            size="icon"
            aria-label="Voltar para a biblioteca"
            className="h-9 w-9 shrink-0 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <p className="truncate text-base font-bold leading-tight">Meu desempenho</p>
            <p className="truncate text-xs text-slate-400">
              {[accountName, accountEmail].filter(Boolean).join(' • ')}
            </p>
          </div>
        </div>
        {!licenseBadge.active && (
          <TrialCountdown
            trialEndsAt={licenseBadge.trialEndsAt}
            trialDaysLeft={licenseBadge.trialDaysLeft}
            onSubscribe={onSubscribe}
            compact
          />
        )}
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-5">
        {/* Abas Resumo | Histórico */}
        <div className="grid grid-cols-2 gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1" role="tablist">
          {(
            [
              ['resumo', 'Resumo', Target],
              ['historico', 'Histórico', History],
            ] as [PerfTab, string, typeof Target][]
          ).map(([key, label, Icon]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={`flex h-10 items-center justify-center gap-1.5 rounded-lg text-sm font-bold transition-colors ${
                tab === key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>

        {tab === 'resumo' ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            {stats && stats.answered > 0 ? (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <StatCard icon={CheckCircle2} label="Acertos" value={String(stats.correct)} tone="emerald" />
                  <StatCard icon={XCircle} label="Erros" value={String(stats.wrong)} tone="red" />
                  <StatCard icon={Target} label="Aproveitamento" value={`${stats.pct}%`} tone="amber" />
                  <StatCard icon={BookOpen} label="Simulados concluídos" value={String(stats.attempts)} tone="slate" />
                </div>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                      <span>Taxa de acerto geral</span>
                      <span className="font-bold text-slate-900">{stats.pct}%</span>
                    </div>
                    <Progress value={stats.pct} className="mt-1.5 h-2.5" aria-label={`Taxa de acerto: ${stats.pct}%`} />
                  </CardContent>
                </Card>

                {stats.subjects.length > 0 && (
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Desempenho por disciplina
                      </p>
                      <ul className="mt-3 space-y-2.5" aria-label="Aproveitamento por disciplina">
                        {stats.subjects.map((s) => (
                          <li key={s.name} className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5">
                            <div className="flex items-baseline justify-between gap-2">
                              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800">
                                {s.name}
                              </span>
                              <span className={`shrink-0 text-sm font-bold ${pctColor(s.pct)}`}>{s.pct}%</span>
                            </div>
                            <Progress value={s.pct} className="mt-1.5 h-1.5" aria-label={`${s.name}: ${s.pct}%`} />
                            <p className="mt-1 text-[11px] text-slate-500">
                              {s.correct} de {s.answered} {s.answered === 1 ? 'questão' : 'questões'}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 text-center">
                <Target className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-3 text-sm font-bold text-slate-800">Nenhum desempenho ainda</p>
                <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
                  Conclua uma prova oficial (PF, PC, PM, PRF ou Polícia Penal) ou um simulado de PDF — seus acertos,
                  erros e aproveitamento por disciplina aparecem aqui.
                </p>
              </div>
            )}

            {!licenseBadge.active && (
              <button
                type="button"
                onClick={onSubscribe}
                className="mt-4 flex w-full items-center gap-3 rounded-2xl bg-slate-900 p-4 text-left transition-colors hover:bg-slate-800"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-slate-950">
                  <Crown className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white">Assine e continue evoluindo</p>
                  <p className="text-xs text-slate-400">
                    {SITE.price}{SITE.period} • todas as provas liberadas, sem interrupções
                  </p>
                </div>
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            {attempts.length > 0 ? (
              <ul className="mt-4 space-y-2.5" aria-label="Provas concluídas">
                {attempts.map((a) => {
                  const ans = typeof a.answered === 'number' ? a.answered : a.total
                  return (
                    <li key={a.id}>
                      <Card className="transition-shadow hover:shadow-md">
                        <CardContent className="flex items-center gap-3 p-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                            {a.mode === 'prova' ? <FileText className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-slate-900">
                              {a.title || 'Simulado'}
                            </p>
                            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500">
                              <span>{formatWhen(a.createdAt)}</span>
                              <span aria-hidden>•</span>
                              <Badge
                                variant="secondary"
                                className={`h-auto px-1.5 py-0 text-[10px] font-bold ${
                                  a.mode === 'prova'
                                    ? 'bg-slate-200 text-slate-700 hover:bg-slate-200'
                                    : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
                                }`}
                              >
                                {a.mode === 'prova' ? 'Prova' : 'Estudo'}
                              </Badge>
                              <span className="flex items-center gap-0.5">
                                <Clock className="h-3 w-3" /> {formatDuration(a.timeUsedMs)}
                              </span>
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className={`text-base font-black leading-tight ${pctColor(a.pct)}`}>{a.pct}%</p>
                            <p className="text-[11px] text-slate-500">
                              {a.correct} de {ans} {ans === 1 ? 'questão' : 'questões'}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 text-center">
                <History className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-3 text-sm font-bold text-slate-800">Sem provas concluídas por aqui</p>
                <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
                  Quando você finalizar um simulado, ele entra nesta lista com a nota, a data e o tempo que você
                  levou — assim fica fácil acompanhar sua evolução.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </main>
    </div>
  )
}
