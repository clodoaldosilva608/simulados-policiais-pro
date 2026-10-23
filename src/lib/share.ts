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
