'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  Ban,
  Clock,
  KeyRound,
  Loader2,
  LogIn,
  LogOut,
  Mail,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UserPlus,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { SITE } from '@/config/site'
import type { SessionApi } from '@/lib/session'

interface AccessScreenProps {
  /** Sessão do aluno (conta autenticada) */
  session: SessionApi
  /** Aba inicial: criar conta (padrão) ou entrar */
  initialMode?: Modo
  onBack: () => void
  /** Acesso liberado → ir para a biblioteca */
  onDone: () => void
}

type Modo = 'registrar' | 'entrar'
type Ativacao = 'email' | 'codigo'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function AccessScreen({ session, initialMode = 'registrar', onBack, onDone }: AccessScreenProps) {
  const { toast } = useToast()
  const [modo, setModo] = useState<Modo>(initialMode)
  const [checkingCakto, setCheckingCakto] = useState<boolean | null>(null)

  useEffect(() => {
    fetch('/api/license')
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { cakto?: boolean } | null) => setCheckingCakto(Boolean(d?.cakto)))
      .catch(() => setCheckingCakto(null))
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950 text-white">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3.5">
          <Button
            onClick={onBack}
            variant="ghost"
            size="icon"
            aria-label="Voltar"
            className="h-9 w-9 shrink-0 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-400 text-slate-950">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <p className="text-base font-bold">{SITE.name}</p>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {session.authed ? (
            <AccountView session={session} onBack={onBack} onDone={onDone} toast={toast} caktoOk={checkingCakto} />
          ) : (
            <AuthView session={session} modo={modo} setModo={setModo} onDone={onDone} toast={toast} />
          )}

          <button
            type="button"
            onClick={onBack}
            className="mx-auto mt-6 flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-800"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar para a página inicial
          </button>
        </motion.div>
      </main>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Cadastro / login                                                    */
/* ------------------------------------------------------------------ */

function AuthView({
  session,
  modo,
  setModo,
  onDone,
  toast,
}: {
  session: SessionApi
  modo: Modo
  setModo: (m: Modo) => void
  onDone: () => void
  toast: ReturnType<typeof useToast>['toast']
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    setError('')
    setBusy(true)
    try {
      if (modo === 'registrar') {
        const res = await session.register({ name: name.trim() || undefined, email, password })
        if (!res.ok) {
          setError(res.message ?? 'Não foi possível criar sua conta.')
          return
        }
        if (res.trial && res.trial.started === false) {
          toast({
            title: 'Conta criada!',
            description:
              'Este aparelho já usou o teste grátis. Assine para desbloquear todas as provas.',
          })
        } else {
          toast({
            title: 'Conta criada!',
            description: `Teste grátis de ${SITE.trialDays} dias liberado neste aparelho. Bons estudos!`,
          })
        }
        onDone()
        return
      }
      const res = await session.login({ email, password })
      if (!res.ok) {
        setError(res.message ?? 'E-mail ou senha incorretos.')
        return
      }
      toast({ title: 'Bem-vindo de volta!', description: 'Acesso vinculado a este aparelho.' })
      onDone()
    } catch {
      setError('Falha de conexão. Verifique sua internet e tente novamente.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <h1 className="text-2xl font-black tracking-tight text-slate-900">Acessar minha conta</h1>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
        Para usar o app — inclusive o teste grátis de {SITE.trialDays} dias — é obrigatório ter uma conta.
        Ela fica ativa em <strong>um aparelho por vez</strong>, protegendo seu acesso.
      </p>

      {/* Avisos de segurança */}
      {session.takenOver && (
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-300 bg-amber-50 p-3.5">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <p className="text-xs leading-relaxed text-amber-800">
            {session.message || 'Esta conta está sendo usada em outro aparelho.'} Ao entrar aqui, o outro
            aparelho é desconectado automaticamente.
          </p>
        </div>
      )}
      {session.blocked && (
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-300 bg-red-50 p-3.5">
          <Ban className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <p className="text-xs leading-relaxed text-red-800">
            {session.message || 'Esta conta não pode ser acessada. Fale com o suporte.'}
          </p>
        </div>
      )}

      {/* Abas criar conta | entrar */}
      <div className="mt-5 grid grid-cols-2 gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1">
        {(
          [
            ['registrar', 'Criar conta', UserPlus],
            ['entrar', 'Entrar', LogIn],
          ] as [Modo, string, typeof UserPlus][]
        ).map(([key, label, Icon]) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setModo(key)
              setError('')
            }}
            aria-pressed={modo === key}
            className={`flex h-10 items-center justify-center gap-1.5 rounded-lg text-xs font-bold transition-colors sm:text-sm ${
              modo === key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      <Card className="mt-3">
        <CardContent className="space-y-4 p-5">
          {modo === 'registrar' ? (
            <>
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-amber-500" />
                <h2 className="text-base font-bold text-slate-900">Criar minha conta</h2>
                <Badge className="ml-auto gap-1 bg-amber-100 text-amber-800 hover:bg-amber-100">
                  <Sparkles className="h-3 w-3" /> Teste grátis incluso
                </Badge>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reg-name" className="text-sm font-medium text-slate-700">
                  Seu nome <span className="font-normal text-slate-400">(opcional)</span>
                </Label>
                <Input
                  id="reg-name"
                  autoComplete="name"
                  placeholder="Como devemos te chamar?"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11"
                />
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <LogIn className="h-5 w-5 text-amber-500" />
                <h2 className="text-base font-bold text-slate-900">Entrar na minha conta</h2>
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="auth-email" className="text-sm font-medium text-slate-700">
              E-mail
            </Label>
            <Input
              id="auth-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="voce@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError('')
              }}
              className="h-11"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="auth-pass" className="text-sm font-medium text-slate-700">
              Senha {modo === 'registrar' && <span className="font-normal text-slate-400">(mínimo 6 caracteres)</span>}
            </Label>
            <Input
              id="auth-pass"
              type="password"
              autoComplete={modo === 'registrar' ? 'new-password' : 'current-password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
              onKeyDown={(e) => e.key === 'Enter' && !busy && void submit()}
              className="h-11"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs leading-relaxed text-red-700">
              {error}
            </p>
          )}

          <Button
            onClick={() => void submit()}
            disabled={busy || !email.trim() || password.length < (modo === 'registrar' ? 6 : 1)}
            className="h-12 w-full bg-slate-900 text-base font-bold text-white hover:bg-slate-800"
          >
            {busy ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> {modo === 'registrar' ? 'Criando conta...' : 'Entrando...'}
              </>
            ) : modo === 'registrar' ? (
              <>
                <Sparkles className="mr-2 h-5 w-5" /> Criar conta e iniciar teste grátis
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-5 w-5" /> Entrar neste aparelho
              </>
            )}
          </Button>

          <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-400">
            <Smartphone className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Proteção anti-compartilhamento: sua conta funciona em um aparelho por vez. Ao entrar em um novo
            aparelho, o anterior é desconectado (basta entrar de novo para voltar). Dúvidas? {SITE.supportEmail}.
          </p>
        </CardContent>
      </Card>

      {modo === 'entrar' && (
        <p className="mt-4 text-center text-xs leading-relaxed text-slate-500">
          Já assinou na Cakto? Entre com sua conta e ative com o <strong>e-mail da compra</strong> na próxima
          tela.
        </p>
      )}
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Conta autenticada: status + ativação + sair                         */
/* ------------------------------------------------------------------ */

function AccountView({
  session,
  onBack,
  onDone,
  toast,
  caktoOk,
}: {
  session: SessionApi
  onBack: () => void
  onDone: () => void
  toast: ReturnType<typeof useToast>['toast']
  caktoOk: boolean | null
}) {
  const access = session.access
  const status: 'active' | 'trial' | 'none' =
    access?.status === 'active' ? 'active' : access?.status === 'trial' ? 'trial' : 'none'
  const initial =
    (session.user?.name ?? session.user?.email ?? 'A').trim().charAt(0).toUpperCase() || 'A'

  return (
    <>
      <h1 className="text-2xl font-black tracking-tight text-slate-900">Minha conta</h1>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
        Seus dados e o status do seu acesso neste aparelho.
      </p>

      {/* Dados da conta */}
      <Card className="mt-4">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-900 text-lg font-bold text-amber-300">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-bold text-slate-900">
              {session.user?.name?.trim() || 'Aluno'}
            </p>
            <p className="break-all text-xs text-slate-500">{session.user?.email ?? '—'}</p>
          </div>
          <Badge
            className={`shrink-0 ${
              status === 'active'
                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
                : status === 'trial'
                  ? 'bg-amber-100 text-amber-800 hover:bg-amber-100'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {status === 'active' ? 'Assinante' : status === 'trial' ? 'Teste grátis' : 'Sem acesso'}
          </Badge>
        </CardContent>
      </Card>

      {session.blocked && (
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-300 bg-red-50 p-3.5">
          <Ban className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <p className="text-xs leading-relaxed text-red-800">
            {session.message || 'Esta conta não pode ser acessada. Fale com o suporte.'}
          </p>
        </div>
      )}

      {/* Status de acesso */}
      {status === 'active' && (
        <Card className="mt-5 border-emerald-200 bg-emerald-50">
          <CardContent className="flex items-center gap-3 p-4">
            <BadgeCheck className="h-6 w-6 shrink-0 text-emerald-600" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-emerald-900">Assinatura ativa nesta conta</p>
              <p className="text-xs text-emerald-700">Todas as provas liberadas neste aparelho.</p>
            </div>
            <Button onClick={onDone} className="shrink-0 bg-emerald-600 font-bold text-white hover:bg-emerald-700">
              Entrar
            </Button>
          </CardContent>
        </Card>
      )}

      {status === 'trial' && (
        <Card className="mt-5 border-emerald-200 bg-emerald-50">
          <CardContent className="flex items-center gap-3 p-4">
            <Clock className="h-6 w-6 shrink-0 text-emerald-600" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-emerald-900">
                {(access?.trialDaysLeft ?? 0) > 0 ? (
                  <>
                    Teste grátis ativo — {access?.trialDaysLeft}{' '}
                    {(access?.trialDaysLeft ?? 0) === 1 ? 'dia restante' : 'dias restantes'}
                  </>
                ) : (
                  'Teste grátis ativo — menos de 1 dia restante'
                )}
              </p>
              <p className="text-xs text-emerald-700">Todas as provas liberadas durante o teste.</p>
            </div>
            <Button onClick={onDone} className="shrink-0 bg-emerald-600 font-bold text-white hover:bg-emerald-700">
              Entrar
            </Button>
          </CardContent>
        </Card>
      )}

      {status === 'none' && !session.blocked && (
        <Card className="mt-5 border-amber-200 bg-amber-50">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertTriangle className="h-6 w-6 shrink-0 text-amber-600" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-amber-900">
                {access?.status === 'canceled' ? 'Assinatura cancelada' : 'Acesso expirado'}
              </p>
              <p className="text-xs leading-relaxed text-amber-800">
                Ative sua assinatura abaixo para continuar estudando neste aparelho.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Teste grátis (quando elegível) */}
      {status === 'none' && !session.blocked && (
        <Card className="mt-4 border-dashed">
          <CardContent className="flex flex-col items-center gap-3 p-5 text-center sm:flex-row sm:text-left">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100">
              <Sparkles className="h-6 w-6 text-amber-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900">Quero experimentar</p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                {SITE.trialDays} dias grátis, sem cartão de crédito. Um teste por aparelho.
              </p>
            </div>
            <TrialButton session={session} toast={toast} onDone={onDone} />
          </CardContent>
        </Card>
      )}

      {/* Ativação de assinatura */}
      {status === 'none' && !session.blocked && <ActivateArea session={session} toast={toast} caktoOk={caktoOk} />}

      {/* Aparelho + sair */}
      <Card className="mt-4">
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center gap-2.5">
            <Smartphone className="h-5 w-5 shrink-0 text-slate-500" />
            <p className="text-xs leading-relaxed text-slate-500">
              Esta conta está ativa <strong>apenas neste aparelho</strong>. Ao entrar em outro aparelho, este
              será desconectado — e vice-versa.
            </p>
          </div>
          <Button
            onClick={async () => {
              await session.logout()
              onBack()
            }}
            variant="outline"
            className="h-10 w-full border-slate-300 font-bold text-slate-700 hover:bg-slate-100"
          >
            <LogOut className="mr-2 h-4 w-4" /> Sair deste aparelho
          </Button>
        </CardContent>
      </Card>
    </>
  )
}

function TrialButton({
  session,
  toast,
  onDone,
}: {
  session: SessionApi
  toast: ReturnType<typeof useToast>['toast']
  onDone: () => void
}) {
  const [busy, setBusy] = useState(false)
  return (
    <Button
      onClick={async () => {
        setBusy(true)
        try {
          const res = await session.startTrial()
          if (res.ok) {
            toast({ title: 'Teste grátis iniciado!', description: `${SITE.trialDays} dias com tudo liberado.` })
            onDone()
          } else {
            toast({ title: 'Teste indisponível', description: res.message ?? 'Tente novamente mais tarde.' })
          }
        } finally {
          setBusy(false)
        }
      }}
      disabled={busy}
      className="w-full shrink-0 bg-amber-400 font-black text-slate-950 hover:bg-amber-300 sm:w-auto"
    >
      {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-1.5 h-4 w-4" />}
      Iniciar teste grátis
    </Button>
  )
}

/* ------------------------------------------------------------------ */
/* Ativação (e-mail da compra | código) — exige conta autenticada      */
/* ------------------------------------------------------------------ */

function ActivateArea({
  session,
  toast,
  caktoOk,
}: {
  session: SessionApi
  toast: ReturnType<typeof useToast>['toast']
  caktoOk: boolean | null
}) {
  const [modo, setModo] = useState<Ativacao>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState('')

  const handleActivate = async () => {
    setError('')
    if (modo === 'email') {
      const cleanEmail = email.trim().toLowerCase()
      if (!EMAIL_RE.test(cleanEmail)) {
        setError('Digite o e-mail que você usou na compra na Cakto.')
        return
      }
      setChecking(true)
      try {
        const res = await session.activate({ email: cleanEmail })
        if (res.valid) {
          toast({ title: 'Acesso ativado!', description: 'Assinatura ativa na sua conta. Bons estudos!' })
        } else {
          setError(res.message ?? 'Não encontramos assinatura ativa para este e-mail.')
        }
      } catch {
        setError('Não foi possível verificar agora. Verifique sua conexão e tente novamente.')
      } finally {
        setChecking(false)
      }
      return
    }

    const clean = code.trim().toUpperCase()
    if (!clean) {
      setError('Digite o código que você recebeu por e-mail após a compra.')
      return
    }
    setChecking(true)
    try {
      const res = await session.activate({ code: clean })
      if (res.valid) {
        toast({ title: 'Acesso ativado!', description: 'Sua assinatura está ativa. Bons estudos!' })
      } else {
        setError(res.message ?? 'Código inválido. Confira o e-mail de compra.')
      }
    } catch {
      setError('Não foi possível verificar o código agora. Verifique sua conexão e tente novamente.')
    } finally {
      setChecking(false)
    }
  }

  return (
    <>
      <div className="mt-5 grid grid-cols-2 gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => {
            setModo('email')
            setError('')
          }}
          aria-pressed={modo === 'email'}
          className={`flex h-10 items-center justify-center gap-1.5 rounded-lg text-xs font-bold transition-colors sm:text-sm ${
            modo === 'email' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Mail className="h-4 w-4" /> E-mail da compra
        </button>
        <button
          type="button"
          onClick={() => {
            setModo('codigo')
            setError('')
          }}
          aria-pressed={modo === 'codigo'}
          className={`flex h-10 items-center justify-center gap-1.5 rounded-lg text-xs font-bold transition-colors sm:text-sm ${
            modo === 'codigo' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <KeyRound className="h-4 w-4" /> Código de acesso
        </button>
      </div>

      <Card className="mt-3">
        <CardContent className="space-y-4 p-5">
          {modo === 'email' ? (
            <>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-amber-500" />
                <h2 className="text-base font-bold text-slate-900">Ativar com e-mail da compra</h2>
                <Badge className="ml-auto gap-1 bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                  <BadgeCheck className="h-3 w-3" /> Recomendado
                </Badge>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="access-email" className="text-sm font-medium text-slate-700">
                  E-mail usado no pagamento (Cakto)
                </Label>
                <Input
                  id="access-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="voce@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError('')
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && !checking && void handleActivate()}
                  className="h-11"
                />
              </div>
              {error && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs leading-relaxed text-red-700">
                  {error}
                </p>
              )}
              <Button
                onClick={() => void handleActivate()}
                disabled={checking}
                className="h-12 w-full bg-slate-900 text-base font-bold text-white hover:bg-slate-800"
              >
                {checking ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Verificando assinatura...
                  </>
                ) : (
                  <>
                    <BadgeCheck className="mr-2 h-5 w-5" /> Verificar e ativar
                  </>
                )}
              </Button>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Use o mesmo e-mail informado no checkout da Cakto. Assinaturas ativas são confirmadas na hora —
                sem código. Dúvidas? {SITE.supportEmail}.
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-amber-500" />
                <h2 className="text-base font-bold text-slate-900">Tenho um código de acesso</h2>
                <Badge className="ml-auto gap-1 bg-amber-100 text-amber-800 hover:bg-amber-100">
                  <BadgeCheck className="h-3 w-3" /> Assinantes
                </Badge>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="access-code" className="text-sm font-medium text-slate-700">
                  Código de acesso
                </Label>
                <Input
                  id="access-code"
                  placeholder="SPP-XXXX-XXXX-XXXX"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase())
                    setError('')
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && !checking && void handleActivate()}
                  autoCapitalize="characters"
                  autoCorrect="off"
                  spellCheck={false}
                  className="h-11 font-mono tracking-wider"
                />
              </div>
              {error && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs leading-relaxed text-red-700">
                  {error}
                </p>
              )}
              <Button
                onClick={() => void handleActivate()}
                disabled={checking}
                className="h-12 w-full bg-slate-900 text-base font-bold text-white hover:bg-slate-800"
              >
                {checking ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Verificando...
                  </>
                ) : (
                  <>
                    <KeyRound className="mr-2 h-5 w-5" /> Ativar acesso
                  </>
                )}
              </Button>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Não achou seu código? Verifique o e-mail de confirmação da Cakto (inclusive a caixa de spam) ou
                fale com o suporte: {SITE.supportEmail}.
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {caktoOk === false && (
        <p className="mt-4 text-center text-[11px] text-slate-400">
          Verificação automática por e-mail em manutenção neste momento — use a aba “Código de acesso”.
        </p>
      )}
    </>
  )
}
