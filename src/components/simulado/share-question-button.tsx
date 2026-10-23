'use client'

import { useState } from 'react'
import { Loader2, Share2 } from 'lucide-react'
import { captureAndShareQuestion } from '@/lib/question-share'

export type ShareState = 'idle' | 'correct' | 'wrong' | 'answered'

/**
 * BOTÃO COMPARTILHAR QUESTÃO — tira automaticamente uma imagem da tela da
 * questão que está sendo resolvida e prepara para compartilhar nas redes
 * sociais / grupos de WhatsApp. O botão em si fica oculto na captura
 * (data-share-hide) e o card recebe faixa de marca do app.
 *
 * DESTAQUE VIRAL: quando o aluno responde (acerto/erro), o botão ganha um
 * brilho pulsante colorido convidando para compartilhar o resultado —
 * acerto = verde ("Compartilhe seu acerto!"), erro = vermelho, prova
 * (sem gabarito) = âmbar neutro.
 */
export function ShareQuestionButton({
  targetId,
  className = '',
  state = 'idle',
  compact = false,
}: {
  /** id do elemento (card da questão) a capturar */
  targetId: string
  className?: string
  /** destaque após responder: acerto verde, erro vermelho, resposta em prova âmbar */
  state?: ShareState
  /** versão compacta (só ícone, círculo) usada na barra de ações do card */
  compact?: boolean
}) {
  const [busy, setBusy] = useState(false)

  const handle = async () => {
    if (busy) return
    const node = document.getElementById(targetId)
    if (!node) return
    setBusy(true)
    try {
      await captureAndShareQuestion(node)
    } catch {
      // falha silenciosa: html-to-image pode falhar com imagens externas (CORS)
    } finally {
      setBusy(false)
    }
  }

  const highlight =
    state === 'correct'
      ? 'border-emerald-400 bg-emerald-400/15 text-emerald-300 shadow-[0_0_16px_rgba(52,211,153,0.55)] ring-2 ring-emerald-400/50'
      : state === 'wrong'
        ? 'border-rose-400 bg-rose-400/15 text-rose-300 shadow-[0_0_16px_rgba(251,113,133,0.5)] ring-2 ring-rose-400/50'
        : state === 'answered'
          ? 'border-amber-300 bg-amber-300/15 text-amber-200 shadow-[0_0_16px_rgba(252,211,77,0.5)] ring-2 ring-amber-300/50'
          : ''

  const label =
    busy
      ? 'Gerando imagem...'
      : state === 'correct'
        ? 'Compartilhe seu acerto!'
        : state === 'wrong'
          ? 'Desafie um amigo!'
          : state === 'answered'
            ? 'Compartilhar questão'
            : 'Compartilhar'

  if (compact) {
    return (
      <button
        type="button"
        data-share-hide="true"
        onClick={handle}
        disabled={busy}
        aria-label={`Compartilhar esta questão nas redes sociais${state !== 'idle' ? ` — ${label}` : ''}`}
        title={
          state === 'correct'
            ? 'Você acertou! Compartilhe com os amigos e desafie quem estudou com você'
            : state === 'wrong'
              ? 'Questão errada — compartilhe para estudar em grupo'
              : 'Compartilhar esta questão com os amigos (gera imagem da questão)'
        }
        className={`relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-all disabled:opacity-60 ${
          highlight || 'border-zinc-600 bg-transparent text-zinc-400 hover:border-amber-300 hover:text-amber-300'
        } ${state !== 'idle' ? 'animate-pulse' : ''} ${className}`}
      >
        {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Share2 className="h-5 w-5" />}
        {state !== 'idle' && !busy && (
          <span
            data-share-hide="true"
            className={`absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 ${
              state === 'correct' ? 'border-emerald-300 bg-emerald-400' : state === 'wrong' ? 'border-rose-300 bg-rose-400' : 'border-amber-200 bg-amber-300'
            }`}
          />
        )}
      </button>
    )
  }

  return (
    <button
      type="button"
      data-share-hide="true"
      onClick={handle}
      disabled={busy}
      aria-label={`Compartilhar esta questão nas redes sociais${state !== 'idle' ? ` — ${label}` : ''}`}
      title={
        state === 'correct'
          ? 'Você acertou! Compartilhe com os amigos e desafie quem estudou com você'
          : state === 'wrong'
            ? 'Questão errada — compartilhe para estudar em grupo'
            : 'Compartilhar esta questão com os amigos (gera imagem da questão)'
      }
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-60 ${
        highlight || 'border-slate-200 bg-white text-slate-500 hover:border-emerald-300 hover:text-emerald-600'
      } ${state !== 'idle' ? 'animate-pulse' : ''} ${className}`}
    >
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Share2 className="h-3.5 w-3.5" />}
      {label}
      {state !== 'idle' && !busy && (
        <span
          data-share-hide="true"
          className={`h-2 w-2 rounded-full ${state === 'correct' ? 'bg-emerald-400' : state === 'wrong' ? 'bg-rose-400' : 'bg-amber-300'}`}
        />
      )}
    </button>
  )
}
