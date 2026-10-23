'use client'

import { useEffect, useState } from 'react'
import { Loader2, Megaphone, Pencil, Plus, Trash2 } from 'lucide-react'
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

export interface AdminPopup {
  id: string
  title: string
  body: string
  ctaLabel?: string
  ctaUrl?: string
  screens: string[]
  startsAt?: number
  endsAt?: number
  frequency: 'once' | 'session' | 'daily' | 'always'
  delaySec?: number
  tone?: string
  active: boolean
  createdAt: number
  updatedAt: number
}

interface PopupDraft {
  id?: string
  title: string
  body: string
  ctaLabel: string
  ctaUrl: string
  screens: string[]
  startDate: string
  endDate: string
  frequency: 'once' | 'session' | 'daily' | 'always'
  delaySec: string
  tone: string
  active: boolean
}

const SCREENS: { id: string; label: string }[] = [
  { id: 'landing', label: 'Landing (visitantes)' },
  { id: 'library', label: 'Painel do aluno' },
  { id: 'banco', label: 'Banco de Questões' },
  { id: 'welcome', label: 'Abertura do simulado' },
  { id: 'exam', label: 'Durante o exame' },
  { id: 'results', label: 'Resultado' },
  { id: 'review', label: 'Revisão' },
  { id: 'desempenho', label: 'Desempenho' },
  { id: 'erros', label: 'Caderno de erros' },
  { id: 'pomodoro', label: 'Pomodoro' },
  { id: 'conta', label: 'Minha conta' },
  { id: 'suporte', label: 'Suporte' },
  { id: 'ia', label: 'Configurações da IA' },
]

const FREQ_LABEL: Record<string, string> = {
  once: '1x por usuário (nunca repete)',
  session: '1x por sessão do app',
  daily: '1x por dia',
  always: 'sempre que entrar na tela',
}

const TONES: { id: string; label: string }[] = [
  { id: 'amber', label: 'Âmbar (destaque padrão)' },
  { id: 'emerald', label: 'Verde (positivo)' },
  { id: 'sky', label: 'Azul (informativo)' },
]

const emptyDraft = (): PopupDraft => ({
  title: '',
  body: '',
  ctaLabel: '',
  ctaUrl: '',
  screens: ['library'],
  startDate: '',
  endDate: '',
  frequency: 'once',
  delaySec: '0',
  tone: 'amber',
  active: true,
})

const fmtDay = (ts?: number) => (ts ? new Date(ts).toISOString().slice(0, 10) : '')

/* ------------------------------------------------------------------ */
/* Painel                                                               */
/* ------------------------------------------------------------------ */

