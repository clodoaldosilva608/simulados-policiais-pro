'use client'

import { useCallback, useEffect, useState } from 'react'
import { Loader2, GraduationCap, ShieldCheck } from 'lucide-react'
import { LandingPage } from '@/components/landing/landing-page'
import { AccessScreen } from '@/components/simulado/access-screen'
import { AccountScreen } from '@/components/simulado/account-screen'
import { SupportScreen } from '@/components/simulado/support-screen'
import { LibraryScreen, type SavedInfo, type DashboardStats } from '@/components/simulado/library-screen'
import { PerformanceScreen, type PerfTab } from '@/components/simulado/performance-screen'
import { PomodoroScreen } from '@/components/simulado/pomodoro-screen'
import { ErrorsScreen } from '@/components/simulado/errors-screen'
import { AiSettingsScreen } from '@/components/simulado/ai-settings-screen'
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
import { useSession } from '@/lib/session'
import { SITE } from '@/config/site'
import {
  listLocalDocuments,
  getLocalDocument,
  deleteLocalDocument,
  addLocalAttempt,
  listLocalAttempts,
  listAllLocalAttempts,
  hasAttemptWithId,
  recordWrongQuestions,
  countDueWrongQuestions,
  localDocToPack,
  type LocalAttempt,
  type WrongQuestionInput,
} from '@/lib/local-db'
import { buildRandomPack, type RandomFormat } from '@/lib/random-simulado'
import { answeredThisWeek } from '@/lib/weekly-goal'
import {
  planFromAccess,
  recordAnswered,
  recordSimuladoGenerated,
  usageSnapshot,
  type PlanInfo,
} from '@/lib/plan'
import { PlanUpsellDialog, type UpsellReason } from '@/components/simulado/promo-dialogs'

function statsFromAttempts(attempts: LocalAttempt[]): DashboardStats {
  // Dedupe defensivo: a mesma prova concluída no mesmo instante (±60s) conta
  // uma única vez — protege o painel de qualquer duplicidade histórica.
  const ordered = [...attempts].sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1))
  const kept: { docId: string; t: number }[] = []
  const unique: LocalAttempt[] = []
  for (const a of ordered) {
    const t = new Date(a.createdAt).getTime()
    if (kept.some((k) => k.docId === a.docId && Math.abs(k.t - t) < 60_000)) continue
    kept.push({ docId: a.docId, t })
    unique.push(a)
  }
  let answered = 0
  let correct = 0
  const subjects = new Map<string, { correct: number; answered: number }>()
  for (const a of unique) {
    const ans = typeof a.answered === 'number' ? a.answered : a.total
    answered += Math.min(Math.max(ans, 0), a.total)
    correct += Math.min(Math.max(a.correct, 0), a.total)
    // Agrega métricas por disciplina (tentativas antigas podem não ter bySubject)
    if (a.bySubject) {
      for (const [name, agg] of Object.entries(a.bySubject)) {
        if (!agg || typeof agg.answered !== 'number') continue
        let acc = subjects.get(name)
        if (!acc) {
          acc = { correct: 0, answered: 0 }
          subjects.set(name, acc)
        }
        acc.answered += Math.max(0, agg.answered)
        acc.correct += Math.min(Math.max(agg.correct ?? 0, 0), agg.answered)
      }
    }
  }
  const wrong = Math.max(0, answered - correct)
  const pct = answered > 0 ? Math.round((correct / answered) * 100) : 0
  // Lista por disciplina: mais respondidas primeiro; empate → menor aproveitamento
  const subjectStats = [...subjects.entries()]
    .map(([name, agg]) => ({
      name,
      correct: agg.correct,
      answered: agg.answered,
      pct: agg.answered > 0 ? Math.round((agg.correct / agg.answered) * 100) : 0,
    }))
    .sort((x, y) => y.answered - x.answered || x.pct - y.pct || x.name.localeCompare(y.name))
  return { attempts: unique.length, answered, correct, wrong, pct, subjects: subjectStats }
}

