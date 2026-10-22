import { NextRequest, NextResponse } from 'next/server'
import { blobConfigured, upsertUser } from '@/lib/blob-registry'
import { clearUserCookieHeader, validateUserSession } from '@/lib/user-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/auth/logout — encerra a sessão neste aparelho e LIBERA o vínculo
 * de dispositivo (a conta volta a poder ser usada em qualquer aparelho).
 */
export async function POST(req: NextRequest) {
  if (blobConfigured()) {
    const check = await validateUserSession(req)
    if (check.ok && check.user && check.session) {
      try {
        await upsertUser(
          check.user.id,
          { activeDevice: undefined, activeDeviceAt: undefined },
          { serverAction: true, heartbeat: false },
        )
      } catch {
        /* não bloqueia o logout */
      }
    }
  }
  return NextResponse.json({ ok: true }, { headers: { 'Set-Cookie': clearUserCookieHeader() } })
}
