'use client'

/**
 * POP-UPS PROMOCIONAIS — controle de frequência para não irritar o aluno.
 *
 * Cada pop-up tem uma chave no localStorage com o timestamp da última
 * exibição; só volta a aparecer depois do período de resfriamento
 * (cooldown). Sinalizadores em sessionStorage evitam dois pop-ups no
 * mesmo carregamento do app.
 */

export const PROMO_KEYS = {
  /** Pop-up "torne-se assinante" (CTA de valor acessível) */
  subscriber: 'spp-promo-sub-v1',
  /** Pop-up "compartilhe com amigos e grupos de estudo" */
  share: 'spp-promo-share-v1',
} as const

/** Sinalizadores de sessão: pop-up já exibido neste carregamento do app */
const SESSION_FLAG = 'spp-promo-session-v1'

/** Dias de resfriamento de cada pop-up */
export const PROMO_COOLDOWN_DAYS = {
  subscriber: 3,
  share: 4,
} as const

/** true quando o pop-up pode ser exibido (nunca mostrado ou cooldown vencido) */
export function shouldShowPromo(key: string, cooldownDays: number): boolean {
  if (typeof window === 'undefined') return false
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return true
    const last = Number(raw)
    if (!Number.isFinite(last)) return true
    return Date.now() - last >= cooldownDays * 86_400_000
  } catch {
    return false
  }
}

/** Registra que o pop-up foi exibido agora (reinicia o cooldown) */
export function markPromoShown(key: string): void {
  try {
    window.localStorage.setItem(key, String(Date.now()))
  } catch {
    /* persistência é opcional */
  }
}

/** Pop-up já apareceu neste carregamento do app? (evita dois de uma vez) */
export function promoShownThisSession(flag: string): boolean {
  if (typeof window === 'undefined') return false
  try {
    const raw = window.sessionStorage.getItem(SESSION_FLAG)
    if (!raw) return false
    return (JSON.parse(raw) as string[]).includes(flag)
  } catch {
    return false
  }
}

export function markPromoSession(flag: string): void {
  try {
    const raw = window.sessionStorage.getItem(SESSION_FLAG)
    const list = raw ? (JSON.parse(raw) as string[]) : []
    if (!list.includes(flag)) list.push(flag)
    window.sessionStorage.setItem(SESSION_FLAG, JSON.stringify(list))
  } catch {
    /* persistência é opcional */
  }
}
