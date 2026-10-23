/**
 * BUILD DO BANCO DE QUESTÕES — gera CSV final a partir de:
 *  1. Provas oficiais já transcritas no app (src/data/official) — questões REAIS
 *     com gabarito oficial (PF 2025, PC-CE 2025, PM-RJ 2024 FGV, PRF 2021, Polícia Penal)
 *  2. Questões inéditas autorais (scripts/bank-data/*.ts) por carreira/banca
 *
 * Valida cada linha (enunciado, alternativas, gabarito), remove duplicatas e
 * escreve CSV com separador ';' e campos entre aspas.
 * Uso: bun scripts/build-bank-csv.ts
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import type { Row } from './bank-data/types'

import { PF_CONST } from './bank-data/pf-dir-const'
import { PF_PENAL } from './bank-data/pf-direito-penal'
import { PF_PROC } from './bank-data/pf-proc-penal'
import { PF_ADM } from './bank-data/pf-dir-adm'
import { PF_CRIM } from './bank-data/pf-criminologia'
import { PRF_TRANSITO } from './bank-data/prf-transito'
import { TRANSITO_MC } from './bank-data/transito-mc'
import { GM_13022 } from './bank-data/gm-lei13022'
import { GM_CONST_ADM } from './bank-data/gm-const-adm'
import { GM_PORT } from './bank-data/gm-portugues'
import { GM_DH_SOCORROS } from './bank-data/gm-ddhh-socorros'
import { PM_PORT_MAT } from './bank-data/pm-portugues-mat'
import { PM_CONST_LEGISL } from './bank-data/pm-const-legislacao'
import { PP_LEP } from './bank-data/policia-penal-lep'
import { PF_BATCH2 } from './bank-data/pf-batch2'
import { PC_BATCH } from './bank-data/pc-batch'
import { PRF_BATCH2 } from './bank-data/prf-batch2'
import { GM_BATCH2 } from './bank-data/gm-batch2'
import { PM_BATCH2 } from './bank-data/pm-batch2'
import { TRANSITO_BATCH2 } from './bank-data/transito-batch2'
import { PP_BATCH2 } from './bank-data/policia-penal-batch2'
import { BATCH2B } from './bank-data/batch2b'

/* --------- 1. Provas oficiais do app --------- */
import { PF_2025_PACK, PC_CE_2025_PACK, PM_RJ_2024_PACK, PRF_2021_PACK, POLICIAL_PENAL_PACK } from '../src/data/official'
import type { SimuladoPack } from '../src/data/types'

const OFFICIAL_PACKS: SimuladoPack[] = [PF_2025_PACK, PC_CE_2025_PACK, PM_RJ_2024_PACK, PRF_2021_PACK, POLICIAL_PENAL_PACK]

function rowsFromPack(pack: SimuladoPack): Row[] {
  const subjName = new Map(pack.subjects.map((s) => [s.id, s.name]))
  const nivel = pack.carreira === 'PM' ? 'Médio' : 'Superior'
  return pack.questions.map((q) => {
    const idx = 'abcde'.indexOf(q.answer)
    return {
      banca: pack.banca ?? 'Oficial',
      concurso: pack.title,
      nivel,
      materia: subjName.get(q.subjectId) ?? 'Conhecimentos Gerais',
      assunto: `Prova oficial ${pack.ano}`,
      ano: pack.ano,
      tipo: (pack.questionFormat === 'certo_errado' ? 'certo_errado' : 'multipla') as Row['tipo'],
      statement: clean(q.statement),
      ...optFields(q.options.map((o) => o.html)),
      answer: pack.questionFormat === 'certo_errado' ? (q.answer === 'a' ? 'CERTO' : 'ERRADO') : 'abcde'[idx].toUpperCase(),
      comment: (q.comment && q.comment.trim()) || `Prova oficial ${pack.banca} ${pack.ano} — transcrita da prova com gabarito oficial da banca.`,
    }
  })
}

function clean(s: string): string {
  return s.replace(/\s+/g, ' ').trim().slice(0, 7900)
}

function optFields(options: string[]): Pick<Row, 'a' | 'b' | 'c' | 'd' | 'e'> {
  return {
    a: clean(options[0] ?? ''),
    b: clean(options[1] ?? ''),
    c: clean(options[2] ?? ''),
    d: clean(options[3] ?? ''),
    e: clean(options[4] ?? ''),
  }
}

