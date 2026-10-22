'use client'

import { useEffect, useMemo, useState } from 'react'
import { Crown, Hourglass } from 'lucide-react'

/**
 * Cronômetro de urgência do teste grátis — dias · horas · min · s
 * Fica fixo no topo (dentro do header sticky) enquanto o aluno estiver
 * em período de avaliação, empurrando a decisão de assinar.
 */
export function TrialCountdown({
  trialEndsAt,
  trialDaysLeft,
  onSubscribe,
  compact = false,
}: {
  /** ISO do fim exato do teste (vem do servidor em /api/auth/me) */
  trialEndsAt?: string | null
  /** Fallback quando o servidor ainda não informa o instante exato */
  trialDaysLeft?: number | null
  onSubscribe?: () => void
  /** true = versão compacta (sem botão assinar) */
  compact?: boolean
}) {
  const [now, setNow] = useState(() => Date.now())

  // Fim do teste: ISO exato do servidor; fallback = dias restantes informados
  const endMs = useMemo(() => {
    if (trialEndsAt) {
      const parsed = new Date(trialEndsAt).getTime()
      if (Number.isFinite(parsed)) return parsed
    }
    if (typeof trialDaysLeft === 'number' && trialDaysLeft > 0) {
      return Date.now() + trialDaysLeft * 86_400_000
    }
    return null
  }, [trialEndsAt, trialDaysLeft])

  useEffect(() => {
    if (endMs === null) return
    const iv = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(iv)
  }, [endMs])

  if (endMs === null) return null

  const diff = endMs - now
  if (diff <= 0) {
    return (
      <div
        className={`w-full bg-red-600 text-white ${compact ? 'px-3 py-1.5 text-[11px]' : 'px-4 py-2 text-xs'}`}
        role="timer"
        aria-label="Teste grátis encerrado"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 font-bold">
          <Hourglass className="h-3.5 w-3.5 shrink-0" />
          <span>Seu teste grátis terminou — assine para continuar estudando!</span>
          {onSubscribe && (
            <button
              type="button"
              onClick={onSubscribe}
              className="ml-1 rounded-full bg-white px-2.5 py-0.5 text-[11px] font-black text-red-700 transition-colors hover:bg-red-50"
            >
              Assinar
            </button>
          )}
        </div>
      </div>
    )
  }

  const totalSec = Math.floor(diff / 1000)
  const d = Math.floor(totalSec / 86_400)
  const h = Math.floor((totalSec % 86_400) / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  const urgente = diff < 24 * 3_600_000

  return (
    <div
      className={`w-full text-white transition-colors ${
        urgente ? 'bg-red-600 animate-pulse' : 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600'
      } ${compact ? 'px-3 py-1.5 text-[11px]' : 'px-4 py-2 text-xs'}`}
      role="timer"
      aria-label={`Teste grátis termina em ${d} dias, ${h} horas, ${m} minutos e ${s} segundos`}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-2 gap-y-1 font-bold">
        <span className="flex items-center gap-1.5">
          <Hourglass className="h-3.5 w-3.5 shrink-0" />
          Teste grátis termina em
        </span>
        <span className="font-black tabular-nums tracking-tight" suppressHydrationWarning>
          {d > 0 ? `${d}d ` : ''}
          {pad(h)}h:{pad(m)}m:{pad(s)}s
        </span>
        {onSubscribe && (
          <button
            type="button"
            onClick={onSubscribe}
            className="ml-1 flex items-center gap-1 rounded-full bg-slate-950 px-3 py-0.5 text-[11px] font-black text-amber-300 transition-transform hover:scale-105"
          >
            <Crown className="h-3 w-3" /> Assinar
          </button>
        )}
      </div>
    </div>
  )
}
