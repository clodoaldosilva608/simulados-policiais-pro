'use client'

import { useEffect, useState } from 'react'
import { Loader2, Pencil, Plus, Save, Settings2, Trash2 } from 'lucide-react'
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
import { useToast } from '@/hooks/use-toast'

/* ------------------------------------------------------------------ */
/* Tipos                                                                */
/* ------------------------------------------------------------------ */

export interface AppConfigView {
  price: string
  trialDays: number
  freeSimuladosPerMonth: number
  freeQuestionsPerDay: number
  freeComments: boolean
  checkoutUrl: string
  supportEmail: string
  updatedAt: number
}

export interface CustomPlanView {
  id: string
  name: string
  price: string
  simuladosPerMonth: number
  questionsPerDay: number
  comments: boolean
  active: boolean
  createdAt: number
  updatedAt: number
}

interface PlanDraft {
  id?: string
  name: string
  price: string
  simuladosPerMonth: string
  questionsPerDay: string
  comments: boolean
  active: boolean
}

const emptyDraft = (): PlanDraft => ({
  name: '',
  price: 'R$ 0',
  simuladosPerMonth: '5',
  questionsPerDay: '15',
  comments: false,
  active: true,
})

/* ------------------------------------------------------------------ */
/* Painel                                                               */
/* ------------------------------------------------------------------ */