/* --------- 2. Montagem + validação --------- */
const authored: Row[] = [
  ...PF_CONST, ...PF_PENAL, ...PF_PROC, ...PF_ADM, ...PF_CRIM,
  ...PRF_TRANSITO, ...TRANSITO_MC,
  ...GM_13022, ...GM_CONST_ADM, ...GM_PORT, ...GM_DH_SOCORROS,
  ...PM_PORT_MAT, ...PM_CONST_LEGISL, ...PP_LEP,
]

/* Lote 2 (questões novas desta rodada) — também entram no CSV completo */
const batch2: Row[] = [
  ...PF_BATCH2, ...PC_BATCH, ...PRF_BATCH2,
  ...GM_BATCH2, ...PM_BATCH2, ...TRANSITO_BATCH2, ...PP_BATCH2, ...BATCH2B,
]

/**
 * EMBARALHA as alternativas das questões de múltipla escolha (evita o padrão
 * "gabarito sempre em A" das inéditas). A letra do gabarito é ajustada junto.
 * Questões Certo/Errado não são embaralhadas.
 */
function shuffleOptions(r: Row): Row {
  if (r.tipo !== 'multipla') return r
  const opts = [r.a, r.b, r.c, r.d, r.e].map((o, i) => ({ o: o ?? '', correct: i === 'ABCDE'.indexOf(r.answer.trim().toUpperCase()) }))
  const valid = opts.filter((x) => x.o.trim().length > 0)
  for (let i = valid.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[valid[i], valid[j]] = [valid[j], valid[i]]
  }
  const letters = ['a', 'b', 'c', 'd', 'e'] as const
  const out: Record<string, string> = {}
  let answer = 'A'
  valid.forEach((x, i) => {
    out[letters[i]] = x.o
    if (x.correct) answer = letters[i].toUpperCase()
  })
  return { ...r, a: out.a, b: out.b, c: out.c, d: out.d, e: out.e, answer }
}

const official: Row[] = OFFICIAL_PACKS.flatMap(rowsFromPack)

const all = [...official, ...authored, ...batch2.map(shuffleOptions)]
const batch2Keys = new Set(batch2.map((r) => clean(r.statement).toLowerCase().replace(/[^a-zà-ú0-9]/gi, '').slice(0, 90)))
const seen = new Set<string>()
const errors: string[] = []
type FinalRow = Row & { batch2?: boolean }
const finalRows: FinalRow[] = []

for (const r of all) {
  const key = clean(r.statement).toLowerCase().replace(/[^a-zà-ú0-9]/gi, '').slice(0, 90)
  if (!key || seen.has(key)) continue

  const st = clean(r.statement)
  if (st.length < 15) { errors.push(`Enunciado curto (${st.length}): "${st.slice(0, 40)}"`); continue }

  let row: FinalRow
  if (r.tipo === 'certo_errado') {
    const ans = r.answer.trim().toUpperCase()
    if (ans !== 'CERTO' && ans !== 'ERRADO') { errors.push(`Gabarito C/E inválido: "${r.answer}"`); continue }
    row = { ...r, statement: st, answer: ans }
  } else {
    const opts = [r.a, r.b, r.c, r.d, r.e].filter((o) => o && o.trim().length > 0)
    if (opts.length < 3) { errors.push(`Poucas alternativas (${opts.length}): "${st.slice(0, 40)}"`); continue }
    const letter = r.answer.trim().toUpperCase()
    const idx = 'ABCDE'.indexOf(letter)
    if (idx < 0 || idx >= opts.length) { errors.push(`Gabarito fora do intervalo (${letter}) em: "${st.slice(0, 40)}"`); continue }
    const [a, b, c, d, e] = [opts[0], opts[1], opts[2] ?? '', opts[3] ?? '', opts[4] ?? '']
    row = { ...r, statement: st, a: clean(a), b: clean(b), c: clean(c), d: clean(d), e: clean(e), answer: letter }
  }
  seen.add(key)
  finalRows.push({ ...row, batch2: batch2Keys.has(key) })
}

/* --------- 3. CSV --------- */
function esc(v: string | number): string {
  const s = String(v ?? '').replace(/\r?\n/g, ' ').trim()
  return `"${s.replace(/"/g, '""')}"`
}

