'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Download,
  FileUp,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  XCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

/* ------------------------------------------------------------------ */
/* Tipos                                                                */
/* ------------------------------------------------------------------ */

export interface AdminQuestion {
  id: string
  banca: string
  concurso: string
  nivel: string
  materia: string
  assunto?: string
  ano: number
  tipo: 'multipla' | 'certo_errado'
  statement: string
  options: string[]
  answer: number
  comment?: string
  active: boolean
  createdAt: number
  updatedAt: number
}

interface QuestionDraft {
  id?: string
  banca: string
  concurso: string
  nivel: string
  materia: string
  assunto: string
  ano: string
  tipo: 'multipla' | 'certo_errado'
  statement: string
  options: string[]
  answer: string
  comment: string
  active: boolean
}

const NIVEIS = ['Superior', 'Médio', 'Técnico', 'Fundamental']

const emptyDraft = (): QuestionDraft => ({
  banca: '',
  concurso: '',
  nivel: 'Superior',
  materia: '',
  assunto: '',
  ano: String(new Date().getFullYear()),
  tipo: 'multipla',
  statement: '',
  options: ['', '', '', '', ''],
  answer: 'a',
  comment: '',
  active: true,
})

const CSV_TEMPLATE = `banca;concurso;nivel;materia;assunto;ano;tipo;statement;a;b;c;d;e;answer;comment
CEBRASPE;Polícia Federal — Agente;Superior;Direito Penal;Princípios;2024;multipla;"Segundo o princípio da legalidade penal, é correto afirmar que:";"Não há crime sem lei anterior que o defina";"A analogia pode criar crimes";"O costume complementa o tipo penal";"A autoria é sempre culposa";"A omissão é sempre punível";a;"A legalidade estrita veda analogia incriminadora (art. 1º CP)."`

/* ------------------------------------------------------------------ */
/* Painel                                                               */
/* ------------------------------------------------------------------ */