export function PlansPanel({ onConfigSaved }: { onConfigSaved?: () => void }) {
  const { toast } = useToast()
  const [config, setConfig] = useState<AppConfigView | null>(null)
  const [plans, setPlans] = useState<CustomPlanView[] | null>(null)
  const [draft, setDraft] = useState<PlanDraft | null>(null)
  const [busy, setBusy] = useState(false)
  const [saving, setSaving] = useState(false)

  const reload = async () => {
    const [cfgRes, plansRes] = await Promise.all([
      fetch('/api/admin/config', { cache: 'no-store' }),
      fetch('/api/admin/plans', { cache: 'no-store' }),
    ])
    if (cfgRes.ok) {
      const data = (await cfgRes.json()) as { config?: AppConfigView }
      setConfig(data.config ?? null)
    }
    if (plansRes.ok) {
      const data = (await plansRes.json()) as { plans?: CustomPlanView[] }
      setPlans(data.plans ?? [])
    }
  }

  useEffect(() => {
    void reload()
  }, [])

  const updateCfg = (patch: Partial<AppConfigView>) => {
    setConfig((c) => (c ? { ...c, ...patch } : c))
  }

  const saveConfig = async () => {
    if (!config) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      const data = (await res.json()) as { ok?: boolean; config?: AppConfigView }
      if (data.ok && data.config) {
        setConfig(data.config)
        toast({
          title: 'Configuração salva',
          description: 'Preço, limites e textos do app atualizados em tempo real (landing + app + servidor).',
        })
        onConfigSaved?.()
      } else {
        toast({ title: 'Erro ao salvar', variant: 'destructive' })
      }
    } finally {
      setSaving(false)
    }
  }

  const savePlan = async () => {
    if (!draft) return
    setBusy(true)
    try {
      const res = await fetch('/api/admin/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save',
          plan: {
            id: draft.id,
            name: draft.name,
            price: draft.price,
            simuladosPerMonth: Number(draft.simuladosPerMonth) || 0,
            questionsPerDay: Number(draft.questionsPerDay) || 0,
            comments: draft.comments,
            active: draft.active,
          },
        }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string }
      if (data.ok) {
        toast({ title: 'Plano salvo', description: 'Atribua-o a usuários na aba Usuários → Plano.' })
        setDraft(null)
        await reload()
      } else {
        toast({ title: 'Erro ao salvar', description: data.error, variant: 'destructive' })
      }
    } finally {
      setBusy(false)
    }
  }

  const removePlan = async (p: CustomPlanView) => {
    if (!window.confirm(`Excluir o plano "${p.name}"? Usuários atribuídos voltam ao padrão.`)) return
    setBusy(true)
    try {
      await fetch('/api/admin/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id: p.id }),
      })
      toast({ title: 'Plano excluído' })
      await reload()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-4 space-y-4">
      {/* ---------------- Configuração dinâmica ---------------- */}
      <Card className="border-slate-800 bg-slate-900">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm text-slate-200">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400 text-slate-950">
              <Settings2 className="h-4 w-4" />
            </span>
            Configuração da aplicação
            <span className="ml-auto text-[10px] font-normal text-slate-500">
              {config?.updatedAt ? `atualizada em ${new Date(config.updatedAt).toLocaleString('pt-BR')}` : ''}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {config === null ? (
            <p className="flex items-center gap-2 py-6 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Carregando configuração...
            </p>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs text-slate-300">Preço da assinatura (exibição)</Label>
                  <Input
                    value={config.price}
                    onChange={(e) => updateCfg({ price: e.target.value })}
                    className="h-9 border-slate-700 bg-slate-950 text-sm text-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-300">Dias de teste grátis</Label>
                  <Input
                    value={String(config.trialDays)}
                    onChange={(e) => updateCfg({ trialDays: Number(e.target.value.replace(/\D/g, '')) || 1 })}
                    className="h-9 border-slate-700 bg-slate-950 text-sm text-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-300">Plano grátis — simulados por mês</Label>
                  <Input
                    value={String(config.freeSimuladosPerMonth)}
                    onChange={(e) => updateCfg({ freeSimuladosPerMonth: Number(e.target.value.replace(/\D/g, '')) || 0 })}
                    className="h-9 border-slate-700 bg-slate-950 text-sm text-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-300">Plano grátis — questões por dia</Label>
                  <Input
                    value={String(config.freeQuestionsPerDay)}
                    onChange={(e) => updateCfg({ freeQuestionsPerDay: Number(e.target.value.replace(/\D/g, '')) || 0 })}
                    className="h-9 border-slate-700 bg-slate-950 text-sm text-white"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs text-slate-300">URL do checkout (Cakto)</Label>
                  <Input
                    value={config.checkoutUrl}
                    onChange={(e) => updateCfg({ checkoutUrl: e.target.value })}
                    className="h-9 border-slate-700 bg-slate-950 text-sm text-white"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs text-slate-300">E-mail de suporte</Label>
                  <Input
                    value={config.supportEmail}
                    onChange={(e) => updateCfg({ supportEmail: e.target.value })}
                    className="h-9 border-slate-700 bg-slate-950 text-sm text-white"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <input
                  type="checkbox"
                  checked={config.freeComments}
                  onChange={(e) => updateCfg({ freeComments: e.target.checked })}
                  className="h-4 w-4 accent-emerald-600"
                />
                Plano grátis COM comentários de professor (default: desligado — comentário é o diferencial do pago)
              </label>
              <div className="flex justify-end">
                <Button onClick={() => void saveConfig()} disabled={saving} className="bg-amber-400 font-black text-slate-950 hover:bg-amber-300">
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Salvar configuração
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ---------------- Planos customizados ---------------- */}
      <Card className="border-slate-800 bg-slate-900">
        <CardHeader className="pb-2">
          <CardTitle className="flex flex-wrap items-center gap-2 text-sm text-slate-200">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400 text-slate-950">
              <Plus className="h-4 w-4" />
            </span>
            Planos customizados
            <Badge className="bg-slate-800 text-slate-300 hover:bg-slate-800">{plans?.length ?? 0} planos</Badge>
            <Button onClick={() => setDraft(emptyDraft())} size="sm" className="ml-auto bg-emerald-600 font-bold text-white hover:bg-emerald-700">
              <Plus className="mr-1.5 h-4 w-4" /> Criar plano
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-[11px] leading-relaxed text-slate-500">
            Planos especiais (ex.: promoções, parcerias, contas de influenciador) com limites próprios de simulados,
            questões e comentários. Atribua na aba <b className="text-slate-300">Usuários → Editar → Plano</b>.
          </p>
          {plans === null ? (
            <p className="flex items-center gap-2 py-4 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Carregando planos...
            </p>
          ) : plans.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">Nenhum plano customizado criado.</p>
          ) : (
            <div className="divide-y divide-slate-800 rounded-lg border border-slate-800">
              {plans.map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="text-sm font-bold text-slate-200">{p.name}</p>
                      <Badge variant="outline" className="border-amber-800 bg-amber-950 text-[10px] font-bold text-amber-300">
                        {p.price}
                      </Badge>
                      {!p.active && (
                        <Badge variant="outline" className="border-red-900 bg-red-950 text-[10px] font-bold text-red-300">
                          inativo
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {p.simuladosPerMonth} simulados/mês · {p.questionsPerDay} questões/dia ·{' '}
                      {p.comments ? 'com comentários' : 'sem comentários'}
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
                          name: p.name,
                          price: p.price,
                          simuladosPerMonth: String(p.simuladosPerMonth),
                          questionsPerDay: String(p.questionsPerDay),
                          comments: p.comments,
                          active: p.active,
                        })
                      }
                    >
                      <Pencil className="h-3.5 w-3.5" /> Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-red-400 hover:bg-red-950 hover:text-red-300"
                      onClick={() => void removePlan(p)}
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

      {/* ---------------- Dialog: plano customizado ---------------- */}
      <Dialog open={draft !== null} onOpenChange={(o) => !o && setDraft(null)}>
        <DialogContent className="max-w-md border-slate-800 bg-slate-900 text-slate-100">
          <DialogHeader>
            <DialogTitle>{draft?.id ? 'Editar plano' : 'Criar plano customizado'}</DialogTitle>
            <DialogDescription>Limites próprios para contas específicas (atribuível por usuário).</DialogDescription>
          </DialogHeader>
          {draft && (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs text-slate-300">Nome do plano *</Label>
                <Input
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  placeholder="Plano Mentor / Promoção Black / Parceria XYZ"
                  className="h-9 border-slate-700 bg-slate-950 text-sm text-white"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-slate-300">Preço</Label>
                  <Input
                    value={draft.price}
                    onChange={(e) => setDraft({ ...draft, price: e.target.value })}
                    className="h-9 border-slate-700 bg-slate-950 text-sm text-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-300">Simulados/mês</Label>
                  <Input
                    value={draft.simuladosPerMonth}
                    onChange={(e) => setDraft({ ...draft, simuladosPerMonth: e.target.value.replace(/\D/g, '') })}
                    className="h-9 border-slate-700 bg-slate-950 text-sm text-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-300">Questões/dia</Label>
                  <Input
                    value={draft.questionsPerDay}
                    onChange={(e) => setDraft({ ...draft, questionsPerDay: e.target.value.replace(/\D/g, '') })}
                    className="h-9 border-slate-700 bg-slate-950 text-sm text-white"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <input
                  type="checkbox"
                  checked={draft.comments}
                  onChange={(e) => setDraft({ ...draft, comments: e.target.checked })}
                  className="h-4 w-4 accent-emerald-600"
                />
                Incluir comentários de professor
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <input
                  type="checkbox"
                  checked={draft.active}
                  onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
                  className="h-4 w-4 accent-emerald-600"
                />
                Plano ativo
              </label>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDraft(null)} className="text-slate-400">
              Cancelar
            </Button>
            <Button onClick={() => void savePlan()} disabled={busy} className="bg-amber-400 font-black text-slate-950 hover:bg-amber-300">
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Salvar plano
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
