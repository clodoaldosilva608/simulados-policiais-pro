'use client'

import { useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  BadgeCheck,
  BookOpen,
  BookX,
  CheckCircle2,
  ChevronRight,
  Crown,
  FilePlus2,
  FileText,
  GraduationCap,
  Landmark,
  LifeBuoy,
  Loader2,
  LogOut,
  Menu,
  PenTool,
  Play,
  Plus,
  RotateCcw,
  Share2,
  ShieldCheck,
  Sparkles,
  Target,
  Timer,
  Trash2,
  Upload,
  UserRound,
  CheckCheck,
  History,
  ListOrdered,
  Moon,
  Sun,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { SITE } from '@/config/site'
import { shareApp } from '@/lib/share'
import {
  OFFICIAL_PACKS,
  STATIC_PACK,
  formatDurationLabel,
  packFormatLabel,
  type DocumentSummary,
  type SimuladoPack,
} from '@/data/simulado'
import { UploadDialog } from './upload-dialog'
import { TrialCountdown } from './trial-countdown'
import {
  FONT_SIZES,
  getFontSize,
  getTheme,
  setFontSize,
  setTheme,
  type FontSize,
  type ThemeMode,
} from '@/lib/appearance'

export interface SavedInfo {
  finished: boolean
}

/** Métricas de desempenho do aluno (painel da biblioteca) */
export interface DashboardStats {
  attempts: number
  answered: number
  correct: number
  wrong: number
  pct: number
  /** Aproveitamento por disciplina (mais respondidas primeiro) */
  subjects: { name: string; correct: number; answered: number; pct: number }[]
}

type FormatFilter = 'todos' | 'certo_errado' | 'multipla_escolha'

interface LibraryScreenProps {
  docs: DocumentSummary[]
  loading: boolean
  savedInfo: Record<string, SavedInfo>
  onOpen: (docId: string) => void
  onDelete: (docId: string) => void
  onUploadCompleted: () => void
  /** Estado da licença: assinante ou teste grátis (com fim exato do teste) */
  licenseBadge: { active: boolean; trialDaysLeft: number | null; trialEndsAt?: string | null }
  /** E-mail da conta autenticada (badge do cabeçalho) */
  accountEmail?: string
  /** Primeiro nome do aluno (saudação no painel) */
  accountName?: string
  /** Métricas de acertos/erros de todos os simulados concluídos */
  stats?: DashboardStats | null
  /** Abre a tela de acesso/gerenciar assinatura */
  onManageAccess: () => void
  /** Abre a tela Meu desempenho (aba resumo) ou Meu histórico (aba historico) */
  onOpenPerformance: (tab: 'resumo' | 'historico') => void
  /** Abre o cronômetro Pomodoro de estudo */
  onOpenPomodoro: () => void
  /** Abre o caderno de erros (questões erradas para revisar) */
  onOpenErrors: () => void
  /** Quantidade de questões no caderno de erros (badge do menu) */
  errorCount?: number
  /** Encerra a sessão nesta conta/aparelho (menu hambúrguer) */
  onSignOut: () => void
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

/** Cores por carreira policial */
const CARREIRA_STYLES: Record<string, string> = {
  PF: 'bg-slate-900 text-amber-300',
  PC: 'bg-amber-600 text-white',
  PM: 'bg-emerald-700 text-white',
  PRF: 'bg-orange-600 text-white',
  'Polícia Penal': 'bg-purple-800 text-white',
}

const CARREIRA_ICONS: Record<string, typeof ShieldCheck> = {
  PF: Landmark,
  PC: ShieldCheck,
  PM: ShieldCheck,
  PRF: ShieldCheck,
  'Polícia Penal': BadgeCheck,
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

/** Item do menu hambúrguer (ação ou link, ex. suporte por e-mail) */
function MenuItem({
  icon: Icon,
  label,
  hint,
  badge,
  onClick,
  href,
}: {
  icon: typeof UserRound
  label: string
  hint?: string
  /** Contador destacado (ex. questões no caderno de erros) */
  badge?: number
  onClick: () => void
  /** Quando definido, renderiza <a> em vez de botão */
  href?: string
}) {
  const inner = (
    <>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-slate-800">{label}</p>
        {hint && <p className="truncate text-xs text-slate-500">{hint}</p>}
      </div>
      {badge !== undefined && badge > 0 && (
        <span className="flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 px-1.5 text-[11px] font-black text-amber-300">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
      <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
    </>
  )
  const cls =
    'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-slate-100'
  return href ? (
    <a href={href} onClick={onClick} className={cls}>
      {inner}
    </a>
  ) : (
    <button type="button" onClick={onClick} className={cls}>
      {inner}
    </button>
  )
}

function OfficialPackCard({
  pack,
  saved,
  onOpen,
  index,
}: {
  pack: SimuladoPack
  saved?: SavedInfo
  onOpen: (id: string) => void
  index: number
}) {
  const Icon = CARREIRA_ICONS[pack.carreira ?? ''] ?? ShieldCheck
  const subjectsCount = pack.subjects.length
  const formatLabel = packFormatLabel(pack)
  const isCE = formatLabel === 'Certo/Errado'
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.25) }}
    >
      <Card className="flex h-full flex-col border-slate-200 transition-shadow hover:shadow-lg">
        <CardContent className="flex flex-1 flex-col gap-3 p-5">
          <div className="flex items-start gap-3">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${CARREIRA_STYLES[pack.carreira ?? ''] ?? 'bg-slate-900 text-amber-300'}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold leading-tight text-slate-900">{pack.title}</h3>
                {pack.oficial ? (
                  <Badge className="gap-1 bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                    <BadgeCheck className="h-3 w-3" /> Prova oficial
                  </Badge>
                ) : (
                  <Badge className="gap-1 bg-amber-100 text-amber-800 hover:bg-amber-100">
                    <PenTool className="h-3 w-3" /> Inédito no estilo da banca
                  </Badge>
                )}
              </div>
              <p className="mt-0.5 text-sm text-slate-500">{pack.subtitle}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              className={
                isCE
                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
                  : 'bg-slate-100 text-slate-800 hover:bg-slate-100'
              }
            >
              {isCE ? <CheckCheck className="mr-1 h-3.5 w-3.5" /> : <ListOrdered className="mr-1 h-3.5 w-3.5" />}
              {formatLabel}
            </Badge>
            <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-100">
              {pack.ano} • {pack.banca}
            </Badge>
            <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-100">
              {pack.questions.length} questões
            </Badge>
            <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-100">
              {subjectsCount} disciplinas
            </Badge>
            <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-100">
              {formatDurationLabel(pack.durationMinutes)}
            </Badge>
          </div>

          <div className="mt-auto flex gap-2 pt-1">
            {saved && !saved.finished && (
              <Button onClick={() => onOpen(pack.id)} className="flex-1 bg-emerald-600 font-bold text-white hover:bg-emerald-700">
                <Play className="mr-1.5 h-4 w-4" /> Continuar
              </Button>
            )}
            <Button
              onClick={() => onOpen(pack.id)}
              className={`${saved && !saved.finished ? '' : 'flex-1'} bg-slate-900 font-bold text-white hover:bg-slate-800`}
            >
              {saved ? 'Abrir' : (
                <>
                  <Play className="mr-1.5 h-4 w-4" /> Iniciar
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function LibraryScreen({
  docs,
  loading,
  savedInfo,
  onOpen,
  onDelete,
  onUploadCompleted,
  licenseBadge,
  accountEmail,
  accountName,
  stats,
  onManageAccess,
  onOpenPerformance,
  onOpenPomodoro,
  onOpenErrors,
  errorCount,
  onSignOut,
}: LibraryScreenProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  // Preferências de aparência: lidas no 1º render do cliente (o Sheet fechado
  // não renderiza nada no SSR, então não há risco de mismatch de hidratação)
  const [theme, setThemeState] = useState<ThemeMode>(() => getTheme())
  const [fontSize, setFontSizeState] = useState<FontSize>(() => getFontSize())
  const [resumeDocId, setResumeDocId] = useState<string | null>(null)
  const [initialFile, setInitialFile] = useState<File | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DocumentSummary | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [formatFilter, setFormatFilter] = useState<FormatFilter>('todos')
  const dropCount = useRef(0)

  const openNewUpload = () => {
    setResumeDocId(null)
    setInitialFile(null)
    setDialogOpen(true)
  }

  const openResume = (docId: string) => {
    setResumeDocId(docId)
    setInitialFile(null)
    setDialogOpen(true)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    dropCount.current = 0
    const f = Array.from(e.dataTransfer.files).find(
      (x) => x.type === 'application/pdf' || x.name.toLowerCase().endsWith('.pdf')
    )
    if (f) {
      setResumeDocId(null)
      setInitialFile(f)
      setDialogOpen(true)
    }
  }

  const officialPacks = useMemo(() => {
    if (formatFilter === 'todos') return OFFICIAL_PACKS
    return OFFICIAL_PACKS.filter((p) => p.questionFormat === formatFilter)
  }, [formatFilter])

  const avatarInitial = (accountName ?? '').trim().charAt(0).toUpperCase() || 'A'

  const readyDocs = docs.filter((d) => d.status === 'ready')
  const otherDocs = docs.filter((d) => d.status !== 'ready')

  const FILTERS: { id: FormatFilter; label: string }[] = [
    { id: 'todos', label: 'Todos os modelos' },
    { id: 'certo_errado', label: 'Certo/Errado (C/E)' },
    { id: 'multipla_escolha', label: 'A, B, C, D, E' },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Cabeçalho */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900 text-white shadow-lg">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-slate-950">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-bold leading-tight sm:text-base">
              <span className="sm:hidden">Simulados Pro</span>
              <span className="hidden sm:inline">Simulados Policiais Pro</span>
            </p>
            <p className="hidden text-xs leading-tight text-slate-400 sm:block">
              Provas oficiais (PF, PC, PM, PRF, Polícia Penal) + transforme qualquer PDF em simulado
            </p>
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onManageAccess}
              aria-label="Gerenciar conta e assinatura"
              title={
                accountName || accountEmail
                  ? `Conta: ${[accountName, accountEmail].filter(Boolean).join(' • ')}`
                  : 'Gerenciar conta'}
              className={`hidden shrink-0 whitespace-nowrap rounded-full px-2.5 py-1.5 text-[11px] font-bold transition-colors sm:block sm:px-3 ${
                licenseBadge.active
                  ? 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25'
                  : 'bg-amber-400/15 text-amber-300 hover:bg-amber-400/25'
              }`}
            >
              {licenseBadge.active ? (
                <>
                  <span className="sm:hidden">★</span>
                  <span className="hidden sm:inline">★ Assinante</span>
                </>
              ) : licenseBadge.trialDaysLeft !== null ? (
                <>
                  <span className="sm:hidden">{licenseBadge.trialDaysLeft}d</span>
                  <span className="hidden sm:inline">Teste grátis • {licenseBadge.trialDaysLeft}d</span>
                </>
              ) : (
                <>
                  <span className="sm:hidden">Teste</span>
                  <span className="hidden sm:inline">Teste grátis</span>
                </>
              )}
            </button>
            <Button
              onClick={openNewUpload}
              className="bg-amber-500 font-bold text-slate-950 hover:bg-amber-400"
            >
              <Plus className="mr-1.5 h-4 w-4" /> Novo
            </Button>
            {/* Menu hambúrguer — canto superior direito, todas as opções da conta */}
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Abrir menu"
                  title="Menu"
                  className="h-10 w-10 shrink-0 text-slate-200 hover:bg-slate-800 hover:text-white"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="flex w-[304px] flex-col gap-0 p-0 sm:w-[360px] [&>button]:text-slate-400 [&>button]:hover:text-white"
              >
                <SheetHeader className="gap-0 space-y-0 rounded-none border-b border-slate-800 bg-slate-900 p-5 pb-6 text-white">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-400 text-base font-bold text-slate-950">
                      {avatarInitial}
                    </div>
                    <div className="min-w-0">
                      <SheetTitle className="truncate text-base font-bold text-white">
                        Olá, {accountName || 'Aluno'}
                      </SheetTitle>
                      <SheetDescription className="truncate text-xs text-slate-400">
                        {accountEmail || 'Conta do aluno'}
                      </SheetDescription>
                    </div>
                  </div>
                  <p
                    className={`mt-3 inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                      licenseBadge.active
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : 'bg-amber-400/15 text-amber-300'
                    }`}
                  >
                    {licenseBadge.active ? (
                      <>
                        <BadgeCheck className="h-3.5 w-3.5" /> Assinatura ativa
                      </>
                    ) : licenseBadge.trialDaysLeft !== null ? (
                      <>
                        <Sparkles className="h-3.5 w-3.5" /> Teste grátis • {licenseBadge.trialDaysLeft}d restantes
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5" /> Teste grátis
                      </>
                    )}
                  </p>
                </SheetHeader>

                <nav aria-label="Opções do menu" className="flex-1 space-y-1 overflow-y-auto p-3">
                  {/* Assinar o plano (ou status de assinante) */}
                  {licenseBadge.active ? (
                    <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
                        <Crown className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-emerald-900">Assinatura ativa</p>
                        <p className="truncate text-xs text-emerald-700">Todas as provas liberadas</p>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false)
                        window.open(SITE.checkoutUrl, '_blank', 'noopener,noreferrer')
                      }}
                      className="flex w-full items-center gap-3 rounded-xl bg-amber-400 px-3.5 py-3 text-left transition-colors hover:bg-amber-300"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-amber-300">
                        <Crown className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-950">Assinar o plano</p>
                        <p className="truncate text-xs text-slate-700">
                          {SITE.price}{SITE.period} • Cakto
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-slate-700" />
                    </button>
                  )}

                  <MenuItem
                    icon={UserRound}
                    label="Minha conta"
                    hint="Status, ativação e aparelho"
                    onClick={() => {
                      setMenuOpen(false)
                      onManageAccess()
                    }}
                  />
                  <MenuItem
                    icon={Target}
                    label="Meu desempenho"
                    hint="Acertos, erros e disciplinas"
                    onClick={() => {
                      setMenuOpen(false)
                      onOpenPerformance('resumo')
                    }}
                  />
                  <MenuItem
                    icon={History}
                    label="Meu histórico"
                    hint="Provas que você já concluiu"
                    onClick={() => {
                      setMenuOpen(false)
                      onOpenPerformance('historico')
                    }}
                  />
                  <MenuItem
                    icon={FilePlus2}
                    label="Novo simulado"
                    hint="Transforme um PDF em prova"
                    onClick={() => {
                      setMenuOpen(false)
                      openNewUpload()
                    }}
                  />
                  <MenuItem
                    icon={Timer}
                    label="Pomodoro"
                    hint="Foco com intervalos e sinal sonoro"
                    onClick={() => {
                      setMenuOpen(false)
                      onOpenPomodoro()
                    }}
                  />
                  <MenuItem
                    icon={BookX}
                    label="Caderno de erros"
                    hint="Questões que você errou para revisar"
                    badge={errorCount}
                    onClick={() => {
                      setMenuOpen(false)
                      onOpenErrors()
                    }}
                  />
                  <MenuItem
                    icon={Share2}
                    label="Convidar amigos"
                    hint="Mostre o app para outros concurseiros"
                    onClick={() => {
                      setMenuOpen(false)
                      shareApp()
                    }}
                  />
                  <MenuItem
                    icon={LifeBuoy}
                    label="Suporte"
                    hint={SITE.supportEmail}
                    href={`mailto:${SITE.supportEmail}`}
                    onClick={() => setMenuOpen(false)}
                  />

                  {/* Aparência: tema e tamanho da fonte */}
                  <div className="pt-2">
                    <p className="px-1 pb-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                      Aparência
                    </p>
                    <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/60 p-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-14 shrink-0 text-xs font-semibold text-slate-600">Tema</span>
                        <div className="grid flex-1 grid-cols-2 gap-1 rounded-lg bg-slate-200/70 p-0.5">
                          {(
                            [
                              ['light', 'Claro', Sun],
                              ['dark', 'Escuro', Moon],
                            ] as [ThemeMode, string, typeof Sun][]
                          ).map(([mode, label, Icon]) => (
                            <button
                              key={mode}
                              type="button"
                              aria-pressed={theme === mode}
                              onClick={() => {
                                setTheme(mode)
                                setThemeState(mode)
                              }}
                              className={`flex h-8 items-center justify-center gap-1.5 rounded-md text-xs font-bold transition-colors ${
                                theme === mode
                                  ? 'bg-white text-slate-900 shadow-sm'
                                  : 'text-slate-500 hover:text-slate-700'
                              }`}
                            >
                              <Icon className="h-3.5 w-3.5" /> {label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-14 shrink-0 text-xs font-semibold text-slate-600">Fonte</span>
                        <div className="grid flex-1 grid-cols-3 gap-1 rounded-lg bg-slate-200/70 p-0.5">
                          {(Object.keys(FONT_SIZES) as FontSize[]).map((key) => (
                            <button
                              key={key}
                              type="button"
                              aria-pressed={fontSize === key}
                              onClick={() => {
                                setFontSize(key)
                                setFontSizeState(key)
                              }}
                              className={`flex h-8 items-center justify-center rounded-md text-xs font-bold transition-colors ${
                                fontSize === key
                                  ? 'bg-white text-slate-900 shadow-sm'
                                  : 'text-slate-500 hover:text-slate-700'
                              }`}
                            >
                              {FONT_SIZES[key].label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </nav>

                <div className="border-t border-slate-200 p-4">
                  <Button
                    onClick={() => {
                      setMenuOpen(false)
                      onSignOut()
                    }}
                    variant="outline"
                    className="h-11 w-full border-slate-300 font-bold text-slate-700 hover:bg-slate-100"
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Sair deste aparelho
                  </Button>
                  <p className="mt-2.5 text-center text-[11px] leading-relaxed text-slate-400">
                    {SITE.name} • {SITE.price}{SITE.period}
                  </p>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        {/* Cronômetro de urgência do teste grátis (fixo no topo) */}
        {!licenseBadge.active && (
          <TrialCountdown
            trialEndsAt={licenseBadge.trialEndsAt}
            trialDaysLeft={licenseBadge.trialDaysLeft}
            onSubscribe={() => window.open(SITE.checkoutUrl, '_blank', 'noopener,noreferrer')}
          />
        )}
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        {/* Painel do aluno — saudação + métricas de acertos/erros */}
        {accountName && (
          <section id="painel-desempenho" aria-label="Meu desempenho" className="mb-6 scroll-mt-20">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-900 text-base font-bold text-amber-300">
                  {avatarInitial}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-lg font-bold leading-tight text-slate-900">Olá, {accountName}</p>
                  <p className="text-xs text-slate-500">
                    Seu desempenho em todos os simulados concluídos neste aparelho
                  </p>
                </div>
              </div>
              {stats && stats.answered > 0 ? (
                <>
                  <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <StatCard icon={CheckCircle2} label="Acertos" value={String(stats.correct)} tone="emerald" />
                    <StatCard icon={XCircle} label="Erros" value={String(stats.wrong)} tone="red" />
                    <StatCard icon={Target} label="Aproveitamento" value={`${stats.pct}%`} tone="amber" />
                    <StatCard icon={BookOpen} label="Simulados concluídos" value={String(stats.attempts)} tone="slate" />
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                      <span>Taxa de acerto geral</span>
                      <span className="font-bold text-slate-900">{stats.pct}%</span>
                    </div>
                    <Progress value={stats.pct} className="mt-1.5 h-2" aria-label={`Taxa de acerto: ${stats.pct}%`} />
                  </div>
                  {stats.subjects.length > 0 && (
                    <div className="mt-5">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Desempenho por disciplina
                      </p>
                      <ul className="mt-2.5 grid gap-2.5 sm:grid-cols-2" aria-label="Aproveitamento por disciplina">
                        {stats.subjects.map((s) => (
                          <li
                            key={s.name}
                            className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5"
                          >
                            <div className="flex items-baseline justify-between gap-2">
                              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800">
                                {s.name}
                              </span>
                              <span
                                className={`shrink-0 text-sm font-bold ${
                                  s.pct >= 70 ? 'text-emerald-700' : s.pct >= 50 ? 'text-amber-700' : 'text-red-700'
                                }`}
                              >
                                {s.pct}%
                              </span>
                            </div>
                            <Progress
                              value={s.pct}
                              className="mt-1.5 h-1.5"
                              aria-label={`${s.name}: ${s.pct}% de acerto`}
                            />
                            <p className="mt-1 text-[11px] text-slate-500">
                              {s.correct} de {s.answered} {s.answered === 1 ? 'questão' : 'questões'}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-500">
                  Você ainda não concluiu nenhum simulado neste aparelho. Inicie uma prova oficial (PF, PC, PM, PRF ou
                  Polícia Penal) ou transforme um PDF em simulado — seus acertos e erros aparecerão aqui.
                </p>
              )}
              {/* Compartilhar o app com os amigos */}
              <button
                type="button"
                onClick={shareApp}
                className="mt-4 flex w-full items-center gap-3 rounded-xl border border-dashed border-amber-400/70 bg-amber-400/10 px-4 py-3 text-left transition-colors hover:bg-amber-400/20"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-400 text-slate-950">
                  <Share2 className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900">Está gostando? Compartilhe!</p>
                  <p className="truncate text-xs text-slate-500">
                    Chame seus amigos concurseiros para estudar com você
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-amber-600" />
              </button>
            </div>
          </section>
        )}

        {/* Provas oficiais — Área Policial */}
        <section>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
              Provas oficiais — Área Policial
            </h2>
            <Badge className="bg-slate-900 text-amber-300 hover:bg-slate-900">
              <BadgeCheck className="mr-1 h-3 w-3" /> Gabarito oficial
            </Badge>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Questões reais de concursos recentes da área policial, com o gabarito oficial de cada banca. Escolha o
            modelo de resposta que você prefere treinar: <b className="text-emerald-700">Certo/Errado</b> ou{' '}
            <b className="text-slate-800">A, B, C, D, E</b>.
          </p>

          {/* Filtro de modelo */}
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filtrar por modelo de questão">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFormatFilter(f.id)}
                aria-pressed={formatFilter === f.id}
                className={`rounded-full border px-4 py-2 text-xs font-bold transition-all ${
                  formatFilter === f.id
                    ? 'border-slate-900 bg-slate-900 text-amber-300 shadow-md'
                    : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {officialPacks.map((pack, i) => (
              <OfficialPackCard
                key={pack.id}
                pack={pack}
                saved={savedInfo[pack.id]}
                onOpen={onOpen}
                index={i}
              />
            ))}
          </div>

          {/* Simulado inédito do app (PC-PE) */}
          <div className="mt-4">
            <Card className="border-slate-900/20 shadow-md transition-shadow hover:shadow-lg">
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-900">
                  <GraduationCap className="h-7 w-7 text-amber-300" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{STATIC_PACK.title}</h3>
                    <Badge className="bg-slate-900 text-amber-300 hover:bg-slate-900">Inédito do app</Badge>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-100">
                      A, B, C, D, E
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-sm text-slate-500">{STATIC_PACK.subtitle}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {STATIC_PACK.questions.length} questões • 11 disciplinas • {formatDurationLabel(STATIC_PACK.durationMinutes)} •
                    Banca CEBRASPE
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {savedInfo[STATIC_PACK.id] && !savedInfo[STATIC_PACK.id].finished && (
                    <Button onClick={() => onOpen(STATIC_PACK.id)} className="bg-emerald-600 font-bold text-white hover:bg-emerald-700">
                      <Play className="mr-1.5 h-4 w-4" /> Continuar
                    </Button>
                  )}
                  <Button
                    onClick={() => onOpen(STATIC_PACK.id)}
                    className="bg-slate-900 font-bold text-white hover:bg-slate-800"
                  >
                    {savedInfo[STATIC_PACK.id] ? 'Abrir' : (
                      <>
                        <Play className="mr-1.5 h-4 w-4" /> Iniciar
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Hero com upload */}
        <section className="mt-10">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <div
              role="button"
              tabIndex={0}
              aria-label="Enviar PDF para criar simulado"
              onClick={openNewUpload}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openNewUpload()}
              onDragEnter={(e) => {
                e.preventDefault()
                dropCount.current++
                setDragOver(true)
              }}
              onDragLeave={(e) => {
                e.preventDefault()
                dropCount.current--
                if (dropCount.current <= 0) setDragOver(false)
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className={`cursor-pointer rounded-2xl border-2 border-dashed bg-white px-6 py-8 text-center shadow-sm transition-all sm:py-10 ${
                dragOver ? 'border-amber-500 bg-amber-50/60 ring-4 ring-amber-400/20' : 'border-slate-300 hover:border-amber-400'
              }`}
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900">
                <Upload className="h-7 w-7 text-amber-300" />
              </div>
              <h2 className="mt-4 text-lg font-bold text-slate-900 sm:text-xl">
                Transforme qualquer PDF em simulado interativo
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-slate-500">
                Editais, apostilas, resumos, legislação, provas anteriores... a IA lê o conteúdo e cria um simulado
                inédito — escolhendo o modelo <b>Certo/Errado</b> ou <b>A, B, C, D, E</b>.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs font-medium text-slate-500">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5">
                  <FileText className="h-3.5 w-3.5 text-slate-400" /> PDFs de até 25 MB
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Questões inéditas por IA
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5">
                  <CheckCheck className="h-3.5 w-3.5 text-emerald-500" /> Certo/Errado ou A–E
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-emerald-500" /> Gabarito comentado
                </span>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Simulados enviados */}
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
            Meus simulados de PDF {readyDocs.length > 0 && <span className="text-slate-400">({docs.length})</span>}
          </h2>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {[0, 1].map((i) => (
                <Card key={i} className="border-slate-200">
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className="h-12 w-12 animate-pulse rounded-xl bg-slate-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
                      <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : docs.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center gap-2 p-10 text-center">
                <FileText className="h-8 w-8 text-slate-300" />
                <p className="text-sm font-semibold text-slate-600">Nenhum PDF enviado ainda</p>
                <p className="max-w-sm text-xs leading-relaxed text-slate-400">
                  Envie seu primeiro material de estudo usando a área acima e ele aparecerá aqui como um simulado
                  interativo.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {[...otherDocs, ...readyDocs].map((doc, i) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.2) }}
                >
                  <Card className="flex h-full flex-col border-slate-200 transition-shadow hover:shadow-md">
                    <CardContent className="flex flex-1 flex-col gap-3 p-5">
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                            doc.status === 'ready'
                              ? 'bg-amber-100 text-amber-600'
                              : doc.status === 'error'
                                ? 'bg-red-100 text-red-600'
                                : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {doc.status === 'ready' ? (
                            <FileText className="h-6 w-6" />
                          ) : doc.status === 'error' ? (
                            <AlertTriangle className="h-6 w-6" />
                          ) : (
                            <Loader2 className="h-6 w-6 animate-spin" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-base font-bold text-slate-900" title={doc.title}>
                            {doc.title}
                          </h3>
                          <p className="mt-0.5 truncate text-xs text-slate-400" title={doc.fileName}>
                            {doc.fileName} • {doc.pages} pág. • {formatBytes(doc.fileSize)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(doc)}
                          aria-label={`Excluir ${doc.title}`}
                          className="shrink-0 rounded-lg p-2 text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {doc.status === 'ready' && (
                          <>
                            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                              <CheckCircle2 className="mr-1 h-3 w-3" /> Pronto
                            </Badge>
                            <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-100">
                              {doc.questionsCount} questões
                            </Badge>
                            <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-100">
                              {doc.style === 'certo_errado' ? 'Certo/Errado' : 'Múltipla escolha'}
                            </Badge>
                          </>
                        )}
                        {doc.status === 'processing' && (
                          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            Gerando • bloco {Math.min(doc.chunksDone + 1, doc.chunksTotal)}/{doc.chunksTotal}
                          </Badge>
                        )}
                        {doc.status === 'error' && (
                          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                            <AlertTriangle className="mr-1 h-3 w-3" /> Falhou
                          </Badge>
                        )}
                        <span className="ml-auto text-[11px] text-slate-400">
                          {new Date(doc.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>

                      {doc.status === 'processing' && doc.chunksTotal > 0 && (
                        <Progress value={(doc.chunksDone / doc.chunksTotal) * 100} className="h-2" />
                      )}

                      {doc.status === 'error' && doc.error && (
                        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs leading-relaxed text-red-700">
                          {doc.error}
                        </p>
                      )}

                      <div className="mt-auto flex gap-2 pt-1">
                        {doc.status === 'ready' && (
                          <Button
                            onClick={() => onOpen(doc.id)}
                            className="flex-1 bg-slate-900 font-bold text-white hover:bg-slate-800"
                          >
                            {savedInfo[doc.id] && !savedInfo[doc.id].finished ? (
                              <>
                                <Play className="mr-1.5 h-4 w-4" /> Continuar
                              </>
                            ) : (
                              <>
                                <Play className="mr-1.5 h-4 w-4" /> Iniciar
                              </>
                            )}
                          </Button>
                        )}
                        {doc.status === 'processing' && (
                          <Button
                            onClick={() => openResume(doc.id)}
                            variant="outline"
                            className="flex-1 border-slate-300 bg-white font-semibold"
                          >
                            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Acompanhar
                          </Button>
                        )}
                        {doc.status === 'error' && (
                          <Button
                            onClick={() => openResume(doc.id)}
                            className="flex-1 bg-slate-900 font-bold text-white hover:bg-slate-800"
                          >
                            <RotateCcw className="mr-1.5 h-4 w-4" /> Tentar novamente
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="mt-auto border-t border-slate-200 bg-white py-4">
        <p className="text-center text-xs text-slate-400">
          Simulados Policiais Pro • provas oficiais com gabarito + qualquer PDF transformado em simulado por IA.
          Sempre confira o gabarito com a fonte oficial.
        </p>
        <p className="mt-1 flex items-center justify-center gap-1 text-center text-[11px] text-slate-300">
          <ShieldCheck className="h-3 w-3" /> Seus PDFs e progressos ficam salvos apenas neste aparelho.
        </p>
      </footer>

      {/* Dialog de upload/processamento */}
      <UploadDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        resumeDocId={resumeDocId}
        initialFile={initialFile}
        onCompleted={onUploadCompleted}
      />

      {/* Confirmação de exclusão */}
      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir simulado?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deleteTarget?.title}” e todas as suas questões serão removidos definitivamente. Seu progresso salvo
              no navegador também deixará de ser usado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) onDelete(deleteTarget.id)
                setDeleteTarget(null)
              }}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
