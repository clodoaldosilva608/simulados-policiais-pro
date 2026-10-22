'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  BadgeCheck,
  Clock,
  KeyRound,
  Loader2,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { SITE } from '@/config/site'
import { trialDaysLeft, type LicenseState } from '@/lib/license'

interface AccessScreenProps {
  /** Licença atual (null quando não há) */
  license: LicenseState | null
  onBack: () => void
  /** Ativação validada com sucesso (identificador = e-mail ou código) */
  onActivated: (id: string) => void
  /** Iniciar/continuar teste grátis (e-mail opcional para vínculo do acesso) */
  onStartTrial: (email?: string) => void
  /** Remove a licença deste aparelho */
  onSignOut: () => void
}

type Modo = 'email' | 'codigo'

export function AccessScreen({ license, onBack, onActivated, onStartTrial, onSignOut }: AccessScreenProps) {
  const { toast } = useToast()
  const [modo, setModo] = useState<Modo>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [trialEmail, setTrialEmail] = useState('')
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState('')
  const [serverCakto, setServerCakto] = useState<boolean | null>(null)

  useEffect(() => {
    fetch('/api/license')
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { cakto?: boolean } | null) => setServerCakto(Boolean(d?.cakto)))
      .catch(() => setServerCakto(null))
  }, [])

  // Já está em teste grátis (mesmo expirado mostramos situação)
  const trialAtivo =
    license?.status === 'trial' && license.trialStartedAt && trialDaysLeft(license) > 0

  const handleActivate = async () => {
    setError('')

    if (modo === 'email') {
      const cleanEmail = email.trim().toLowerCase()
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        setError('Digite o e-mail que você usou na compra na Cakto.')
        return
      }
      setChecking(true)
      try {
        const res = await fetch('/api/license', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail }),
        })
        const data = (await res.json()) as { valid?: boolean; message?: string }
        if (data.valid) {
          toast({
            title: 'Acesso ativado!',
            description: 'Assinatura ativa confirmada neste aparelho. Bons estudos!',
          })
          onActivated(cleanEmail)
        } else {
          setError(data.message ?? 'Não encontramos assinatura ativa para este e-mail.')
        }
      } catch {
        setError('Não foi possível verificar agora. Verifique sua conexão e tente novamente.')
      } finally {
        setChecking(false)
      }
      return
    }

    // modo código
    const clean = code.trim().toUpperCase()
    if (!clean) {
      setError('Digite o código que você recebeu por e-mail após a compra.')
      return
    }
    setChecking(true)
    try {
      const res = await fetch('/api/license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: clean }),
      })
      const data = (await res.json()) as { valid?: boolean; message?: string }
      if (data.valid) {
        toast({
          title: 'Acesso ativado!',
          description: 'Sua assinatura está ativa neste aparelho. Bons estudos!',
        })
        onActivated(clean)
      } else {
        setError(data.message ?? 'Código inválido. Confira o e-mail de compra.')
      }
    } catch {
      setError('Não foi possível verificar o código agora. Verifique sua conexão e tente novamente.')
    } finally {
      setChecking(false)
    }
  }

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
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Acessar minha conta</h1>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
            Assinou na Cakto? Ative com o <strong>e-mail da compra</strong> — a verificação é automática. Ou use um
            código de acesso.
          </p>

          {/* Status de assinante */}
          {license?.status === 'active' && (
            <Card className="mt-5 border-emerald-200 bg-emerald-50">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center gap-3">
                  <BadgeCheck className="h-6 w-6 shrink-0 text-emerald-600" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-emerald-900">Assinatura ativa neste aparelho</p>
                    <p className="truncate text-xs text-emerald-700">{license.code}</p>
                  </div>
                  <Button
                    onClick={onBack}
                    className="shrink-0 bg-emerald-600 font-bold text-white hover:bg-emerald-700"
                  >
                    Entrar
                  </Button>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      type="button"
                      className="text-xs font-semibold text-emerald-800 underline underline-offset-2 hover:text-emerald-950"
                    >
                      Usar outro acesso / sair deste aparelho
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Sair deste aparelho?</AlertDialogTitle>
                      <AlertDialogDescription>
                        O acesso deste aparelho será removido. Seu progresso de estudos e PDFs salvos continuam no
                        aparelho, mas você precisará ativar novamente para voltar a usar o app.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={onSignOut}
                        className="bg-red-600 text-white hover:bg-red-700"
                      >
                        Sair
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          )}

          {/* Status do teste grátis */}
          {license?.status === 'trial' && license.trialStartedAt && (
            <Card className="mt-5 border-emerald-200 bg-emerald-50">
              <CardContent className="flex items-center gap-3 p-4">
                {trialAtivo ? (
                  <>
                    <Clock className="h-6 w-6 shrink-0 text-emerald-600" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-emerald-900">
                        Teste grátis ativo — {trialDaysLeft(license)}{' '}
                        {trialDaysLeft(license) === 1 ? 'dia restante' : 'dias restantes'}
                      </p>
                      <p className="text-xs text-emerald-700">
                        Aproveite: todas as provas liberadas durante o teste.
                      </p>
                    </div>
                    <Button
                      onClick={onStartTrial.bind(null, trialEmail.trim().toLowerCase() || undefined)}
                      className="shrink-0 bg-emerald-600 font-bold text-white hover:bg-emerald-700"
                    >
                      Entrar
                    </Button>
                  </>
                ) : (
                  <>
                    <Clock className="h-6 w-6 shrink-0 text-slate-400" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-700">Teste grátis encerrado</p>
                      <p className="text-xs text-slate-500">
                        Ative sua assinatura com o e-mail da compra para continuar estudando.
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Alternador e-mail | código */}
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

          {/* Teste grátis */}
          {!trialAtivo && (
            <Card className="mt-4 border-dashed">
              <CardContent className="flex flex-col items-center gap-3 p-5 text-center sm:flex-row sm:text-left">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100">
                  <Sparkles className="h-6 w-6 text-amber-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900">Ainda não assinou?</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                    Experimente tudo por {SITE.trialDays} dias grátis, sem cartão de crédito.
                  </p>
                </div>
                <Button
                  onClick={() => onStartTrial(trialEmail.trim().toLowerCase() || undefined)}
                  className="w-full shrink-0 bg-amber-400 font-black text-slate-950 hover:bg-amber-300 sm:w-auto"
                >
                  Testar grátis
                </Button>
              </CardContent>
              <CardContent className="-mt-2 px-5 pb-5">
                <div className="space-y-1.5">
                  <Label htmlFor="trial-email" className="text-xs font-medium text-slate-500">
                    Seu e-mail (opcional) — para recuperar seu acesso e receber dicas
                  </Label>
                  <Input
                    id="trial-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="voce@email.com"
                    value={trialEmail}
                    onChange={(e) => setTrialEmail(e.target.value)}
                    className="h-10"
                  />
                  {trialEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trialEmail.trim()) && (
                    <p className="text-[11px] text-amber-700">
                      E-mail incompleto — você ainda pode testar, mas não poderemos recuperar seu acesso.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {serverCakto === false && (
            <p className="mt-4 text-center text-[11px] text-slate-400">
              Verificação automática por e-mail em manutenção neste momento — use a aba “Código de acesso”.
            </p>
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
