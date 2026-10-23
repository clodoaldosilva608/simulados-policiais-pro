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

const official: Row[] = OFFICIAL_PACKS.flatMap(rowsFromPack)

const all = [...official, ...authored]
const seen = new Set<string>()
const errors: string[] = []
const finalRows: Row[] = []

for (const r of all) {
  const key = clean(r.statement).toLowerCase().replace(/[^a-zà-ú0-9]/gi, '').slice(0, 90)
  if (!key || seen.has(key)) continue

  const st = clean(r.statement)
  if (st.length < 15) { errors.push(`Enunciado curto (${st.length}): "${st.slice(0, 40)}"`); continue }

  if (r.tipo === 'certo_errado') {
    const ans = r.answer.trim().toUpperCase()
    if (ans !== 'CERTO' && ans !== 'ERRADO') { errors.push(`Gabarito C/E inválido: "${r.answer}"`); continue }
    finalRows.push({ ...r, statement: st, answer: ans })
  } else {
    const opts = [r.a, r.b, r.c, r.d, r.e].filter((o) => o && o.trim().length > 0)
    if (opts.length < 3) { errors.push(`Poucas alternativas (${opts.length}): "${st.slice(0, 40)}"`); continue }
    const letter = r.answer.trim().toUpperCase()
    const idx = 'ABCDE'.indexOf(letter)
    if (idx < 0 || idx >= opts.length) { errors.push(`Gabarito fora do intervalo (${letter}) em: "${st.slice(0, 40)}"`); continue }
    const [a, b, c, d, e] = [opts[0], opts[1], opts[2] ?? '', opts[3] ?? '', opts[4] ?? '']
    finalRows.push({ ...r, statement: st, a: clean(a), b: clean(b), c: clean(c), d: clean(d), e: clean(e), answer: letter })
  }
  seen.add(key)
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

const outDir = join(import.meta.dir, 'bank-out')
mkdirSync(outDir, { recursive: true })
writeFileSync(join(outDir, 'questoes.csv'), lines.join('\n'), 'utf8')

/* --------- 4. Relatório --------- */
const byCareer = new Map<string, number>()
for (const r of finalRows) byCareer.set(r.concurso, (byCareer.get(r.concurso) ?? 0) + 1)
console.log('=== RELATÓRIO ===')
console.log(`Oficiais: ${official.length} | Inéditas: ${authored.length} | Finais: ${finalRows.length}`)
console.log(`Duplicatas/removidas: ${all.length - finalRows.length - errors.length} | Erros de validação: ${errors.length}`)
for (const e of errors) console.log('  ERRO:', e)
console.log('--- Por concurso ---')
for (const [c, n] of [...byCareer.entries()].sort((a, b) => b[1] - a[1])) console.log(`  ${n} × ${c}`)
const byMateria = new Map<string, number>()
for (const r of finalRows) byMateria.set(r.materia, (byMateria.get(r.materia) ?? 0) + 1)
console.log('--- Top matérias ---')
for (const [m, n] of [...byMateria.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12)) console.log(`  ${n} × ${m}`)
console.log(`\nCSV: ${join(outDir, 'questoes.csv')} (${(lines.join('\n').length / 1024).toFixed(0)} KB)`)
