'use client'

import { useMemo, useState } from 'react'
import {
  BadgeCheck,
  Ban,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  FileText,
  Loader2,
  MoreHorizontal,
  Search,
  ShieldX,
  UserCheck,
  UserCog,
  UserX,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
/* Tipos (espelham /api/admin/overview)                                */
/* ------------------------------------------------------------------ */

export interface AdminUser {
  id: string
  name?: string
  email?: string
  ident?: string
  status: 'trial' | 'active' | 'expired' | 'canceled'
  effStatus: 'trial' | 'active' | 'expired' | 'canceled' | 'banned'
  source?: string
  trialStartedAt?: number
  trialExtendedDays?: number
  trialEndsAt?: number
  activatedAt?: number
  canceledAt?: number
  adminGrant?: boolean
  adminRevoked?: boolean
  banned?: boolean
  notes?: string
  device?: string
  platform?: string
  createdAt: number
  updatedAt: number
  lastSeen: number
}

const SOURCE_LABEL: Record<string, string> = {
  trial: 'Teste grátis',
  cakto_email: 'Cakto (e-mail)',
  cakto_webhook: 'Cakto (webhook)',
  code: 'Código de acesso',
  admin: 'Concedido pelo admin',
  sync: 'Importado da Cakto',
}

const STATUS_STYLE: Record<AdminUser['effStatus'], { label: string; cls: string }> = {
  trial: { label: 'Teste grátis', cls: 'bg-sky-950 text-sky-300 border-sky-800 hover:bg-sky-950' },
  active: { label: 'Assinante', cls: 'bg-emerald-950 text-emerald-300 border-emerald-800 hover:bg-emerald-950' },
  expired: { label: 'Expirado', cls: 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-800' },
  canceled: { label: 'Cancelado', cls: 'bg-orange-950 text-orange-300 border-orange-800 hover:bg-orange-950' },
  banned: { label: 'Bloqueado', cls: 'bg-red-950 text-red-300 border-red-800 hover:bg-red-950' },
}

const DAY = 86400000
const fmt = (ts?: number) =>
  ts
    ? new Date(ts).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
    : '—'

/* ------------------------------------------------------------------ */
/* Painel de usuários                                                  */
/* ------------------------------------------------------------------ */

export function UsersPanel({ users, reload }: { users: AdminUser[]; reload: () => Promise<void> }) {
  const { toast } = useToast()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'todos' | AdminUser['effStatus']>('todos')
  const [page, setPage] = useState(0)
  const [detail, setDetail] = useState<AdminUser | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<AdminUser | null>(null)
  const [confirmBan, setConfirmBan] = useState<AdminUser | null>(null)
  const [noteDraft, setNoteDraft] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const PER_PAGE = 10

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return users.filter((u) => {
      if (status !== 'todos' && u.effStatus !== status) return false
      if (!q) return true
      return (
        (u.email ?? '').toLowerCase().includes(q) ||
        (u.name ?? '').toLowerCase().includes(q) ||
        (u.ident ?? '').toLowerCase().includes(q) ||
        (u.platform ?? '').toLowerCase().includes(q) ||
        (u.device ?? '').toLowerCase().includes(q)
      )
    })
  }, [users, query, status])

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const pageSafe = Math.min(page, pages - 1)
  const slice = filtered.slice(pageSafe * PER_PAGE, pageSafe * PER_PAGE + PER_PAGE)

  const act = async (user: AdminUser, action: string, days?: number, note?: string) => {
    setBusyId(user.id)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, action, days, note }),
      })
      const data = (await res.json()) as { ok?: boolean; message?: string; error?: string }
      if (data.ok) {
        toast({ title: 'Feito!', description: data.message })
        if (detail?.id === user.id && note === undefined && action === 'save_note') setDetail(null)
        if (action === 'delete') {
          setDetail(null)
          setConfirmDelete(null)
        }
        if (action === 'ban') setConfirmBan(null)
        await reload()
      } else {
        toast({
          title: 'Não foi possível',
          description: data.error ?? data.message ?? 'Erro inesperado',
          variant: 'destructive',
        })
      }
    } catch {
      toast({ title: 'Falha de conexão', variant: 'destructive' })
    } finally {
      setBusyId(null)
    }
  }

  const exportCsv = () => {
    const head = [
      'criado_em',
      'email',
      'nome',
      'status',
      'origem',
      'inicio_teste',
      'fim_teste',
      'ativado_em',
      'plataforma',
      'navegador',
      'ultimo_acesso',
      'acesso_manual',
      'bloqueado',
      'observacoes',
    ]
    const rows = filtered.map((u) =>
      [
        fmt(u.createdAt),
        u.email ?? '',
        u.name ?? '',
        STATUS_STYLE[u.effStatus].label,
        SOURCE_LABEL[u.source ?? ''] ?? u.source ?? '',
        fmt(u.trialStartedAt),
        fmt(u.trialEndsAt),
        fmt(u.activatedAt),
        u.platform ?? '',
        u.device ?? '',
        fmt(u.lastSeen),
        u.adminGrant ? 'sim' : 'não',
        u.banned ? 'sim' : 'não',
        (u.notes ?? '').replace(/[\r\n;]+/g, ' '),
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(';'),
    )
    const csv = '\uFEFF' + head.join(';') + '\n' + rows.join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `usuarios-simulados-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="mt-4 border-slate-800 bg-slate-900">
      <CardHeader className="pb-3">
        <CardTitle className="flex flex-wrap items-center gap-2 text-sm text-slate-200">
          <UserCog className="h-4 w-4 text-amber-400" />
          Usuários ({filtered.length})
          <Button
            onClick={exportCsv}
            size="sm"
            variant="outline"
            className="ml-auto border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-800"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" /> CSV
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Filtros */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setPage(0)
              }}
              placeholder="Buscar por e-mail, nome, código, aparelho..."
              className="h-10 border-slate-700 bg-slate-950 pl-9 text-white"
            />
          </div>
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v as typeof status)
              setPage(0)
            }}
          >
            <SelectTrigger className="h-10 w-full border-slate-700 bg-slate-950 text-white sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-slate-700 bg-slate-900 text-white">
              <SelectItem value="todos">Todos os status</SelectItem>
              <SelectItem value="trial">Teste grátis</SelectItem>
              <SelectItem value="active">Assinantes</SelectItem>
              <SelectItem value="expired">Expirados</SelectItem>
              <SelectItem value="canceled">Cancelados</SelectItem>
              <SelectItem value="banned">Bloqueados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabela (desktop) */}
        <div className="hidden overflow-x-auto rounded-lg border border-slate-800 lg:block">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-[10px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2.5">Usuário</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5">Origem</th>
                <th className="px-3 py-2.5">Criado</th>
                <th className="px-3 py-2.5">Vence</th>
                <th className="px-3 py-2.5">Último acesso</th>
                <th className="px-3 py-2.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {slice.map((u) => (
                <tr key={u.id} className="hover:bg-slate-950/50">
                  <td className="max-w-[220px] px-3 py-2.5">
                    <button type="button" onClick={() => setDetail(u)} className="block text-left">
                      <p className="truncate font-semibold text-slate-100">{u.email ?? u.name ?? '(sem e-mail)'}</p>
                      <p className="truncate text-[10px] text-slate-500">
                        {u.platform ?? '—'} · {u.device ?? '—'}
                      </p>
                    </button>
                  </td>
                  <td className="px-3 py-2.5"><StatusBadge u={u} /></td>
                  <td className="px-3 py-2.5 text-[11px] text-slate-400">{SOURCE_LABEL[u.source ?? ''] ?? u.source ?? '—'}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap text-[11px]">{fmt(u.createdAt)}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap text-[11px]">{u.trialEndsAt ? fmt(u.trialEndsAt) : '—'}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap text-[11px]">{fmt(u.lastSeen)}</td>
                  <td className="px-3 py-2.5 text-right">
                    <RowMenu u={u} onAct={act} busy={busyId === u.id} onDetail={setDetail} onBan={setConfirmBan} onDelete={setConfirmDelete} />
                  </td>
                </tr>
              ))}
              {slice.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-10 text-center text-slate-500">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Cards (mobile) */}
        <div className="space-y-2 lg:hidden">
          {slice.map((u) => (
            <div key={u.id} className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
              <div className="flex items-start gap-2">
                <button type="button" onClick={() => setDetail(u)} className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm font-bold text-slate-100">{u.email ?? u.name ?? '(sem e-mail)'}</p>
                  <p className="mt-0.5 text-[10px] text-slate-500">
                    {u.platform ?? '—'} · {u.device ?? '—'} · criado {fmt(u.createdAt)}
                  </p>
                </button>
                <RowMenu u={u} onAct={act} busy={busyId === u.id} onDetail={setDetail} onBan={setConfirmBan} onDelete={setConfirmDelete} />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <StatusBadge u={u} />
                {u.trialEndsAt && u.effStatus === 'trial' && (
                  <span className="text-[10px] text-sky-300">
                    vence {fmt(u.trialEndsAt)}
                  </span>
                )}
              </div>
            </div>
          ))}
          {slice.length === 0 && (
            <p className="py-10 text-center text-sm text-slate-500">Nenhum usuário encontrado.</p>
          )}
        </div>

        {/* Paginação */}
        {pages > 1 && (
          <div className="flex items-center justify-between pt-1">
            <p className="text-[11px] text-slate-500">
              Página {pageSafe + 1} de {pages}
            </p>
            <div className="flex gap-1.5">
              <Button
                size="sm"
                variant="outline"
                disabled={pageSafe === 0}
                onClick={() => setPage(pageSafe - 1)}
                className="h-8 border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-800"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={pageSafe >= pages - 1}
                onClick={() => setPage(pageSafe + 1)}
                className="h-8 border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-800"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Detalhes do usuário */}
      <Dialog open={detail !== null} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto border-slate-800 bg-slate-900 text-slate-100 sm:max-w-lg">
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle className="break-all text-base">{detail.email ?? detail.name ?? detail.id}</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Detalhes e ações do usuário
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-1.5 rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-xs">
                <DetailLine label="Status"><StatusBadge u={detail} /></DetailLine>
                <DetailLine label="Origem">{SOURCE_LABEL[detail.source ?? ''] ?? detail.source ?? '—'}</DetailLine>
                <DetailLine label="Conta criada">{fmt(detail.createdAt)}</DetailLine>
                <DetailLine label="Último acesso">{fmt(detail.lastSeen)}</DetailLine>
                {detail.trialStartedAt && (
                  <DetailLine label="Teste">{fmt(detail.trialStartedAt)} → {fmt(detail.trialEndsAt)}
                    {detail.trialExtendedDays ? ` (+${detail.trialExtendedDays}d estendidos)` : ''}
                  </DetailLine>
                )}
                {detail.activatedAt && <DetailLine label="Ativado em">{fmt(detail.activatedAt)}</DetailLine>}
                {detail.canceledAt && <DetailLine label="Cancelado em">{fmt(detail.canceledAt)}</DetailLine>}
                <DetailLine label="Aparelho">{detail.platform ?? '—'} · {detail.device ?? '—'}</DetailLine>
                {detail.ident && <DetailLine label="Identificador">{detail.ident}</DetailLine>}
                {detail.adminGrant && <DetailLine label="Acesso manual">sim (vitalício)</DetailLine>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300">Observações internas</Label>
                <Textarea
                  value={noteDraft || detail.notes || ''}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  onFocus={() => setNoteDraft(detail.notes ?? '')}
                  placeholder="Ex.: pagou via Pix, pediu extensão de teste..."
                  className="min-h-[70px] border-slate-700 bg-slate-950 text-sm text-white"
                />
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busyId === detail.id}
                  onClick={() => void act(detail, 'save_note', undefined, noteDraft || detail.notes || '')}
                  className="border-slate-700 bg-slate-950 text-slate-200 hover:bg-slate-800"
                >
                  <FileText className="mr-1.5 h-3.5 w-3.5" /> Salvar observação
                </Button>
              </div>

              <DialogFooter className="flex-wrap gap-2 sm:justify-between">
                <div className="flex flex-wrap gap-1.5">
                  <Button size="sm" onClick={() => void act(detail, 'extend_trial', 7)} disabled={busyId === detail.id}
                    className="bg-sky-600 font-bold text-white hover:bg-sky-700">
                    <CalendarClock className="mr-1.5 h-3.5 w-3.5" /> +7 dias de teste
                  </Button>
                  {!detail.adminGrant ? (
                    <Button size="sm" onClick={() => void act(detail, 'grant')} disabled={busyId === detail.id}
                      className="bg-emerald-600 font-bold text-white hover:bg-emerald-700">
                      <BadgeCheck className="mr-1.5 h-3.5 w-3.5" /> Conceder acesso
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => void act(detail, 'revoke')} disabled={busyId === detail.id}
                      variant="outline" className="border-amber-700 bg-amber-950 text-amber-200 hover:bg-amber-900">
                      <ShieldX className="mr-1.5 h-3.5 w-3.5" /> Revogar
                    </Button>
                  )}
                  {!detail.banned ? (
                    <Button size="sm" onClick={() => setConfirmBan(detail)} disabled={busyId === detail.id}
                      variant="outline" className="border-red-800 bg-red-950 text-red-200 hover:bg-red-900">
                      <Ban className="mr-1.5 h-3.5 w-3.5" /> Bloquear
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => void act(detail, 'unban')} disabled={busyId === detail.id}
                      variant="outline" className="border-slate-700 bg-slate-950 text-slate-200 hover:bg-slate-800">
                      <UserCheck className="mr-1.5 h-3.5 w-3.5" /> Desbloquear
                    </Button>
                  )}
                  <Button size="sm" onClick={() => void act(detail, 'cancel')} disabled={busyId === detail.id}
                    variant="outline" className="border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-800">
                    <XCircle className="mr-1.5 h-3.5 w-3.5" /> Marcar cancelado
                  </Button>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(detail)}
                  className="text-red-400 hover:bg-red-950 hover:text-red-300">
                  <UserX className="mr-1.5 h-3.5 w-3.5" /> Excluir conta
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmar exclusão */}
      <Dialog open={confirmDelete !== null} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <DialogContent className="border-slate-800 bg-slate-900 text-slate-100 sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Excluir usuário?</DialogTitle>
            <DialogDescription className="text-slate-400">
              {confirmDelete?.email ?? confirmDelete?.id} será removido permanentemente do painel
              (o app dele continua funcionando conforme a licença local).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}
              className="border-slate-700 bg-slate-950 text-slate-200 hover:bg-slate-800">
              Cancelar
            </Button>
            <Button
              onClick={() => confirmDelete && void act(confirmDelete, 'delete')}
              disabled={busyId !== null}
              className="bg-red-600 font-bold text-white hover:bg-red-700"
            >
              {busyId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Excluir definitivamente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmar bloqueio */}
      <Dialog open={confirmBan !== null} onOpenChange={(o) => !o && setConfirmBan(null)}>
        <DialogContent className="border-slate-800 bg-slate-900 text-slate-100 sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Bloquear usuário?</DialogTitle>
            <DialogDescription className="text-slate-400">
              {confirmBan?.email ?? confirmBan?.id} perde o acesso no próximo heartbeat do app
              (até 5 minutos). Você pode desbloquear a qualquer momento.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmBan(null)}
              className="border-slate-700 bg-slate-950 text-slate-200 hover:bg-slate-800">
              Cancelar
            </Button>
            <Button
              onClick={() => confirmBan && void act(confirmBan, 'ban')}
              disabled={busyId !== null}
              className="bg-red-600 font-bold text-white hover:bg-red-700"
            >
              Bloquear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/* Auxiliares                                                          */
/* ------------------------------------------------------------------ */

function StatusBadge({ u }: { u: AdminUser }) {
  const s = STATUS_STYLE[u.effStatus]
  return (
    <Badge variant="outline" className={`${s.cls} whitespace-nowrap text-[10px] font-bold`}>
      {s.label}
      {u.effStatus === 'trial' && u.trialEndsAt && (
        <span className="ml-1 font-normal opacity-80">
          {Math.max(0, Math.ceil((u.trialEndsAt - Date.now()) / DAY))}d
        </span>
      )}
    </Badge>
  )
}

function DetailLine({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <span className="text-slate-500">{label}</span>
      <span className="text-right text-slate-200">{children}</span>
    </div>
  )
}

function RowMenu({
  u,
  onAct,
  busy,
  onDetail,
  onBan,
  onDelete,
}: {
  u: AdminUser
  onAct: (user: AdminUser, action: string, days?: number, note?: string) => Promise<void>
  busy: boolean
  onDetail: (u: AdminUser) => void
  onBan: (u: AdminUser) => void
  onDelete: (u: AdminUser) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="ghost" disabled={busy} className="h-8 w-8 p-0 text-slate-400 hover:bg-slate-800 hover:text-white">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="border-slate-800 bg-slate-900 text-slate-200">
        <DropdownMenuItem onClick={() => onDetail(u)}>
          <Search className="mr-2 h-3.5 w-3.5" /> Ver detalhes
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => void onAct(u, 'extend_trial', 7)}>
          <CalendarClock className="mr-2 h-3.5 w-3.5" /> Estender teste +7d
        </DropdownMenuItem>
        {!u.adminGrant && (
          <DropdownMenuItem onClick={() => void onAct(u, 'grant')}>
            <BadgeCheck className="mr-2 h-3.5 w-3.5" /> Conceder acesso vitalício
          </DropdownMenuItem>
        )}
        {u.adminGrant && (
          <DropdownMenuItem onClick={() => void onAct(u, 'revoke')}>
            <ShieldX className="mr-2 h-3.5 w-3.5" /> Revogar acesso manual
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => void onAct(u, 'cancel')}>
          <XCircle className="mr-2 h-3.5 w-3.5" /> Marcar cancelado
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-slate-800" />
        {!u.banned ? (
          <DropdownMenuItem onClick={() => onBan(u)} className="text-red-400 focus:text-red-300">
            <Ban className="mr-2 h-3.5 w-3.5" /> Bloquear
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => void onAct(u, 'unban')}>
            <UserCheck className="mr-2 h-3.5 w-3.5" /> Desbloquear
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => onDelete(u)} className="text-red-400 focus:text-red-300">
          <UserX className="mr-2 h-3.5 w-3.5" /> Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
