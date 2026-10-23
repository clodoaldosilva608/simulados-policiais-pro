import { NextResponse } from 'next/server'
import { getAppConfig } from '@/lib/content'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/config — configuração DINÂMICA do app (editável no painel admin).
 * Pública: preço, limites do plano grátis, checkout e suporte. O cliente faz
 * merge sobre os padrões embutidos (offline-first).
 */
export async function GET() {
  const cfg = await getAppConfig()
  return NextResponse.json({
    ok: true,
    config: {
      price: cfg.price,
      trialDays: cfg.trialDays,
      freeSimuladosPerMonth: cfg.freeSimuladosPerMonth,
      freeQuestionsPerDay: cfg.freeQuestionsPerDay,
      freeComments: cfg.freeComments,
      checkoutUrl: cfg.checkoutUrl,
      supportEmail: cfg.supportEmail,
    },
  })
}
