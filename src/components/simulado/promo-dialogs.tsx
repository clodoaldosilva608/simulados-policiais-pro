'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen,
  CheckCheck,
  Crown,
  FileText,
  Link2,
  MessageCircle,
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
  Timer,
  TrendingUp,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { SITE } from '@/config/site'
import { inviteMessage, SHARE_URL, shareApp, telegramLink, whatsappLink } from '@/lib/share'

/* ------------------------------------------------------------------ */
/*  POP-UP ASSINANTE — oferta de valor acessível com CTA convincente  */
/* ------------------------------------------------------------------ */

export function SubscriberPromoDialog({
  open,
  onOpenChange,
  onSubscribe,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubscribe: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-md">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
          {/* Cabeçalho escuro com selo */}
          <div className="relative bg-slate-950 px-6 pb-5 pt-6 text-center text-white">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400 shadow-lg shadow-amber-400/30">
              <Crown className="h-7 w-7 text-slate-950" />
            </div>
            <DialogHeader className="mt-3 space-y-1.5 text-center">
              <DialogTitle className="text-xl font-black leading-tight text-white">
                Você está no caminho certo. Não pare agora!
              </DialogTitle>
              <DialogDescription className="mx-auto max-w-xs text-sm leading-relaxed text-slate-300">
                Quem resolve questões todos os dias passa. Garanta o acesso completo por menos de{' '}
                <b className="text-amber-300">R$ 0,60 por dia</b> — o preço de um café de esquina.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-6 py-5">
            <ul className="space-y-2.5 text-sm text-slate-700">
              {[
                { icon: BookOpen, text: 'Todas as provas oficiais liberadas — PF, PC, PM, PRF e Polícia Penal' },
                { icon: FileText, text: 'PDFs ilimitados virando simulado com IA, para sempre' },
                { icon: CheckCheck, text: 'Caderno de erros com repetição espaçada 3/7/15 dias' },
                { icon: Timer, text: 'Pomodoro, metas semanais e gráfico de evolução' },
                { icon: TrendingUp, text: 'Estatísticas completas por disciplina para guiar seu estudo' },
              ].map((item) => (
                <li key={item.text} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                    <item.icon className="h-3 w-3 text-emerald-700" />
                  </span>
                  <span className="leading-snug">{item.text}</span>
                </li>
              ))}
            </ul>

            {/* Bloco de empatia social */}
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="flex items-start gap-2 text-xs leading-relaxed text-amber-900">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <span>
                  Esta plataforma foi criada <b>para quem quer se preparar e não pode pagar cursinho caro</b>:
                  todo o material de um curso de R$ 500+ por menos de um lanche por semana. Estudar não pode ser
                  privilégio.
                </span>
              </p>
            </div>

            <Button
              onClick={() => {
                onOpenChange(false)
                onSubscribe()
              }}
              className="mt-4 h-13 h-[52px] w-full bg-amber-400 text-base font-black text-slate-950 shadow-lg shadow-amber-400/30 hover:bg-amber-300"
            >
              <Crown className="mr-2 h-5 w-5" /> Garantir meu acesso — {SITE.price}{SITE.period}
            </Button>
            <p className="mt-2 text-center text-[11px] leading-relaxed text-slate-400">
              Pix, Pix Automático ou cartão via Cakto • cancele quando quiser, sem multa
            </p>
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="mt-1 h-9 w-full text-xs font-semibold text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              Continuar estudando no teste grátis
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}

/* --------------------------------------------------------------------- */
/*  POP-UP COMPARTILHAR — amigos e grupos de estudo (WhatsApp etc.)      */
/* --------------------------------------------------------------------- */

export function SharePromoDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [copied, setCopied] = useState(false)
  const message = inviteMessage()

  const copyLink = () => {
    const nav = typeof navigator !== 'undefined' ? navigator : undefined
    const full = `${message} ${SHARE_URL}`
    void nav?.clipboard
      ?.writeText(full)
      .then(() => {
        setCopied(true)
        window.setTimeout(() => setCopied(false), 2500)
      })
      .catch(() => undefined)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center sm:text-center">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400 shadow-lg shadow-amber-400/30">
            <Users className="h-7 w-7 text-slate-950" />
          </div>
          <DialogTitle className="text-xl font-black leading-tight text-slate-900">
            Estudar acompanhado rende mais!
          </DialogTitle>
          <DialogDescription className="mx-auto max-w-sm text-sm leading-relaxed text-slate-500">
            Chame seus amigos e o <b>grupo de estudos</b> para conhecer a plataforma — o valor é acessível para
            todos e ninguém precisa pagar cursinho caro para passar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2.5">
          {/* WhatsApp — canal nº 1 dos concurseiros brasileiros */}
          <a
            href={whatsappLink(message)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-emerald-600 text-sm font-bold text-white transition-colors hover:bg-emerald-700"
          >
            <MessageCircle className="h-5 w-5" /> Enviar no WhatsApp
          </a>
          <a
            href={telegramLink(message, SHARE_URL)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-sky-600 text-sm font-bold text-white transition-colors hover:bg-sky-700"
          >
            <Send className="h-5 w-5" /> Enviar no Telegram
          </a>
          <div className="grid grid-cols-2 gap-2.5">
            <Button onClick={() => shareApp()} variant="outline" className="h-11 border-slate-300 font-bold text-slate-700 hover:bg-slate-100">
              <Share2 className="mr-1.5 h-4 w-4" /> Outros apps
            </Button>
            <Button onClick={copyLink} variant="outline" className="h-11 border-slate-300 font-bold text-slate-700 hover:bg-slate-100">
              {copied ? <CheckCheck className="mr-1.5 h-4 w-4 text-emerald-600" /> : <Link2 className="mr-1.5 h-4 w-4" />}
              {copied ? 'Copiado!' : 'Copiar link'}
            </Button>
          </div>
        </div>

        <p className="flex items-center justify-center gap-1.5 text-center text-[11px] leading-relaxed text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
          Sua indicação não custa nada e ajuda outro concurseiro a estudar melhor
        </p>
      </DialogContent>
    </Dialog>
  )
}
