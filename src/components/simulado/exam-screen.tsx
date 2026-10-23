'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Crown,
  Flag,
  GraduationCap,
  Lightbulb,
  ListChecks,
  Timer,
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { HtmlContent } from './html-content'
import { TextBlockCard } from './text-block-card'
import { CommentLocked } from './comment-lock'
import {
  formatDuration,
  answerLabel,
  getPackSubject,
  isCertErrado,
  type ExamState,
  type OptionKey,
  type Question,
  type SimuladoPack,
} from '@/data/simulado'

interface ExamScreenProps {
  pack: SimuladoPack
  state: ExamState
  /** Plano grátis: comentários bloqueados + cota diária de questões */
  planFree?: boolean
  /** Comentários bloqueados? (default = planFree; plano custom pode liberar) */
  commentsLocked?: boolean
  /** Questões que ainda podem ser respondidas hoje (null = ilimitado) */
  questionsLeft?: number | null
  /** Abre o pop-up de assinatura quando a COTA DIÁRIA bloqueia uma resposta */
  onUpgrade?: () => void
  /** Abre o pop-up de assinatura ao clicar no comentário bloqueado (motivo = comentários) */
  onCommentsUpgrade?: () => void
  onAnswer: (qid: number, key: OptionKey) => void
  onToggleMark: (qid: number) => void
  onNavigate: (index: number) => void
  onFinish: () => void
}

