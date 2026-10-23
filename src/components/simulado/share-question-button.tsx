'use client'

import { useState } from 'react'
import { Loader2, Share2 } from 'lucide-react'
import { captureAndShareQuestion } from '@/lib/question-share'

/**
 * BOTÃO COMPARTILHAR QUESTÃO — tira automaticamente uma imagem da tela da
 * questão que está sendo resolvida e prepara para compartilhar nas redes
 * sociais / grupos de WhatsApp. O botão em si fica oculto na captura
 * (data-share-hide) e o card recebe faixa de marca do app.
 */
export function ShareQuestionButton({
  targetId,
  className = '',
}: {
  /** id do elemento (card da questão) a capturar */
  targetId: string
  className?: string
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

  return (
    <button
      type="button"
      data-share-hide="true"
      onClick={handle}
      disabled={busy}
      aria-label="Compartilhar esta questão nas redes sociais"
      title="Compartilhar esta questão com os amigos (gera imagem da questão)"
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-60 ${
        className || 'border-slate-200 bg-white text-slate-500 hover:border-emerald-300 hover:text-emerald-600'
      }`}
    >
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Share2 className="h-3.5 w-3.5" />}
      {busy ? 'Gerando imagem...' : 'Compartilhar'}
    </button>
  )
}
