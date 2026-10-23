import { NextResponse, NextRequest } from 'next/server'
import { upsertUser } from '@/lib/blob-registry'
import { accessOf, rateLimit, validateUserSession } from '@/lib/user-auth'
import { planLimitsFor } from '@/lib/content'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/usage/simulado — cota mensal de GERAÇÃO de simulados do plano grátis.
 *
 * Chamado pelo cliente QUANDO um novo simulado começa a ser gerado (upload de
 * PDF novo — retomadas não contam). No servidor é a fonte autoritativa, pois a
 * geração com IA tem custo real:
 *
 * • assinante ativo / teste grátis → { ok: true, unlimited: true } (não registra)
 * • plano grátis (teste expirado / assinatura cancelada) → registra 1 no mês
 *   (campo genLog do usuário, com timestamps do mês corrente) e recusa com 402
 *   quando a cota acabou. LIMITE dinâmico: config do admin ou plano customizado
 *   atribuído à conta (planLimitsFor).
 */

function monthKey(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

export async function POST(req: NextRequest) {
  const check = await validateUserSession(req)
  if (!check.ok || !check.user) {
    return NextResponse.json(
      { ok: false, error: 'Sessão encerrada. Entre na sua conta para gerar simulados.' },
      { status: 401 },
    )
  }
  if (!rateLimit(`gen:${check.user.id}`, 30, 3_600_000)) {
    return NextResponse.json(
      { ok: false, error: 'Muitas tentativas seguidas. Aguarde alguns minutos.' },
      { status: 429 },
    )
  }

  const user = check.user
  const acc = accessOf(user)
  if (acc.status === 'active' || acc.status === 'trial') {
    return NextResponse.json({ ok: true, unlimited: true })
  }

  const now = new Date()
  const mk = monthKey(now)
  const log = (user.genLog ?? [])
    .filter((t) => Number.isFinite(t) && monthKey(new Date(t)) === mk)
    .sort((a, b) => a - b)

  // limite dinâmico: config do painel admin / plano customizado da conta
  const limits = await planLimitsFor(user.customPlanId)
  const monthlyLimit = limits.freeSimuladosPerMonth

  if (log.length >= monthlyLimit) {
    return NextResponse.json(
      {
        ok: false,
        reason: 'quota',
        remaining: 0,
        error: `Você já gerou os ${monthlyLimit} simulados do plano grátis neste mês.`,
      },
      { status: 402 },
    )
  }

  log.push(now.getTime())
  try {
    await upsertUser(user.id, { genLog: log }, { serverAction: true })
  } catch {
    /* falha de registro não deve travar a geração (cota local continua valendo) */
  }

  return NextResponse.json({
    ok: true,
    remaining: Math.max(0, monthlyLimit - log.length),
  })
}