/** Nome para exibição: nome cadastrado ou deriva do e-mail */
function displayNameOf(user: { name?: string; email?: string } | null | undefined): string {
  const n = user?.name?.trim()
  if (n) return n.split(/\s+/)[0]
  const prefix = (user?.email ?? '').split('@')[0] ?? ''
  const words = prefix
    .replace(/[._\-+0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (words.length === 0) return 'Aluno'
  return words
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

type Phase = 'landing' | 'access' | 'library' | 'conta' | 'suporte' | 'desempenho' | 'pomodoro' | 'erros' | 'ia' | 'welcome' | 'exam' | 'results' | 'review'

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

/** Mapa subjectId → nome de exibição da disciplina (packs oficiais) */
function subjectNameMap(pack: SimuladoPack): Map<string, string> {
  const map = new Map<string, string>()
  for (const s of pack.subjects) map.set(s.id, s.name || s.id)
  return map
}

/**
 * Desempenho por disciplina de uma tentativa (chave = nome exibido).
 * Disciplinas de PDFs já vêm com subjectId = nome — aí o mapa é nulo.
 */
function bySubjectFrom(
  questions: { id: string; answer: OptionKey; subjectId: string }[],
  answers: Record<string, OptionKey>,
  subjectNames: Map<string, string> | null,
): Record<string, { correct: number; answered: number }> {
  const out: Record<string, { correct: number; answered: number }> = {}
  for (const q of questions) {
    const given = answers[q.id]
    if (!given) continue
    const name = subjectNames?.get(q.subjectId) ?? q.subjectId
    const agg = (out[name] ??= { correct: 0, answered: 0 })
    agg.answered += 1
    if (given === q.answer) agg.correct += 1
  }
  return out
}

/**
 * Migração: estados finalizados no localStorage (provas oficiais e PDFs)
 * que ainda não viraram tentativa no banco local ganham uma tentativa —
 * assim o painel de métricas inclui o histórico anterior à atualização.
 */
async function migrateLegacyFinishedStates(docs: { id: string; title: string }[]): Promise<void> {
  if (typeof window === 'undefined') return
  const titles = new Map<string, string>()
  for (const p of STATIC_PACKS) titles.set(p.id, p.title)
  for (const d of docs) titles.set(d.id, d.title)
  for (const docId of titles.keys()) {
    try {
      const raw = window.localStorage.getItem(storageKeyFor(docId))
      if (!raw) continue
      const parsed = JSON.parse(raw) as Partial<ExamState>
      if (!parsed?.finished || typeof parsed.finishedAt !== 'number') continue
      const attemptId = `att-mig-${docId}-${parsed.finishedAt}`
      if (await hasAttemptWithId(attemptId)) continue
      // Já existe tentativa registrada nesta conclusão? (ex.: gravação feita
      // ao finalizar o simulado) — evita contar a mesma prova duas vezes.
      const existing = await listLocalAttempts(docId)
      const alreadyRecorded = existing.some(
        (a) => Math.abs(new Date(a.createdAt).getTime() - parsed.finishedAt!) < 60_000,
      )
      if (alreadyRecorded) continue
      let questions: { id: string; answer: OptionKey; subjectId: string }[] | null = null
      let subjectNames: Map<string, string> | null = null
      const staticPack = getStaticPack(docId)
      if (staticPack) {
        questions = staticPack.questions
        subjectNames = subjectNameMap(staticPack)
      } else {
        const doc = await getLocalDocument(docId)
        if (doc) questions = doc.questions // PDFs: subjectId já é o nome
      }
      if (!questions || questions.length === 0) continue
      const answers = parsed.answers ?? {}
      const correct = questions.filter((q) => answers[q.id] === q.answer).length
      const answered = questions.filter((q) => answers[q.id]).length
      const total = questions.length
      await addLocalAttempt({
        id: attemptId,
        docId,
        name: parsed.name ?? '',
        title: titles.get(docId),
        bySubject: bySubjectFrom(questions, answers, subjectNames),
        mode: parsed.mode === 'estudo' ? 'estudo' : 'prova',
        correct,
        answered,
        total,
        pct: total > 0 ? Math.round((correct / total) * 100) : 0,
        timeUsedMs: Math.max(0, parsed.finishedAt - (parsed.startedAt ?? parsed.finishedAt)),
        createdAt: new Date(parsed.finishedAt).toISOString(),
      })
    } catch {
      /* migração é best-effort */
    }
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
  const session = useSession()
  const [hydrated, setHydrated] = useState(false)
  const [phase, setPhase] = useState<Phase>('library')
  const [accessMode, setAccessMode] = useState<'registrar' | 'entrar'>('registrar')

  // PLANO DO ALUNO: assinante/teste = premium (tudo liberado); expirado ou
  // assinatura cancelada = plano grátis (limites do FREE_PLAN na lib/plan.ts)
  const plan: PlanInfo = planFromAccess(session.access)
  const planFree = plan.plan === 'free'
  const usage = planFree ? usageSnapshot() : null

  // Pop-up de upgrade aberto a partir das telas de estudo (quota/comentários)
  const [upsell, setUpsell] = useState<UpsellReason | null>(null)
  const openUpsell = useCallback((reason: UpsellReason) => setUpsell(reason), [])

  // Biblioteca (simulados de PDF salvos localmente)
  const [docs, setDocs] = useState<DocumentSummary[]>([])
  const [docsLoading, setDocsLoading] = useState(true)
  const [savedInfo, setSavedInfo] = useState<Record<string, SavedInfo>>({})

  // Métricas do painel do aluno (acertos/erros em todos os simulados)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  // Histórico completo (tela Meu desempenho → aba Histórico)
  const [allAttempts, setAllAttempts] = useState<LocalAttempt[]>([])
  const [errorCount, setErrorCount] = useState(0)
  const [perfTab, setPerfTab] = useState<PerfTab>('resumo')

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

  const recomputeStats = useCallback(async () => {
    try {
      const all = await listAllLocalAttempts()
      // Mais recentes primeiro (histórico)
      const desc = [...all].sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))
      setAllAttempts(desc)
      setStats(statsFromAttempts(desc))
    } catch {
      /* métricas são opcionais */
    }
  }, [])

  /** Contador do caderno de erros (badge do menu = questões para revisar HOJE) */
  const refreshErrorCount = useCallback(() => {
    void countDueWrongQuestions()
      .then((count) => setErrorCount(count))
      .catch(() => setErrorCount(0))
  }, [])

  useEffect(() => {
    refreshErrorCount()
  }, [refreshErrorCount])

  // Métricas: migra estados antigos e soma todas as tentativas do aparelho
  useEffect(() => {
    let alive = true
    void (async () => {
      try {
        const list = docs.length > 0 ? docs : await listLocalDocuments()
        await migrateLegacyFinishedStates(list)
        const all = await listAllLocalAttempts()
        if (!alive) return
        const desc = [...all].sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))
        setAllAttempts(desc)
        setStats(statsFromAttempts(desc))
      } catch {
        /* métricas são opcionais */
      }
    })()
    return () => {
      alive = false
    }
  }, [docs])

  // Fase inicial: conta autenticada SEMPRE entra no app — assinante/teste com
  // acesso completo e conta com teste expirado/assinatura cancelada no PLANO
  // GRÁTIS (limitado). Sem sessão → landing; banida/revogada nem autentica
  // (o servidor devolve 401/403 e o fluxo de acesso aparece).
  // IMPORTANTE: NÃO força 'access' → 'library' — quando o aluno abre Minha
  // conta pelo menu, o heartbeat (a cada 5 min) atualiza session.access e
  // antes isso EXPULSAVA a pessoa da tela antes de ver seus dados. A volta
  // da tela de acesso é sempre manual (Voltar / Entrar).
  useEffect(() => {
    if (session.loading) return
    setHydrated(true)
    const has = session.authed && Boolean(session.access)
    if (has) {
      // só resgata quem ficou preso na landing — não mexe em acesso/desempenho
      setPhase((p) => (p === 'landing' ? 'library' : p))
    } else if (session.authed) {
      // conta autenticada sem status de acesso (caso raro): tela de conta/ativação
      setPhase((p) =>
        p === 'library' || p === 'desempenho' || p === 'welcome' || p === 'exam' || p === 'results' || p === 'review' || p === 'ia'
          ? 'access'
          : p,
      )
    } else {
      setPhase((p) => (p === 'landing' || p === 'access' ? p : 'landing'))
    }
  }, [session.loading, session.authed, session.access])

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

  /** SIMULADO ALEATÓRIO: sorteia uma prova de todas as fontes e abre */
  const handleRandomSimulado = useCallback(async (opts: { count: number; format: RandomFormat }) => {
    setPackLoading(true)
    try {
      const generated = await buildRandomPack(opts)
      if (!generated) return
      // Plano grátis: sorteio conta como 1 simulado gerado no mês
      if (planFree) recordSimuladoGenerated()
      setPack(generated)
      setAttempts([])
      setSavedMeta(null)
      setState(null)
      setPhase('welcome')
    } catch {
      /* sorteio é best-effort — segue na biblioteca */
    } finally {
      setPackLoading(false)
    }
  }, [planFree])

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
    if (!state || state.finished || !pack) return
    const finished: ExamState = { ...state, finished: true, finishedAt: Date.now() }
    setState(finished)
    // Registra a tentativa no banco LOCAL (provas oficiais e simulados de PDF)
    const total = pack.questions.length
    const correct = pack.questions.filter((q) => finished.answers[q.id] === q.answer).length
    const answered = pack.questions.filter((q) => finished.answers[q.id]).length
    const bySubject = bySubjectFrom(pack.questions, finished.answers, subjectNameMap(pack))
    void addLocalAttempt({
      id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      docId: pack.id,
      name: finished.name,
      title: pack.title,
      bySubject,
      mode: finished.mode,
      correct,
      answered,
      total,
      pct: total > 0 ? Math.round((correct / total) * 100) : 0,
      timeUsedMs: (finished.finishedAt ?? Date.now()) - finished.startedAt,
      createdAt: new Date().toISOString(),
    }).then(() => void recomputeStats())
    // CADERNO DE ERROS: toda questão respondida errada entra para revisão futura
    const subjectNames = subjectNameMap(pack)
    const missedAt = new Date().toISOString()
    const wrongEntries: WrongQuestionInput[] = pack.questions
      .filter((q) => finished.answers[q.id] && finished.answers[q.id] !== q.answer)
      .map((q) => ({
        id: `${pack.id}:${q.id}`,
        docId: pack.id,
        docTitle: pack.title,
        questionId: q.id,
        subject: subjectNames.get(q.subjectId) ?? q.subjectId,
        statement: q.statement,
        textRef: q.textRef,
        textBlock: q.textRef ? pack.textBlocks[q.textRef] : undefined,
        style: q.options.length <= 2 ? 'certo_errado' : 'multipla',
        options: q.options,
        answer: q.answer,
        comment: q.comment,
        lastMissedAt: missedAt,
      }))
    if (wrongEntries.length > 0) {
      void recordWrongQuestions(wrongEntries).then(() => void refreshErrorCount())
    }
    setSavedMeta((m) => ({ finished: true, mode: m?.mode ?? 'prova', name: m?.name ?? '' }))
    setPhase('results')
  }, [state, pack, recomputeStats, refreshErrorCount])

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
      void recomputeStats()
    },
    [loadDocs, recomputeStats]
  )

  // Heartbeat: o hook useSession já verifica /api/auth/me a cada 5 min e ao
  // voltar para o app — valida sessão, dispositivo único e status de acesso.

  // Splash enquanto carrega sessão/estado
  if (!hydrated || session.loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 text-slate-400">
        <ShieldCheck className="h-10 w-10 animate-pulse text-amber-500" />
        <p className="text-sm">Carregando simulados...</p>
      </div>
    )
  }

  const hasAccess = session.authed && Boolean(session.access)

  // Sem sessão: landing ou tela de conta (cadastro obrigatório)
  if (!hasAccess) {
    if (phase === 'access') {
      return (
        <AccessScreen
          session={session}
          initialMode={accessMode}
          onBack={() => setPhase('landing')}
          onDone={() => setPhase('library')}
        />
      )
    }
    return (
      <LandingPage
        onEnterAccess={() => {
          setAccessMode('entrar')
          setPhase('access')
        }}
        onStartTrial={() => {
          setAccessMode('registrar')
          setPhase('access')
        }}
      />
    )
  }

  if (phase === 'access') {
    // Conta autenticada gerenciando acesso/assinatura
    return (
      <AccessScreen
        session={session}
        initialMode={accessMode}
        onBack={() => setPhase('library')}
        onDone={() => setPhase('library')}
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
          active: session.access?.status === 'active',
          trialDaysLeft: session.access?.status === 'trial' ? (session.access.trialDaysLeft ?? 0) : null,
          trialEndsAt: session.access?.trialEndsAt ?? null,
        }}
        plan={plan}
        usage={usage}
        accountEmail={session.user?.email}
        accountName={displayNameOf(session.user)}
        accountPhoto={session.user?.photo}
        stats={stats}
        onManageAccess={() => setPhase('access')}
        onOpenAccount={() => setPhase('conta')}
        onOpenSupport={() => setPhase('suporte')}
        onOpenPerformance={(tab) => {
          setPerfTab(tab)
          setPhase('desempenho')
        }}
        onOpenPomodoro={() => setPhase('pomodoro')}
        onOpenErrors={() => setPhase('erros')}
        onOpenAiSettings={() => setPhase('ia')}
        errorCount={errorCount}
        onRandomSimulado={(opts) => void handleRandomSimulado(opts)}
        weekAnswered={answeredThisWeek(allAttempts)}
        onSignOut={() => void session.logout()}
      />
    )
  }

  if (phase === 'conta') {
    return (
      <AccountScreen
        session={session}
        onBack={() => setPhase('library')}
        onManageAccess={() => setPhase('access')}
        onOpenSupport={() => setPhase('suporte')}
      />
    )
  }

  if (phase === 'suporte') {
    return (
      <SupportScreen
        onBack={() => setPhase('library')}
        accountEmail={session.user?.email}
        accountName={displayNameOf(session.user)}
      />
    )
  }

  if (phase === 'desempenho') {
    return (
      <PerformanceScreen
        initialTab={perfTab}
        stats={stats}
        attempts={allAttempts}
        accountName={displayNameOf(session.user)}
        accountEmail={session.user?.email}
        licenseBadge={{
          active: session.access?.status === 'active',
          trialDaysLeft: session.access?.status === 'trial' ? (session.access.trialDaysLeft ?? 0) : null,
          trialEndsAt: session.access?.trialEndsAt ?? null,
        }}
        onBack={() => setPhase('library')}
        onSubscribe={() => window.open(SITE.checkoutUrl, '_blank', 'noopener,noreferrer')}
      />
    )
  }

  if (phase === 'pomodoro') {
    return <PomodoroScreen onBack={() => setPhase('library')} />
  }

  if (phase === 'erros') {
    return (
      <>
        <ErrorsScreen onBack={() => setPhase('library')} planFree={planFree} onUpgrade={() => openUpsell('comments')} />
        <PlanUpsellDialog open={upsell !== null} onOpenChange={(o) => !o && setUpsell(null)} reason={upsell ?? 'comments'} />
      </>
    )
  }

  if (phase === 'ia') {
    return <AiSettingsScreen onBack={() => setPhase('library')} />
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
      <>
        <ExamScreen
          pack={pack}
          state={state}
          planFree={planFree}
          questionsLeft={usage ? usage.questionsLeft : null}
          onUpgrade={() => openUpsell('questions')}
          onCommentsUpgrade={() => openUpsell('comments')}
          onAnswer={(qid, key) => {
            // Plano grátis: cada 1ª resposta de questão conta na cota diária
            if (planFree && state && !state.answers[qid]) recordAnswered()
            setState((s) => (s ? { ...s, answers: { ...s.answers, [qid]: key } } : s))
          }}
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
        <PlanUpsellDialog open={upsell !== null} onOpenChange={(o) => !o && setUpsell(null)} reason={upsell ?? 'questions'} />
      </>
    )
  }

  if (phase === 'results' && state?.finished) {
    return (
      <ResultsScreen
        pack={pack}
        state={state}
        onReview={() => setPhase('review')}
        licenseBadge={{
          active: session.access?.status === 'active',
          trialDaysLeft: session.access?.status === 'trial' ? (session.access.trialDaysLeft ?? 0) : null,
          trialEndsAt: session.access?.trialEndsAt ?? null,
        }}
        onSubscribe={() => window.open(SITE.checkoutUrl, '_blank', 'noopener,noreferrer')}
        accountName={displayNameOf(session.user)}
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
      <>
        <ReviewScreen
          pack={pack}
          answers={state.answers}
          marked={state.marked}
          planFree={planFree}
          onUpgrade={() => openUpsell('comments')}
          onBack={() => setPhase('results')}
        />
        <PlanUpsellDialog open={upsell !== null} onOpenChange={(o) => !o && setUpsell(null)} reason={upsell ?? 'comments'} />
      </>
    )
  }

  return (
    <>
      <WelcomeScreen
        pack={pack}
        defaultName={savedMeta?.name ?? ''}
        defaultMode={savedMeta?.mode ?? 'prova'}
        hasSaved={Boolean(savedMeta)}
        savedFinished={Boolean(savedMeta?.finished)}
        attempts={attempts}
        planFree={planFree}
        questionsLeft={usage ? usage.questionsLeft : null}
        simuladosLeft={usage ? usage.simuladosLeft : null}
        onUpgrade={() => openUpsell('comments')}
        onStart={handleStart}
        onContinue={handleContinue}
        onViewResults={handleViewResults}
        onDiscard={handleDiscard}
        onBack={backToLibrary}
      />
      <PlanUpsellDialog open={upsell !== null} onOpenChange={(o) => !o && setUpsell(null)} reason={upsell ?? 'comments'} />
    </>
  )
}
