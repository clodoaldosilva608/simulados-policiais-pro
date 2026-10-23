import { NextRequest, NextResponse } from 'next/server'
import { appendEvent, blobConfigured, upsertUser } from '@/lib/blob-registry'
import { validateUserSession } from '@/lib/user-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/auth/profile — atualiza os dados editáveis da conta.
 *
 * • name  — nome de exibição (opcional, ≤ 80 chars)
 * • photo — foto de perfil como data URL (image/*, até ~150 KB após o
 *   redimensionamento no cliente) OU null para REMOVER a foto atual.
 *
 * O e-mail NÃO pode ser alterado por aqui: é a identidade de login (índice
 * único) e a chave de ativação Cakto — mudança só via suporte.
 */
export async function POST(req: NextRequest) {
  if (!blobConfigured()) {
    return NextResponse.json(
      { ok: false, message: 'Armazenamento de contas não configurado neste ambiente.' },
      { status: 503 },
    )
  }

  const check = await validateUserSession(req)
  if (!check.ok) {
    return NextResponse.json({ ok: false, message: 'Sessão encerrada. Entre novamente.' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ ok: false, message: 'Requisição inválida.' }, { status: 400 })
  }

  const patch: Record<string, string | undefined> = {}
  let touchedName = false
  let touchedPhoto = false

  if ('name' in body) {
    touchedName = true
    const name = typeof body.name === 'string' ? body.name.trim().slice(0, 80) : ''
    if (name && name.length < 2) {
      return NextResponse.json({ ok: false, message: 'Nome muito curto.' }, { status: 400 })
    }
    patch.name = name || undefined
  }

  if ('photo' in body) {
    touchedPhoto = true
    const photo = body.photo
    if (photo === null) {
      patch.photo = undefined // remover
    } else if (typeof photo === 'string' && photo.startsWith('data:image/')) {
      // data URL: data:image/(png|jpeg|webp);base64,<payload>
      const m = /^data:image\/(?:png|jpeg|jpg|webp);base64,[A-Za-z0-9+/=]+$/.exec(photo)
      if (!m) {
        return NextResponse.json(
          { ok: false, message: 'Formato de imagem não suportado. Use JPG ou PNG.' },
          { status: 400 },
        )
      }
      if (photo.length > 160_000) {
        return NextResponse.json(
          { ok: false, message: 'Foto muito grande. Escolha outra imagem.' },
          { status: 413 },
        )
      }
      patch.photo = photo
    } else {
      return NextResponse.json({ ok: false, message: 'Imagem inválida.' }, { status: 400 })
    }
  }

  if (!touchedName && !touchedPhoto) {
    return NextResponse.json({ ok: false, message: 'Nada para atualizar.' }, { status: 400 })
  }

  try {
    const user = await upsertUser(check.user!.id, patch, { serverAction: true })
    void appendEvent({
      type: 'profile_updated',
      email: user.email,
      message: `Perfil atualizado${touchedName ? ' (nome)' : ''}${touchedPhoto ? ' (foto)' : ''}`,
      source: 'app',
    })
    return NextResponse.json({
      ok: true,
      user: { name: user.name, email: user.email, photo: user.photo },
    })
  } catch {
    return NextResponse.json(
      { ok: false, message: 'Não foi possível salvar agora. Tente novamente.' },
      { status: 500 },
    )
  }
}
