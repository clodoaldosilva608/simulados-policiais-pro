import { NextRequest, NextResponse } from 'next/server'
import { adminFromRequest } from '@/lib/admin-auth'
import { activeBackend, blobConfigured } from '@/lib/blob-registry'
import { pgConfigured, pgDiag } from '@/lib/pg-registry'
import { get, list, put } from '@vercel/blob'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * DIAGNÓSTICO DO ARMAZENAMENTO — sonda o backend ativo (Postgres primeiro,
 * depois Blob) e reporta o erro REAL (suspensa por cota / deletada / token
 * inválido) para o painel admin. Usado pela aba Ajustes: o dono vê exatamente
 * POR QUE os logins falham.
 */

interface ProbeResult {
  op: string
  ok: boolean
  code?: string
  message?: string
}

function describe(err: unknown): { code: string; message: string } {
  const e = err as { name?: string; message?: string; statusCode?: number; code?: string }
  const msg = e?.message ?? String(err)
  let code = e?.code ?? e?.name ?? 'erro'
  if (/limits-exceeded|suspended/i.test(msg) || /limits-exceeded|suspended/i.test(code)) {
    code = 'store-suspensa-cota'
  } else if (/not[- ]?found|404|does not exist/i.test(msg)) {
    code = 'arquivo-ou-store-inexistente'
  } else if (/unauthorized|forbidden|401|403/i.test(msg)) {
    code = 'token-sem-permissao'
  }
  return { code, message: msg.slice(0, 300) }
}

export async function GET(req: NextRequest) {
  if (!adminFromRequest(req)) {
    return NextResponse.json({ ok: false, error: 'nao-autenticado' }, { status: 401 })
  }

  const backend = activeBackend()
  const probes: ProbeResult[] = []

  /* ---------- BACKEND POSTGRES (Supabase) — primário ---------- */
  if (backend === 'postgres') {
    const pg = await pgDiag()
    for (const o of pg.ops) {
      probes.push({ op: `pg:${o.op}`, ok: o.ok, message: o.message })
    }
    const failing = probes.filter((p) => !p.ok)
    const verdict = failing.length === 0 ? 'operacional' : 'indisponivel'
    return NextResponse.json({
      ok: true,
      backend,
      configured: true,
      verdict,
      probes,
      dica:
        verdict === 'operacional'
          ? 'Armazenamento Postgres (Supabase) respondendo normalmente — contorno à store Blob suspensa ativo.'
          : 'Postgres indisponível. Verifique a conexão da store supabase-meucorre em vercel.com → Storage.',
    })
  }

  /* ---------- BACKEND BLOB — legado/fallback ---------- */
  const configured = blobConfigured()

  if (configured) {
    // 1) listagem (leitura do diretório de usuários)
    try {
      const page = await list({ prefix: 'users/', limit: 5 })
      probes.push({ op: 'list(users/)', ok: true, message: `${page.blobs.length} blobs na página` })
    } catch (err) {
      const d = describe(err)
      probes.push({ op: 'list(users/)', ok: false, code: d.code, message: d.message })
    }

    // 2) leitura de arquivo conhecido (índice de e-mails)
    try {
      await get('index/auth-emails.json', { access: 'private', useCache: false })
      probes.push({ op: 'get(index/auth-emails.json)', ok: true })
    } catch (err) {
      const d = describe(err)
      // "not found" significa que a store FUNCIONA (só não tem o arquivo)
      probes.push(
        d.code === 'arquivo-ou-store-inexistente'
          ? { op: 'get(index/auth-emails.json)', ok: true, message: 'arquivo inexistente (store ok)' }
          : { op: 'get(index/auth-emails.json)', ok: false, code: d.code, message: d.message },
      )
    }

    // 3) escrita de sonda (arquivo de diagnóstico, sem valor de dados)
    try {
      await put('diag/probe.json', JSON.stringify({ at: Date.now() }), {
        access: 'private',
        contentType: 'application/json',
        addRandomSuffix: false,
        allowOverwrite: true,
      })
      probes.push({ op: 'put(diag/probe.json)', ok: true })
    } catch (err) {
      const d = describe(err)
      probes.push({ op: 'put(diag/probe.json)', ok: false, code: d.code, message: d.message })
    }
  }

  const failing = probes.filter((p) => !p.ok)
  const suspended = failing.some((p) => p.code === 'store-suspensa-cota')
  const verdict = !configured
    ? 'nao-configurado'
    : failing.length === 0
      ? 'operacional'
      : suspended
        ? 'suspensa-por-cota'
        : failing.some((p) => p.code === 'token-sem-permissao')
          ? 'credencial-invalida'
          : 'indisponivel'

  return NextResponse.json({
    ok: true,
    backend,
    configured,
    verdict,
    probes,
    dica:
      verdict === 'suspensa-por-cota'
        ? 'A store Blob foi suspensa por excesso de uso. O contorno é migrar para Postgres: conecte uma store Supabase/Neon ao projeto (POSTGRES_URL) e faça redeploy.'
        : verdict === 'credencial-invalida'
          ? 'O token do Blob está inválido/sem permissão. Recrie a store em vercel.com → Storage e reconecte ao projeto.'
          : verdict === 'operacional'
            ? 'Armazenamento respondendo normalmente.'
            : 'Armazenamento indisponível. Verifique a store em vercel.com → Storage.',
  })
}
