// Gera ícones do app (PWA) a partir de um SVG — executar: bun scripts/make-icons.ts
import sharp from 'sharp'
import { mkdirSync } from 'fs'

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#020617"/>
  <g transform="translate(256 256)">
    <path d="M0 -170 L128 -118 V-6 C128 62 76 122 0 152 C-76 122 -128 62 -128 -6 V-118 Z" fill="#fbbf24"/>
    <path d="M0 -132 L96 -92 V-10 C96 44 54 94 0 118 C-54 94 -96 44 -96 -10 V-92 Z" fill="#020617"/>
    <path d="M-42 4 L-12 36 L48 -34" stroke="#fbbf24" stroke-width="22" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`

mkdirSync('public/icons', { recursive: true })

for (const size of [192, 512]) {
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(`public/icons/icon-${size}.png`)
  console.log(`ok: public/icons/icon-${size}.png`)
}
