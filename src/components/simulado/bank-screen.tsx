'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  BookOpenCheck,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  Filter,
  Layers,
  Loader2,
  Play,
  Search,
  Sparkles,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { HtmlContent } from './html-content'
import {
  fetchBankList,
  fetchMaterials,
  fetchSampleQuestions,
  bankToPack,
  type BankFacets,
  type BankFilters,
  type BankPreviewDto,
  type MaterialDto,
} from '@/lib/bank'
import type { SimuladoPack } from '@/data/simulado'
import { useUsage } from '@/lib/plan'
import type { PlanInfo } from '@/lib/plan'

interface BankScreenProps {
  onBack: () => void
  plan: PlanInfo
  /** Abre o pop-up de assinatura */
  onUpgrade: (reason: 'questions' | 'comments' | 'simulados') => void
  /** Entrega o pack de prática montado ao fluxo de exame existente */
  onPractice: (pack: SimuladoPack) => void
}

type Tab = 'questoes' | 'materiais'

const PAGE_SIZE = 15

export function BankScreen({ onBack, plan, onUpgrade, onPractice }: BankScreenProps) {
  const [tab, setTab] = useState<Tab>('questoes')
  const usage = useUsage()

  /* ---------------- filtros ---------------- */
  const [filters, setFilters] = useState<BankFilters>({})
  const [facets, setFacets] = useState<BankFacets | null>(null)
  const [searchDraft, setSearchDraft] = useState('')

  /* ---------------- listagem ---------------- */
  const [items, setItems] = useState<BankPreviewDto[] | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)

  /* ---------------- prática ---------------- */
  const [starting, setStarting] = useState(false)
  const [practiceError, setPracticeError] = useState('')

  /* ---------------- materiais ---------------- */
  const [materials, setMaterials] = useState<MaterialDto[] | null>(null)

  const loadList = useCallback(
    async (opts: { facets?: boolean } = {}) => {
      setLoading(true)
      try {
        const res = await fetchBankList(filters, {
          limit: PAGE_SIZE,
          offset: page * PAGE_SIZE,
          facets: opts.facets ?? facets === null,
        })
        setItems(res.questions)
        setTotal(res.total)
        if (res.facets) setFacets(res.facets)
      } catch {
        setItems([])
        setTotal(0)
      } finally {
        setLoading(false)
      }
    },
    [filters, page, facets],
  )

  useEffect(() => {
    void loadList({ facets: true })
     
  }, [filters, page])

  useEffect(() => {
    if (tab === 'materiais' && materials === null) {
      void fetchMaterials().then(setMaterials)
    }
  }, [tab, materials])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const planFree = plan.plan === 'free'

  const setFilter = (key: keyof BankFilters, value: string) => {
    setPage(0)
    if (!value || value === 'todos') {
      setFilters((f) => {
        const next = { ...f }
        delete next[key as string]
        return next
      })
    } else if (key === 'ano') {
      setFilters((f) => ({ ...f, ano: Number(value) }))
    } else {
      setFilters((f) => ({ ...f, [key]: value }))
    }
  }

  const filterCount = Object.values(filters).filter((v) => v !== undefined && v !== '').length + (filters.q ? 1 : 0)

  /* ---------------- iniciar prática ---------------- */
  const startPractice = async (n: number) => {
    setStarting(true)
    setPracticeError('')
    try {
      const { total: available, questions } = await fetchSampleQuestions(filters, n)
      if (questions.length === 0) {
        setPracticeError('Nenhuma questão encontrada com esses filtros. Ajuste os filtros e tente novamente.')
        return
      }
      if (planFree && usage.questionsLeft === 0) {
        onUpgrade('questions')
        return
      }
      onPractice(bankToPack(questions, filters))
      void available
    } catch {
      setPracticeError('Falha ao carregar as questões. Verifique sua conexão e tente novamente.')
    } finally {
      setStarting(false)
    }
  }

  const applySearch = () => {
    setPage(0)
    setFilters((f) => {
      const next = { ...f }
      if (searchDraft.trim()) next.q = searchDraft.trim()
      else delete next.q
      return next
    })
  }

  const clearFilters = () => {
    setFilters({})
    setSearchDraft('')
    setPage(0)
  }

  const activeFilterLabel = useMemo(() => {
    const parts: string[] = []
    if (filters.materia) parts.push(filters.materia)
    if (filters.banca) parts.push(filters.banca)
    if (filters.concurso) parts.push(filters.concurso)
    if (filters.nivel) parts.push(filters.nivel)
    if (filters.ano) parts.push(String(filters.ano))
    return parts.join(' • ')
  }, [filters])

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900 text-white shadow-lg">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3.5">
          <Button
            onClick={onBack}
            variant="ghost"
            size="icon"
            aria-label="Voltar para a biblioteca"
            className="h-9 w-9 shrink-0 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-bold leading-tight">Banco de Questões</p>
            <p className="truncate text-xs text-slate-400">
              {total > 0
                ? `${total} ${total === 1 ? 'questão disponível' : 'questões disponíveis'}${activeFilterLabel ? ` — ${activeFilterLabel}` : ''}`
                : 'Filtre por banca, matéria, concurso, nível e ano'}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1 rounded-xl bg-slate-800 p-1">
            <button
              type="button"
              onClick={() => setTab('questoes')}
              aria-pressed={tab === 'questoes'}
              className={`flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-bold transition-colors ${
                tab === 'questoes' ? 'bg-amber-400 text-slate-950' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Layers className="h-4 w-4" /> Questões
            </button>
            <button
              type="button"
              onClick={() => setTab('materiais')}
              aria-pressed={tab === 'materiais'}
              className={`flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-bold transition-colors ${
                tab === 'materiais' ? 'bg-amber-400 text-slate-950' : 'text-slate-300 hover:text-white'
              }`}
            >
              <BookOpenCheck className="h-4 w-4" /> Materiais
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-5">
        {tab === 'questoes' ? (
          <>
            {/* -------- Painel de prática rápida -------- */}
            <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-white">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-600" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-800">Prática com filtros</p>
                    <p className="text-xs text-slate-500">
                      Sorteamos questões inéditas conforme os filtros abaixo — como nos grandes bancos de questões.
                    </p>
                  </div>
                  {planFree && (
                    <Badge className="shrink-0 bg-slate-900 text-white hover:bg-slate-900">
                      {usage.questionsLeft > 0 ? `hoje: ${usage.questionsLeft}` : 'cota zerada'}
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {[10, 20, 30].map((n) => (
                    <Button
                      key={n}
                      onClick={() => void startPractice(n)}
                      disabled={starting || total === 0}
                      className="h-10 flex-1 bg-emerald-600 font-bold text-white hover:bg-emerald-700"
                    >
                      {starting ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Play className="mr-1.5 h-4 w-4" />}
                      {n} questões
                    </Button>
                  ))}
                </div>
                {practiceError && (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                    {practiceError}
                  </p>
                )}
                {planFree && usage.questionsLeft === 0 && (
                  <button
                    type="button"
                    onClick={() => onUpgrade('questions')}
                    className="w-full rounded-lg border border-amber-300 bg-amber-100 px-3 py-2 text-left text-xs font-semibold text-amber-800"
                  >
                    Você usou sua cota de hoje. <span className="underline">Assine para responder sem limite</span> →
                  </button>
                )}
              </CardContent>
            </Card>

            {/* -------- Filtros -------- */}
            <div className="mt-4 space-y-2.5 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2 text-slate-800">
                <Filter className="h-4 w-4 text-slate-400" />
                <p className="text-sm font-bold">Filtros</p>
                {filterCount > 0 && (
                  <button type="button" onClick={clearFilters} className="ml-auto text-xs font-semibold text-amber-600 hover:underline">
                    Limpar ({filterCount})
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  value={searchDraft}
                  onChange={(e) => setSearchDraft(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && applySearch()}
                  placeholder="Buscar no enunciado (ex.: habeas corpus)"
                  className="h-10 border-slate-300 bg-white text-sm"
                />
                <Button onClick={applySearch} variant="outline" className="h-10 shrink-0 border-slate-300" aria-label="Buscar">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <FilterSelect
                  placeholder="Banca"
                  value={filters.banca ?? 'todos'}
                  options={(facets?.bancas ?? []).map((b) => ({ value: b, label: b }))}
                  onChange={(v) => setFilter('banca', v)}
                />
                <FilterSelect
                  placeholder="Matéria"
                  value={filters.materia ?? 'todos'}
                  options={(facets?.materias ?? []).map((m) => ({ value: m, label: m }))}
                  onChange={(v) => setFilter('materia', v)}
                />
                <FilterSelect
                  placeholder="Nível"
                  value={filters.nivel ?? 'todos'}
                  options={(facets?.niveis ?? []).map((n) => ({ value: n, label: n }))}
                  onChange={(v) => setFilter('nivel', v)}
                />
                <FilterSelect
                  placeholder="Ano"
                  value={filters.ano ? String(filters.ano) : 'todos'}
                  options={(facets?.anos ?? []).map((a) => ({ value: String(a), label: String(a) }))}
                  onChange={(v) => setFilter('ano', v)}
                />
                <div className="col-span-2">
                  <FilterSelect
                    placeholder="Concurso"
                    value={filters.concurso ?? 'todos'}
                    options={(facets?.concursos ?? []).map((c) => ({ value: c, label: c }))}
                    onChange={(v) => setFilter('concurso', v)}
                  />
                </div>
              </div>
            </div>

            {/* -------- Lista de questões -------- */}
            {loading && items === null ? (
              <div className="flex items-center justify-center gap-3 py-14 text-slate-400">
                <Loader2 className="h-6 w-6 animate-spin" />
                <p className="text-sm">Carregando questões...</p>
              </div>
            ) : (items ?? []).length === 0 ? (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 text-center">
                <FileText className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-3 text-sm font-bold text-slate-800">Nenhuma questão com esses filtros</p>
                <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
                  O banco está crescendo — novas questões são adicionadas continuamente pela equipe. Ajuste os filtros
                  ou volte a praticar em outra combinação.
                </p>
              </div>
            ) : (
              <>
                <div className="mt-4 space-y-2.5">
                  {(items ?? []).map((q, i) => (
                    <div key={q.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-black text-slate-300">#{page * PAGE_SIZE + i + 1}</span>
                        <Badge variant="outline" className="border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-600">
                          {q.banca}
                        </Badge>
                        <Badge variant="outline" className="border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-600">
                          {q.materia}
                        </Badge>
                        {q.assunto && (
                          <span className="max-w-[45%] truncate text-[10px] text-slate-400">{q.assunto}</span>
                        )}
                        <span className="ml-auto text-[10px] font-semibold text-slate-400">
                          {q.ano} · {q.nivel}
                        </span>
                      </div>
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-700">
                        <HtmlContent html={q.statement.replace(/<[^>]+>/g, '')} />
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-400">
                        <span>{q.tipo === 'certo_errado' ? 'Certo/Errado' : `${q.optionsCount} alternativas`}</span>
                        {q.hasComment && <span className="text-amber-600">• com comentário</span>}
                      </div>
                    </div>
                  ))}
                </div>
                {/* paginação */}
                <div className="mt-4 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    className="border-slate-300"
                  >
                    <ChevronLeft className="h-4 w-4" /> Anterior
                  </Button>
                  <span className="text-xs font-semibold text-slate-500">
                    Página {page + 1} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page + 1 >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="border-slate-300"
                  >
                    Próxima <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </>
        ) : (
          /* ================== MATERIAIS ================== */
          materials === null ? (
            <div className="flex items-center justify-center gap-3 py-14 text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p className="text-sm">Carregando materiais...</p>
            </div>
          ) : materials.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
              <BookOpenCheck className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm font-bold text-slate-800">Nenhum material publicado ainda</p>
              <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
                Apostilas e PDFs de estudo selecionados pela equipe aparecerão aqui para você estudar e baixar.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {materials.map((m) => (
                <div key={m.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold leading-snug text-slate-800">{m.title}</p>
                      {m.description && <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{m.description}</p>}
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        {m.materia && (
                          <Badge variant="outline" className="border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-600">
                            {m.materia}
                          </Badge>
                        )}
                        {m.concurso && <span className="text-[10px] text-slate-400">{m.concurso}</span>}
                        {m.fileSize && (
                          <span className="text-[10px] text-slate-400">{(m.fileSize / 1024 / 1024).toFixed(1)} MB</span>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col gap-1.5">
                      <Button
                        size="sm"
                        onClick={() => window.open(m.url, '_blank', 'noopener,noreferrer')}
                        className="h-8 bg-emerald-600 font-bold text-white hover:bg-emerald-700"
                      >
                        <ExternalLink className="mr-1 h-3.5 w-3.5" /> Abrir
                      </Button>
                      <a
                        href={m.url}
                        download={m.fileName ?? m.title}
                        className="flex h-8 items-center justify-center gap-1 rounded-lg border border-slate-300 px-3 text-xs font-bold text-slate-600 hover:bg-slate-50"
                      >
                        <Download className="h-3.5 w-3.5" /> Baixar
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </main>
    </div>
  )
}

function FilterSelect({
  placeholder,
  value,
  options,
  onChange,
}: {
  placeholder: string
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-10 border-slate-300 bg-white text-sm" aria-label={placeholder}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="todos">{`${placeholder}: todos`}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
