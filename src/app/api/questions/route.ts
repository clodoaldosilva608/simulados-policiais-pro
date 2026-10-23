import { NextRequest, NextResponse } from 'next/server'
import { validateUserSession } from '@/lib/user-auth'
import { listQuestions, type BankQuestion } from '@/lib/content'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/questions — BANCO DE QUESTÕES para o aluno (autenticado).
 *
 * Filtros: banca, materia, concurso, nivel, ano, q (busca no enunciado).
 * Modos:
 *  • sample=N   → N questões aleatórias completas (para montar a prática)
 *  • padrão     → listagem paginada (preview do enunciado) + total
 *  • facets=1   → valores distintos dos filtros (selects da tela)
 */

const MAX_LIMIT = 100

function previewOf(q: BankQuestion) {
  return {
    id: q.id,
    banca: q.banca,
    concurso: q.concurso,
    nivel: q.nivel,
    materia: q.materia,
    assunto: q.assunto,
    ano: q.ano,
    tipo: q.tipo,
    statement: q.statement.length > 240 ? q.statement.slice(0, 240).trimEnd() + '…' : q.statement,
    optionsCount: q.options.length,
    hasComment: Boolean(q.comment),
    createdAt: q.createdAt,
  }
}

export async function GET(req: NextRequest) {
  const check = await validateUserSession(req)
  if (!check.ok || !check.user) {
    return NextResponse.json({ ok: false, error: 'nao-autenticado' }, { status: 401 })
  }

  const sp = req.nextUrl.searchParams
  const banca = (sp.get('banca') ?? '').trim().toLowerCase()
  const materia = (sp.get('materia') ?? '').trim().toLowerCase()
  const concurso = (sp.get('concurso') ?? '').trim().toLowerCase()
  const nivel = (sp.get('nivel') ?? '').trim().toLowerCase()
  const ano = Math.floor(Number(sp.get('ano')) || 0)
  const q = (sp.get('q') ?? '').trim().toLowerCase()
  const wantFacets = sp.get('facets') === '1'
  const sample = Math.min(MAX_LIMIT, Math.max(0, Math.floor(Number(sp.get('sample')) || 0)))
  const limit = Math.min(MAX_LIMIT, Math.max(1, Math.floor(Number(sp.get('limit')) || 20)))
  const offset = Math.max(0, Math.floor(Number(sp.get('offset')) || 0))

  const all = (await listQuestions()).filter((x) => x.active)

  const filtered = all.filter((x) => {
    if (banca && x.banca.toLowerCase() !== banca) return false
    if (materia && x.materia.toLowerCase() !== materia) return false
    if (concurso && !x.concurso.toLowerCase().includes(concurso)) return false
    if (nivel && x.nivel.toLowerCase() !== nivel) return false
    if (ano && x.ano !== ano) return false
    if (q && !`${x.statement} ${x.assunto ?? ''}`.toLowerCase().includes(q)) return false
    return true
  })

  if (sample > 0) {
    // embaralhamento aleatório (Fisher-Yates) — prática estilo Qconcursos
    const pool = [...filtered]
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[pool[i], pool[j]] = [pool[j], pool[i]]
    }
    const picked = pool.slice(0, sample).map((x) => ({
      id: x.id,
      banca: x.banca,
      concurso: x.concurso,
      nivel: x.nivel,
      materia: x.materia,
      assunto: x.assunto,
      ano: x.ano,
      tipo: x.tipo,
      statement: x.statement,
      options: x.options,
      answer: x.answer,
      comment: x.comment,
    }))
    return NextResponse.json({ ok: true, total: filtered.length, questions: picked })
  }

  const page = filtered.slice(offset, offset + limit)

  const facets = wantFacets
    ? {
        bancas: [...new Set(all.map((x) => x.banca))].sort((a, b) => a.localeCompare(b, 'pt-BR')),
        materias: [...new Set(all.map((x) => x.materia))].sort((a, b) => a.localeCompare(b, 'pt-BR')),
        concursos: [...new Set(all.map((x) => x.concurso))].sort((a, b) => a.localeCompare(b, 'pt-BR')),
        niveis: [...new Set(all.map((x) => x.nivel))].sort((a, b) => a.localeCompare(b, 'pt-BR')),
        anos: [...new Set(all.map((x) => x.ano))].sort((a, b) => b - a),
      }
    : undefined

  return NextResponse.json({
    ok: true,
    total: filtered.length,
    questions: page.map(previewOf),
    facets,
  })
}
