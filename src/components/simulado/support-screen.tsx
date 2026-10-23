'use client'

import { useState } from 'react'
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  LifeBuoy,
  Mail,
  Send,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { SITE } from '@/config/site'

interface SupportScreenProps {
  onBack: () => void
  /** E-mail da conta (pré-preenchido na mensagem) */
  accountEmail?: string
  accountName?: string
}

/**
 * Tela "Suporte": leva direto ao contato por e-mail
 * (suportesimuladospoliciais@gmail.com) com a mensagem pronta para enviar.
 */
export function SupportScreen({ onBack, accountEmail, accountName }: SupportScreenProps) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  const subject = 'Suporte — Simulados Policiais Pro'
  const body = [
    'Olá!',
    '',
    'Preciso de ajuda com o app Simulados Policiais Pro.',
    '',
    `— Minha dúvida / problema:`,
    ``,
    `— Minha conta: ${accountEmail ?? '(e-mail)'}${accountName ? ` (${accountName})` : ''}`,
  ].join('\n')

  const mailtoHref = `mailto:${SITE.supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

  const openMail = () => {
    // mailto abre o app de e-mail do aparelho com a mensagem pronta
    window.location.href = mailtoHref
  }

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(SITE.supportEmail)
      setCopied(true)
      toast({ title: 'E-mail copiado!', description: SITE.supportEmail })
      window.setTimeout(() => setCopied(false), 2500)
    } catch {
      toast({ title: 'Não foi possível copiar', description: `Anote o endereço: ${SITE.supportEmail}` })
    }
  }

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
            <p className="truncate text-base font-bold leading-tight">Suporte</p>
            <p className="truncate text-xs text-slate-400">Fale direto com a nossa equipe</p>
          </div>
          <LifeBuoy className="ml-auto h-5 w-5 shrink-0 text-amber-400" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 space-y-5 px-4 py-6">
        {/* Card principal de contato */}
        <section aria-label="Contato do suporte" className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white">
              <Mail className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-base font-bold text-amber-900">Atendimento por e-mail</p>
              <p className="mt-0.5 break-all text-sm font-semibold text-amber-800">{SITE.supportEmail}</p>
              <p className="mt-1 text-sm leading-relaxed text-amber-800">
                Toque no botão abaixo: seu app de e-mail abre com o endereço e a mensagem já preenchidos —
                é só escrever sua dúvida e enviar.
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button
              onClick={openMail}
              className="h-12 flex-1 bg-amber-500 text-base font-black text-slate-950 shadow-lg shadow-amber-500/30 hover:bg-amber-400"
            >
              <Send className="mr-2 h-5 w-5" /> Enviar mensagem agora
            </Button>
            <Button
              onClick={() => void copyEmail()}
              variant="outline"
              className="h-12 border-slate-300 bg-white font-bold text-slate-700 hover:bg-slate-100"
            >
              {copied ? <CheckCircle2 className="mr-2 h-5 w-5 text-emerald-600" /> : <Copy className="mr-2 h-5 w-5" />}
              {copied ? 'Copiado!' : 'Copiar e-mail'}
            </Button>
          </div>
        </section>

        {/* Como podemos ajudar mais rápido */}
        <section aria-label="Como escrever sua mensagem" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-slate-900">Para uma resposta mais rápida, inclua na mensagem:</p>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-700">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              O e-mail da sua conta (já preenchido automaticamente na mensagem).
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              O que aconteceu e em qual tela (ex.: &quot;erro ao gerar simulado do PDF&quot;).
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              Pedido de alteração de e-mail, se for o caso — a troca é feita pela equipe, com confirmação
              dos dois endereços.
            </li>
          </ul>
          <p className="mt-4 flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-xs leading-relaxed text-slate-600">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            Nunca envie sua senha para ninguém — a equipe de suporte nunca pede senha nem código de acesso.
          </p>
        </section>

        <p className="px-1 pb-2 text-center text-xs leading-relaxed text-slate-400">
          Respondemos normalmente em até 24–48h em dias úteis.
        </p>
      </main>
    </div>
  )
}
