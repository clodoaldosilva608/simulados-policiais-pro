import { NextRequest, NextResponse } from 'next/server'
import { adminFromRequest } from '@/lib/admin-auth'
import { appendEvent, blobConfigured } from '@/lib/blob-registry'
import { getAppConfig, saveAppConfig } from '@/lib/content'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** GET/PUT /api/admin/config — configuração dinâmica da aplicação (painel). */

export async function GET(req: NextRequest) {
  if (!adminFromRequest(req)) {
    return NextResponse.json({ ok: false, error: 'nao-autenticado' }, { status: 401 })
  }
  const config = await getAppConfig()
  return NextResponse.json({ ok: true, config })
}

export async function PUT(req: NextRequest) {
  if (!adminFromRequest(req)) {
    return NextResponse.json({ ok: false, error: 'nao-autenticado' }, { status: 401 })
  }
  if (!blobConfigured()) {
    return NextResponse.json({ ok: false, error: 'armazenamento-nao-configurado' }, { status: 503 })
  }
  try {
    const body = (await req.json()) as Record<string, unknown>
    const config = await saveAppConfig(body)
    void appendEvent({
      type: 'admin_config_saved',
      message: `Configuração salva: ${config.price}/mês · teste ${config.trialDays}d · grátis ${config.freeSimuladosPerMonth} simulados/mês e ${config.freeQuestionsPerDay} questões/dia`,
      source: 'admin',
    })
    return NextResponse.json({ ok: true, config })
  } catch {
    return NextResponse.json({ ok: false, error: 'requisicao-invalida' }, { status: 400 })
  }
}
