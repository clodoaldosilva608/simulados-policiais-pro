import { NextRequest, NextResponse } from 'next/server'
import { validateUserSession } from '@/lib/user-auth'
import { listMaterials } from '@/lib/content'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** GET /api/materials — materiais de estudo ativos para o aluno (autenticado). */
export async function GET(req: NextRequest) {
  const check = await validateUserSession(req)
  if (!check.ok || !check.user) {
    return NextResponse.json({ ok: false, error: 'nao-autenticado' }, { status: 401 })
  }
  const materials = (await listMaterials()).filter((m) => m.active)
  return NextResponse.json({ ok: true, materials })
}