export function ExamScreen({
  pack,
  state,
  planFree = false,
  commentsLocked,
  questionsLeft = null,
  onUpgrade,
  onCommentsUpgrade,
  onAnswer,
  onToggleMark,
  onNavigate,
  onFinish,
}: ExamScreenProps) {
  const [now, setNow] = useState(() => Date.now())
  const [navOpen, setNavOpen] = useState(false)
  const autoFired = useRef(false)

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const QUESTIONS = pack.questions
  const question = QUESTIONS[state.current]
  const subject = getPackSubject(pack, question.subjectId)
  const isCE = isCertErrado(question)
  const answeredCount = QUESTIONS.filter((q) => state.answers[q.id]).length
  const markedSet = new Set(state.marked)
  const isAnswered = Boolean(state.answers[question.id])

  // Cronômetro
  const DURATION_MS = pack.durationMinutes * 60 * 1000
  const remainingMs = state.mode === 'prova' ? DURATION_MS - (now - state.startedAt) : Infinity
  const elapsedMs = state.mode === 'estudo' ? now - state.startedAt : Math.min(DURATION_MS, now - state.startedAt)
  const isLowTime = state.mode === 'prova' && remainingMs < 10 * 60 * 1000
  const isWarnTime = state.mode === 'prova' && remainingMs < 30 * 60 * 1000 && !isLowTime

  // Auto-finalização ao esgotar o tempo
  useEffect(() => {
    if (state.mode === 'prova' && remainingMs <= 0 && !autoFired.current) {
      autoFired.current = true
      onFinish()
    }
  }, [remainingMs, state.mode, onFinish])

  // Scroll ao topo ao trocar de questão
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [state.current])

  const goPrev = () => onNavigate(Math.max(0, state.current - 1))
  const goNext = () => onNavigate(Math.min(QUESTIONS.length - 1, state.current + 1))

  const locked = state.mode === 'estudo' && isAnswered

  // Plano grátis: cota diária esgotada → bloqueia novas respostas e oferece a assinatura
  const quotaReached = planFree && questionsLeft !== null && questionsLeft <= 0

  const handleAnswer = (key: OptionKey) => {
    if (locked) return
    if (quotaReached) {
      onUpgrade?.()
      return
    }
    onAnswer(question.id, key)
  }

  // Atalhos de teclado (a–e, 1–5, c/e em Certo/Errado, setas)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return
      const key = e.key.toLowerCase()
      const opt = question.options.find((o) => o.key === key)
      if (opt) {
        handleAnswer(opt.key)
        return
      }
      // Em questões Certo/Errado, as teclas “c” e “e” também respondem
      if (isCE && (key === 'c' || key === 'e')) {
        handleAnswer(key === 'c' ? 'a' : 'b')
        return
      }
      const num = Number.parseInt(key, 10)
      if (num >= 1 && num <= question.options.length) {
        handleAnswer(question.options[num - 1].key)
        return
      }
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [state.current, locked])

  const timerLabel = state.mode === 'prova' ? formatDuration(remainingMs) : formatDuration(elapsedMs)
  const timerIcon = state.mode === 'prova' ? Timer : Clock

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Cabeçalho fixo */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900 text-white shadow-lg">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-400 text-slate-950">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold leading-tight">{pack.title}</p>
              <p className="text-[11px] leading-tight text-slate-400">
                {state.mode === 'prova' ? 'Modo prova' : 'Modo estudo'}
                {state.name ? ` • ${state.name}` : ''}
              </p>
            </div>
          </div>

          <div
            className={`ml-auto flex items-center gap-2 rounded-lg px-3 py-1.5 font-mono text-lg font-bold tabular-nums ${
              state.mode === 'prova'
                ? isLowTime
                  ? 'animate-pulse bg-red-500/20 text-red-300'
                  : isWarnTime
                    ? 'bg-amber-400/15 text-amber-300'
                    : 'bg-white/10 text-emerald-300'
                : 'bg-white/10 text-slate-200'
            }`}
          >
            <Timer className="h-4 w-4" />
            {timerLabel}
          </div>

          <div className="hidden items-center gap-2 text-xs text-slate-300 sm:flex">
            <ListChecks className="h-4 w-4 text-amber-300" />
            <span className="font-semibold text-white">{answeredCount}</span>/{QUESTIONS.length} respondidas
          </div>

          {/* Plano grátis: contador da cota diária de questões */}
          {planFree && questionsLeft !== null && (
            <div
              className={`hidden items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold sm:flex ${
                quotaReached ? 'animate-pulse bg-red-500/20 text-red-300' : 'bg-amber-400/15 text-amber-300'
              }`}
              title="Plano grátis: cota diária de questões"
            >
              <Crown className="h-3.5 w-3.5" />
              {quotaReached ? 'limite de hoje atingido' : `restam ${questionsLeft} hoje`}
            </div>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" className="bg-amber-500 font-bold text-slate-950 hover:bg-amber-400">
                Finalizar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Finalizar e ver o resultado?</AlertDialogTitle>
                <AlertDialogDescription>
                  Você respondeu <b>{answeredCount}</b> de {QUESTIONS.length} questões
                  {QUESTIONS.length - answeredCount > 0 && (
                    <>
                      {' '}
                      — ainda há <b className="text-amber-700">{QUESTIONS.length - answeredCount} em branco</b>
                    </>
                  )}
                  {markedSet.size > 0 && <> e <b>{markedSet.size} sinalizada(s)</b> para revisão</>}.
                  {state.mode === 'prova' && ' O cronômetro continuará correndo se você voltar à prova.'}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Continuar resolvendo</AlertDialogCancel>
                <AlertDialogAction onClick={onFinish} className="bg-amber-500 font-bold text-slate-950 hover:bg-amber-400">
                  Finalizar simulado
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        {/* Barra de progresso */}
        <div className="h-1 w-full bg-slate-800">
          <div
            className="h-full bg-amber-400 transition-all duration-500"
            style={{ width: `${(answeredCount / QUESTIONS.length) * 100}%` }}
          />
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[1fr_300px]">
        <div>
          {/* Mapa de questões (mobile) */}
          <div className="mb-4 lg:hidden">
            <Sheet open={navOpen} onOpenChange={setNavOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full border-slate-300 bg-white">
                  <ListChecks className="mr-2 h-4 w-4" />
                  Mapa de questões — {answeredCount}/{QUESTIONS.length} respondidas
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Navegação</SheetTitle>
                  <SheetDescription>Ir para uma questão específica</SheetDescription>
                </SheetHeader>
                <NavigationGrid
                  questions={QUESTIONS}
                  current={state.current}
                  answers={state.answers}
                  marked={markedSet}
                  onSelect={(i) => {
                    onNavigate(i)
                    setNavOpen(false)
                  }}
                />
                <Legend />
              </SheetContent>
            </Sheet>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={question.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.18 }}
            >
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-5 sm:p-7">
                  {/* Cabeçalho da questão */}
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-lg bg-slate-900 px-3 py-1 text-sm font-bold text-amber-300">
                      Questão {String(question.id).padStart(2, '0')}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {subject.name}
                    </span>
                    <span className="hidden text-xs text-slate-400 sm:inline">{subject.professor}</span>
                    <button
                      type="button"
                      onClick={() => onToggleMark(question.id)}
                      className={`ml-auto inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                        markedSet.has(question.id)
                          ? 'border-amber-400 bg-amber-100 text-amber-800'
                          : 'border-slate-200 bg-white text-slate-500 hover:border-amber-300 hover:text-amber-600'
                      }`}
                    >
                      <Flag className={`h-3.5 w-3.5 ${markedSet.has(question.id) ? 'fill-amber-500 text-amber-600' : ''}`} />
                      {markedSet.has(question.id) ? 'Sinalizada' : 'Sinalizar'}
                    </button>
                  </div>

                  {question.textRef && pack.textBlocks[question.textRef] && (
                    <div className="mt-5">
                      <TextBlockCard text={pack.textBlocks[question.textRef]} />
                    </div>
                  )}

                  <div className="mt-5">
                    <HtmlContent html={question.statement} />
                  </div>

                  {/* Alternativas — Certo/Errado renderiza botões dedicados */}
                  {isCE ? (
                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {question.options.map((opt) => {
                        const isCerto = opt.html === 'Certo'
                        const selected = state.answers[question.id] === opt.key
                        const isCorrect = opt.key === question.answer
                        let cls = isCerto
                          ? 'border-emerald-300 bg-white hover:border-emerald-500 hover:bg-emerald-50'
                          : 'border-red-300 bg-white hover:border-red-500 hover:bg-red-50'
                        let badgeCls = isCerto
                          ? 'border border-emerald-600 bg-emerald-600 text-white'
                          : 'border border-red-500 bg-red-500 text-white'
                        if (locked) {
                          if (isCorrect) {
                            cls = isCerto ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-400/40' : 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-400/40'
                            badgeCls = 'border border-emerald-600 bg-emerald-600 text-white'
                          } else if (selected) {
                            cls = 'border-red-400 bg-red-50 ring-2 ring-red-400/40'
                            badgeCls = 'border border-red-500 bg-red-500 text-white'
                          } else {
                            cls = 'border-slate-200 bg-white opacity-60'
                          }
                        } else if (selected) {
                          cls = isCerto
                            ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/40'
                            : 'border-red-600 bg-red-50 ring-2 ring-red-500/40'
                        }
                        return (
                          <button
                            key={opt.key}
                            type="button"
                            disabled={locked}
                            onClick={() => handleAnswer(opt.key)}
                            className={`flex items-center gap-3 rounded-xl border-2 px-5 py-6 text-left transition-all ${cls} ${
                              locked ? 'cursor-default' : 'cursor-pointer'
                            }`}
                          >
                            <span
                              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-black uppercase ${badgeCls}`}
                            >
                              {isCerto ? 'C' : 'E'}
                            </span>
                            <span className="text-lg font-bold text-slate-900">{opt.html}</span>
                            {locked && isCorrect && <CheckCircle2 className="ml-auto h-6 w-6 shrink-0 text-emerald-600" />}
                            {locked && selected && !isCorrect && <XCircle className="ml-auto h-6 w-6 shrink-0 text-red-500" />}
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                  <div className="mt-4 space-y-2.5">
                    {question.options.map((opt) => {
                      const selected = state.answers[question.id] === opt.key
                      const isCorrect = opt.key === question.answer
                      let cls = 'border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50'
                      let badgeCls = 'border border-slate-300 bg-white text-slate-600'
                      if (locked) {
                        if (isCorrect) {
                          cls = 'border-emerald-500 bg-emerald-50'
                          badgeCls = 'border border-emerald-600 bg-emerald-600 text-white'
                        } else if (selected) {
                          cls = 'border-red-400 bg-red-50'
                          badgeCls = 'border border-red-500 bg-red-500 text-white'
                        } else {
                          cls = 'border-slate-200 bg-white opacity-60'
                        }
                      } else if (selected) {
                        cls = 'border-amber-500 bg-amber-50 ring-2 ring-amber-400/40'
                        badgeCls = 'border border-amber-600 bg-amber-600 text-white'
                      }
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          disabled={locked}
                          onClick={() => handleAnswer(opt.key)}
                          className={`flex w-full items-start gap-3 rounded-xl border-2 p-3.5 text-left transition-all sm:p-4 ${cls} ${
                            locked ? 'cursor-default' : 'cursor-pointer'
                          }`}
                        >
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold uppercase ${badgeCls}`}
                          >
                            {opt.key}
                          </span>
                          <HtmlContent html={opt.html} className="pt-0.5" />
                          {locked && isCorrect && <CheckCircle2 className="ml-auto h-5 w-5 shrink-0 text-emerald-600" />}
                          {locked && selected && !isCorrect && <XCircle className="ml-auto h-5 w-5 shrink-0 text-red-500" />}
                        </button>
                      )
                    })}
                  </div>
                  )}

                  {/* Feedback do modo estudo */}
                  {locked && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
                      {state.answers[question.id] === question.answer ? (
                        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                          <CheckCircle2 className="h-5 w-5" /> Você acertou!
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
                          <XCircle className="h-5 w-5" /> Resposta incorreta — gabarito: {answerLabel(question)}.
                        </div>
                      )}
                      <div className="mt-3">
                        {(commentsLocked ?? planFree) ? (
                          <CommentLocked onUpgrade={() => (onCommentsUpgrade ?? onUpgrade)?.()} />
                        ) : (
                          <div className="rounded-lg border-l-4 border-amber-400 bg-amber-50/70 px-4 py-3">
                            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-amber-700">
                              <Lightbulb className="h-4 w-4" /> Comentário
                            </p>
                            <HtmlContent html={question.comment} className="text-sm" />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Navegação inferior */}
                  <div className="mt-7 flex items-center justify-between gap-3">
                    <Button variant="outline" onClick={goPrev} disabled={state.current === 0} className="bg-white">
                      <ChevronLeft className="mr-1 h-4 w-4" /> Anterior
                    </Button>
                    <p className="text-xs text-slate-400">
                      {state.current + 1} / {QUESTIONS.length}
                    </p>
                    <Button
                      onClick={goNext}
                      disabled={state.current === QUESTIONS.length - 1}
                      className="bg-slate-900 text-white hover:bg-slate-800"
                    >
                      Próxima <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Painel lateral de navegação (desktop) */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4">
            <Card className="border-slate-200">
              <CardContent className="p-4">
                <p className="mb-3 text-sm font-semibold text-slate-900">Mapa de questões</p>
                <NavigationGrid
                  questions={QUESTIONS}
                  current={state.current}
                  answers={state.answers}
                  marked={markedSet}
                  onSelect={onNavigate}
                />
                <Legend />
              </CardContent>
            </Card>
            {state.mode === 'prova' && (
              <Card className="border-amber-200 bg-amber-50/60">
                <CardContent className="flex items-start gap-2.5 p-4">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <p className="text-xs leading-relaxed text-amber-900">
                    O tempo é continuado: se você sair e voltar, o cronômetro permanece correndo, como na prova real.
                    Atalhos: teclas <b>a–e</b> (ou <b>1–5</b>) respondem; setas navegam.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </aside>
      </main>
    </div>
  )
}

interface NavigationGridProps {
  questions: Question[]
  current: number
  answers: Record<number, OptionKey>
  marked: Set<number>
  onSelect: (index: number) => void
}

function NavigationGrid({ questions, current, answers, marked, onSelect }: NavigationGridProps) {
  return (
    <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-10 lg:grid-cols-6">
      {questions.map((q, i) => {
        const answered = Boolean(answers[q.id])
        const isMarked = marked.has(q.id)
        const isCurrent = i === current
        let cls = 'border border-slate-200 bg-white text-slate-500 hover:border-slate-400'
        if (answered) cls = 'border border-slate-900 bg-slate-900 text-white'
        if (isMarked) cls = 'border border-amber-500 bg-amber-400 text-slate-950 font-bold'
        if (isCurrent) cls += ' ring-2 ring-amber-500 ring-offset-1'
        return (
          <button
            key={q.id}
            type="button"
            onClick={() => onSelect(i)}
            title={`Questão ${q.id}`}
            className={`relative flex h-8 items-center justify-center rounded-md text-xs font-semibold transition-all ${cls}`}
          >
            {String(q.id).padStart(2, '0')}
          </button>
        )
      })}
    </div>
  )
}

function Legend() {
  return (
    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-slate-500">
      <span className="inline-flex items-center gap-1.5">
        <span className="h-3 w-3 rounded border border-slate-900 bg-slate-900" /> Respondida
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-3 w-3 rounded border border-slate-200 bg-white" /> Em branco
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-3 w-3 rounded border border-amber-500 bg-amber-400" /> Sinalizada
      </span>
    </div>
  )
}
