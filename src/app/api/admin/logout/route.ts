import { NextResponse } from 'next/server'
import { clearCookieHeader } from '@/lib/admin-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Encerra a sessão do painel admin neste navegador. */
export async function POST() {
  return NextResponse.json({ ok: true }, { headers: { 'Set-Cookie': clearCookieHeader() } })
}
