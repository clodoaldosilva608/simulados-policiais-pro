'use client'

import { useEffect, useRef, useState } from 'react'
import { Megaphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { fetchPopups, markPopupShown, popupAllowed, type PopupDto } from '@/lib/bank'

/**
 * CAMADA DE POP-UPS DO APP — lê os pop-ups criados no painel admin e exibe
 * conforme a tela atual ("onde"), janela de datas ("quando") e frequência
 * por usuário ("quantas vezes": 1x, por sessão, 1x/dia ou sempre).
 */

const TONES: Record<string, { icon: string; titleCls: string }> = {
  amber: { icon: 'bg-amber-400 text-slate-950', titleCls: 'text-slate-900' },
  emerald: { icon: 'bg-emerald-500 text-white', titleCls: 'text-slate-900' },
  sky: { icon: 'bg-sky-500 text-white', titleCls: 'text-slate-900' },
}

export function PopupLayer({ screen, visible }: { screen: string; visible: boolean }) {
  const [shown, setShown] = useState<{ popup: PopupDto; screen: string } | null>(null)
  const [cache, setCache] = useState<PopupDto[]>([])
  const cacheFor = useRef<string>('')
  const timer = useRef<number | null>(null)

  // carrega os pop-ups elegíveis quando a tela muda
  useEffect(() => {
    if (!visible) return
    let alive = true
    void fetchPopups(screen).then((popups) => {
      if (!alive) return
      setCache(popups)
      cacheFor.current = screen
    })
    return () => {
      alive = false
    }
  }, [screen, visible])

  // decide qual exibir (respeitando frequência por usuário) + atraso configurado
  useEffect(() => {
    if (timer.current) window.clearTimeout(timer.current)
    if (!visible || cacheFor.current !== screen || cache.length === 0) return
    const eligible = cache.filter((p) => popupAllowed(p))
    if (eligible.length === 0) return
    // prioridade: o mais recente criado
    const chosen = eligible[eligible.length - 1]
    const delay = Math.max(0, Math.min(600, chosen.delaySec ?? 0)) * 1000
    timer.current = window.setTimeout(() => {
      setShown({ popup: chosen, screen })
      markPopupShown(chosen)
    }, delay)
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [screen, cache, visible])

  const close = () => setShown(null)

  // só renderiza o pop-up AGENDADO para a tela atual (troca de tela descarta)
  if (!shown || shown.screen !== screen) return null
  const popup = shown.popup
  const tone = TONES[popup.tone ?? 'amber'] ?? TONES.amber

  return (
    <Dialog open onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-sm rounded-2xl border-slate-200 bg-white p-0 overflow-hidden">
        <div className={`flex h-14 items-center justify-center ${tone.icon}`}>
          <Megaphone className="h-7 w-7" />
        </div>
        <div className="space-y-3 p-5">
          <DialogHeader className="space-y-1.5 text-left">
            <DialogTitle className={`text-lg font-black leading-tight ${tone.titleCls}`}>{popup.title}</DialogTitle>
            <DialogDescription className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
              {popup.body}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2">
            {popup.ctaLabel && popup.ctaUrl && (
              <Button
                onClick={() => {
                  window.open(popup.ctaUrl!, '_blank', 'noopener,noreferrer')
                  close()
                }}
                className="h-11 w-full bg-emerald-600 font-bold text-white hover:bg-emerald-700"
              >
                {popup.ctaLabel}
              </Button>
            )}
            <Button variant="ghost" onClick={close} className="h-9 w-full text-xs font-semibold text-slate-500">
              Continuar estudando
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
