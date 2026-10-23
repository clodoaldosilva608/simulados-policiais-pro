'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Asterisk,
  CheckCircle2,
  Clock,
  EyeOff,
  FileText,
  Flag,
  Lightbulb,
  ListChecks,
  MessageSquareText,
  Minus,
  Monitor,
  SkipForward,
  Square,
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
import { ShareQuestionButton, type ShareState } from './share-question-button'
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
  /** RISCAR/desriscar uma alternativa (estilo Qconcursos) */
  onToggleEliminate?: (qid: number, key: OptionKey) => void
  /** Anotação livre da questão (ESPAÇO LIVRE) */
  onSetNote?: (qid: number, text: string) => void
  onNavigate: (index: number) => void
  onFinish: () => void
}

const PAPER_KEY = 'spp-exam-paper-v1'

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
  onToggleEliminate,
  onSetNote,
  onNavigate,
  onFinish,
}: ExamScreenProps) {
  const [now, setNow] = useState(() => Date.now())
  const [navOpen, setNavOpen] = useState(false)
  const autoFired = useRef(false)
  const notesRef = useRef<HTMLTextAreaElement | null>(null)
  // Tema da tela da questão: DARK (padrão, estilo Qconcursos) ou PAPEL (claro)
  // A tela só renderiza no cliente (após login), então o lazy initializer é seguro.
  const [paper, setPaper] = useState(() => {
    if (typeof window === 'undefined') return false
    try {
      return window.localStorage.getItem(PAPER_KEY) === '1'
    } catch {
      return false
    }
  })

  const togglePaper = () => {
    setPaper((p) => {
      try {
        window.localStorage.setItem(PAPER_KEY, p ? '0' : '1')
      } catch {
        /* noop */
      }
      return !p
    })
  }

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const QUESTIONS = pack.questions
  const question: Question = QUESTIONS[state.current]
  const subject = getPackSubject(pack, question.subjectId)
  const isCE = isCertErrado(question)
  const answeredCount = QUESTIONS.filter((q) => state.answers[q.id]).length
  const markedSet = useMemo(() => new Set(state.marked), [state.marked])
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

  /** VOLTAR DEPOIS: sinaliza a questão e pula para a próxima em branco (estilo Qconcursos) */
  const voltarDepois = () => {
    if (!markedSet.has(question.id)) onToggleMark(question.id)
    for (let step = 1; step < QUESTIONS.length; step++) {
      const idx = (state.current + step) % QUESTIONS.length
      if (!state.answers[QUESTIONS[idx].id]) {
        onNavigate(idx)
        return
      }
    }
    goNext()
  }

  /** RISCAR: elimina visualmente a alternativa (toggle) */
  const eliminatedFor = state.eliminated?.[question.id] ?? []
  const isStruck = (key: OptionKey) => eliminatedFor.includes(key)
  const toggleEliminate = (key: OptionKey) => {
    if (locked) return
    onToggleEliminate?.(question.id, key)
  }

  const noteValue = state.notes?.[question.id] ?? ''
  const setNote = (text: string) => onSetNote?.(question.id, text.slice(0, 2000))

  // DESTAQUE VIRAL do compartilhar: acerto verde, erro vermelho, prova âmbar
  const shareState: ShareState = useMemo(() => {
    if (!isAnswered) return 'idle'
    if (state.mode === 'estudo') return state.answers[question.id] === question.answer ? 'correct' : 'wrong'
    return 'answered'
  }, [isAnswered, state.mode, state.answers, question.id, question.answer])

  // Próxima em branco (para o atalho de navegação)
  const nextBlank = () => {
    for (let step = 1; step < QUESTIONS.length; step++) {
      const idx = (state.current + step) % QUESTIONS.length
      if (!state.answers[QUESTIONS[idx].id]) {
        onNavigate(idx)
        return
      }
    }
    goNext()
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
  const TimerIcon = state.mode === 'prova' ? Timer : Clock

  // Metadados de origem (badges estilo Qconcursos: [ano] [cargo/concurso] [banca])
  const metaAno = question.ano ?? pack.ano
  const metaBanca = question.banca ?? pack.banca
  const metaConcurso = question.concurso ?? (pack.oficial ? pack.title : undefined)
  const metaNivel = question.nivel
  const headerTitle = [subject.name, question.assunto].filter(Boolean).join(' · ')

  /* --------- tokens de tema (DARK padrão / PAPEL claro) --------- */
  const T = paper
    ? {
        page: 'min-h-screen bg-stone-200 pb-28',
        headerTop: 'bg-stone-900 border-b border-stone-800',
        headerBar: 'bg-stone-950/95 border-b border-stone-800',
        title: 'text-amber-300',
        sub: 'text-stone-400',
        chip: 'bg-white/10 text-stone-200',
        timeText: 'text-emerald-300',
        card: 'border-stone-300 bg-white shadow-sm',
        badge: 'border-stone-300 bg-stone-100 text-stone-600',
        nivel: 'text-stone-500',
        divider: 'border-stone-200',
        stmt: 'text-stone-900',
        letterIdle: 'border border-stone-300 bg-stone-100 text-stone-600',
        optionIdle: 'border-stone-200 bg-white hover:border-stone-400 hover:bg-stone-50',
        optionSelected: 'border-amber-500 bg-amber-50 ring-2 ring-amber-400/40',
        letterSelected: 'border border-amber-600 bg-amber-600 text-white',
        riscar: 'border-stone-300 bg-white text-stone-400 hover:border-rose-400 hover:text-rose-500',
        riscarActive: 'border-rose-400 bg-rose-100 text-rose-600',
        struck: 'line-through opacity-45',
        noteArea: 'border-stone-300 bg-transparent text-stone-900 placeholder:text-stone-400 focus:border-amber-500',
        free: 'text-stone-500',
        notesLabel: 'text-stone-400',
        navBtn: 'border-stone-400 bg-white text-stone-600 hover:bg-stone-100',
        bottomNav: 'border-t border-stone-800 bg-stone-900',
        asideCard: 'border-stone-200 bg-white',
        feedbackOk: 'border-emerald-300 bg-emerald-50 text-emerald-800',
        feedbackErr: 'border-red-300 bg-red-50 text-red-800',
        commentBox: 'border-l-4 border-amber-400 bg-amber-50/70',
        commentTitle: 'text-amber-700',
      }
    : {
        page: 'min-h-screen bg-zinc-950 pb-28',
        headerTop: 'bg-zinc-900 border-b border-zinc-800',
        headerBar: 'bg-zinc-950/95 border-b border-zinc-800',
        title: 'text-amber-300',
        sub: 'text-zinc-400',
        chip: 'bg-white/10 text-zinc-200',
        timeText: 'text-emerald-300',
        card: 'border-amber-900/50 bg-[#1d1811] shadow-[0_0_0_1px_rgba(0,0,0,0.4)]',
        badge: 'border-zinc-600 bg-transparent text-zinc-300',
        nivel: 'text-zinc-500',
        divider: 'border-zinc-700/60',
        stmt: 'text-zinc-100',
        letterIdle: 'border border-amber-500/70 bg-amber-400/20 text-amber-300',
        optionIdle: 'border-zinc-700/70 bg-transparent hover:border-amber-400/60 hover:bg-amber-400/5',
        optionSelected: 'border-amber-400 bg-amber-400/10 ring-1 ring-amber-400/50',
        letterSelected: 'border border-amber-400 bg-amber-400 text-zinc-950',
        riscar: 'border-zinc-700/70 bg-transparent text-zinc-500 hover:border-rose-400 hover:text-rose-400',
        riscarActive: 'border-rose-400 bg-rose-400/15 text-rose-300',
        struck: 'line-through opacity-45',
        noteArea: 'border-zinc-700/70 bg-transparent text-zinc-100 placeholder:text-zinc-500 focus:border-amber-400',
        free: 'text-zinc-500',
        notesLabel: 'text-amber-500/80',
        navBtn: 'border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800',
        bottomNav: 'border-t border-zinc-800 bg-zinc-900/95 backdrop-blur',
        asideCard: 'border-zinc-700 bg-zinc-900',
        feedbackOk: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
        feedbackErr: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
        commentBox: 'border-l-4 border-amber-400 bg-amber-400/5',
        commentTitle: 'text-amber-400',
      }

  return (
    <div className={T.page}>
      {/* ── Cabeçalho estilo Qconcursos ─────────────────────────── */}
      <header className="sticky top-0 z-40 shadow-lg">
        <div className={T.headerTop}>
          <div className="mx-auto flex max-w-4xl items-center gap-3 px-3 py-2.5 sm:px-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  type="button"
                  aria-label="Finalizar ou sair do simulado"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
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
                  <AlertDialogAction
                    onClick={onFinish}
                    className="bg-amber-500 font-bold text-slate-950 hover:bg-amber-400"
                  >
                    Finalizar simulado
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <div className="min-w-0 flex-1">
              <p className={`truncate text-[13px] font-extrabold uppercase tracking-wide ${T.title}`}>
                {headerTitle || pack.title}
              </p>
              <p className={`text-xs leading-tight ${T.sub}`}>
                Questão {state.current + 1} de {QUESTIONS.length}
                <span className="hidden sm:inline"> • {state.mode === 'prova' ? 'Modo prova' : 'Modo estudo'}</span>
                {state.name ? <span className="hidden sm:inline"> • {state.name}</span> : null}
              </p>
            </div>

            <ShareQuestionButton targetId="exam-question-card" state={shareState} compact className="" />
          </div>
        </div>

        {/* Barra do cronômetro */}
        <div className={T.headerBar}>
          <div className="mx-auto flex max-w-4xl items-center gap-2 px-3 py-2 sm:px-4">
            <TimerIcon className={`h-4 w-4 ${T.sub}`} />
            <span
              className={`font-mono text-lg font-bold tabular-nums ${
                state.mode === 'prova' ? (isLowTime ? 'animate-pulse text-red-400' : isWarnTime ? 'text-amber-300' : T.timeText) : T.timeText
              }`}
            >
              {timerLabel}
            </span>
            <span className={`hidden rounded-md px-2 py-1 text-[11px] font-semibold sm:inline ${T.chip}`}>
              {answeredCount}/{QUESTIONS.length} respondidas
            </span>
            {planFree && questionsLeft !== null && (
              <span
                className={`rounded-md px-2 py-1 text-[11px] font-bold ${
                  quotaReached ? 'animate-pulse bg-red-500/20 text-red-300' : 'bg-amber-400/15 text-amber-300'
                }`}
                title="Plano grátis: cota diária de questões"
              >
                {quotaReached ? 'limite de hoje atingido' : `restam ${questionsLeft} hoje`}
              </span>
            )}
            <div className="ml-auto flex items-center gap-2">
              <Sheet open={navOpen} onOpenChange={setNavOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    aria-label="Mapa de questões"
                    title="Mapa de questões"
                    className="flex h-9 w-9 items-center justify-center rounded-md bg-amber-400/90 text-zinc-950 transition-colors hover:bg-amber-300"
                  >
                    <ListChecks className="h-4.5 w-4.5" />
                  </button>
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
              {/* Quadrado vermelho = finalizar (como no Qconcursos) */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    type="button"
                    aria-label="Finalizar simulado"
                    title="Finalizar simulado"
                    className="flex h-9 w-11 items-center justify-center rounded-md border border-red-400/40 bg-red-500/80 text-white transition-colors hover:bg-red-500"
                  >
                    <Square className="h-4 w-4 fill-current" />
                  </button>
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
                      .
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Continuar resolvendo</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={onFinish}
                      className="bg-amber-500 font-bold text-slate-950 hover:bg-amber-400"
                    >
                      Finalizar simulado
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          {/* Barra de progresso */}
          <div className="h-1 w-full bg-black/40">
            <div
              className="h-full bg-amber-400 transition-all duration-500"
              style={{ width: `${(answeredCount / QUESTIONS.length) * 100}%` }}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-4xl gap-6 px-3 py-5 sm:px-4 lg:grid-cols-[1fr_280px]">
        <div>
          <AnimatePresence mode="wait">
            <motion.div
              key={question.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.18 }}
            >
              <Card id="exam-question-card" className={T.card}>
                <CardContent className="p-4 sm:p-6">
                  {/* Badges de origem: [2021] [Oficial Investigador] [IDECAN] */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {metaAno ? <OriginBadge T={T}>{metaAno}</OriginBadge> : null}
                    {metaConcurso ? <OriginBadge T={T}>{metaConcurso}</OriginBadge> : null}
                    {metaBanca ? <OriginBadge T={T}>{metaBanca}</OriginBadge> : null}
                  </div>

                  {/* Nível (equivalente à linha “Dificuldade” do Qconcursos) */}
                  {metaNivel ? (
                    <p className={`mt-3 flex items-center gap-1.5 text-sm ${T.nivel}`}>
                      <EyeOff className="h-4 w-4" /> Nível: {metaNivel}
                    </p>
                  ) : null}

                  {/* Ações: VOLTAR DEPOIS · sinalizar · compartilhar · PAPEL/DARK */}
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={voltarDepois}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[11px] font-extrabold uppercase tracking-wider transition-colors ${
                        paper
                          ? 'border-stone-300 bg-white text-amber-700 hover:border-amber-400'
                          : 'border-amber-500/50 bg-transparent text-amber-300 hover:bg-amber-400/10'
                      }`}
                      title="Sinaliza esta questão e pula para a próxima em branco"
                    >
                      <Asterisk className="h-4 w-4" /> Voltar depois
                    </button>

                    <button
                      type="button"
                      onClick={() => onToggleMark(question.id)}
                      aria-label={markedSet.has(question.id) ? 'Remover sinalização' : 'Sinalizar questão'}
                      title={markedSet.has(question.id) ? 'Sinalizada — clique para remover' : 'Sinalizar para revisar depois'}
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
                        markedSet.has(question.id)
                          ? 'border-amber-400 bg-amber-400/20 text-amber-300'
                          : paper
                            ? 'border-stone-300 bg-white text-stone-400 hover:border-amber-400 hover:text-amber-600'
                            : 'border-zinc-600 bg-transparent text-zinc-400 hover:border-amber-300 hover:text-amber-300'
                      }`}
                    >
                      <Flag className={`h-4.5 w-4.5 ${markedSet.has(question.id) ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>

                    {/* Alternância PAPEL / DARK */}
                    <div
                      className={`ml-auto flex items-center overflow-hidden rounded-full border text-[11px] font-extrabold uppercase tracking-wider ${
                        paper ? 'border-stone-300' : 'border-zinc-600'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => !paper && togglePaper()}
                        className={`flex items-center gap-1.5 px-3 py-2 transition-colors ${
                          paper
                            ? 'bg-amber-400 text-zinc-950'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <FileText className="h-3.5 w-3.5" /> Papel
                      </button>
                      <button
                        type="button"
                        onClick={() => paper && togglePaper()}
                        className={`flex items-center gap-1.5 px-3 py-2 transition-colors ${
                          !paper ? 'bg-amber-400 text-zinc-950' : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <Monitor className="h-3.5 w-3.5" /> Dark
                      </button>
                    </div>
                  </div>

                  <div className={`mt-4 border-t ${T.divider}`} />

                  {question.textRef && pack.textBlocks[question.textRef] && (
                    <div className="mt-4">
                      <TextBlockCard text={pack.textBlocks[question.textRef]} />
                    </div>
                  )}

                  <div className={`mt-4 ${T.stmt}`}>
                    <HtmlContent html={question.statement} className="text-[17px] leading-relaxed sm:text-lg" />
                  </div>

                  {/* Alternativas — Certo/Errado renderiza botões dedicados */}
                  {isCE ? (
                    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {question.options.map((opt) => {
                        const isCerto = opt.html === 'Certo'
                        const selected = state.answers[question.id] === opt.key
                        const isCorrect = opt.key === question.answer
                        const struck = isStruck(opt.key)
                        let cls = isCerto
                          ? paper
                            ? 'border-emerald-300 bg-white hover:border-emerald-500 hover:bg-emerald-50'
                            : 'border-emerald-700/60 bg-emerald-500/5 hover:border-emerald-400 hover:bg-emerald-500/10'
                          : paper
                            ? 'border-red-300 bg-white hover:border-red-500 hover:bg-red-50'
                            : 'border-rose-700/60 bg-rose-500/5 hover:border-rose-400 hover:bg-rose-500/10'
                        let badgeCls = isCerto
                          ? 'border border-emerald-600 bg-emerald-600 text-white'
                          : 'border border-red-500 bg-red-500 text-white'
                        if (locked) {
                          if (isCorrect) {
                            cls = paper
                              ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-400/40'
                              : 'border-emerald-400 bg-emerald-400/10 ring-2 ring-emerald-400/40'
                            badgeCls = 'border border-emerald-500 bg-emerald-500 text-white'
                          } else if (selected) {
                            cls = paper
                              ? 'border-red-400 bg-red-50 ring-2 ring-red-400/40'
                              : 'border-rose-400 bg-rose-400/10 ring-2 ring-rose-400/40'
                            badgeCls = 'border border-rose-500 bg-rose-500 text-white'
                          } else {
                            cls = paper ? 'border-stone-200 bg-white opacity-60' : 'border-zinc-800 bg-transparent opacity-50'
                          }
                        } else if (selected) {
                          cls = isCerto
                            ? paper
                              ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/40'
                              : 'border-emerald-400 bg-emerald-400/10 ring-2 ring-emerald-400/50'
                            : paper
                              ? 'border-red-600 bg-red-50 ring-2 ring-red-500/40'
                              : 'border-rose-400 bg-rose-400/10 ring-2 ring-rose-400/50'
                        }
                        return (
                          <div key={opt.key} className="flex items-stretch gap-2">
                            <button
                              type="button"
                              disabled={locked}
                              onClick={() => handleAnswer(opt.key)}
                              className={`flex flex-1 items-center gap-3 rounded-xl border-2 px-4 py-5 text-left transition-all ${cls} ${
                                locked ? 'cursor-default' : 'cursor-pointer'
                              }`}
                            >
                              <span
                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-black uppercase ${badgeCls}`}
                              >
                                {isCerto ? 'C' : 'E'}
                              </span>
                              <span className={`text-lg font-bold ${T.stmt} ${struck ? T.struck : ''}`}>{opt.html}</span>
                              {locked && isCorrect && <CheckCircle2 className="ml-auto h-6 w-6 shrink-0 text-emerald-500" />}
                              {locked && selected && !isCorrect && <XCircle className="ml-auto h-6 w-6 shrink-0 text-rose-500" />}
                            </button>
                            {!locked && (
                              <RiscarButton
                                T={T}
                                active={struck}
                                onClick={() => toggleEliminate(opt.key)}
                              />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="mt-5 space-y-3">
                      {question.options.map((opt) => {
                        const selected = state.answers[question.id] === opt.key
                        const isCorrect = opt.key === question.answer
                        const struck = isStruck(opt.key)
                        let cls = T.optionIdle
                        let badgeCls = T.letterIdle
                        if (locked) {
                          if (isCorrect) {
                            cls = paper ? 'border-emerald-500 bg-emerald-50' : 'border-emerald-400 bg-emerald-400/10'
                            badgeCls = 'border border-emerald-500 bg-emerald-500 text-white'
                          } else if (selected) {
                            cls = paper ? 'border-red-400 bg-red-50' : 'border-rose-400 bg-rose-400/10'
                            badgeCls = 'border border-rose-500 bg-rose-500 text-white'
                          } else {
                            cls = paper ? 'border-stone-200 bg-white opacity-60' : 'border-zinc-800 bg-transparent opacity-50'
                          }
                        } else if (selected) {
                          cls = T.optionSelected
                          badgeCls = T.letterSelected
                        }
                        return (
                          <div key={opt.key} className="flex items-stretch gap-2">
                            <button
                              type="button"
                              disabled={locked}
                              onClick={() => handleAnswer(opt.key)}
                              className={`flex w-full items-start gap-3 rounded-xl border-2 p-3.5 text-left transition-all sm:p-4 ${cls} ${
                                locked ? 'cursor-default' : 'cursor-pointer'
                              }`}
                            >
                              <span
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-sm font-black uppercase ${badgeCls}`}
                              >
                                {opt.key}
                              </span>
                              <HtmlContent
                                html={opt.html}
                                className={`pt-0.5 ${struck ? T.struck : ''}`}
                              />
                              {locked && isCorrect && (
                                <CheckCircle2 className="ml-auto h-5 w-5 shrink-0 text-emerald-500" />
                              )}
                              {locked && selected && !isCorrect && (
                                <XCircle className="ml-auto h-5 w-5 shrink-0 text-rose-500" />
                              )}
                            </button>
                            {!locked && (
                              <RiscarButton T={T} active={struck} onClick={() => toggleEliminate(opt.key)} />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Feedback do modo estudo */}
                  {locked && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
                      {state.answers[question.id] === question.answer ? (
                        <div className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-semibold ${T.feedbackOk}`}>
                          <CheckCircle2 className="h-5 w-5" /> Você acertou!
                        </div>
                      ) : (
                        <div className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-semibold ${T.feedbackErr}`}>
                          <XCircle className="h-5 w-5" /> Resposta incorreta — gabarito: {answerLabel(question)}.
                        </div>
                      )}
                      <div className="mt-3">
                        {(commentsLocked ?? planFree) ? (
                          <CommentLocked onUpgrade={() => (onCommentsUpgrade ?? onUpgrade)?.()} />
                        ) : (
                          <div className={`rounded-lg px-4 py-3 ${T.commentBox}`}>
                            <p className={`mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide ${T.commentTitle}`}>
                              <Lightbulb className="h-4 w-4" /> Comentário
                            </p>
                            <HtmlContent html={question.comment} className={`text-sm ${T.stmt}`} />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* ESPAÇO LIVRE — anotações do aluno (estilo Qconcursos) */}
                  <div className={`relative mt-8 border-t ${T.divider}`}>
                    <span
                      className={`absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 text-[11px] font-extrabold uppercase tracking-[0.2em] ${T.notesLabel} ${
                        paper ? 'bg-white' : 'bg-[#1d1811]'
                      }`}
                    >
                      Espaço livre
                    </span>
                    <div className="pt-4">
                      <textarea
                        ref={notesRef}
                        value={noteValue}
                        onChange={(e) => setNote(e.target.value)}
                        rows={3}
                        placeholder="Clique aqui para anotar"
                        className={`w-full resize-y rounded-lg border-2 px-3 py-2.5 text-sm outline-none transition-colors ${T.noteArea}`}
                      />
                    </div>
                  </div>

                  {/* Navegação no rodapé do card (desktop) */}
                  <div className="mt-5 hidden items-center justify-between gap-3 sm:flex">
                    <Button
                      variant="outline"
                      onClick={goPrev}
                      disabled={state.current === 0}
                      className={paper ? 'bg-white' : 'border-zinc-700 bg-transparent text-zinc-200 hover:bg-zinc-800'}
                    >
                      <ChevronLeftSmall /> Anterior
                    </Button>
                    <p className={`text-xs ${T.free}`}>
                      {state.current + 1} / {QUESTIONS.length}
                    </p>
                    <Button
                      onClick={goNext}
                      disabled={state.current === QUESTIONS.length - 1}
                      className={paper ? 'bg-stone-900 text-white hover:bg-stone-800' : 'bg-amber-400 text-zinc-950 hover:bg-amber-300'}
                    >
                      Próxima <ChevronRightSmall />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Painel lateral de navegação (desktop) */}
          <aside className="mt-6 hidden lg:block">
            <div className="space-y-4">
              <Card className={T.asideCard}>
                <CardContent className="p-4">
                  <p className={`mb-3 text-sm font-semibold ${T.stmt}`}>Mapa de questões</p>
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
                <Card className={paper ? 'border-amber-200 bg-amber-50/60' : 'border-amber-500/30 bg-amber-400/5'}>
                  <CardContent className="flex items-start gap-2.5 p-4">
                    <AlertTriangle className={`mt-0.5 h-4 w-4 shrink-0 ${paper ? 'text-amber-600' : 'text-amber-400'}`} />
                    <p className={`text-xs leading-relaxed ${paper ? 'text-amber-900' : 'text-amber-200/90'}`}>
                      O tempo é continuado: se você sair e voltar, o cronômetro permanece correndo, como na prova real.
                      Atalhos: teclas <b>a–e</b> (ou <b>1–5</b>) respondem; setas navegam.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </aside>
        </div>
      </main>

      {/* ── Barra de navegação fixa (estilo Qconcursos) ─────────── */}
      <nav className={`fixed inset-x-0 bottom-0 z-40 ${T.bottomNav}`}>
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-2 px-3 py-2.5 sm:px-4">
          <button
            type="button"
            onClick={() => {
              notesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
              setTimeout(() => notesRef.current?.focus(), 350)
            }}
            aria-label="Ir para as anotações"
            title="Anotações da questão (espaço livre)"
            className={`flex h-10 w-10 items-center justify-center rounded-full border ${T.navBtn}`}
          >
            <MessageSquareText className="h-4.5 w-4.5" />
          </button>
          <p className={`text-xs font-semibold sm:hidden ${T.sub}`}>
            {state.current + 1}/{QUESTIONS.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={nextBlank}
              aria-label="Ir para a próxima questão em branco"
              title="Próxima em branco"
              className={`flex h-10 items-center gap-1.5 rounded-lg border px-3 text-xs font-bold ${T.navBtn}`}
            >
              <SkipForward className="h-4 w-4" />
              <span className="hidden sm:inline">Em branco</span>
            </button>
            <button
              type="button"
              onClick={goPrev}
              disabled={state.current === 0}
              aria-label="Questão anterior"
              title="Anterior"
              className={`flex h-10 w-12 items-center justify-center rounded-lg border transition-opacity disabled:opacity-35 ${T.navBtn}`}
            >
              <ArrowLeft className="h-4.5 w-4.5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={state.current === QUESTIONS.length - 1}
              aria-label="Próxima questão"
              title="Próxima"
              className={`flex h-10 w-12 items-center justify-center rounded-lg border transition-opacity disabled:opacity-35 ${T.navBtn}`}
            >
              <ArrowRight className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </nav>
    </div>
  )
}

function OriginBadge({
  T,
  children,
}: {
  T: { badge: string }
  children: React.ReactNode
}) {
  return (
    <span className={`rounded-md border px-2.5 py-1 text-[11px] font-semibold ${T.badge}`}>{children}</span>
  )
}

function RiscarButton({
  T,
  active,
  onClick,
}: {
  T: { riscar: string; riscarActive: string }
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={active ? 'Remover risco da alternativa' : 'Riscar alternativa'}
      title={active ? 'Remover risco' : 'Riscar alternativa (elimina visualmente)'}
      className={`flex w-12 shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg border py-1.5 transition-colors ${
        active ? T.riscarActive : T.riscar
      }`}
    >
      <Minus className="h-4 w-4" />
      <span className="text-[8px] font-extrabold uppercase tracking-wider">Riscar</span>
    </button>
  )
}

function ChevronLeftSmall() {
  return <ArrowLeft className="ml-1 h-4 w-4" />
}

function ChevronRightSmall() {
  return <ArrowRight className="mr-1 h-4 w-4" />
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
