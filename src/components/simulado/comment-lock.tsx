'use client'

import { Crown, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SITE } from '@/config/site'

/**
 * Cartão de comentário BLOQUEADO (plano grátis) — substitui o comentário do
 * professor nas questões e abre o pop-up de upgrade. Mensagem curta e com
 * proposta de valor: o "porquê" da resposta é o que faz a nota subir.
 */
export function CommentLocked({ onUpgrade }: { onUpgrade: () => void }) {
  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3.5">
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-amber-700">
        <Lock className="h-3.5 w-3.5" /> Comentário do professor
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
        A explicação completa desta questão é exclusiva do plano <b>Assinante</b> — entender o porquê de cada
        resposta é o caminho mais curto para a aprovação.
      </p>
      <Button
        onClick={onUpgrade}
        size="sm"
        className="mt-3 h-9 bg-amber-500 font-bold text-slate-950 shadow-sm hover:bg-amber-400"
      >
        <Crown className="mr-1.5 h-4 w-4" /> Desbloquear comentários — {SITE.price}{SITE.period}
      </Button>
    </div>
  )
}
