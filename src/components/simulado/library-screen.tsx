'use client'

import { useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  FileText,
  GraduationCap,
  Landmark,
  Loader2,
  PenTool,
  Play,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  CheckCheck,
  ListOrdered,
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
  OFFICIAL_PACKS,
  STATIC_PACK,
  formatDurationLabel,
  packFormatLabel,
  type DocumentSummary,
  type SimuladoPack,
} from '@/data/simulado'
import { UploadDialog } from './upload-dialog'

export interface SavedInfo {
  finished: boolean
}

type FormatFilter = 'todos' | 'certo_errado' | 'multipla_escolha'

interface LibraryScreenProps {
  docs: DocumentSummary[]
  loading: boolean
  savedInfo: Record<string, SavedInfo>
  onOpen: (docId: string) => void
  onDelete: (docId: string) => void
  onUploadCompleted: () => void
  /** Estado da licença: assinante ou teste grátis */
  licenseBadge: { active: boolean; trialDaysLeft: number | null }
  /** Abre a tela de acesso/gerenciar assinatura */
  onManageAccess: () => void
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
  onManageAccess,
}: LibraryScreenProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
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
            <p className="text-base font-bold leading-tight">Simulados Policiais Pro</p>
            <p className="hidden text-xs leading-tight text-slate-400 sm:block">
              Provas oficiais (PF, PC, PM, PRF, Polícia Penal) + transforme qualquer PDF em simulado
            </p>
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onManageAccess}
              aria-label="Gerenciar assinatura"
              className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1.5 text-[11px] font-bold transition-colors sm:px-3 ${
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
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
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