export function PopupsPanel() {
  const { toast } = useToast()
  const [popups, setPopups] = useState<AdminPopup[] | null>(null)
  const [draft, setDraft] = useState<PopupDraft | null>(null)
  const [busy, setBusy] = useState(false)

  const reload = async () => {
    const res = await fetch('/api/popups?screen=__all__', { cache: 'no-store' })
    // /api/popups filtra por tela; para o painel usamos a listagem completa:
    const resAll = await fetch('/api/admin/popups', { cache: 'no-store' }).catch(() => null)
    if (resAll && resAll.ok) {
      const data = (await resAll.json()) as { popups?: AdminPopup[] }
      setPopups(data.popups ?? [])
    } else if (res.ok) {
      // fallback: sem rota admin dedicada, mostra apenas os ativos da tela
      const data = (await res.json()) as { popups?: AdminPopup[] }
      setPopups(data.popups ?? [])
    } else {
      setPopups([])
    }
    void res
  }

  useEffect(() => {
    void reload()
  }, [])

  const save = async () => {
    if (!draft) return
    setBusy(true)
    try {
      const res = await fetch('/api/admin/popups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save',
          popup: {
            id: draft.id,
            title: draft.title,
            body: draft.body,
            ctaLabel: draft.ctaLabel,
            ctaUrl: draft.ctaUrl,
            screens: draft.screens,
            startsAt: draft.startDate ? new Date(draft.startDate + 'T00:00:00').getTime() : undefined,
            endsAt: draft.endDate ? new Date(draft.endDate + 'T23:59:59').getTime() : undefined,
            frequency: draft.frequency,
            delaySec: Number(draft.delaySec) || 0,
            tone: draft.tone,
            active: draft.active,
          },
        }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string }
      if (data.ok) {
        toast({ title: 'Pop-up salvo', description: 'Ele aparece no app conforme a configuração escolhida.' })
        setDraft(null)
        await reload()
      } else {
        toast({ title: 'Erro ao salvar', description: data.error ?? 'Verifique os campos.', variant: 'destructive' })
      }
    } finally {
      setBusy(false)
    }
  }

  const remove = async (p: AdminPopup) => {
    if (!window.confirm(`Excluir o pop-up "${p.title}"?`)) return
    setBusy(true)
    try {
      await fetch('/api/admin/popups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id: p.id }),
      })
      toast({ title: 'Pop-up excluído' })
      await reload()
    } finally {
      setBusy(false)
    }
  }

  const toggle = async (p: AdminPopup) => {
    setBusy(true)
    try {
      await fetch('/api/admin/popups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle', id: p.id }),
      })
      await reload()
    } finally {
      setBusy(false)
    }
  }

  const toggleScreen = (id: string) => {
    if (!draft) return
    setDraft({
      ...draft,
      screens: draft.screens.includes(id) ? draft.screens.filter((s) => s !== id) : [...draft.screens, id],
    })
  }

  return (
    <div className="mt-4 space-y-4">
      <Card className="border-slate-800 bg-slate-900">
        <CardHeader className="pb-2">
          <CardTitle className="flex flex-wrap items-center gap-2 text-sm text-slate-200">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400 text-slate-950">
              <Megaphone className="h-4 w-4" />
            </span>
            Pop-ups da aplicação
            <Badge className="bg-slate-800 text-slate-300 hover:bg-slate-800">{popups?.length ?? 0} pop-ups</Badge>
            <Button onClick={() => setDraft(emptyDraft())} size="sm" className="ml-auto bg-emerald-600 font-bold text-white hover:bg-emerald-700">
              <Plus className="mr-1.5 h-4 w-4" /> Novo pop-up
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-[11px] leading-relaxed text-slate-500">
            Escolha ONDE (telas), QUANDO (período) e QUANTAS VEZES (frequência por usuário) cada pop-up aparece no app.
          </p>
        </CardContent>
      </Card>

      <Card className="border-slate-800 bg-slate-900">
        <CardContent className="p-0">
          {popups === null ? (
            <p className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Carregando pop-ups...
            </p>
          ) : popups.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">Nenhum pop-up criado ainda.</p>
          ) : (
            <div className="divide-y divide-slate-800">
              {popups.map((p) => (
                <div key={p.id} className="flex items-start gap-3 p-3 hover:bg-slate-950/60">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="text-sm font-bold text-slate-200">{p.title}</p>
                      <Badge variant="outline" className="border-slate-700 bg-slate-950 text-[10px] font-bold text-slate-400">
                        {FREQ_LABEL[p.frequency] ?? p.frequency}
                      </Badge>
                      {!p.active && (
                        <Badge variant="outline" className="border-red-900 bg-red-950 text-[10px] font-bold text-red-300">
                          pausado
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-slate-400">{p.body}</p>
                    <p className="mt-1 text-[10px] text-slate-500">
                      Telas: {p.screens.join(', ')}
                      {p.startsAt || p.endsAt ? ` · ${fmtDay(p.startsAt) || '…'} → ${fmtDay(p.endsAt) || '…'}` : ' · sempre'}
                      {p.delaySec ? ` · atraso ${p.delaySec}s` : ''}
                      {p.ctaLabel ? ` · CTA "${p.ctaLabel}"` : ''}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-slate-300 hover:bg-slate-800"
                      onClick={() =>
                        setDraft({
                          id: p.id,
                          title: p.title,
                          body: p.body,
                          ctaLabel: p.ctaLabel ?? '',
                          ctaUrl: p.ctaUrl ?? '',
                          screens: p.screens,
                          startDate: fmtDay(p.startsAt),
                          endDate: fmtDay(p.endsAt),
                          frequency: p.frequency,
                          delaySec: String(p.delaySec ?? 0),
                          tone: p.tone ?? 'amber',
                          active: p.active,
                        })
                      }
                    >
                      <Pencil className="h-3.5 w-3.5" /> Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className={`h-7 px-2 ${p.active ? 'text-amber-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-800'}`}
                      onClick={() => void toggle(p)}
                    >
                      {p.active ? 'Pausar' : 'Ativar'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-red-400 hover:bg-red-950 hover:text-red-300"
                      onClick={() => void remove(p)}
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

      {/* ---------------- Dialog: criar/editar pop-up ---------------- */}
      <Dialog open={draft !== null} onOpenChange={(o) => !o && setDraft(null)}>
        <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto border-slate-800 bg-slate-900 text-slate-100">
          <DialogHeader>
            <DialogTitle>{draft?.id ? 'Editar pop-up' : 'Novo pop-up do app'}</DialogTitle>
            <DialogDescription>Defina onde, quando e quantas vezes ele aparece para os usuários.</DialogDescription>
          </DialogHeader>
          {draft && (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs text-slate-300">Título *</Label>
                <Input
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  placeholder="Novidades: Prova PF 2025 disponível!"
                  className="h-9 border-slate-700 bg-slate-950 text-sm text-white"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-300">Mensagem *</Label>
                <Textarea
                  value={draft.body}
                  onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                  placeholder="Colocamos no ar 200 questões inéditas de Direito Penal..."
                  className="min-h-[80px] border-slate-700 bg-slate-950 text-sm text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-slate-300">Botão CTA (opcional)</Label>
                  <Input
                    value={draft.ctaLabel}
                    onChange={(e) => setDraft({ ...draft, ctaLabel: e.target.value })}
                    placeholder="Ver agora"
                    className="h-9 border-slate-700 bg-slate-950 text-sm text-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-300">Link do CTA</Label>
                  <Input
                    value={draft.ctaUrl}
                    onChange={(e) => setDraft({ ...draft, ctaUrl: e.target.value })}
                    placeholder="https://..."
                    className="h-9 border-slate-700 bg-slate-950 text-sm text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-slate-300">ONDE — telas em que aparece *</Label>
                <div className="grid grid-cols-2 gap-1.5 rounded-lg border border-slate-800 bg-slate-950 p-2">
                  {SCREENS.map((s) => (
                    <label key={s.id} className="flex items-center gap-2 text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={draft.screens.includes(s.id)}
                        onChange={() => toggleScreen(s.id)}
                        className="h-3.5 w-3.5 accent-amber-400"
                      />
                      {s.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-slate-300">QUANDO — início</Label>
                  <Input
                    type="date"
                    value={draft.startDate}
                    onChange={(e) => setDraft({ ...draft, startDate: e.target.value })}
                    className="h-9 border-slate-700 bg-slate-950 text-sm text-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-300">QUANDO — fim</Label>
                  <Input
                    type="date"
                    value={draft.endDate}
                    onChange={(e) => setDraft({ ...draft, endDate: e.target.value })}
                    className="h-9 border-slate-700 bg-slate-950 text-sm text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-slate-300">QUANTAS VEZES</Label>
                  <Select value={draft.frequency} onValueChange={(v) => setDraft({ ...draft, frequency: v as PopupDraft['frequency'] })}>
                    <SelectTrigger className="h-9 border-slate-700 bg-slate-950 text-sm text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(FREQ_LABEL).map(([k, v]) => (
                        <SelectItem key={k} value={k}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-300">Atraso ao entrar na tela (s)</Label>
                  <Input
                    value={draft.delaySec}
                    onChange={(e) => setDraft({ ...draft, delaySec: e.target.value.replace(/\D/g, '') })}
                    className="h-9 border-slate-700 bg-slate-950 text-sm text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-slate-300">Cor do destaque</Label>
                <Select value={draft.tone} onValueChange={(v) => setDraft({ ...draft, tone: v })}>
                  <SelectTrigger className="h-9 border-slate-700 bg-slate-950 text-sm text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TONES.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <input
                  type="checkbox"
                  checked={draft.active}
                  onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
                  className="h-4 w-4 accent-emerald-600"
                />
                Pop-up ativo
              </label>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDraft(null)} className="text-slate-400">
              Cancelar
            </Button>
            <Button onClick={() => void save()} disabled={busy} className="bg-amber-400 font-black text-slate-950 hover:bg-amber-300">
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Salvar pop-up
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
