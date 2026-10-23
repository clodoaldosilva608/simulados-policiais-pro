'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Activity,
  BadgeCheck,
  BarChart3,
  Ban,
  BookOpenCheck,
  Clock,
  Coins,
  Database,
  Download,
  FileText,
  KeyRound,
  Loader2,
  LogOut,
  Megaphone,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  TrendingUp,
  Upload,
  UserCheck,
  UserX,
  Users,
  Wrench,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UsersPanel, type AdminUser } from '@/app/admin/users-panel'
import { QuestionsPanel } from '@/app/admin/questions-panel'
import { MaterialsPanel } from '@/app/admin/materials-panel'
import { PopupsPanel } from '@/app/admin/popups-panel'
import { PlansPanel } from '@/app/admin/plans-panel'

/* ------------------------------------------------------------------ */
/* Tipos da API                                                        */
/* ------------------------------------------------------------------ */

interface Stats {
  total: number
  trial: number
  active: number
  expired: number
  canceled: number
  banned: number
  new7d: number
  trialExpiringSoon: number
  mrrCents: number
  conversionPct: number
  byDay: { day: string; count: number }[]
}

interface EventItem {
  id: string
  type: string
  at: number
  email?: string
  message?: string
  source?: string
}

interface AppConfig {
  adminAuth: boolean
  blob: boolean
  cakto: boolean
  checkoutUrl: string
  trialDays: number
  price: string
  accessCodes: string[]
  accessCodesEnv: string[]
}

interface Overview {
  ok: true
  generatedAt: number
  stats: Stats
  users: AdminUser[]
  events: EventItem[]
  config: AppConfig
}

type Tab = 'usuarios' | 'questoes' | 'materiais' | 'popups' | 'planos' | 'eventos' | 'ajustes'

