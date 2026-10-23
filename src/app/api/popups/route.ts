import { NextRequest, NextResponse } from 'next/server'
import { listPopups, popupsForScreen } from '@/lib/content'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/popups?screen=library — pop-ups ativos elegíveis para a tela.
 * Público (conteúdo de marketing definido pelo admin; o controle de
 * frequência por usuário acontece no cliente, em localStorage).
 */
export async function GET(req: NextRequest) {
  const screen = (req.nextUrl.searchParams.get('screen') ?? '').trim()
  const popups = await listPopups()
  return NextResponse.json({ ok: true, popups: popupsForScreen(popups, screen) })
}