const HEADER = 'banca;concurso;nivel;materia;assunto;ano;tipo;statement;a;b;c;d;e;answer;comment'
const lines = [HEADER, ...finalRows.map((r) =>
  [r.banca, r.concurso, r.nivel, r.materia, r.assunto, r.ano, r.tipo, r.statement, r.a, r.b, r.c, r.d, r.e, r.answer, r.comment].map(esc).join(';')
)]

/* CSV só do lote 2 (para importação incremental na produção) */
const batch2Rows = finalRows.filter((r) => r.batch2)
const linesBatch2 = [HEADER, ...batch2Rows.map((r) =>
  [r.banca, r.concurso, r.nivel, r.materia, r.assunto, r.ano, r.tipo, r.statement, r.a, r.b, r.c, r.d, r.e, r.answer, r.comment].map(esc).join(';')
)]

const outDir = join(import.meta.dir, 'bank-out')
mkdirSync(outDir, { recursive: true })
writeFileSync(join(outDir, 'questoes.csv'), lines.join('\n'), 'utf8')
writeFileSync(join(outDir, 'questoes-batch2.csv'), linesBatch2.join('\n'), 'utf8')

/* --------- 3b. SEED estático (fallback quando o Blob está indisponível) --------- */
function fnv1a(str: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h.toString(36)
}

const seedObjects = finalRows.map((r) => ({
  id: `seed-${fnv1a(r.statement)}`,
  banca: r.banca,
  concurso: r.concurso,
  nivel: r.nivel,
  materia: r.materia,
  assunto: r.assunto || undefined,
  ano: r.ano,
  tipo: r.tipo as 'multipla' | 'certo_errado',
  statement: r.statement,
  options:
    r.tipo === 'certo_errado'
      ? ['Certo', 'Errado']
      : [r.a, r.b, r.c, r.d, r.e].filter((o) => o && o.trim().length > 0),
  answer:
    r.tipo === 'certo_errado'
      ? r.answer === 'CERTO'
        ? 0
        : 1
      : Math.max(0, 'ABCDE'.indexOf(r.answer)),
  comment: r.comment || undefined,
  active: true,
}))

const seedTs = `/**
 * BANCO DE QUESTÕES — SEED ESTÁTICO (gerado por scripts/build-bank-csv.ts).
 * Fallback somente-leitura usado quando o armazenamento (Vercel Blob) está
 * indisponível/suspenso, garantindo que o banco do aluno nunca fique vazio.
 * NÃO EDITAR À MÃO — regenerar com: bun scripts/build-bank-csv.ts
 */
import type { BankQuestion } from '@/lib/content'

export const BANK_SEED: BankQuestion[] = ${JSON.stringify(seedObjects)}
`
writeFileSync(join(import.meta.dir, '..', 'src', 'data', 'bank-seed.ts'), seedTs, 'utf8')

/* --------- 4. Relatório --------- */
const byCareer = new Map<string, number>()
for (const r of finalRows) byCareer.set(r.concurso, (byCareer.get(r.concurso) ?? 0) + 1)
console.log('=== RELATÓRIO ===')
console.log(`Oficiais: ${official.length} | Inéditas (lote 1): ${authored.length} | Lote 2: ${batch2.length} | Finais: ${finalRows.length}`)
console.log(`Lote 2 no CSV final (após dedupe): ${batch2Rows.length}`)
console.log(`Duplicatas/removidas: ${all.length - finalRows.length - errors.length} | Erros de validação: ${errors.length}`)
for (const e of errors) console.log('  ERRO:', e)
console.log('--- Por concurso ---')
for (const [c, n] of [...byCareer.entries()].sort((a, b) => b[1] - a[1])) console.log(`  ${n} × ${c}`)
const byMateria = new Map<string, number>()
for (const r of finalRows) byMateria.set(r.materia, (byMateria.get(r.materia) ?? 0) + 1)
console.log('--- Top matérias ---')
for (const [c, n] of [...byMateria.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12)) console.log(`  ${n} × ${m}`)
console.log(`\nCSV: ${join(outDir, 'questoes.csv')} (${(lines.join('\n').length / 1024).toFixed(0)} KB)`)
console.log(`Seed estático: ${seedObjects.length} questões -> src/data/bank-seed.ts`)
