'use client'

import { useCallback, useEffect, useState } from 'react'
import { Loader2, GraduationCap, ShieldCheck } from 'lucide-react'
import { LandingPage } from '@/components/landing/landing-page'
import { AccessScreen } from '@/components/simulado/access-screen'
import { LibraryScreen, type SavedInfo } from '@/components/simulado/library-screen'
import { WelcomeScreen, type AttemptInfo } from '@/components/simulado/welcome-screen'
import { ExamScreen } from '@/components/simulado/exam-screen'
import { ResultsScreen } from '@/components/simulado/results-screen'
import { ReviewScreen } from '@/components/simulado/review-screen'
import {
  STATIC_PACKS,
  getStaticPack,
  type DocumentSummary,
  type ExamMode,
  type ExamState,
  type OptionKey,
  type SimuladoPack,
} from '@/data/simulado'
import { useLicense, trackRegistry } from '@/lib/license'
import {
  listLocalDocuments,
  getLocalDocument,
  deleteLocalDocument,
  addLocalAttempt,
  listLocalAttempts,
  localDocToPack,
} from '@/lib/local-db'

const STATIC_IDS = new Set(STATIC_PACKS.map((p) => p.id))

type Phase = 'landing' | 'access' | 'library' | 'welcome' | 'exam' | 'results' | 'review'

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

export default function Home() {
  const license = useLicense()
  const [hydrated, setHydrated] = useState(false)
  const [phase, setPhase] = useState<Phase>('library')

  // Biblioteca (simulados de PDF salvos localmente)
  const [docs, setDocs] = useState<DocumentSummary[]>([])
  const [docsLoading, setDocsLoading] = useState(true)
  const [savedInfo, setSavedInfo] = useState<Record<string, SavedInfo>>({})

  // Simulado ativo
  const [pack, setPack] = useState<SimuladoPack | null>(null)
  const [packLoading, setPackLoading] = useState(false)
  const [attempts, setAttempts] = useState<AttemptInfo[]>([])
  const [state, setState] = useState<ExamState | null>(null)
  const [savedMeta, setSavedMeta] = useState<{ finished: boolean; mode: ExamMode; name: string } | null>(null)

  const refreshSavedInfo = useCallback((list: { id: string }[]) => {
    const info: Record<string, SavedInfo> = {}
    for (const p of STATIC_PACKS) {
      const meta = peekSavedMeta(p.id)
      if (meta) info[p.id] = meta
    }
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
      const list = await listLocalDocuments()
      setDocs(list)
      refreshSavedInfo(list)
    } catch {
      setDocs([])
    } finally {
      setDocsLoading(false)
    }
  }, [refreshSavedInfo])

  // Fase inicial: licença válida → biblioteca; sem acesso → landing
  useEffect(() => {
    if (license.status === 'loading') return
    setHydrated(true)
    if (license.allowed) {
      setPhase((p) => (p === 'landing' || p === 'access' ? 'library' : p))
    } else {
      setPack(null)
      setState(null)
      setPhase((p) => (p === 'landing' || p === 'access' ? p : 'landing'))
    }
  }, [license.status, license.allowed])

  useEffect(() => {
    void loadDocs()
  }, [loadDocs])

  const handleUploadCompleted = useCallback(() => {
    void loadDocs()
  }, [loadDocs])

  const openDoc = useCallback(async (docId: string) => {
    const staticPack = getStaticPack(docId)
    if (staticPack) {
      setPack(staticPack)
      setAttempts([])
      const saved = loadSaved(docId, staticPack.questions.length - 1)
      setSavedMeta(saved ? { finished: saved.finished, mode: saved.mode, name: saved.name } : null)
      setPhase('welcome')
      return
    }
    setPackLoading(true)
    setPhase('welcome') // exibe carregamento na transição
    try {
      const doc = await getLocalDocument(docId)
      if (!doc) throw new Error('Simulado não encontrado')
      const built = localDocToPack(doc)
      setPack(built)
      const saved = loadSaved(built.id, built.questions.length - 1)
      setSavedMeta(saved ? { finished: saved.finished, mode: saved.mode, name: saved.name } : null)
      const localAttempts = await listLocalAttempts(doc.id)
      setAttempts(localAttempts)
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
      // Registra a tentativa no banco LOCAL (apenas simulados de PDF)
      if (pack && !STATIC_IDS.has(pack.id)) {
        const total = pack.questions.length
        const correct = pack.questions.filter((q) => finished.answers[q.id] === q.answer).length
        void addLocalAttempt({
          id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          docId: pack.id,
          name: finished.name,
          mode: finished.mode,
          correct,
          total,
          pct: total > 0 ? Math.round((correct / total) * 100) : 0,
          timeUsedMs: (finished.finishedAt ?? Date.now()) - finished.startedAt,
          createdAt: new Date().toISOString(),
        })
      }
      return finished
    })
    setSavedMeta((m) => ({ finished: true, mode: m?.mode ?? 'prova', name: m?.name ?? '' }))
    setPhase('results')
  }, [pack])

  const handleDelete = useCallback(
    async (docId: string) => {
      try {
        await deleteLocalDocument(docId)
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

  // Registro central (painel admin): heartbeat do estado da licença
  useEffect(() => {
    const lic = license.license
    if (!lic) return
    const beat = () =>
      trackRegistry(
        lic.status === 'active'
          ? { status: 'active', ident: lic.code, activatedAt: lic.activatedAt }
          : { status: 'trial', trialStartedAt: lic.trialStartedAt },
      )
    beat()
    const iv = window.setInterval(beat, 5 * 60 * 1000)
    const onVisible = () => {
      if (document.visibilityState === 'visible') beat()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.clearInterval(iv)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [license.license])

  // Splash enquanto carrega licença/estado
  if (!hydrated || license.status === 'loading') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 text-slate-400">
        <ShieldCheck className="h-10 w-10 animate-pulse text-amber-500" />
        <p className="text-sm">Carregando simulados...</p>
      </div>
    )
  }

  // Sem acesso: landing ou tela de acesso
  if (!license.allowed) {
    if (phase === 'access') {
      return (
        <AccessScreen
          license={license.license}
          onBack={() => setPhase('landing')}
          onActivated={(code) => {
            license.activate(code)
            setPhase('library')
          }}
          onStartTrial={(email) => {
            license.startTrial(email)
            setPhase('library')
          }}
          onSignOut={() => {
            license.signOut()
            setPhase('landing')
          }}
        />
      )
    }
    return (
      <LandingPage
        onEnterAccess={() => setPhase('access')}
        onStartTrial={() => {
          license.startTrial()
          setPhase('library')
        }}
      />
    )
  }

  if (phase === 'access') {
    // Assinante/teste gerenciando acesso
    return (
      <AccessScreen
        license={license.license}
        onBack={() => setPhase('library')}
        onActivated={(code) => {
          license.activate(code)
          setPhase('library')
        }}
        onStartTrial={() => setPhase('library')}
        onSignOut={() => {
          license.signOut()
          setPhase('landing')
        }}
      />
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
        licenseBadge={{
          active: license.status === 'active',
          trialDaysLeft: license.daysLeft,
        }}
        onManageAccess={() => setPhase('access')}
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
