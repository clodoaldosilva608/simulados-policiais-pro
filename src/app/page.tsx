'use client'

import { useCallback, useEffect, useState } from 'react'
import { Loader2, GraduationCap } from 'lucide-react'
import { LibraryScreen, type SavedInfo } from '@/components/simulado/library-screen'
import { WelcomeScreen, type AttemptInfo } from '@/components/simulado/welcome-screen'
import { ExamScreen } from '@/components/simulado/exam-screen'
import { ResultsScreen } from '@/components/simulado/results-screen'
import { ReviewScreen } from '@/components/simulado/review-screen'
import {
  STATIC_PACK,
  type DocumentSummary,
  type ExamMode,
  type ExamState,
  type OptionKey,
  type SimuladoPack,
} from '@/data/simulado'

type Phase = 'library' | 'welcome' | 'exam' | 'results' | 'review'

interface PackResponse {
  document: { id: string; title: string; subtitle?: string; style: string; status: string }
  questions: {
    id: number
    subjectId: string
    textRef?: string
    statement: string
    options: { key: OptionKey; html: string }[]
    answer: OptionKey
    comment: string
  }[]
  textBlocks: Record<string, { refId: string; title: string; paragraphs: string[]; source?: string }>
}

const storageKeyFor = (docId: string) => `simulado-${docId}`

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

function loadSaved(docId: string, maxIndex: number): ExamState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(storageKeyFor(docId))
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
      current: Math.min(Math.max(parsed.current ?? 0, 0), Math.max(0, maxIndex)),
      answers: parsed.answers ?? {},
      marked: Array.isArray(parsed.marked) ? parsed.marked : [],
    }
  } catch {
    return null
  }
}

function peekSavedMeta(docId: string): SavedInfo | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(storageKeyFor(docId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<ExamState>
    if (!parsed || typeof parsed.startedAt !== 'number') return null
    return { finished: Boolean(parsed.finished) }
  } catch {
    return null
  }
}

/** Converte a resposta da API em um SimuladoPack */
function buildPack(data: PackResponse): SimuladoPack {
  const subjectIds: string[] = []
  for (const q of data.questions) {
    if (!subjectIds.includes(q.subjectId)) subjectIds.push(q.subjectId)
  }
  const textBlocks: SimuladoPack['textBlocks'] = {}
  for (const [refId, tb] of Object.entries(data.textBlocks)) {
    textBlocks[refId] = { id: tb.refId, title: tb.title, paragraphs: tb.paragraphs, source: tb.source }
  }
  return {
    id: data.document.id,
    title: data.document.title,
    subtitle: data.document.style === 'certo_errado' ? 'Gerado do seu PDF • Estilo Certo/Errado' : 'Gerado do seu PDF • Múltipla escolha',
    footer: `Questões geradas por inteligência artificial a partir do PDF “${data.document.title}”. Sempre confira o conteúdo com a fonte oficial de estudo.`,
    durationMinutes: Math.max(20, Math.ceil(data.questions.length * 3)), // ~3 min por questão
    passPct: 70,
    subjects: subjectIds.map((sid) => ({ id: sid, name: sid, professor: '' })),
    textBlocks,
    questions: data.questions,
  }
}

