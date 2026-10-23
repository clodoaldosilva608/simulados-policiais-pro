/**
 * OCR de PDF "em imagem" (escaneado): renderiza cada página para JPEG no
 * navegador (unpdf/pdf.js usa DOM canvas no cliente) para envio ao modelo
 * de visão via /api/transcribe.
 */
import { getDocumentProxy } from 'unpdf'

type PdfProxy = Awaited<ReturnType<typeof getDocumentProxy>>

/** Abre o PDF (mesma entrada usada pela extração de texto). */
export async function openPdfForRender(buffer: Uint8Array): Promise<PdfProxy> {
  return getDocumentProxy(buffer)
}

/** Renderiza UMA página como data URL JPEG (compacta, pronta para visão). */
export async function renderPdfPageToJpegDataUrl(
  pdf: PdfProxy,
  pageNumber: number,
  width = 1000,
  quality = 0.72,
): Promise<string> {
  const page = await pdf.getPage(pageNumber)
  const baseViewport = page.getViewport({ scale: 1 })
  const scale = width / baseViewport.width
  const viewport = page.getViewport({ scale })

  const canvas = document.createElement('canvas')
  canvas.width = Math.ceil(viewport.width)
  canvas.height = Math.ceil(viewport.height)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas indisponível neste navegador')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  await page.render({
    canvas,
    canvasContext: ctx,
    viewport,
  } as unknown as Parameters<ReturnType<PdfProxy['getPage']>['render']>[0]).promise

  return canvas.toDataURL('image/jpeg', quality)
}