const BRL = (cents: number) =>
  (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const fmtDate = (ts?: number) =>
  ts
    ? new Date(ts).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
    : '—'

/* ------------------------------------------------------------------ */
/* Página                                                              */
/* ------------------------------------------------------------------ */

export default function AdminPage() {
  const [overview, setOverview] = useState<Overview | null>(null)
  const [loading, setLoading] = useState(true)
  const [needsLogin, setNeedsLogin] = useState(false)
  const [fatalError, setFatalError] = useState('')

  // login
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)

  const [tab, setTab] = useState<Tab>('usuarios')
  const [cfgTick, setCfgTick] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/overview', { cache: 'no-store' })
      if (res.status === 401) {
        setNeedsLogin(true)
        setOverview(null)
        setFatalError('')
      } else if (res.status === 503) {
        setNeedsLogin(false)
        setFatalError('Armazenamento do painel (Vercel Blob) não configurado neste ambiente.')
      } else if (!res.ok) {
        setNeedsLogin(false)
        setFatalError(`Erro ${res.status} ao carregar o painel.`)
      } else {
        const data = (await res.json()) as Overview
        setOverview(data)
        setNeedsLogin(false)
        setFatalError('')
      }
    } catch {
      setFatalError('Falha de conexão com o servidor.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
    const iv = window.setInterval(() => void load(), 60_000)
    return () => window.clearInterval(iv)
  }, [load])

  const handleLogin = async () => {
    setLoginError('')
    setLoggingIn(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = (await res.json()) as { ok?: boolean; message?: string }
      if (data.ok) {
        setPassword('')
        await load()
      } else {
        setLoginError(data.message ?? 'Credenciais inválidas.')
      }
    } catch {
      setLoginError('Falha de conexão. Tente novamente.')
    } finally {
      setLoggingIn(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' }).catch(() => {})
    setOverview(null)
    setNeedsLogin(true)
  }

  /* ---------------- Tela de login (autenticação dedicada) ---------------- */
  if (needsLogin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex flex-col items-center gap-2 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400">
              <ShieldCheck className="h-8 w-8 text-slate-950" />
            </div>
            <h1 className="text-xl font-black text-white">Painel Administrativo</h1>
            <p className="text-xs text-slate-400">Simulados Policiais Pro — acesso restrito</p>
          </div>
          <Card className="border-slate-800 bg-slate-900 text-slate-100">
            <CardContent className="space-y-4 p-6">
              <div className="space-y-1.5">
                <Label htmlFor="admin-user" className="text-slate-300">E-mail</Label>
                <Input
                  id="admin-user"
                  type="email"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-11 border-slate-700 bg-slate-950 text-white"
                  placeholder="admin@exemplo.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="admin-pass" className="text-slate-300">Senha</Label>
                <Input
                  id="admin-pass"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !loggingIn && void handleLogin()}
                  className="h-11 border-slate-700 bg-slate-950 text-white"
                  placeholder="••••••••••"
                />
              </div>
              {loginError && (
                <p className="rounded-lg border border-red-900 bg-red-950/60 px-3 py-2 text-xs text-red-300">
                  {loginError}
                </p>
              )}
              <Button
                onClick={() => void handleLogin()}
                disabled={loggingIn || !username || !password}
                className="h-11 w-full bg-amber-400 font-black text-slate-950 hover:bg-amber-300"
              >
                {loggingIn ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <KeyRound className="mr-2 h-5 w-5" />}
                Entrar no painel
              </Button>
            </CardContent>
          </Card>
          <p className="mt-4 text-center text-[11px] leading-relaxed text-slate-500">
            Sessão dedicada do administrador (12h). As contas dos alunos do app são independentes.
          </p>
        </div>
      </div>
    )
  }

  /* ---------------- Carregando / erro fatal ---------------- */
  if (loading && !overview) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Carregando painel...
      </div>
    )
  }
  if (fatalError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-center">
        <div className="max-w-md">
          <Wrench className="mx-auto mb-3 h-10 w-10 text-amber-400" />
          <p className="text-sm text-slate-300">{fatalError}</p>
        </div>
      </div>
    )
  }
  if (!overview) return null

  const { stats, config } = overview

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Cabeçalho */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-400 text-slate-950">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-black">Painel Admin — {`Simulados Policiais Pro`}</p>
            <p className="truncate text-[11px] text-slate-400">
              Atualizado às {fmtDate(overview.generatedAt)}
            </p>
          </div>
          <Button
            onClick={() => void load()}
            variant="outline"
            size="sm"
            className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
            aria-label="Atualizar"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="ml-1.5 hidden sm:inline">Atualizar</span>
          </Button>
          <Button
            onClick={() => void handleLogout()}
            variant="outline"
            size="sm"
            className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
            aria-label="Sair"
          >
            <LogOut className="h-4 w-4" />
            <span className="ml-1.5 hidden sm:inline">Sair</span>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <KpiCard icon={Users} label="Contas criadas" value={String(stats.total)} hint={`${stats.new7d} novos em 7 dias`} />
          <KpiCard icon={Clock} label="Em teste grátis" value={String(stats.trial)} hint={`${stats.trialExpiringSoon} vencem em 48h`} accent="text-sky-400" />
          <KpiCard icon={BadgeCheck} label="Assinantes ativos" value={String(stats.active)} hint="plano recorrente" accent="text-emerald-400" />
          <KpiCard icon={Coins} label="Receita/mês" value={BRL(stats.mrrCents)} hint="R$ 17,90 × ativos" accent="text-amber-400" />
          <KpiCard icon={UserX} label="Testes expirados" value={String(stats.expired)} hint="sem assinatura" />
          <KpiCard icon={TrendingUp} label="Cancelados" value={String(stats.canceled)} hint="assinaturas" />
          <KpiCard icon={Ban} label="Bloqueados" value={String(stats.banned)} hint="pelo admin" accent="text-red-400" />
          <KpiCard icon={BarChart3} label="Conversão" value={`${stats.conversionPct}%`} hint="contas → pagantes" accent="text-amber-400" />
        </div>

        {/* Gráfico: registros por dia */}
        <Card className="mt-4 border-slate-800 bg-slate-900">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-slate-200">
              <Activity className="h-4 w-4 text-amber-400" /> Novas contas — últimos 14 dias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-32 items-end gap-1.5">
              {stats.byDay.map((d) => {
                const max = Math.max(1, ...stats.byDay.map((x) => x.count))
                const h = Math.max(d.count > 0 ? 8 : 2, Math.round((d.count / max) * 100))
                return (
                  <div key={d.day} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                    <span className="text-[10px] font-bold text-slate-400">{d.count > 0 ? d.count : ''}</span>
                    <div
                      className={`w-full rounded-t ${d.count > 0 ? 'bg-amber-400' : 'bg-slate-800'}`}
                      style={{ height: `${h}%` }}
                      title={`${d.day}: ${d.count}`}
                    />
                    <span className="w-full truncate text-center text-[9px] text-slate-500">{d.day}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Abas */}
        <div className="mt-5 flex gap-1 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 p-1">
          {(
            [
              ['usuarios', 'Usuários', Users],
              ['questoes', 'Questões', FileText],
              ['materiais', 'Materiais', BookOpenCheck],
              ['popups', 'Pop-ups', Megaphone],
              ['planos', 'Planos', Coins],
              ['eventos', 'Eventos', Activity],
              ['ajustes', 'Ajustes', Settings],
            ] as [Tab, string, typeof Users][]
          ).map(([key, label, Icon]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              aria-pressed={tab === key}
              className={`flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg px-3.5 text-xs font-bold transition-colors sm:text-sm ${
                tab === key ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>

        {tab === 'usuarios' && (
          <UsersPanel
            users={overview.users}
            reload={async () => {
              await load()
            }}
          />
        )}

        {tab === 'questoes' && <QuestionsPanel />}

        {tab === 'materiais' && <MaterialsPanel />}

        {tab === 'popups' && <PopupsPanel />}

        {tab === 'planos' && (
          <PlansPanel
            onConfigSaved={() => {
              setCfgTick((t) => t + 1)
              void load()
            }}
          />
        )}

        {tab === 'eventos' && (
          <Card className="mt-4 border-slate-800 bg-slate-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-200">Eventos recentes (Cakto, ativações, admin)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {overview.events.length === 0 && (
                <p className="py-6 text-center text-sm text-slate-500">Nenhum evento registrado ainda.</p>
              )}
              {overview.events.map((e) => (
                <div key={e.id} className="flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                  <div className="mt-0.5 shrink-0">
                    <EventBadge type={e.type} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs leading-relaxed text-slate-200">{e.message ?? e.type}</p>
                    <p className="mt-0.5 text-[10px] text-slate-500">
                      {fmtDate(e.at)} · origem: {e.source ?? '—'}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {tab === 'ajustes' && (
          <ConfigPanel
            config={config}
            cfgTick={cfgTick}
            onReload={async () => {
              await load()
            }}
          />
        )}
      </main>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Componentes auxiliares                                              */
/* ------------------------------------------------------------------ */

function KpiCard({
  icon: Icon,
  label,
  value,
  hint,
  accent = 'text-amber-400',
}: {
  icon: typeof Users
  label: string
  value: string
  hint?: string
  accent?: string
}) {
  return (
    <Card className="border-slate-800 bg-slate-900">
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${accent}`} />
          <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        </div>
        <p className="mt-2 text-2xl font-black text-white">{value}</p>
        {hint && <p className="mt-0.5 truncate text-[10px] text-slate-500">{hint}</p>}
      </CardContent>
    </Card>
  )
}

function EventBadge({ type }: { type: string }) {
  const color =
    type.includes('approved') || type.includes('created') || type.includes('activation')
      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
      : type.includes('cancel') || type.includes('refund') || type.includes('refused') || type.includes('chargeback')
        ? 'bg-red-950 text-red-300 border-red-800'
        : type.includes('admin') || type.includes('code')
          ? 'bg-amber-950 text-amber-300 border-amber-800'
          : 'bg-slate-800 text-slate-300 border-slate-700'
  return <Badge variant="outline" className={`${color} max-w-[180px] truncate text-[10px]`}>{type}</Badge>
}

/* ------------------------------------------------------------------ */
/* Ajustes: configuração + códigos de acesso + sync Cakto              */
/* ------------------------------------------------------------------ */

interface StorageDiag {
  verdict: string
  dica?: string
  probes?: { op: string; ok: boolean; code?: string; message?: string }[]
}

function StorageBackupCard() {
  const [diag, setDiag] = useState<StorageDiag | null>(null)
  const [probing, setProbing] = useState(true)
  const [restoring, setRestoring] = useState(false)
  const [msg, setMsg] = useState('')

  const probe = useCallback(async () => {
    setProbing(true)
    try {
      const res = await fetch('/api/admin/diag-storage', { cache: 'no-store' })
      const data = (await res.json()) as StorageDiag
      setDiag(data)
    } catch {
      setDiag({ verdict: 'probe-falhou', dica: 'Não foi possível sondar o armazenamento.' })
    } finally {
      setProbing(false)
    }
  }, [])

  useEffect(() => {
    void probe()
  }, [probe])

  const downloadBackup = () => {
    // O endpoint já responde com Content-Disposition (download direto)
    window.location.href = '/api/admin/backup'
    setMsg('Download do backup iniciado. Guarde este arquivo em local seguro.')
  }

  const restoreBackup = async (file: File) => {
    setRestoring(true)
    setMsg('')
    try {
      const text = await file.text()
      JSON.parse(text) // valida antes de enviar
      const res = await fetch('/api/admin/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: text,
      })
      const data = (await res.json()) as { ok?: boolean; restored?: number; errors?: string[] }
      setMsg(
        data.ok
          ? `Restauração concluída: ${data.restored ?? 0} contas recriadas.${data.errors?.length ? ' Avisos: ' + data.errors.join('; ') : ''}`
          : 'Falha na restauração — verifique o arquivo.',
      )
    } catch {
      setMsg('Arquivo inválido — envie o JSON gerado pelo botão "Baixar backup".')
    } finally {
      setRestoring(false)
    }
  }

  const verdictMap: Record<string, { label: string; cls: string }> = {
    operacional: { label: 'Operacional', cls: 'text-emerald-400' },
    'suspensa-por-cota': { label: 'SUSPENSA por excesso de uso — logins de alunos ficam indisponíveis', cls: 'text-red-400' },
    'credencial-invalida': { label: 'Credencial do armazenamento inválida', cls: 'text-red-400' },
    'nao-configurado': { label: 'Não configurado', cls: 'text-amber-400' },
    indisponivel: { label: 'Indisponível', cls: 'text-red-400' },
  }
  const v = verdictMap[diag?.verdict ?? ''] ?? { label: diag?.verdict ?? 'verificando…', cls: 'text-slate-400' }

  return (
    <Card className="border-slate-800 bg-slate-900">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm text-slate-200">
          <Database className="h-4 w-4 text-amber-400" /> Armazenamento & Backup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-300">Estado do registro central</p>
            <p className={`mt-0.5 text-xs font-bold ${v.cls}`}>{probing ? 'sondando…' : v.label}</p>
          </div>
          <Button onClick={() => void probe()} disabled={probing} size="sm" variant="outline" className="border-slate-700 bg-slate-950 text-slate-200 hover:bg-slate-800">
            {probing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span className="ml-1.5">Sondar</span>
          </Button>
        </div>
        {diag?.dica && (
          <p className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs leading-relaxed text-slate-300">{diag.dica}</p>
        )}
        {diag?.probes && diag.probes.some((p) => !p.ok) && (
          <details className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2">
            <summary className="cursor-pointer text-xs font-semibold text-slate-300">Detalhes técnicos do erro</summary>
            <div className="mt-2 space-y-1">
              {diag.probes.map((p) => (
                <p key={p.op} className="font-mono text-[10px] leading-relaxed text-slate-400">
                  {p.ok ? '✓' : '✗'} {p.op}
                  {p.code ? ` — ${p.code}` : ''}
                  {p.message && !p.ok ? ` — ${p.message}` : ''}
                </p>
              ))}
            </div>
          </details>
        )}
        <div className="flex flex-wrap gap-2">
          <Button onClick={downloadBackup} size="sm" className="bg-amber-400 font-bold text-slate-950 hover:bg-amber-300">
            <Download className="mr-1.5 h-4 w-4" /> Baixar backup completo
          </Button>
          <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-slate-700 bg-slate-950 px-3 text-xs font-semibold text-slate-200 hover:bg-slate-800">
            <Upload className="h-4 w-4" /> {restoring ? 'Restaurando…' : 'Restaurar backup'}
            <input
              type="file"
              accept="application/json"
              className="hidden"
              disabled={restoring}
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) void restoreBackup(f)
                e.target.value = ''
              }}
            />
          </label>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-500">
          O backup contém TODAS as contas (senhas em hash), índices, códigos e o conteúdo do app (questões,
          materiais, pop-ups, planos e configurações). Baixe periodicamente — se a store ever falhar, a
          restauração recria tudo em segundos. Arquivo contém dados sensíveis: não compartilhe.
        </p>
        {msg && <p className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-300">{msg}</p>}
      </CardContent>
    </Card>
  )
}

function ConfigPanel({ config, cfgTick, onReload }: { config: AppConfig; cfgTick: number; onReload: () => Promise<void> }) {
  useEffect(() => {
    void onReload()
     
  }, [cfgTick])
  const [codes, setCodes] = useState<string[]>(config.accessCodes)
  const [envCodes] = useState<string[]>(config.accessCodesEnv)
  const [busy, setBusy] = useState(false)
  const [syncMsg, setSyncMsg] = useState('')
  const [syncing, setSyncing] = useState(false)

  const addCode = async (code?: string) => {
    setBusy(true)
    try {
      const res = await fetch('/api/admin/codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(code ? { code } : {}),
      })
      const data = (await res.json()) as { codes?: string[] }
      if (data.codes) setCodes(data.codes)
      await onReload()
    } finally {
      setBusy(false)
    }
  }

  const removeCode = async (code: string) => {
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/codes?code=${encodeURIComponent(code)}`, { method: 'DELETE' })
      const data = (await res.json()) as { codes?: string[] }
      if (data.codes) setCodes(data.codes)
      await onReload()
    } finally {
      setBusy(false)
    }
  }

  const syncCakto = async () => {
    setSyncing(true)
    setSyncMsg('')
    try {
      const res = await fetch('/api/admin/cakto-sync', { method: 'POST' })
      const data = (await res.json()) as {
        ok?: boolean
        subscriptionsTotal?: number
        created?: number
        reactivated?: number
        canceled?: number
      }
      setSyncMsg(
        data.ok
          ? `Concluído: ${data.subscriptionsTotal ?? 0} assinaturas na Cakto · ${data.created ?? 0} novos · ${data.reactivated ?? 0} reativados · ${data.canceled ?? 0} cancelados`
          : 'Falha na sincronização — verifique as credenciais da Cakto.',
      )
      await onReload()
    } catch {
      setSyncMsg('Falha de conexão na sincronização.')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="mt-4 space-y-4">
      <StorageBackupCard />
      <Card className="border-slate-800 bg-slate-900">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm text-slate-200">
            <Wrench className="h-4 w-4 text-amber-400" /> Estado da aplicação
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <StatusLine label="Autenticação do admin" ok={config.adminAuth} okLabel="ativa" nokLabel="não configurada" />
          <StatusLine label="Registro central (Vercel Blob)" ok={config.blob} okLabel="conectado" nokLabel="não configurado" />
          <StatusLine label="Cakto (assinaturas)" ok={config.cakto} okLabel="configurada" nokLabel="não configurada" />
          <div className="text-xs text-slate-400">
            <p className="font-semibold text-slate-300">Checkout</p>
            <p className="mt-0.5 break-all text-slate-400">{config.checkoutUrl}</p>
          </div>
          <div className="text-xs text-slate-400">
            <p className="font-semibold text-slate-300">Plano</p>
            <p className="mt-0.5">{config.price}/mês · teste grátis {config.trialDays} dias</p>
          </div>
          <div className="flex items-end">
            <Button
              onClick={() => void syncCakto()}
              disabled={syncing}
              className="h-10 bg-amber-400 font-bold text-slate-950 hover:bg-amber-300"
            >
              {syncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Sincronizar assinantes da Cakto
            </Button>
          </div>
          {syncMsg && <p className="sm:col-span-2 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-300">{syncMsg}</p>}
        </CardContent>
      </Card>

      <Card className="border-slate-800 bg-slate-900">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm text-slate-200">
            <KeyRound className="h-4 w-4 text-amber-400" /> Códigos de acesso
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs leading-relaxed text-slate-400">
            Códigos criados aqui são aceitos imediatamente na ativação do app (junto com os da variável
            ACCESS_CODES). Gere um código e envie manualmente para conceder acesso a alguém.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => void addCode()}
              disabled={busy}
              size="sm"
              className="bg-emerald-600 font-bold text-white hover:bg-emerald-700"
            >
              <UserCheck className="mr-1.5 h-4 w-4" /> Gerar novo código
            </Button>
            <AddCustomCode onAdd={(c) => void addCode(c)} busy={busy} />
          </div>
          {codes.length === 0 && <p className="text-xs text-slate-500">Nenhum código criado no painel.</p>}
          <div className="space-y-1.5">
            {codes.map((c) => (
              <div key={c} className="flex items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2">
                <code className="truncate font-mono text-xs text-amber-300">{c}</code>
                <Button
                  onClick={() => void removeCode(c)}
                  disabled={busy}
                  size="sm"
                  variant="ghost"
                  className="h-7 text-red-400 hover:bg-red-950 hover:text-red-300"
                >
                  Remover
                </Button>
              </div>
            ))}
            {envCodes.length > 0 && (
              <p className="pt-1 text-[10px] text-slate-500">
                + {envCodes.length} código(s) fixo(s) na variável ACCESS_CODES do servidor.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-800 bg-slate-900">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-slate-200">Segurança</CardTitle>
        </CardHeader>
        <CardContent className="text-xs leading-relaxed text-slate-400">
          <ul className="list-disc space-y-1 pl-4">
            <li>Senha do admin armazenada como hash scrypt no servidor (env ADMIN_PASSWORD_HASH).</li>
            <li>Sessão assinada por HMAC (12h) em cookie httpOnly — troque o ADMIN_SESSION_SECRET para invalidar todas.</li>
            <li>Limite de 8 tentativas de login por 15 minutos por IP.</li>
            <li>Esta página não é indexada (robots noindex) e não tem link no app.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

function StatusLine({
  label,
  ok,
  okLabel,
  nokLabel,
}: {
  label: string
  ok: boolean
  okLabel: string
  nokLabel: string
}) {
  return (
    <div className="text-xs">
      <p className="font-semibold text-slate-300">{label}</p>
      <Badge className={`mt-1 ${ok ? 'bg-emerald-950 text-emerald-300 hover:bg-emerald-950' : 'bg-red-950 text-red-300 hover:bg-red-950'}`}>
        {ok ? okLabel : nokLabel}
      </Badge>
    </div>
  )
}

function AddCustomCode({ onAdd, busy }: { onAdd: (code: string) => void; busy: boolean }) {
  const [code, setCode] = useState('')
  const valid = /^SPP-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code.trim().toUpperCase())
  return (
    <div className="flex items-center gap-2">
      <Input
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="SPP-XXXX-XXXX-XXXX (opcional)"
        className="h-9 w-56 border-slate-700 bg-slate-950 font-mono text-xs text-white"
      />
      <Button
        onClick={() => {
          onAdd(code.trim().toUpperCase())
          setCode('')
        }}
        disabled={busy || !valid}
        size="sm"
        variant="outline"
        className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
      >
        <Search className="mr-1.5 h-4 w-4" /> Adicionar
      </Button>
    </div>
  )
}