export default function Home() {
  const [hydrated, setHydrated] = useState(false)
  const [phase, setPhase] = useState<Phase>('library')

  // Biblioteca
  const [docs, setDocs] = useState<DocumentSummary[]>([])
  const [docsLoading, setDocsLoading] = useState(true)
  const [savedInfo, setSavedInfo] = useState<Record<string, SavedInfo>>({})

  // Simulado ativo
  const [pack, setPack] = useState<SimuladoPack | null>(null)
  const [packLoading, setPackLoading] = useState(false)
  const [attempts, setAttempts] = useState<AttemptInfo[]>([])
  const [state, setState] = useState<ExamState | null>(null)
  const [savedMeta, setSavedMeta] = useState<{ finished: boolean; mode: ExamMode; name: string } | null>(null)

  const refreshSavedInfo = useCallback((list: DocumentSummary[]) => {
    const info: Record<string, SavedInfo> = {}
    const staticMeta = peekSavedMeta(STATIC_PACK.id)
    if (staticMeta) info[STATIC_PACK.id] = staticMeta
    for (const d of list) {
      const meta = peekSavedMeta(d.id)
      if (meta) info[d.id] = meta
    }
    setSavedInfo(info)
  }, [])

  // Auto-save do estado em andamento
  useEffect(() => {
    if (!state || !pack) return
    try {
      window.localStorage.setItem(storageKeyFor(pack.id), JSON.stringify(state))
    } catch {
      /* armazenamento indisponível */
    }
  }, [state, pack])

  const loadDocs = useCallback(async () => {
    try {
      const res = await fetch('/api/documents')
      if (res.ok) {
        const data = (await res.json()) as { documents: DocumentSummary[] }
        setDocs(data.documents)
        refreshSavedInfo(data.documents)
      }
    } catch {
      /* segue com lista vazia */
    } finally {
      setDocsLoading(false)
    }
  }, [refreshSavedInfo])

  useEffect(() => {
    void loadDocs()
    setHydrated(true)
  }, [loadDocs])

  const handleUploadCompleted = useCallback(() => {
    void loadDocs()
  }, [loadDocs])

  const openDoc = useCallback(async (docId: string) => {
    if (docId === STATIC_PACK.id) {
      setPack(STATIC_PACK)
      setAttempts([])
      const saved = loadSaved(docId, STATIC_PACK.questions.length - 1)
      setSavedMeta(saved ? { finished: saved.finished, mode: saved.mode, name: saved.name } : null)
      setPhase('welcome')
      return
    }
    setPackLoading(true)
    setPhase('welcome') // exibe carregamento na transição
    try {
      const [docRes, attRes] = await Promise.all([
        fetch(`/api/documents/${docId}`),
        fetch(`/api/documents/${docId}/attempts`).catch(() => null),
      ])
      if (!docRes.ok) throw new Error('Falha ao carregar o simulado')
      const data = (await docRes.json()) as PackResponse
      const built = buildPack(data)
      setPack(built)
      const saved = loadSaved(built.id, built.questions.length - 1)
      setSavedMeta(saved ? { finished: saved.finished, mode: saved.mode, name: saved.name } : null)
      if (attRes && attRes.ok) {
        const attData = (await attRes.json()) as { attempts: AttemptInfo[] }
        setAttempts(attData.attempts)
      } else {
        setAttempts([])
      }
    } catch {
      setPack(null)
      setPhase('library')
    } finally {
      setPackLoading(false)
    }
  }, [])

  const backToLibrary = useCallback(() => {
    setPack(null)
    setState(null)
    setSavedMeta(null)
    setPhase('library')
    void loadDocs()
  }, [loadDocs])

  const handleStart = (name: string, mode: ExamMode) => {
    if (!pack) return
    setState(freshState(name, mode))
    setSavedMeta({ finished: false, mode, name })
    setPhase('exam')
  }

  const handleContinue = () => {
    if (!pack) return
    const saved = loadSaved(pack.id, pack.questions.length - 1)
    if (saved) {
      setState(saved)
      setPhase(saved.finished ? 'results' : 'exam')
    }
  }

  const handleViewResults = () => {
    if (!pack) return
    const saved = loadSaved(pack.id, pack.questions.length - 1)
    if (saved) {
      setState(saved)
      setPhase('results')
    }
  }

  const handleDiscard = () => {
    if (!pack) return
    try {
      window.localStorage.removeItem(storageKeyFor(pack.id))
    } catch {
      /* noop */
    }
    setSavedInfo((info) => {
      const next = { ...info }
      delete next[pack.id]
      return next
    })
    setSavedMeta(null)
    setState(null)
    setPhase('welcome')
  }

  const handleFinish = useCallback(() => {
    setState((s) => {
      if (!s || s.finished) return s
      const finished = { ...s, finished: true, finishedAt: Date.now() }
      // Registra a tentativa no servidor (apenas simulados de PDF)
      if (pack && pack.id !== STATIC_PACK.id) {
        const total = pack.questions.length
        const correct = pack.questions.filter((q) => finished.answers[q.id] === q.answer).length
        void fetch(`/api/documents/${pack.id}/attempts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: finished.name,
            mode: finished.mode,
            correct,
            total,
            pct: total > 0 ? Math.round((correct / total) * 100) : 0,
            timeUsedMs: (finished.finishedAt ?? Date.now()) - finished.startedAt,
          }),
        }).catch(() => undefined)
      }
      return finished
    })
    setSavedMeta((m) => ({ finished: true, mode: m?.mode ?? 'prova', name: m?.name ?? '' }))
    setPhase('results')
  }, [pack])

  const handleDelete = useCallback(
    async (docId: string) => {
      try {
        await fetch(`/api/documents/${docId}`, { method: 'DELETE' })
      } catch {
        /* segue */
      }
      try {
        window.localStorage.removeItem(storageKeyFor(docId))
      } catch {
        /* noop */
      }
      void loadDocs()
    },
    [loadDocs]
  )

  if (!hydrated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 text-slate-400">
        <GraduationCap className="h-10 w-10 animate-pulse text-amber-500" />
        <p className="text-sm">Carregando simulados...</p>
      </div>
    )
  }

  if (phase === 'library') {
    return (
      <LibraryScreen
        docs={docs}
        loading={docsLoading}
        savedInfo={savedInfo}
        onOpen={(id) => void openDoc(id)}
        onDelete={(id) => void handleDelete(id)}
        onUploadCompleted={handleUploadCompleted}
      />
    )
  }

  // Telas que dependem do pack
  if (packLoading || !pack) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        <p className="text-sm">Carregando simulado...</p>
      </div>
    )
  }

  if (phase === 'exam' && state && !state.finished) {
    return (
      <ExamScreen
        pack={pack}
        state={state}
        onAnswer={(qid, key) => setState((s) => (s ? { ...s, answers: { ...s.answers, [qid]: key } } : s))}
        onToggleMark={(qid) =>
          setState((s) =>
            s
              ? {
                  ...s,
                  marked: s.marked.includes(qid) ? s.marked.filter((m) => m !== qid) : [...s.marked, qid],
                }
              : s
          )
        }
        onNavigate={(index) =>
          setState((s) => (s ? { ...s, current: Math.min(Math.max(index, 0), pack.questions.length - 1) } : s))
        }
        onFinish={handleFinish}
      />
    )
  }

  if (phase === 'results' && state?.finished) {
    return (
      <ResultsScreen
        pack={pack}
        state={state}
        onReview={() => setPhase('review')}
        onRedo={() => {
          try {
            window.localStorage.removeItem(storageKeyFor(pack.id))
          } catch {
            /* noop */
          }
          setSavedInfo((info) => {
            const next = { ...info }
            delete next[pack.id]
            return next
          })
          setSavedMeta(null)
          setState(null)
          setPhase('welcome')
        }}
        onBackToStart={() => setPhase('welcome')}
      />
    )
  }

  if (phase === 'review' && state?.finished) {
    return (
      <ReviewScreen
        pack={pack}
        answers={state.answers}
        marked={state.marked}
        onBack={() => setPhase('results')}
      />
    )
  }

  return (
    <WelcomeScreen
      pack={pack}
      defaultName={savedMeta?.name ?? ''}
      defaultMode={savedMeta?.mode ?? 'prova'}
      hasSaved={Boolean(savedMeta)}
      savedFinished={Boolean(savedMeta?.finished)}
      attempts={attempts}
      onStart={handleStart}
      onContinue={handleContinue}
      onViewResults={handleViewResults}
      onDiscard={handleDiscard}
      onBack={backToLibrary}
    />
  )
}
