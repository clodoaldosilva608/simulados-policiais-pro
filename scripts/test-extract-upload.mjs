// Testa a extração do PDF enviado exatamente como o app faz (unpdf/pdf.js)
import { readFile } from 'node:fs/promises'
import { extractText, getDocumentProxy } from 'unpdf'

const data = await readFile('/home/z/my-project/upload/port-02-ortografia-hifen.pdf')
console.log('arquivo:', Math.round(data.length / 1024), 'KB')
try {
  const pdf = await getDocumentProxy(new Uint8Array(data))
  const { totalPages, text } = await extractText(pdf, { mergePages: true })
  const t = Array.isArray(text) ? text.join('\n\n') : text
  console.log('páginas:', totalPages)
  console.log('chars extraídos:', t.length)
  console.log('--- início ---')
  console.log(t.slice(0, 600))
  console.log('--- fim ---')
  console.log(t.slice(-300))
  // simula o chunkText do app (7000 chars, máx 10 blocos)
  const paras = t.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
  const chunks = []
  let cur = ''
  for (const p of paras) {
    if (p.length > 7000) {
      if (cur) { chunks.push(cur); cur = '' }
      chunks.push(p.slice(0, 7000))
      continue
    }
    if ((cur + '\n\n' + p).length > 7000 && cur) { chunks.push(cur); cur = p } else { cur = cur ? cur + '\n\n' + p : p }
  }
  if (cur.trim()) chunks.push(cur.trim())
  console.log('blocos gerados:', chunks.length, '| tamanhos:', chunks.map((c) => c.length))
} catch (e) {
  console.log('ERRO NA EXTRAÇÃO:', e.name, String(e?.message ?? e).slice(0, 500))
}
