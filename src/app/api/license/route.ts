import { NextResponse, NextRequest } from 'next/server'

export const runtime = 'nodejs'

function allowedCodes(): string[] {
  return (process.env.ACCESS_CODES ?? '')
    .split(',')
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean)
}

/** GET /api/license — indica se o servidor valida códigos cadastrados */
export async function GET() {
  return NextResponse.json({ configured: allowedCodes().length > 0 })
}

/**
 * POST /api/license — valida um código de acesso entregue pela Cakto.
 *
 * • Com ACCESS_CODES definido: o código precisa estar na lista.
 * • Sem ACCESS_CODES: aceita o formato SPP-XXXX-XXXX-XXXX (modo demonstração —
 *   configure ACCESS_CODES na Vercel antes de vender de verdade).
 */
export async function POST(req: NextRequest) {
  let body: { code?: unknown }
  try {
    body = (await req.json()) as typeof body
  } catch {
    return NextResponse.json({ valid: false, message: 'Requisição inválida' }, { status: 400 })
  }

  const code = typeof body.code === 'string' ? body.code.trim().toUpperCase() : ''
  if (!code) {
    return NextResponse.json({ valid: false, message: 'Digite o código de acesso' }, { status: 400 })
  }

  const codes = allowedCodes()

  if (codes.length > 0) {
    if (codes.includes(code)) {
      return NextResponse.json({ valid: true, plan: 'mensal' })
    }
    return NextResponse.json(
      { valid: false, message: 'Código não reconhecido. Confira o e-mail de compra ou fale com o suporte.' },
      { status: 200 },
    )
  }

  // Modo demonstração: valida apenas o formato do código
  const formatOk = /^SPP-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code)
  return NextResponse.json({
    valid: formatOk,
    message: formatOk
      ? undefined
      : 'Formato inválido. O código tem o formato SPP-XXXX-XXXX-XXXX (verifique o e-mail de compra).',
  })
}
