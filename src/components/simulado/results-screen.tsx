'use client'

import { motion } from 'framer-motion'
import {
  Award,
  BarChart3,
  CheckCircle2,
  Clock,
  Eye,
  Flag,
  RotateCcw,
  Target,
  TrendingUp,
  Trophy,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  EXAM_META,
  TOTAL_QUESTIONS,
  computeResults,
  formatDuration,
  type ExamState,
} from '@/data/simulado'

interface ResultsScreenProps {
  state: ExamState
  onReview: () => void
  onRedo: () => void
  onBackToStart: () => void
}

function barColor(pct: number) {
  if (pct >= 70) return 'bg-emerald-500'
  if (pct >= 50) return 'bg-amber-500'
  return 'bg-red-500'
}

function chipColor(pct: number) {
  if (pct >= 70) return 'bg-emerald-100 text-emerald-800'
  if (pct >= 50) return 'bg-amber-100 text-amber-800'
  return 'bg-red-100 text-red-800'
}

export function ResultsScreen({ state, onReview, onRedo, onBackToStart }: ResultsScreenProps) {
  const result = computeResults(state.answers)
  const markedCount = state.marked.length
  const timeUsedMs = (state.finishedAt ?? Date.now()) - state.startedAt
  const passed = result.pct >= EXAM_META.passPct
  const best = [...result.bySubject].sort((a, b) => b.pct - a.pct)[0]
  const worst = [...result.bySubject].sort((a, b) => a.pct - b.pct)[0]

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:py-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          {/* Nota geral */}
          <Card className="overflow-hidden border-0 bg-slate-900 text-white shadow-xl">
            <CardContent className="p-6 sm:p-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-amber-300">
                    {state.mode === 'prova' ? 'Modo prova' : 'Modo estudo'} • Simulado concluído
                  </p>
                  <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Resultado do Simulado</h1>
                  {state.name && <p className="mt-1 text-sm text-slate-300">Candidato: {state.name}</p>}
                </div>
                <div className="hidden h-14 w-14 items-center justify-center rounded-2xl bg-amber-400 text-slate-950 sm:flex">
                  <Trophy className="h-8 w-8" />
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-end gap-x-10 gap-y-4">
                <div>
                  <p className="text-6xl font-extrabold tabular-nums tracking-tight sm:text-7xl">
                    {result.pct}
                    <span className="text-3xl text-slate-400">%</span>
                  </p>
                  <p className="mt-1 text-sm text-slate-300">
                    <b className="text-white">{result.correct}</b> de {TOTAL_QUESTIONS} questões corretas
                  </p>
                </div>
                <div
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${
                    passed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                  }`}
                >
                  {passed ? <Award className="h-5 w-5" /> : <Target className="h-5 w-5" />}
                  {passed ? `Aprovado — acima da meta (${EXAM_META.passPct}%)` : `Abaixo da meta (${EXAM_META.passPct}%)`}
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl bg-white/5 p-3.5">
                  <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    <Clock className="h-3.5 w-3.5 text-amber-300" /> Tempo utilizado
                  </p>
                  <p className="mt-1 font-mono text-xl font-bold tabular-nums">{formatDuration(timeUsedMs)}</p>
                </div>
                <div className="rounded-xl bg-white/5 p-3.5">
                  <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Respondidas
                  </p>
                  <p className="mt-1 text-xl font-bold tabular-nums">
                    {result.answered}
                    <span className="text-sm text-slate-400">/{TOTAL_QUESTIONS}</span>
                  </p>
                </div>
                <div className="rounded-xl bg-white/5 p-3.5">
                  <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    <XCircle className="h-3.5 w-3.5 text-red-400" /> Em branco
                  </p>
                  <p className="mt-1 text-xl font-bold tabular-nums">{result.unanswered}</p>
                </div>
                <div className="rounded-xl bg-white/5 p-3.5">
                  <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    <Flag className="h-3.5 w-3.5 text-amber-300" /> Sinalizadas
                  </p>
                  <p className="mt-1 text-xl font-bold tabular-nums">{markedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Destaques */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Card className="border-emerald-200">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Melhor desempenho</p>
                  <p className="truncate text-sm font-bold text-slate-900">
                    {best.subject.name} — {best.correct}/{best.total} ({best.pct}%)
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-red-200">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                  <BarChart3 className="h-5 w-5 text-red-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Foco de estudo</p>
                  <p className="truncate text-sm font-bold text-slate-900">
                    {worst.subject.name} — {worst.correct}/{worst.total} ({worst.pct}%)
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Desempenho por disciplina */}
          <Card className="mt-6">
            <CardContent className="p-5 sm:p-6">
              <h2 className="mb-1 text-lg font-bold text-slate-900">Desempenho por disciplina</h2>
              <p className="mb-5 text-xs text-slate-500">
                As barras em verde indicam rendimento igual ou superior à meta de {EXAM_META.passPct}%.
              </p>
              <div className="space-y-4">
                {result.bySubject.map((sr) => (
                  <div key={sr.subject.id}>
                    <div className="mb-1.5 flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-800">{sr.subject.name}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums ${chipColor(sr.pct)}`}>
                        {sr.pct}%
                      </span>
                      <span className="ml-auto text-xs tabular-nums text-slate-500">
                        {sr.correct}/{sr.total} acertos
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${barColor(sr.pct)}`}
                        style={{ width: `${sr.pct}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">Professor: {sr.subject.professor}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ações */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button onClick={onReview} className="h-12 flex-1 bg-slate-900 text-base font-bold text-white hover:bg-slate-800">
              <Eye className="mr-2 h-5 w-5" /> Revisar questões comentadas
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="h-12 flex-1 border-slate-300 bg-white">
                  <RotateCcw className="mr-2 h-5 w-5" /> Refazer simulado
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Refazer o simulado?</AlertDialogTitle>
                  <AlertDialogDescription>
                    O resultado atual e todas as respostas serão apagados para iniciar uma nova tentativa em branco.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Voltar</AlertDialogCancel>
                  <AlertDialogAction onClick={onRedo} className="bg-red-600 text-white hover:bg-red-700">
                    Apagar e refazer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button variant="ghost" onClick={onBackToStart} className="h-12 flex-1 text-slate-600">
              Voltar ao início
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