export function QuestionsPanel() {
  const { toast } = useToast()
  const [questions, setQuestions] = useState<AdminQuestion[]>([])
  const [query, setQuery] = useState('')
  const [filterMateria, setFilterMateria] = useState('todas')
  const [filterBanca, setFilterBanca] = useState('todas')
  const [draft, setDraft] = useState<QuestionDraft | null>(null)
  const [busy, setBusy] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [csvText, setCsvText] = useState('')
  const [importing, setImporting] = useState(false)

  useEffect(() => {
    void reload()
  }, [])

  const materias = useMemo(
    () => [...new Set(questions.map((q) => q.materia))].sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [questions],
  )
  const bancas = useMemo(
    () => [...new Set(questions.map((q) => q.banca))].sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [questions],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return questions.filter((x) => {
      if (filterMateria !== 'todas' && x.materia !== filterMateria) return false
      if (filterBanca !== 'todas' && x.banca !== filterBanca) return false
      if (q && !`${x.statement} ${x.materia} ${x.banca} ${x.concurso} ${x.assunto ?? ''}`.toLowerCase().includes(q))
        return false
      return true
    })
  }, [questions, query, filterMateria, filterBanca])

  const reload = async () => {
    const res = await fetch('/api/admin/questions', { cache: 'no-store' })
    if (res.ok) {
      const data = (await res.json()) as { questions?: AdminQuestion[] }
      setQuestions(data.questions ?? [])
    }
  }

  const save = async () => {
    if (!draft) return
    setBusy(true)
    try {
      const res = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save',
          question: {
            id: draft.id,
            banca: draft.banca,
            concurso: draft.concurso,
            nivel: draft.nivel,
            materia: draft.materia,
            assunto: draft.assunto,
            ano: Number(draft.ano) || new Date().getFullYear(),
            tipo: draft.tipo,
            statement: draft.statement,
            options:
              draft.tipo === 'certo_errado'
                ? ['Certo', 'Errado']
                : draft.options.map((o) => o.trim()).filter(Boolean),
            answer:
              draft.tipo === 'certo_errado'
                ? draft.answer === 'a'
                  ? 0
                  : 1
                : Math.max(0, 'abcde'.indexOf(draft.answer.toLowerCase())),
            comment: draft.comment,
            active: draft.active,
          },
        }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string }
      if (data.ok) {
        toast({ title: 'Questão salva no banco', description: 'Ela já está disponível para os alunos.' })
        setDraft(null)
        await reload()
      } else {
        toast({ title: 'Erro ao salvar', description: data.error ?? 'Verifique os campos.', variant: 'destructive' })
      }
    } finally {
      setBusy(false)
    }
  }

  const remove = async (q: AdminQuestion) => {
    if (!window.confirm(`Excluir definitivamente esta questão (${q.banca} • ${q.materia})?`)) return
    setBusy(true)
    try {
      await fetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id: q.id }),
      })
      toast({ title: 'Questão excluída' })
      await reload()
    } finally {
      setBusy(false)
    }
  }

  const toggle = async (q: AdminQuestion) => {
    setBusy(true)
    try {
      await fetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle', id: q.id }),
      })
      await reload()
    } finally {
      setBusy(false)
    }
  }

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'modelo-questoes-spp.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const runImport = async (file?: File | null) => {
    setImporting(true)
    try {
      let res: Response
      if (file) {
        const form = new FormData()
        form.append('file', file)
        res = await fetch('/api/admin/questions/import', { method: 'POST', body: form })
      } else {
        res = await fetch('/api/admin/questions/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ csv: csvText }),
        })
      }
      const data = (await res.json()) as { ok?: boolean; inserted?: number; errors?: string[]; error?: string }
      if (data.ok) {
        toast({
          title: `${data.inserted ?? 0} questões importadas`,
          description:
            data.errors && data.errors.length > 0
              ? `${data.errors.length}+ linhas rejeitadas (primeiro erro: ${data.errors[0]})`
              : 'Banco atualizado com sucesso.',
        })
        setImportOpen(false)
        setCsvText('')
        await reload()
      } else {
        toast({ title: 'Falha na importação', description: data.error ?? 'CSV inválido.', variant: 'destructive' })
      }
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="mt-4 space-y-4">
      {/* Barra de ações */}
      <Card className="border-slate-800 bg-slate-900">
        <CardHeader className="pb-2">
          <CardTitle className="flex flex-wrap items-center gap-2 text-sm text-slate-200">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400 text-slate-950">
              <FileUp className="h-4 w-4" />
            </span>
            Banco de Questões
            <Badge className="bg-slate-800 text-slate-300 hover:bg-slate-800">{questions.length} questões</Badge>
            <div className="ml-auto flex flex-wrap gap-2">
              <Button
                onClick={() => setDraft(emptyDraft())}
                size="sm"
                className="bg-emerald-600 font-bold text-white hover:bg-emerald-700"
              >
                <Plus className="mr-1.5 h-4 w-4" /> Nova questão
              </Button>
              <Button onClick={() => setImportOpen(true)} size="sm" variant="outline" className="border-slate-700 bg-slate-950 text-slate-200 hover:bg-slate-800">
                <Upload className="mr-1.5 h-4 w-4" /> Importar CSV
              </Button>
              <Button onClick={downloadTemplate} size="sm" variant="outline" className="border-slate-700 bg-slate-950 text-slate-200 hover:bg-slate-800">
                <Download className="mr-1.5 h-4 w-4" /> Modelo
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <div className="relative min-w-[220px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar enunciado, matéria, banca, assunto..."
                className="h-9 border-slate-700 bg-slate-950 pl-9 text-sm text-white"
              />
            </div>
            <Select value={filterMateria} onValueChange={setFilterMateria}>
              <SelectTrigger className="h-9 w-44 border-slate-700 bg-slate-950 text-sm text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as matérias</SelectItem>
                {materias.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterBanca} onValueChange={setFilterBanca}>
              <SelectTrigger className="h-9 w-40 border-slate-700 bg-slate-950 text-sm text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as bancas</SelectItem>
                {bancas.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-[11px] text-slate-500">
            {filtered.length} de {questions.length} questões · formato CSV com colunas: banca;concurso;nivel;materia;assunto;ano;tipo;statement;a;b;c;d;e;answer;comment
          </p>
        </CardContent>
      </Card>

      {/* Lista */}
      <Card className="border-slate-800 bg-slate-900">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">
              Nenhuma questão no banco ainda. Crie a primeira ou importe um CSV.
            </p>
          ) : (
            <div className="divide-y divide-slate-800">
              {filtered.slice(0, 100).map((q) => (
                <div key={q.id} className="flex items-start gap-3 p-3 hover:bg-slate-950/60">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="outline" className="border-amber-800 bg-amber-950 text-[10px] font-bold text-amber-300">
                        {q.banca}
                      </Badge>
                      <Badge variant="outline" className="border-slate-700 bg-slate-950 text-[10px] font-bold text-slate-300">
                        {q.materia}
                      </Badge>
                      <span className="max-w-[40%] truncate text-[10px] text-slate-500">{q.concurso}</span>
                      <span className="ml-auto text-[10px] text-slate-500">
                        {q.ano} · {q.nivel} · {q.tipo === 'certo_errado' ? 'C/E' : `${q.options.length} alt.`}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-300">{q.statement}</p>
                    <p className="mt-0.5 text-[10px] text-slate-500">
                      Gabarito: <b className="text-emerald-400">{q.options[q.answer] ?? '—'}</b>
                      {q.assunto ? ` · ${q.assunto}` : ''}
                      {q.comment ? ' · com comentário' : ''}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-slate-300 hover:bg-slate-800"
                      onClick={() =>
                        setDraft({
                          id: q.id,
                          banca: q.banca,
                          concurso: q.concurso,
                          nivel: q.nivel,
                          materia: q.materia,
                          assunto: q.assunto ?? '',
                          ano: String(q.ano),
                          tipo: q.tipo,
                          statement: q.statement,
                          options: q.tipo === 'certo_errado' ? ['', ''] : [...q.options, '', '', '', ''].slice(0, 5),
                          answer: 'abcde'[q.answer] ?? 'a',
                          comment: q.comment ?? '',
                          active: q.active,
                        })
                      }
                    >
                      <Pencil className="h-3.5 w-3.5" /> Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className={`h-7 px-2 ${q.active ? 'text-amber-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-800'}`}
                      onClick={() => void toggle(q)}
                    >
                      {q.active ? 'Ocultar' : 'Reativar'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-red-400 hover:bg-red-950 hover:text-red-300"
                      onClick={() => void remove(q)}
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Excluir
                    </Button>
                  </div>
                </div>
              ))}
              {filtered.length > 100 && (
                <p className="p-3 text-center text-[11px] text-slate-500">
                  Mostrando as primeiras 100 de {filtered.length} — use os filtros para refinar.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ---------------- Dialog: criar/editar questão ---------------- */}
      <Dialog open={draft !== null} onOpenChange={(o) => !o && setDraft(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-slate-800 bg-slate-900 text-slate-100">
          <DialogHeader>
            <DialogTitle>{draft?.id ? 'Editar questão' : 'Nova questão do banco'}</DialogTitle>
            <DialogDescription>
              Os alunos veem esta questão no Banco de Questões com filtros de banca, matéria, concurso, nível e ano.
            </DialogDescription>
          </DialogHeader>
          {draft && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-slate-300">Banca *</Label>
                  <Input
                    value={draft.banca}
                    onChange={(e) => setDraft({ ...draft, banca: e.target.value })}
                    placeholder="CEBRASPE, FCC, FGV..."
                    className="h-9 border-slate-700 bg-slate-950 text-sm text-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-300">Matéria *</Label>
                  <Input
                    value={draft.materia}
                    onChange={(e) => setDraft({ ...draft, materia: e.target.value })}
                    placeholder="Direito Penal, Português..."
                    className="h-9 border-slate-700 bg-slate-950 text-sm text-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-300">Concurso</Label>
                  <Input
                    value={draft.concurso}
                    onChange={(e) => setDraft({ ...draft, concurso: e.target.value })}
                    placeholder="Polícia Federal — Agente"
                    className="h-9 border-slate-700 bg-slate-950 text-sm text-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-300">Assunto</Label>
                  <Input
                    value={draft.assunto}
                    onChange={(e) => setDraft({ ...draft, assunto: e.target.value })}
                    placeholder="Princípios, Dos crimes contra..."
                    className="h-9 border-slate-700 bg-slate-950 text-sm text-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-300">Nível</Label>
                  <Select value={draft.nivel} onValueChange={(v) => setDraft({ ...draft, nivel: v })}>
                    <SelectTrigger className="h-9 border-slate-700 bg-slate-950 text-sm text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {NIVEIS.map((n) => (
                        <SelectItem key={n} value={n}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-300">Ano</Label>
                    <Input
                      value={draft.ano}
                      onChange={(e) => setDraft({ ...draft, ano: e.target.value.replace(/\D/g, '') })}
                      className="h-9 border-slate-700 bg-slate-950 text-sm text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-300">Tipo</Label>
                    <Select value={draft.tipo} onValueChange={(v) => setDraft({ ...draft, tipo: v as 'multipla' | 'certo_errado' })}>
                      <SelectTrigger className="h-9 border-slate-700 bg-slate-950 text-sm text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="multipla">Múltipla escolha</SelectItem>
                        <SelectItem value="certo_errado">Certo/Errado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-slate-300">Enunciado *</Label>
                <Textarea
                  value={draft.statement}
                  onChange={(e) => setDraft({ ...draft, statement: e.target.value })}
                  placeholder="Julgue o item ou enuncie a questão..."
                  className="min-h-[90px] border-slate-700 bg-slate-950 text-sm text-white"
                />
              </div>

              {draft.tipo === 'certo_errado' ? (
                <div className="space-y-1">
                  <Label className="text-xs text-slate-300">Gabarito (Certo/Errado)</Label>
                  <Select value={draft.answer} onValueChange={(v) => setDraft({ ...draft, answer: v })}>
                    <SelectTrigger className="h-9 border-slate-700 bg-slate-950 text-sm text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="a">Certo</SelectItem>
                      <SelectItem value="b">Errado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-1">
                  <Label className="text-xs text-slate-300">Alternativas (preencha as que usar) e gabarito</Label>
                  {draft.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setDraft({ ...draft, answer: 'abcde'[i] })}
                        title="Marcar como gabarito"
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                          draft.answer === 'abcde'[i] ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {'ABCDE'[i]}
                      </button>
                      <Input
                        value={opt}
                        onChange={(e) => {
                          const options = [...draft.options]
                          options[i] = e.target.value
                          setDraft({ ...draft, options })
                        }}
                        placeholder={`Texto da alternativa ${'ABCDE'[i]}`}
                        className="h-9 border-slate-700 bg-slate-950 text-sm text-white"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-1">
                <Label className="text-xs text-slate-300">Comentário do professor (exclusivo do plano pago)</Label>
                <Textarea
                  value={draft.comment}
                  onChange={(e) => setDraft({ ...draft, comment: e.target.value })}
                  placeholder="Explicação da resposta — fundamento legal, artigos, pegadinhas..."
                  className="min-h-[70px] border-slate-700 bg-slate-950 text-sm text-white"
                />
              </div>

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <input
                  type="checkbox"
                  checked={draft.active}
                  onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
                  className="h-4 w-4 accent-emerald-600"
                />
                Questão ativa (visível para os alunos)
              </label>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDraft(null)} className="text-slate-400">
              Cancelar
            </Button>
            <Button onClick={() => void save()} disabled={busy} className="bg-amber-400 font-black text-slate-950 hover:bg-amber-300">
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Salvar questão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------------- Dialog: importar CSV ---------------- */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-xl border-slate-800 bg-slate-900 text-slate-100">
          <DialogHeader>
            <DialogTitle>Importar questões em massa</DialogTitle>
            <DialogDescription>
              Envie um arquivo CSV (separador ; ou ,) ou cole o conteúdo. Colunas obrigatórias: banca, materia,
              statement, alternativas e answer (letra A–E, ou Certo/Errado).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-700 bg-slate-950 px-4 py-6 text-sm font-semibold text-slate-300 hover:border-amber-500">
              <FileUp className="h-5 w-5 text-amber-400" />
              Selecionar arquivo CSV (até 500 questões)
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) void runImport(f)
                }}
              />
            </label>
            <div className="space-y-1">
              <Label className="text-xs text-slate-300">…ou cole o CSV aqui</Label>
              <Textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="banca;concurso;nivel;materia;assunto;ano;tipo;statement;a;b;c;d;e;answer;comment"
                className="min-h-[120px] border-slate-700 bg-slate-950 font-mono text-xs text-white"
              />
            </div>
            <p className="flex items-start gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-[11px] leading-relaxed text-slate-400">
              <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
              Use aspas duplas em campos com ; ou quebras de linha. tipo = multipla ou certo_errado. Baixe o modelo
              completo no botão “Modelo”.
            </p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setImportOpen(false)} className="text-slate-400">
              Cancelar
            </Button>
            <Button
              onClick={() => void runImport()}
              disabled={importing || csvText.trim().length < 20}
              className="bg-amber-400 font-black text-slate-950 hover:bg-amber-300"
            >
              {importing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />} Importar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
