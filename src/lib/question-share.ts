'use client'

import { toPng } from 'html-to-image'
import { toast } from '@/hooks/use-toast'
import { SITE } from '@/config/site'

/**
 * COMPARTILHAR QUESTÃO — captura a tela da questão que está sendo resolvida
 * (html-to-image), adiciona a marca do app e entrega a imagem pronta para
 * redes sociais e grupos de WhatsApp via Web Share API nativa. Em navegadores
 * sem suporte, baixa a imagem e abre o WhatsApp com o texto do convite.
 */

export const QUESTION_SHARE_URL = 'https://simuladospoliciais.vercel.app'

export const QUESTION_SHARE_TEXT = `🚔 Resolvi essa questão real no ${SITE.name} — e você acertaria? Baixe agora e treine com centenas de questões da PF, PC, PM, PRF, Polícia Penal, Guarda Municipal e Trânsito: ${QUESTION_SHARE_URL}`

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('imagem'))
    img.src = src
  })
}

/** Compõe a captura do card + faixa de marca do app na base da imagem. */
async function composeBrandedImage(node: HTMLElement): Promise<Blob> {
  const dataUrl = await toPng(node, {
    pixelRatio: 2,
    backgroundColor: '#f8fafc',
    // oculta os controles interativos marcados (ex.: o próprio botão de compartilhar)
    filter: (el) => !(el instanceof HTMLElement && el.dataset.shareHide === 'true'),
  })
  const img = await loadImage(dataUrl)

  const footerH = Math.max(64, Math.round(img.width * 0.085))
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height + footerH
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas')

  // fundo + captura
  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(img, 0, 0)

  // faixa de marca
  const pad = Math.round(img.width * 0.04)
  const brandSize = Math.round(footerH * 0.42)
  const urlSize = Math.round(footerH * 0.3)

  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, img.height, canvas.width, footerH)
  ctx.fillStyle = '#fbbf24'
  ctx.fillRect(0, img.height, canvas.width, Math.max(2, Math.round(footerH * 0.05)))

  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#fbbf24'
  ctx.font = `bold ${brandSize}px system-ui, -apple-system, 'Segoe UI', sans-serif`
  ctx.fillText(`🎓 ${SITE.name}`, pad, img.height + footerH * 0.52)

  ctx.fillStyle = '#cbd5e1'
  ctx.font = `${urlSize}px system-ui, -apple-system, 'Segoe UI', sans-serif`
  const urlText = QUESTION_SHARE_URL.replace('https://', '')
  const urlW = ctx.measureText(urlText).width
  ctx.fillText(urlText, canvas.width - pad - urlW, img.height + footerH * 0.52)

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('blob'))), 'image/png', 0.95)
  })
}

function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 4000)
}

/**
 * Captura o card da questão e compartilha: Web Share API (WhatsApp/Instagram/
 * Telegram — ideal no celular/PWA) com fallback de download + link do WhatsApp.
 */
export async function captureAndShareQuestion(node: HTMLElement): Promise<void> {
  const blob = await composeBrandedImage(node)
  const file = new File([blob], 'questao-simulados-policiais.png', { type: 'image/png' })

  const nav = typeof navigator !== 'undefined' ? navigator : undefined
  if (nav?.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], title: `Questão — ${SITE.name}`, text: QUESTION_SHARE_TEXT })
      return
    } catch {
      /* usuário cancelou o compartilhamento nativo */
      return
    }
  }

  // Fallback desktop: baixa a imagem + copia o convite + abre o WhatsApp
  downloadBlob(blob, 'questao-simulados-policiais.png')
  try {
    await nav?.clipboard?.writeText(QUESTION_SHARE_TEXT)
  } catch {
    /* clipboard indisponível */
  }
  toast({
    title: 'Imagem da questão salva! 📸',
    description: 'Anexe a imagem no WhatsApp ou Instagram. O convite com o link do app já foi copiado.',
  })
  window.open(`https://wa.me/?text=${encodeURIComponent(QUESTION_SHARE_TEXT)}`, '_blank', 'noopener,noreferrer')
}
