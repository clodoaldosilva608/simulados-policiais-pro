'use client'

import { useEffect, useState } from 'react'
import { ExternalLink, FileText, Link2, Loader2, Pencil, Plus, Trash2, Upload } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

/* ------------------------------------------------------------------ */
/* Tipos                                                                */
/* ------------------------------------------------------------------ */

export interface AdminMaterial {
  id: string
  title: string
  description?: string
  kind: string
  materia?: string
  concurso?: string
  banca?: string
  ano?: number
  url: string
  fileName?: string
  fileSize?: number
  active: boolean
  createdAt: number
  updatedAt: number
}

interface MaterialDraft {
  id?: string
  title: string
  description: string
  kind: string
  materia: string
  concurso: string
  banca: string
  ano: string
  url: string
  active: boolean
}

const KINDS = ['pdf', 'apostila', 'link']

const emptyDraft = (): MaterialDraft => ({
  title: '',
  description: '',
  kind: 'pdf',
  materia: '',
  concurso: '',
  banca: '',
  ano: '',
  url: '',
  active: true,
})

/* ------------------------------------------------------------------ */
/* Painel                                                               */
/* ------------------------------------------------------------------ */

export function MaterialsPanel() {
  const { toast } = useToast()
  const [materials, setMaterials] = useState<AdminMaterial[] | null>(null)
  const [draft, setDraft] = useState<MaterialDraft | null>(null)
  const [busy, setBusy] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadMeta, setUploadMeta] = useState({ title: '', materia: '', concurso: '', description: '' })
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploading, setUploading] = useState(false)

  const reload = async () => {
    const res = await fetch('/api/admin/materials', { cache: 'no-store' })
    if (res.ok) {
      const data = (await res.json()) as { materials?: AdminMaterial[] }
      setMaterials(data.materials ?? [])
    } else {
      setMaterials([])
    }
  }

  useEffect(() => {
    void reload()
  }, [])

  const saveLink = async () => {
    if (!draft) return
    setBusy(true)
    try {
      const res = await fetch('/api/admin/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save',
          material: {
            id: draft.id,
            title: draft.title,
            description: draft.description,
            kind: draft.kind,
            materia: draft.materia,
            concurso: draft.concurso,
            banca: draft.banca,
            ano: Number(draft.ano) || undefined,
            url: draft.url,
            active: draft.active,
          },
        }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string }
      if (data.ok) {
        toast({ title: 'Material salvo', description: 'Já aparece na aba Materiais do aluno.' })
        setDraft(null)
        await reload()
      } else {
        toast({ title: 'Erro ao salvar', description: data.error ?? 'Verifique os campos.', variant: 'destructive' })
      }
    } finally {
      setBusy(false)
    }
  }

  const doUpload = async () => {
    if (!uploadFile) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', uploadFile)
      form.append('title', uploadMeta.title || uploadFile.name.replace(/\.[a-z0-9]+$/i, ''))
      form.append('materia', uploadMeta.materia)
      form.append('concurso', uploadMeta.concurso)
      form.append('description', uploadMeta.description)
      form.append('kind', 'pdf')
      const res = await fetch('/api/admin/materials', { method: 'POST', body: form })
      const data = (await res.json()) as { ok?: boolean; error?: string }
      if (data.ok) {
        toast({ title: 'Material enviado', description: 'Disponível para os alunos.' })
        setUploadOpen(false)
        setUploadFile(null)
        setUploadMeta({ title: '', materia: '', concurso: '', description: '' })
        await reload()
      } else {
        toast({ title: 'Falha no upload', description: data.error ?? 'Tente novamente.', variant: 'destructive' })
      }
    } finally {
      setUploading(false)
    }
  }

  const remove = async (m: AdminMaterial) => {
    if (!window.confirm(`Excluir o material "${m.title}"?`)) return
    setBusy(true)
    try {
      await fetch('/api/admin/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id: m.id }),
      })
      toast({ title: 'Material excluído' })
      await reload()
    } finally {
      setBusy(false)
    }
  }

  const toggle = async (m: AdminMaterial) => {
    setBusy(true)
    try {
      await fetch('/api/admin/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle', id: m.id }),
      })
      await reload()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-4 space-y-4">
      <Card className="border-slate-800 bg-slate-900">
        <CardHeader className="pb-2">
          <CardTitle className="flex flex-wrap items-center gap-2 text-sm text-slate-200">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400 text-slate-950">
              <FileText className="h-4 w-4" />
            </span>
            Materiais de estudo
            <Badge className="bg-slate-800 text-slate-300 hover:bg-slate-800">{materials?.length ?? 0} materiais</Badge>
            <div className="ml-auto flex flex-wrap gap-2">
              <Button onClick={() => setUploadOpen(true)} size="sm" className="bg-emerald-600 font-bold text-white hover:bg-emerald-700">
                <Upload className="mr-1.5 h-4 w-4" /> Enviar PDF (até 4 MB)
              </Button>
              <Button onClick={() => setDraft(emptyDraft())} size="sm" variant="outline" className="border-slate-700 bg-slate-950 text-slate-200 hover:bg-slate-800">
                <Link2 className="mr-1.5 h-4 w-4" /> Adicionar link
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-[11px] leading-relaxed text-slate-500">
            Apostilas e PDFs aparecem na aba “Materiais” do Banco de Questões do aluno. Para arquivos grandes (acima de
            4 MB), hospede no Drive/Dropbox e cadastre como link externo.
          </p>
        </CardContent>
      </Card>

      <Card className="border-slate-800 bg-slate-900">
        <CardContent className="p-0">
          {materials === null ? (
            <p className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Carregando materiais...
            </p>
          ) : materials.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">Nenhum material cadastrado ainda.</p>
          ) : (
            <div className="divide-y divide-slate-800">
              {materials.map((m) => (
                <div key={m.id} className="flex items-start gap-3 p-3 hover:bg-slate-950/60">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-950 text-red-400">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="truncate text-sm font-bold text-slate-200">{m.title}</p>
                      <Badge variant="outline" className="border-slate-700 bg-slate-950 text-[10px] font-bold text-slate-400">
                        {m.kind}
                      </Badge>
                      {!m.active && (
                        <Badge variant="outline" className="border-red-900 bg-red-950 text-[10px] font-bold text-red-300">
                          oculto
                        </Badge>
                      )}
                    </div>
                    <p className="truncate text-[11px] text-slate-500">
                      {[m.materia, m.concurso, m.banca, m.ano].filter(Boolean).join(' · ') || '—'}
                      {m.fileSize ? ` · ${(m.fileSize / 1024).toFixed(0)} KB` : ''}
                    </p>
                    <a
                      href={m.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-0.5 inline-flex items-center gap-1 truncate text-[11px] font-semibold text-sky-400 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" /> {m.url.slice(0, 70)}
                    </a>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-slate-300 hover:bg-slate-800"
                      onClick={() =>
                        setDraft({
                          id: m.id,
                          title: m.title,
                          description: m.description ?? '',
                          kind: m.kind,
                          materia: m.materia ?? '',
                          concurso: m.concurso ?? '',
                          banca: m.banca ?? '',
                          ano: m.ano ? String(m.ano) : '',
                          url: m.url,
                          active: m.active,
                        })
                      }
                    >
                      <Pencil className="h-3.5 w-3.5" /> Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className={`h-7 px-2 ${m.active ? 'text-amber-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-800'}`}
                      onClick={() => void toggle(m)}
                    >
                      {m.active ? 'Ocultar' : 'Publicar'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-red-400 hover:bg-red-950 hover:text-red-300"
                      onClick={() => void remove(m)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ---------------- Dialog: link externo ---------------- */}
      <Dialog open={draft !== null} onOpenChange={(o) => !o && setDraft(null)}>
        <DialogContent className="max-w-lg border-slate-800 bg-slate-900 text-slate-100">
          <DialogHeader>
            <DialogTitle>{draft?.id ? 'Editar material' : 'Adicionar material por link'}</DialogTitle>
            <DialogDescription>Cadastre um PDF/apostila hospedada externamente (Drive, Dropbox, CDN...).</DialogDescription>
          </DialogHeader>
          {draft && (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs text-slate-300">Título *</Label>
                <Input
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  placeholder="Apostila Direito Penal — parte geral"
                  className="h-9 border-slate-700 bg-slate-950 text-sm text-white"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-300">URL *</Label>
                <Input
                  value={draft.url}
                  onChange={(e) => setDraft({ ...draft, url: e.target.value })}
                  placeholder="https://drive.google.com/..."
                  className="h-9 border-slate-700 bg-slate-950 text-sm text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-slate-300">Matéria</Label>
                  <Input
                    value={draft.materia}
                    onChange={(e) => setDraft({ ...draft, materia: e.target.value })}
                    className="h-9 border-slate-700 bg-slate-950 text-sm text-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-300">Concurso</Label>
                  <Input
                    value={draft.concurso}
                    onChange={(e) => setDraft({ ...draft, concurso: e.target.value })}
                    className="h-9 border-slate-700 bg-slate-950 text-sm text-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-300">Banca</Label>
                  <Input
                    value={draft.banca}
                    onChange={(e) => setDraft({ ...draft, banca: e.target.value })}
                    className="h-9 border-slate-700 bg-slate-950 text-sm text-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-300">Ano</Label>
                  <Input
                    value={draft.ano}
                    onChange={(e) => setDraft({ ...draft, ano: e.target.value.replace(/\D/g, '') })}
                    className="h-9 border-slate-700 bg-slate-950 text-sm text-white"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-300">Descrição</Label>
                <Textarea
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  className="min-h-[60px] border-slate-700 bg-slate-950 text-sm text-white"
                />
              </div>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <input
                  type="checkbox"
                  checked={draft.active}
                  onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
                  className="h-4 w-4 accent-emerald-600"
                />
                Visível para os alunos
              </label>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDraft(null)} className="text-slate-400">
              Cancelar
            </Button>
            <Button onClick={() => void saveLink()} disabled={busy} className="bg-amber-400 font-black text-slate-950 hover:bg-amber-300">
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Salvar material
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------------- Dialog: upload PDF ---------------- */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-lg border-slate-800 bg-slate-900 text-slate-100">
          <DialogHeader>
            <DialogTitle>Enviar PDF/Apostila</DialogTitle>
            <DialogDescription>Arquivo hospedado no storage do app (até 4 MB por arquivo).</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-700 bg-slate-950 px-4 py-6 text-sm font-semibold text-slate-300 hover:border-amber-500">
              <Upload className="h-6 w-6 text-amber-400" />
              {uploadFile ? uploadFile.name : 'Selecionar arquivo PDF'}
              <span className="text-[11px] font-normal text-slate-500">
                {uploadFile ? `${(uploadFile.size / 1024 / 1024).toFixed(2)} MB` : 'clique para escolher'}
              </span>
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
              />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs text-slate-300">Título</Label>
                <Input
                  value={uploadMeta.title}
                  onChange={(e) => setUploadMeta({ ...uploadMeta, title: e.target.value })}
                  placeholder="opcional — usa o nome do arquivo"
                  className="h-9 border-slate-700 bg-slate-950 text-sm text-white"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-300">Matéria</Label>
                <Input
                  value={uploadMeta.materia}
                  onChange={(e) => setUploadMeta({ ...uploadMeta, materia: e.target.value })}
                  className="h-9 border-slate-700 bg-slate-950 text-sm text-white"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-300">Concurso</Label>
                <Input
                  value={uploadMeta.concurso}
                  onChange={(e) => setUploadMeta({ ...uploadMeta, concurso: e.target.value })}
                  className="h-9 border-slate-700 bg-slate-950 text-sm text-white"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-300">Descrição</Label>
                <Input
                  value={uploadMeta.description}
                  onChange={(e) => setUploadMeta({ ...uploadMeta, description: e.target.value })}
                  className="h-9 border-slate-700 bg-slate-950 text-sm text-white"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setUploadOpen(false)} className="text-slate-400">
              Cancelar
            </Button>
            <Button onClick={() => void doUpload()} disabled={uploading || !uploadFile} className="bg-amber-400 font-black text-slate-950 hover:bg-amber-300">
              {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />} Enviar material
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
