'use client'

import { toast } from '@/hooks/use-toast'
import { SITE } from '@/config/site'

/** Link público do app (compartilhamento em redes sociais) */
export const SHARE_URL = 'https://simuladospoliciais.vercel.app'

const SHARE_TEXT = `Estou estudando para concursos policiais com o ${SITE.name} — provas reais da PF, PC, PM, PRF e Polícia Penal com gabarito comentado, e ainda dá para transformar qualquer PDF em simulado. Vem estudar comigo!`

/**
 * Compartilha o app: usa a Web Share API (menu nativo do celular — WhatsApp,
 * Instagram, Telegram...) e, em navegadores sem suporte, copia o link com toast.
 */
export function shareApp(): void {
  const nav = typeof navigator !== 'undefined' ? navigator : undefined

  if (nav?.share) {
    nav.share({ title: SITE.name, text: SHARE_TEXT, url: SHARE_URL }).catch(() => {
      /* usuário cancelou o compartilhamento */
    })
    return
  }

  const fullMessage = `${SHARE_TEXT} ${SHARE_URL}`
  const fallbackCopy = () => toast({ title: 'Link copiado! 🎉', description: 'Agora é só colar e mandar para os amigos.' })

  if (nav?.clipboard?.writeText) {
    nav.clipboard
      .writeText(fullMessage)
      .then(fallbackCopy)
      .catch(() => toast({ title: 'Compartilhe este link', description: SHARE_URL }))
    return
  }

  toast({ title: 'Compartilhe este link', description: SHARE_URL })
}

/* ------------------------- MODOS DUPLA (DESAFIO) ------------------------- */

/** Link de desafio: quem abrir vê "Fulano fez X% — aceita superar?" na landing */
export function buildChallengeUrl(pct: number, fromName?: string): string {
  const params = new URLSearchParams({ desafio: String(Math.max(0, Math.min(100, Math.round(pct)))) })
  const name = fromName?.trim().slice(0, 24)
  if (name) params.set('de', name)
  return `${SHARE_URL}/?${params.toString()}`
}

/**
 * MODO DUPLA — desafia um amigo a superar a nota do aluno no simulado.
 * Envia texto motivacional + link com a nota codificada (?desafio=X&de=Nome).
 */
export function shareChallenge(opts: { pct: number; fromName?: string; packTitle?: string }): void {
  const nav = typeof navigator !== 'undefined' ? navigator : undefined
  const prova = opts.packTitle ? ` no "${opts.packTitle}"` : ''
  const text = `🏁 Desafio aceito? Fiz ${opts.pct}%${prova} no ${SITE.name}. Cria tua conta grátis e tenta me superar!`
  const url = buildChallengeUrl(opts.pct, opts.fromName)

  if (nav?.share) {
    nav.share({ title: `Desafio: ${opts.pct}%`, text, url }).catch(() => {
      /* usuário cancelou */
    })
    return
  }

  const fullMessage = `${text} ${url}`
  const copied = () => toast({ title: 'Desafio copiado! 🏁', description: 'Mande para um amigo e veja quem tira a nota maior.' })
  if (nav?.clipboard?.writeText) {
    nav.clipboard.writeText(fullMessage).then(copied).catch(() => toast({ title: 'Seu link de desafio', description: url }))
    return
  }
  toast({ title: 'Seu link de desafio', description: url })
}

/* --------------------- DEEP LINKS (grupos de estudo) --------------------- */

/** Link direto do WhatsApp com mensagem pré-preenchida (ideal p/ grupos) */
export function whatsappLink(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}

/** Link direto do Telegram (compartilhar url + texto) */
export function telegramLink(text: string, url: string): string {
  return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
}

/** Texto padrão do convite (pop-up de compartilhar) */
export function inviteMessage(): string {
  return SHARE_TEXT
}
