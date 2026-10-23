import { NextResponse, NextRequest } from 'next/server'
import { adminFromRequest } from '@/lib/admin-auth'
import {
  addAccessCode,
  appendEvent,
  blobConfigured,
  generateAccessCode,
  getAccessCodes,
  removeAccessCode,
} from '@/lib/blob-registry'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Gerenciamento de códigos de acesso (SPP-XXXX-XXXX-XXXX) pelo admin. */

export async function GET(req: NextRequest) {
  if (!adminFromRequest(req)) {
    return NextResponse.json({ ok: false, error: 'nao-autenticado' }, { status: 401 })
  }
  const codes = await getAccessCodes()
  return NextResponse.json({ ok: true, codes })
}

export async function POST(req: NextRequest) {
  if (!adminFromRequest(req)) {
    return NextResponse.json({ ok: false, error: 'nao-autenticado' }, { status: 401 })
  }
  if (!blobConfigured()) {
    return NextResponse.json({ ok: false, error: 'armazenamento-nao-configurado' }, { status: 503 })
  }

  let body: { code?: unknown; note?: unknown }
  try {
    body = (await req.json()) as typeof body
  } catch {
    return NextResponse.json({ ok: false, error: 'requisicao-invalida' }, { status: 400 })
  }

  const code =
    typeof body.code === 'string' && body.code.trim()
      ? body.code.trim().toUpperCase()
      : generateAccessCode()

  await addAccessCode(code, typeof body.note === 'string' ? body.note.slice(0, 120) : undefined)
  void appendEvent({ type: 'code_created', message: `Código de acesso criado: ${code}`, source: 'admin' })
  const codes = await getAccessCodes()
  return NextResponse.json({ ok: true, code, codes })
}

export async function DELETE(req: NextRequest) {
  if (!adminFromRequest(req)) {
    return NextResponse.json({ ok: false, error: 'nao-autenticado' }, { status: 401 })
  }
  const code = req.nextUrl.searchParams.get('code')?.trim().toUpperCase()
  if (!code) {
    return NextResponse.json({ ok: false, error: 'codigo-ausente' }, { status: 400 })
  }
  await removeAccessCode(code)
  void appendEvent({ type: 'code_deleted', message: `Código de acesso removido: ${code}`, source: 'admin' })
  const codes = await getAccessCodes()
  return NextResponse.json({ ok: true, codes })
}
