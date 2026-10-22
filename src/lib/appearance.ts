'use client'

/**
 * Aparência do app: TEMA (claro/escuro) e TAMANHO DA FONTE (P/M/G).
 *
 * • Preferências persistem no localStorage e são aplicadas no <html>
 *   (classe .dark + font-size da raiz) — como todo o app usa unidades
 *   rem do Tailwind, a troca de escala afeta textos e espaçamentos.
 * • APPEARANCE_BOOTSTRAP é injetado no <head> pelo layout ANTES da
 *   hidratação para evitar flash de tema errado.
 */

export type ThemeMode = 'light' | 'dark'
export type FontSize = 'p' | 'm' | 'g'

const THEME_KEY = 'spp-theme'
const FONT_KEY = 'spp-font-size'

export const FONT_SIZES: Record<FontSize, { label: string; scale: string }> = {
  p: { label: 'P', scale: '87.5%' },
  m: { label: 'A', scale: '100%' },
  g: { label: 'A+', scale: '112.5%' },
}

export function getTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light'
  try {
    return window.localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export function setTheme(mode: ThemeMode): void {
  try {
    window.localStorage.setItem(THEME_KEY, mode)
  } catch {
    /* armazenamento indisponível */
  }
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', mode === 'dark')
  }
}

export function getFontSize(): FontSize {
  if (typeof window === 'undefined') return 'm'
  try {
    const v = window.localStorage.getItem(FONT_KEY)
    return v === 'p' || v === 'g' ? v : 'm'
  } catch {
    return 'm'
  }
}

export function setFontSize(size: FontSize): void {
  try {
    window.localStorage.setItem(FONT_KEY, size)
  } catch {
    /* armazenamento indisponível */
  }
  if (typeof document !== 'undefined') {
    const scale = FONT_SIZES[size].scale
    if (scale === '100%') {
      document.documentElement.style.removeProperty('font-size')
    } else {
      document.documentElement.style.fontSize = scale
    }
  }
}

/** Script mínimo (JS puro) executado antes da hidratação — evita flash. */
export const APPEARANCE_BOOTSTRAP = `try{
var t=localStorage.getItem('${THEME_KEY}');
if(t==='dark')document.documentElement.classList.add('dark');
var f=localStorage.getItem('${FONT_KEY}');
var s=f==='p'?'87.5%':f==='g'?'112.5%':'';
if(s)document.documentElement.style.fontSize=s;
}catch(e){}`
