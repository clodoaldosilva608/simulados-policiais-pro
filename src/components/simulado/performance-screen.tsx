'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  Crown,
  FileText,
  History,
  SlidersHorizontal,
  Target,
  XCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Slider } from '@/components/ui/slider'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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

/** Meta de aproveitamento por disciplina (persistida no aparelho) */
const META_STORAGE_KEY = 'spp-metas-v1'
const DEFAULT_META = 70
type PeriodFilter = 'all' | '7d' | '30d'
const PERIOD_LABEL: Record<Exclude<PeriodFilter, 'all'>, string> = {
  '7d': 'últimos 7 dias',
  '30d': 'últimos 30 dias',
}

function loadMetas(): Record<string, number> {
  try {
    const raw = localStorage.getItem(META_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, number>) : {}
  } catch {
    return {}
  }
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
  const [period, setPeriod] = useState<PeriodFilter>('all')
  const [metas, setMetas] = useState<Record<string, number>>({})
  const [metaEdit, setMetaEdit] = useState<{ name: string; value: number } | null>(null)

  // Metas ficam salvas no aparelho (mesma filosofia local-first do restante do app)
  useEffect(() => {
    setMetas(loadMetas())
  }, [])

  const metaOf = (name: string) => metas[name] ?? DEFAULT_META

  function saveMeta(name: string, value: number | null) {
    const next = { ...metas }
    if (value == null) delete next[name]
    else next[name] = value
    setMetas(next)
    try {
      localStorage.setItem(META_STORAGE_KEY, JSON.stringify(next))
    } catch {
      /* persistência é opcional */
    }
  }

  /** Histórico filtrado pelo período escolhido (mais recentes primeiro) */
  const filteredAttempts = useMemo(() => {
    if (period === 'all') return attempts
    const min = Date.now() - (period === '7d' ? 7 : 30) * 86_400_000
    return attempts.filter((a) => new Date(a.createdAt).getTime() >= min)
  }, [attempts, period])

  /** Resumo agregado do período filtrado (mesma régua do painel: % sobre respondidas) */
  const periodSummary = useMemo(() => {
    let answered = 0
    let correct = 0
    for (const a of filteredAttempts) {
      const ans = typeof a.answered === 'number' ? a.answered : a.total
      const clamped = Math.min(Math.max(ans, 0), a.total)
      answered += clamped
      correct += Math.min(Math.max(a.correct, 0), clamped)
    }
    return {
      count: filteredAttempts.length,
      pct: answered > 0 ? Math.round((correct / answered) * 100) : null,
    }
  }, [filteredAttempts])

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
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        Toque no ícone ao lado da nota para definir sua meta de aproveitamento
                      </p>
                      <ul className="mt-3 space-y-2.5" aria-label="Aproveitamento por disciplina">
                        {stats.subjects.map((s) => {
                          const meta = metaOf(s.name)
                          const hit = s.pct >= meta
                          const gap = Math.max(0, meta - s.pct)
                          return (
                            <li
                              key={s.name}
                              className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5"
                            >
                              <div className="flex items-center gap-2">
                                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800">
                                  {s.name}
                                </span>
                                <span className={`shrink-0 text-sm font-bold ${pctColor(s.pct)}`}>{s.pct}%</span>
                                <button
                                  type="button"
                                  onClick={() => setMetaEdit({ name: s.name, value: meta })}
                                  aria-label={`Definir meta de aproveitamento em ${s.name}`}
                                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700"
                                >
                                  <SlidersHorizontal className="h-3.5 w-3.5" />
                                </button>
                              </div>
                              <div className="relative mt-1.5">
                                <Progress
                                  value={s.pct}
                                  className="h-1.5"
                                  aria-label={`${s.name}: ${s.pct}% (meta ${meta}%)`}
                                />
                                <span
                                  aria-hidden
                                  className="meta-marker absolute -top-0.5 h-2.5 w-0.5 rounded-full bg-slate-900"
                                  style={{ left: `calc(${Math.min(meta, 100)}% - 1px)` }}
                                />
                              </div>
                              <p className="mt-1 text-[11px] text-slate-500">
                                {s.correct} de {s.answered} {s.answered === 1 ? 'questão' : 'questões'} •{' '}
                                {hit ? (
                                  <span className="font-bold text-emerald-700">meta de {meta}% atingida</span>
                                ) : (
                                  <span className="font-bold text-amber-700">
                                    faltam {gap} p.p. para a meta de {meta}%
                                  </span>
                                )}
                              </p>
                            </li>
                          )
                        })}
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
            {/* Filtro por período */}
            <div
              className="mt-4 grid grid-cols-3 gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1"
              role="group"
              aria-label="Filtrar provas por período"
            >
              {(
                [
                  ['all', 'Todas'],
                  ['7d', '7 dias'],
                  ['30d', '30 dias'],
                ] as [PeriodFilter, string][]
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={period === key}
                  onClick={() => setPeriod(key)}
                  className={`flex h-9 items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                    period === key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {periodSummary.count > 0 && (
              <p className="mt-2 text-xs text-slate-500" aria-live="polite">
                {periodSummary.count} {periodSummary.count === 1 ? 'prova' : 'provas'}{' '}
                {period === 'all' ? 'no histórico' : `nos ${PERIOD_LABEL[period]}`}
                {periodSummary.pct != null && (
                  <>
                    {' '}• aproveitamento{' '}
                    <span className={`font-bold ${pctColor(periodSummary.pct)}`}>{periodSummary.pct}%</span>
                  </>
                )}
              </p>
            )}
            {filteredAttempts.length > 0 ? (
              <ul className="mt-3 space-y-2.5" aria-label="Provas concluídas">
                {filteredAttempts.map((a) => {
                  const ans = typeof a.answered === 'number' ? a.answered : a.total
                  // Aproveitamento sobre as RESPONDIDAS (mesma régua do painel)
                  const pct = ans > 0 ? Math.round((a.correct / ans) * 100) : 0
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
                            <p className={`text-base font-black leading-tight ${pctColor(pct)}`}>{pct}%</p>
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
            ) : attempts.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 text-center">
                <History className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-3 text-sm font-bold text-slate-800">Sem provas concluídas por aqui</p>
                <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
                  Quando você finalizar um simulado, ele entra nesta lista com a nota, a data e o tempo que você
                  levou — assim fica fácil acompanhar sua evolução.
                </p>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 text-center">
                <History className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-3 text-sm font-bold text-slate-800">Nenhuma prova nos {PERIOD_LABEL[period]}</p>
                <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
                  Nenhuma prova foi concluída nesse período. Amplie o filtro para ver o histórico completo ou
                  conclua um novo simulado para acompanhar sua evolução.
                </p>
                <Button variant="outline" className="mt-4" onClick={() => setPeriod('all')}>
                  Ver todos os períodos
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* Editor da meta de aproveitamento por disciplina */}
      <Dialog open={metaEdit !== null} onOpenChange={(open) => (open ? undefined : setMetaEdit(null))}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Meta de aproveitamento</DialogTitle>
            <DialogDescription>
              Defina a nota mínima que você quer alcançar em{' '}
              <span className="font-semibold text-slate-900">{metaEdit?.name ?? '—'}</span>. A barra de desempenho
              mostra a marcação da meta para facilitar a comparação.
            </DialogDescription>
          </DialogHeader>
          {metaEdit && (
            <div className="space-y-4">
              <div className="flex items-baseline justify-center gap-1 rounded-xl border border-slate-200 bg-slate-50 py-3">
                <span className="text-3xl font-black text-slate-900">{metaEdit.value}</span>
                <span className="text-lg font-bold text-slate-500">%</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[60, 70, 80, 90].map((v) => (
                  <button
                    key={v}
                    type="button"
                    aria-pressed={metaEdit.value === v}
                    onClick={() => setMetaEdit({ ...metaEdit, value: v })}
                    className={`h-9 rounded-lg border text-sm font-bold transition-colors ${
                      metaEdit.value === v
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {v}%
                  </button>
                ))}
              </div>
              <Slider
                value={[metaEdit.value]}
                min={40}
                max={100}
                step={5}
                onValueChange={([v]) => setMetaEdit({ ...metaEdit, value: v })}
                aria-label="Ajustar meta de aproveitamento"
              />
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => {
                if (!metaEdit) return
                saveMeta(metaEdit.name, null)
                setMetaEdit(null)
              }}
            >
              Padrão (70%)
            </Button>
            <Button
              onClick={() => {
                if (!metaEdit) return
                saveMeta(metaEdit.name, metaEdit.value)
                setMetaEdit(null)
              }}
            >
              Salvar meta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
