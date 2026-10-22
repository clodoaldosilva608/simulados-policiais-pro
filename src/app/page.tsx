'use client'

import { useCallback, useEffect, useState } from 'react'
import { Loader2, ShieldCheck } from 'lucide-react'
import { WelcomeScreen } from '@/components/simulado/welcome-screen'
import { ExamScreen } from '@/components/simulado/exam-screen'
import { ResultsScreen } from '@/components/simulado/results-screen'
import { ReviewScreen } from '@/components/simulado/review-screen'
import {
  QUESTIONS,
  TOTAL_QUESTIONS,
  type ExamMode,
  type ExamState,
  type OptionKey,
} from '@/data/simulado'

type Phase = 'welcome' | 'exam' | 'results' | 'review'

const STORAGE_KEY = 'simulado-pcpe-agente-v1'

function freshState(name: string, mode: ExamMode): ExamState {
  return {
    name,
    mode,
    startedAt: Date.now(),
    finished: false,
    finishedAt: null,
    current: 0,
    answers: {},
    marked: [],
  }
}

function loadSaved(): ExamState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<ExamState>
    if (!parsed || typeof parsed.startedAt !== 'number' || (parsed.mode !== 'prova' && parsed.mode !== 'estudo')) {
      return null
    }
    return {
      name: parsed.name ?? '',
      mode: parsed.mode,
      startedAt: parsed.startedAt,
      finished: Boolean(parsed.finished),
      finishedAt: parsed.finishedAt ?? null,
      current: Math.min(Math.max(parsed.current ?? 0, 0), QUESTIONS.length - 1),
      answers: parsed.answers ?? {},
      marked: Array.isArray(parsed.marked) ? parsed.marked : [],
    }
  } catch {
    return null
  }
}

export default function Home() {
  const [hydrated, setHydrated] = useState(false)
  const [phase, setPhase] = useState<Phase>('welcome')
  const [state, setState] = useState<ExamState | null>(null)
  const [savedMeta, setSavedMeta] = useState<{ finished: boolean; mode: ExamMode; name: string } | null>(null)

  // Carrega estado salvo do navegador (apenas no cliente)
  useEffect(() => {
    const saved = loadSaved()
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hidratação a partir de armazenamento externo (localStorage)
    setSavedMeta(saved ? { finished: Boolean(saved.finished), mode: saved.mode, name: saved.name } : null)
    setHydrated(true)
  }, [])

  // Persistência automática
  useEffect(() => {
    if (state) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      } catch {
        /* armazenamento indisponível — segue sem persistência */
      }
    }
  }, [state])

  const handleStart = (name: string, mode: ExamMode) => {
    setState(freshState(name, mode))
    setPhase('exam')
  }

  const handleContinue = () => {
    const saved = loadSaved()
    if (saved) {
      setState(saved)
      setPhase(saved.finished ? 'results' : 'exam')
    }
  }

  const handleViewResults = () => {
    const saved = loadSaved()
    if (saved) {
      setState(saved)
      setPhase('results')
    }
  }

  const handleDiscard = () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* noop */
    }
    setSavedMeta(null)
    setState(null)
    setPhase('welcome')
  }

  const handleAnswer = useCallback((qid: number, key: OptionKey) => {
    setState((s) => (s ? { ...s, answers: { ...s.answers, [qid]: key } } : s))
  }, [])

  const handleToggleMark = useCallback((qid: number) => {
    setState((s) =>
      s ? { ...s, marked: s.marked.includes(qid) ? s.marked.filter((m) => m !== qid) : [...s.marked, qid] } : s,
    )
  }, [])

  const handleNavigate = useCallback((index: number) => {
    setState((s) => (s ? { ...s, current: Math.min(Math.max(index, 0), TOTAL_QUESTIONS - 1) } : s))
  }, [])

  const handleFinish = useCallback(() => {
    setState((s) => (s && !s.finished ? { ...s, finished: true, finishedAt: Date.now() } : s))
    setPhase('results')
    setSavedMeta((m) => ({ finished: true, mode: m?.mode ?? 'prova', name: m?.name ?? '' }))
  }, [])

  const handleRedo = () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* noop */
    }
    setState(null)
    setSavedMeta(null)
    setPhase('welcome')
  }

  if (!hydrated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 text-slate-400">
        <ShieldCheck className="h-10 w-10 animate-pulse text-amber-500" />
        <p className="text-sm">Carregando simulado...</p>
      </div>
    )
  }

  if (phase === 'exam' && state && !state.finished) {
    return (
      <ExamScreen
        state={state}
        onAnswer={handleAnswer}
        onToggleMark={handleToggleMark}
        onNavigate={handleNavigate}
        onFinish={handleFinish}
      />
    )
  }

  if (phase === 'results' && state?.finished) {
    return (
      <ResultsScreen
        state={state}
        onReview={() => setPhase('review')}
        onRedo={handleRedo}
        onBackToStart={() => setPhase('welcome')}
      />
    )
  }

  if (phase === 'review' && state?.finished) {
    return <ReviewScreen answers={state.answers} marked={state.marked} onBack={() => setPhase('results')} />
  }

  return (
    <WelcomeScreen
      defaultName={savedMeta?.name ?? ''}
      defaultMode={savedMeta?.mode ?? 'prova'}
      hasSaved={Boolean(savedMeta)}
      savedFinished={Boolean(savedMeta?.finished)}
      onStart={handleStart}
      onContinue={handleContinue}
      onViewResults={handleViewResults}
      onDiscard={handleDiscard}
    />
  )
}
