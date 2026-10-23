'use client'

import { useEffect, useState } from 'react'
import { PencilLine, Target, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Slider } from '@/components/ui/slider'
import {
  DEFAULT_WEEKLY_GOAL,
  WEEKLY_GOAL_PRESETS,
  loadWeeklyGoal,
  saveWeeklyGoal,
  weekRangeLabel,
} from '@/lib/weekly-goal'

/**
 * META SEMANAL DE QUESTÕES — gamificação leve: "200 questões/semana" com
 * barra de progresso. O objetivo fica salvo no aparelho e a semana recomeça
 * na segunda-feira. Usado no painel do aluno e no Meu desempenho.
 */
export function WeeklyGoalCard({
  answered,
  variant = 'full',
}: {
  /** Questões respondidas na semana corrente */
  answered: number
  /** full = painel (editável + rótulo do intervalo); mini = Meu desempenho */
  variant?: 'full' | 'mini'
}) {
  const [goal, setGoal] = useState<number>(DEFAULT_WEEKLY_GOAL)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<number>(DEFAULT_WEEKLY_GOAL)

  useEffect(() => {
    // Deferido pós-pintura (mesma técnica do Pomodoro): evita setState direto
    // em efeito e mismatch de hidratação
    const id = window.setTimeout(() => setGoal(loadWeeklyGoal()), 0)
    return () => window.clearTimeout(id)
  }, [])

  const pct = Math.min(100, goal > 0 ? Math.round((answered / goal) * 100) : 0)
  const done = answered >= goal

  const save = () => {
    saveWeeklyGoal(draft)
    setGoal(draft)
    setEditing(false)
  }

  return (
    <>
      <div
        className={`rounded-xl border p-4 ${
          done ? 'border-emerald-200 bg-emerald-50' : 'border-slate-100 bg-slate-50/60'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
              done ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-amber-300'
            }`}
          >
            {done ? <TrendingUp className="h-5 w-5" /> : <Target className="h-5 w-5" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-sm font-bold text-slate-900">Meta semanal</p>
              <p className={`shrink-0 text-sm font-black ${done ? 'text-emerald-700' : 'text-slate-900'}`}>
                {answered}/{goal}
              </p>
            </div>
            <p className="truncate text-[11px] text-slate-500">
              {done
                ? 'Meta batida! Cada questão extra é lucro 🏁'
                : `Faltam ${Math.max(0, goal - answered)} questões para a meta • semana ${weekRangeLabel()}`}
            </p>
          </div>
          {variant === 'full' && (
            <Button
              onClick={() => {
                setDraft(goal)
                setEditing(true)
              }}
              variant="ghost"
              size="icon"
              aria-label="Editar meta semanal de questões"
              className="h-8 w-8 shrink-0 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
            >
              <PencilLine className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Progress
          value={pct}
          className={`mt-2.5 h-2 ${done ? '[&>div]:bg-emerald-600' : ''}`}
          aria-label={`Meta semanal: ${answered} de ${goal} questões (${pct}%)`}
        />
        <p className="mt-1.5 text-[11px] text-slate-500">
          {pct}% da meta semanal {done ? '— conquistada!' : '— você chega lá'}
        </p>
      </div>

      {/* Editor da meta */}
      <Dialog open={editing} onOpenChange={(open) => (open ? undefined : setEditing(false))}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Meta semanal de questões</DialogTitle>
            <DialogDescription>
              Quantas questões você quer responder por semana? A contagem recomeça toda segunda-feira e a barra de
              progresso aparece no painel.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-baseline justify-center gap-1 rounded-xl border border-slate-200 bg-slate-50 py-3">
              <span className="text-3xl font-black text-slate-900">{draft}</span>
              <span className="text-lg font-bold text-slate-500">questões/semana</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {WEEKLY_GOAL_PRESETS.map((v) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={draft === v}
                  onClick={() => setDraft(v)}
                  className={`h-9 rounded-lg border text-sm font-bold transition-colors ${
                    draft === v
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
            <Slider
              value={[draft]}
              min={10}
              max={500}
              step={10}
              onValueChange={([v]) => setDraft(v)}
              aria-label="Ajustar meta semanal de questões"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => {
                saveWeeklyGoal(DEFAULT_WEEKLY_GOAL)
                setGoal(DEFAULT_WEEKLY_GOAL)
                setEditing(false)
              }}
            >
              Padrão ({DEFAULT_WEEKLY_GOAL})
            </Button>
            <Button onClick={save}>Salvar meta</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
