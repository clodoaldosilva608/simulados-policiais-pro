'use client'

import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  BadgeCheck,
  Camera,
  CheckCircle2,
  Crown,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  LifeBuoy,
  Pencil,
  Smartphone,
  Sparkles,
  Trash2,
  UserRound,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { SITE } from '@/config/site'
import type { SessionApi } from '@/lib/session'

interface AccountScreenProps {
  session: SessionApi
  onBack: () => void
  /** Abre a tela de assinatura/ativação (AccessScreen) */
  onManageAccess: () => void
  /** Abre a tela de suporte (para pedir troca de e-mail, etc.) */
  onOpenSupport: () => void
}

const MAX_DIMENSION = 256
const MAX_PHOTO_CHARS = 160_000

/** Redimensiona a foto no aparelho (256px, JPEG ~0.82) e devolve data URL */
async function fileToDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file)
  try {
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
    const w = Math.max(1, Math.round(bitmap.width * scale))
    const h = Math.max(1, Math.round(bitmap.height * scale))
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('canvas')
    ctx.drawImage(bitmap, 0, 0, w, h)
    return canvas.toDataURL('image/jpeg', 0.82)
  } finally {
    bitmap.close()
  }
}

function fmtDate(ms?: number | string | null): string {
  if (!ms) return '—'
  const d = new Date(ms)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

/**
 * Aba "Minha conta": dados completos do aluno + edição do que é permitido.
 * • Nome e foto: editáveis aqui (foto segue a conta entre aparelhos).
 * • E-mail: TRAVADO — é a identidade de login e a chave de ativação;
 *   mudança somente pelo suporte (botão dedicado).
 * • Senha: troca com verificação da senha atual.
 */
export function AccountScreen({ session, onBack, onManageAccess, onOpenSupport }: AccountScreenProps) {
  const { toast } = useToast()
  const user = session.user

  const [name, setName] = useState(user?.name ?? '')
  const [savingName, setSavingName] = useState(false)
  const [photo, setPhoto] = useState<string | null>(user?.photo ?? null)
  const [photoBusy, setPhotoBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [savingPwd, setSavingPwd] = useState(false)
  const [pwdOk, setPwdOk] = useState('')

  useEffect(() => {
    setName(user?.name ?? '')
    setPhoto(user?.photo ?? null)
  }, [user?.name, user?.photo])

  const nameDirty = (name ?? '').trim() !== (user?.name ?? '').trim()

  const saveName = async () => {
    const next = name.trim()
    if (next.length < 2) {
      toast({ title: 'Nome muito curto', description: 'Digite pelo menos 2 caracteres.' })
      return
    }
    setSavingName(true)
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: next }),
      })
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string }
      if (data.ok) {
        await session.refresh()
        toast({ title: 'Nome atualizado!', description: 'Seus dados foram salvos na conta.' })
      } else {
        toast({ title: 'Não foi possível salvar', description: data.message ?? 'Tente novamente.' })
      }
    } catch {
      toast({ title: 'Falha de conexão', description: 'Verifique sua internet e tente novamente.' })
    } finally {
      setSavingName(false)
    }
  }

  const pickPhoto = () => fileRef.current?.click()

  const handlePhotoFile = async (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Arquivo inválido', description: 'Escolha uma imagem JPG ou PNG.' })
      return
    }
    setPhotoBusy(true)
    try {
      const dataUrl = await fileToDataUrl(file)
      if (dataUrl.length > MAX_PHOTO_CHARS) {
        toast({ title: 'Imagem muito grande', description: 'Tente uma foto menor.' })
        return
      }
      const res = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo: dataUrl }),
      })
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string }
      if (data.ok) {
        await session.refresh()
        toast({ title: 'Foto atualizada!', description: 'Sua foto de perfil foi salva.' })
      } else {
        toast({ title: 'Não foi possível salvar', description: data.message ?? 'Tente outra imagem.' })
      }
    } catch {
      toast({ title: 'Não foi possível carregar a imagem', description: 'Tente outro arquivo.' })
    } finally {
      setPhotoBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const removePhoto = async () => {
    setPhotoBusy(true)
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo: null }),
      })
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string }
      if (data.ok) {
        await session.refresh()
        toast({ title: 'Foto removida' })
      } else {
        toast({ title: 'Não foi possível remover', description: data.message ?? 'Tente novamente.' })
      }
    } catch {
      toast({ title: 'Falha de conexão', description: 'Tente novamente.' })
    } finally {
      setPhotoBusy(false)
    }
  }

  const savePassword = async () => {
    setPwdOk('')
    if (!currentPwd || !newPwd || !confirmPwd) {
      toast({ title: 'Preencha os três campos', description: 'Senha atual, nova senha e confirmação.' })
      return
    }
    if (newPwd.length < 6) {
      toast({ title: 'Senha curta', description: 'A nova senha deve ter pelo menos 6 caracteres.' })
      return
    }
    if (newPwd !== confirmPwd) {
      toast({ title: 'As senhas não conferem', description: 'Confirme a nova senha corretamente.' })
      return
    }
    setSavingPwd(true)
    try {
      const res = await fetch('/api/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd }),
      })
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string }
      if (data.ok) {
        setPwdOk(data.message ?? 'Senha alterada com sucesso!')
        setCurrentPwd('')
        setNewPwd('')
        setConfirmPwd('')
        toast({ title: 'Senha alterada!', description: 'Use a nova senha no próximo login.' })
      } else {
        toast({ title: 'Não foi possível alterar', description: data.message ?? 'Tente novamente.' })
      }
    } catch {
      toast({ title: 'Falha de conexão', description: 'Verifique sua internet e tente novamente.' })
    } finally {
      setSavingPwd(false)
    }
  }

  const access = session.access
  const statusLabel =
    access?.status === 'active'
      ? 'Assinante'
      : access?.status === 'trial'
        ? 'Teste grátis'
        : access?.status === 'canceled'
          ? 'Assinatura cancelada'
          : 'Acesso expirado'
  const trialLabel = access?.trialDaysLeft != null && access.trialDaysLeft > 0
    ? `${access.trialDaysLeft} ${access.trialDaysLeft === 1 ? 'dia' : 'dias'}`
    : 'menos de 1 dia'

  const initial = (user?.name ?? user?.email ?? 'A').trim().charAt(0).toUpperCase() || 'A'
  const deviceLabel = [user?.device, user?.platform].filter(Boolean).join(' • ') || '—'

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Cabeçalho */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900 text-white shadow-lg">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3.5">
          <Button
            onClick={onBack}
            variant="ghost"
            size="icon"
            aria-label="Voltar"
            className="h-9 w-9 shrink-0 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <p className="truncate text-base font-bold leading-tight">Minha conta</p>
            <p className="truncate text-xs text-slate-400">Seus dados, foto de perfil e segurança</p>
          </div>
          <UserRound className="ml-auto h-5 w-5 shrink-0 text-amber-400" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 space-y-5 px-4 py-6">
        {/* Perfil: foto + nome */}
        <section aria-label="Perfil" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                {photo ? (
                   
                  <img
                    src={photo}
                    alt="Sua foto de perfil"
                    className="h-24 w-24 rounded-full border-2 border-slate-200 object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-900 text-3xl font-bold text-amber-300">
                    {initial}
                  </div>
                )}
                {photoBusy && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-950/60">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={pickPhoto}
                  disabled={photoBusy}
                  aria-label="Alterar foto de perfil"
                  className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-amber-500 text-slate-950 shadow transition-colors hover:bg-amber-400 disabled:opacity-60"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={pickPhoto}
                  disabled={photoBusy}
                  className="text-xs font-semibold text-amber-700 underline-offset-2 hover:underline disabled:opacity-60"
                >
                  Alterar foto
                </button>
                {photo && (
                  <>
                    <span className="text-xs text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={() => void removePhoto()}
                      disabled={photoBusy}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 underline-offset-2 hover:underline disabled:opacity-60"
                    >
                      <Trash2 className="h-3 w-3" /> Remover
                    </button>
                  </>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => void handlePhotoFile(e.target.files?.[0])}
              />
            </div>

            <div className="w-full min-w-0 flex-1 space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="account-name" className="text-sm font-semibold text-slate-700">
                  Nome
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="account-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={80}
                    placeholder="Seu nome"
                    className="h-11 flex-1"
                  />
                  <Button
                    onClick={() => void saveName()}
                    disabled={savingName || !nameDirty}
                    className="h-11 bg-slate-900 font-bold text-white hover:bg-slate-800 disabled:opacity-40"
                  >
                    {savingName ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pencil className="h-4 w-4" />}
                    Salvar
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="account-email" className="text-sm font-semibold text-slate-700">
                  E-mail (não editável)
                </Label>
                <div className="flex items-center gap-2 rounded-md border border-input bg-slate-100/70 px-3 py-2.5">
                  <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="min-w-0 flex-1 truncate text-sm text-slate-700">{user?.email ?? '—'}</span>
                  <Lock className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-label="E-mail travado" />
                </div>
                <p className="text-xs leading-relaxed text-slate-500">
                  O e-mail é a identidade da sua conta e não pode ser alterado pelo app. Precisa trocar? Fale
                  com o suporte.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onOpenSupport}
                  className="h-9 border-slate-300 font-bold text-slate-700 hover:bg-slate-100"
                >
                  <LifeBuoy className="mr-1.5 h-4 w-4" /> Alterar e-mail pelo suporte
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Dados da conta */}
        <section aria-label="Dados da conta" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-slate-900">Dados da conta</p>
          <dl className="mt-3 space-y-2.5 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="shrink-0 text-slate-500">Situação</dt>
              <dd
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                  access?.status === 'active'
                    ? 'bg-emerald-100 text-emerald-800'
                    : access?.status === 'trial'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                }`}
              >
                {access?.status === 'active' ? (
                  <Crown className="h-3.5 w-3.5" />
                ) : access?.status === 'trial' ? (
                  <Sparkles className="h-3.5 w-3.5" />
                ) : (
                  <XCircle className="h-3.5 w-3.5" />
                )}
                {statusLabel}
              </dd>
            </div>
            {access?.status === 'trial' && (
              <div className="flex items-center justify-between gap-3">
                <dt className="shrink-0 text-slate-500">Teste termina em</dt>
                <dd className="min-w-0 truncate text-right font-semibold text-slate-800">
                  {fmtDate(access.trialEndsAt)} ({trialLabel})
                </dd>
              </div>
            )}
            {access?.status === 'active' && (
              <div className="flex items-center justify-between gap-3">
                <dt className="shrink-0 text-slate-500">Assinante desde</dt>
                <dd className="min-w-0 truncate text-right font-semibold text-slate-800">
                  {fmtDate(access.trialEndsAt ?? undefined)}
                </dd>
              </div>
            )}
            <div className="flex items-center justify-between gap-3">
              <dt className="shrink-0 text-slate-500">Conta criada em</dt>
              <dd className="min-w-0 truncate text-right font-semibold text-slate-800">{fmtDate(user?.createdAt)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="shrink-0 text-slate-500">Aparelho vinculado</dt>
              <dd className="inline-flex min-w-0 items-center gap-1.5 text-right font-semibold text-slate-800">
                <Smartphone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span className="truncate">{deviceLabel}</span>
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="shrink-0 text-slate-500">E-mail</dt>
              <dd className="min-w-0 truncate text-right font-semibold text-slate-800">{user?.email ?? '—'}</dd>
            </div>
          </dl>
          <Button
            variant="outline"
            onClick={onManageAccess}
            className="mt-4 h-11 w-full border-slate-300 font-bold text-slate-700 hover:bg-slate-100"
          >
            <BadgeCheck className="mr-2 h-4 w-4" /> Gerenciar assinatura / ativação
          </Button>
        </section>

        {/* Segurança: troca de senha */}
        <section aria-label="Segurança" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <KeyRound className="h-4 w-4 text-slate-500" /> Alterar senha
          </p>
          {pwdOk && (
            <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
              <CheckCircle2 className="h-4 w-4 shrink-0" /> {pwdOk}
            </p>
          )}
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="pwd-current" className="text-xs font-semibold text-slate-600">
                Senha atual
              </Label>
              <Input
                id="pwd-current"
                type="password"
                value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)}
                autoComplete="current-password"
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pwd-new" className="text-xs font-semibold text-slate-600">
                Nova senha
              </Label>
              <Input
                id="pwd-new"
                type="password"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                autoComplete="new-password"
                placeholder="Mínimo 6 caracteres"
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pwd-confirm" className="text-xs font-semibold text-slate-600">
                Confirmar nova senha
              </Label>
              <Input
                id="pwd-confirm"
                type="password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                autoComplete="new-password"
                className="h-11"
              />
            </div>
          </div>
          <Button
            onClick={() => void savePassword()}
            disabled={savingPwd}
            className="mt-3 h-11 w-full bg-slate-900 font-bold text-white hover:bg-slate-800 disabled:opacity-60 sm:w-auto"
          >
            {savingPwd ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
            {savingPwd ? 'Salvando...' : 'Trocar senha'}
          </Button>
        </section>

        <p className="px-1 pb-2 text-center text-xs leading-relaxed text-slate-400">
          {SITE.name} • Precisa de ajuda? Escreva para {SITE.supportEmail}
        </p>
      </main>
    </div>
  )
}
