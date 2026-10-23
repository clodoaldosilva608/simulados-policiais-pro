'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BadgeCheck,
  BookOpenCheck,
  CheckCircle2,
  CheckCheck,
  ChevronRight,
  FileText,
  Landmark,
  ListOrdered,
  Lock,
  PlayCircle,
  Share2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Swords,
  Target,
  Timer,
  TrendingUp,
  WifiOff,
  X,
} from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { OFFICIAL_PACKS, STATIC_PACK } from '@/data/simulado'
import { SITE, FREE_PLAN, checkoutConfigured } from '@/config/site'
import { shareApp } from '@/lib/share'

interface LandingPageProps {
  /** Botão "Já sou assinante" */
  onEnterAccess: () => void
  /** Iniciar teste grátis imediatamente */
  onStartTrial: () => void
}

const CARREIRAS = [
  { sigla: 'PF', nome: 'Polícia Federal' },
  { sigla: 'PC', nome: 'Polícia Civil' },
  { sigla: 'PM', nome: 'Polícia Militar' },
  { sigla: 'PRF', nome: 'Polícia Rodoviária Federal' },
  { sigla: 'PPF', nome: 'Polícia Penal Federal' },
  { sigla: 'PP', nome: 'Polícia Penal Estadual' },
]

const FEATURES = [
  {
    icon: BadgeCheck,
    title: 'Provas oficiais recentes',
    text: 'Questões reais de concursos policiais dos últimos anos — PF, PC, PM, PRF e Polícia Penal — com gabarito oficial das bancas.',
  },
  {
    icon: CheckCheck,
    title: 'Modelo Certo/Errado',
    text: 'Treine no estilo CEBRASPE: julgue cada item como certo ou errado, com atalhos rápidos e feedback imediato.',
  },
  {
    icon: ListOrdered,
    title: 'Modelo A, B, C, D, E',
    text: 'Múltipla escolha completa com 5 alternativas, no padrão FGV, VUNESP e demais bancas.',
  },
  {
    icon: FileText,
    title: 'Qualquer PDF vira simulado',
    text: 'Envie edital, apostila, resumo ou legislação e a inteligência artificial cria questões inéditas com gabarito comentado.',
  },
  {
    icon: Timer,
    title: 'Modo prova e modo estudo',
    text: 'Cronômetro real e correção no final — ou resposta comentada na hora para fixar o conteúdo.',
  },
  {
    icon: TrendingUp,
    title: 'Desempenho por disciplina',
    text: 'Veja em quais matérias você está indo bem e onde precisa reforçar antes da prova.',
  },
]

const FAQ_STATIC = [
  {
    q: 'Como recebo meu acesso depois de pagar?',
    a: 'É automático: na tela “Já sou assinante”, informe o MESMO e-mail que você usou no pagamento na Cakto. O app confirma sua assinatura ativa na hora e libera todo o conteúdo neste aparelho. Também é possível ativar com um código de acesso, se você tiver um.',
  },
  {
    q: 'Preciso instalar algum aplicativo?',
    a: 'Não. O Simulados Policiais Pro funciona direto no navegador do seu celular ou computador. No Android e no iPhone você pode “Adicionar à tela de início” para abrir como se fosse um app.',
  },
  {
    q: 'Onde ficam meus dados e os PDFs que eu enviar?',
    a: 'Tudo é salvo de forma LOCAL no seu próprio aparelho (armazenamento do navegador). Seus materiais de estudo não ficam em nuvem e não são compartilhados. Você pode apagar cada simulado quando quiser.',
  },
  {
    q: 'Quais provas estão disponíveis hoje?',
    a: 'Provas oficiais com gabarito: PF 2025 (Certo/Errado), PC-CE Delegado 2025, PM-RJ Soldado 2024 (FGV), PRF 2021 e itens inéditos de Polícia Penal no estilo CEBRASPE — além do simulado completo PC-PE Agente. E você ainda transforma seus próprios PDFs em simulados.',
  },
  {
    q: 'Funciona sem internet?',
    a: 'As provas embutidas no app ficam salvas no aparelho: depois de abrir a página uma vez, você estuda mesmo offline. Apenas a geração de questões a partir de PDFs precisa de conexão.',
  },
]

export function LandingPage({ onEnterAccess, onStartTrial }: LandingPageProps) {
  // CONFIG DINÂMICA (painel admin): preço, dias de teste e limites do plano grátis
  const [cfg, setCfg] = useState({
    price: SITE.price,
    trialDays: SITE.trialDays,
    simulados: FREE_PLAN.simuladosPerMonth,
    questions: FREE_PLAN.questionsPerDay,
    checkoutUrl: SITE.checkoutUrl,
  })
  useEffect(() => {
    let alive = true
    fetch('/api/config')
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { config?: { price?: string; trialDays?: number; freeSimuladosPerMonth?: number; freeQuestionsPerDay?: number; checkoutUrl?: string } } | null) => {
        if (!alive || !d?.config) return
        setCfg({
          price: d.config.price ?? SITE.price,
          trialDays: d.config.trialDays ?? SITE.trialDays,
          simulados: d.config.freeSimuladosPerMonth ?? FREE_PLAN.simuladosPerMonth,
          questions: d.config.freeQuestionsPerDay ?? FREE_PLAN.questionsPerDay,
          checkoutUrl: d.config.checkoutUrl || SITE.checkoutUrl,
        })
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  const faqItems = [
    {
      q: `O que acontece quando o teste grátis de ${cfg.trialDays} dias termina?`,
      a: `Você continua usando o app no PLANO GRÁTIS, para sempre e sem pagar nada: até ${cfg.simulados} simulados gerados por mês, até ${cfg.questions} questões por dia e sem os comentários de professor. Se quiser estudar sem limites — simulados ilimitados, questões sem cota diária e comentário em todas as questões — basta assinar o plano Assinante por ${cfg.price}/mês (menos de R$ 0,60 por dia).`,
    },
    {
      q: `Como funciona a assinatura de ${cfg.price}/mês?`,
      a: 'A cobrança recorrente é gerenciada 100% pela Cakto, plataforma segura de pagamentos. Você pode pagar com Pix, Pix Automático (débito automático) ou cartão de crédito e cancelar quando quiser, direto no seu e-mail de compra — sem multa e sem burocracia.',
    },
    ...FAQ_STATIC,
  ]

  const [paywallHint, setPaywallHint] = useState(false)

  // MODO DUPLA — desafio recebido pelo link (?desafio=X&de=Nome):
  // mostra o banner "Fulano fez X%, aceita superar?" no topo do hero.
  const [challenge, setChallenge] = useState<{ pct: number; from: string } | null>(null)
  useEffect(() => {
    // Deferido pós-pintura: a landing é SSR, o parâmetro só existe no cliente
    const id = window.setTimeout(() => {
      try {
        const params = new URLSearchParams(window.location.search)
        const pct = Number(params.get('desafio'))
        if (!Number.isFinite(pct) || pct <= 0 || pct > 100) return
        const from = (params.get('de') ?? '').replace(/[<>\"'\\]/g, '').trim().slice(0, 24)
        setChallenge({ pct: Math.round(pct), from })
      } catch {
        /* desafio é opcional */
      }
    }, 0)
    return () => window.clearTimeout(id)
  }, [])

  const stats = useMemo(() => {
    const officialQuestions = OFFICIAL_PACKS.reduce((sum, p) => sum + p.questions.length, 0)
    const totalQuestions = officialQuestions + STATIC_PACK.questions.length
    const corporacoes = new Set(OFFICIAL_PACKS.map((p) => p.carreira)).size
    return { totalQuestions, corporacoes: Math.max(corporacoes, 6) }
  }, [])

  const handleSubscribe = () => {
    if (checkoutConfigured()) {
      window.open(cfg.checkoutUrl, '_blank', 'noopener,noreferrer')
    } else {
      setPaywallHint(true)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Cabeçalho fixo */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 text-white backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-2.5 px-4 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-400 text-slate-950">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold leading-tight">{SITE.name}</p>
            <p className="hidden text-[11px] leading-tight text-slate-400 sm:block">
              Estude pelo celular • {SITE.price}{SITE.period}
            </p>
          </div>
          <Button
            onClick={onEnterAccess}
            variant="outline"
            className="h-9 border-slate-700 bg-transparent px-3 text-xs font-bold text-white hover:bg-slate-800 hover:text-white"
          >
            <Lock className="mr-1.5 h-3.5 w-3.5" /> Entrar
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* HERO */}
        <section className="bg-slate-950 text-white">
          <div className="mx-auto max-w-6xl px-4 pb-12 pt-10 sm:pb-16 sm:pt-14">
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <Badge className="mb-4 gap-1.5 border border-amber-400/30 bg-amber-400/10 text-amber-300 hover:bg-amber-400/10">
                <BadgeCheck className="h-3.5 w-3.5" /> Provas oficiais 2021–2025 com gabarito
              </Badge>
              <h1 className="max-w-2xl text-3xl font-black leading-tight tracking-tight sm:text-4xl md:text-5xl">
                Simulados interativos de <span className="text-amber-400">concursos policiais</span> no seu celular
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                Provas reais da PF, PC, PM, PRF e Polícia Penal com correção e comentário — e ainda transforme
                qualquer PDF em um simulado novo com IA. Estude no ônibus, na fila, onde quiser.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  onClick={onStartTrial}
                  className="h-13 h-[52px] bg-amber-400 px-6 text-base font-black text-slate-950 shadow-lg shadow-amber-400/20 hover:bg-amber-300"
                >
                  <PlayCircle className="mr-2 h-5 w-5" /> Criar conta e testar {SITE.trialDays} dias grátis
                </Button>
                <Button
                  onClick={handleSubscribe}
                  className="h-[52px] border border-slate-700 bg-slate-900 px-6 text-base font-bold text-white hover:bg-slate-800"
                >
                  Assinar {SITE.price}{SITE.period}
                  <ChevronRight className="ml-1 h-4 w-4 text-amber-400" />
                </Button>
                <Button
                  onClick={shareApp}
                  className="h-[52px] border border-slate-700 bg-transparent px-6 text-base font-bold text-slate-200 hover:bg-slate-800 hover:text-white"
                >
                  <Share2 className="mr-2 h-5 w-5 text-amber-400" /> Compartilhar
                </Button>
              </div>
              <p className="mt-3 text-xs text-slate-400">
                Cria conta com e-mail e senha • Um aparelho por vez • Cancele quando quiser • Pix, Pix Automático e cartão via Cakto
              </p>

              {/* Banner do desafio recebido (modo dupla) */}
              {challenge && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="relative mt-5 max-w-xl rounded-2xl border-2 border-amber-400 bg-gradient-to-br from-amber-400/15 to-amber-400/5 px-5 py-4 shadow-lg shadow-amber-400/10"
                >
                  <button
                    type="button"
                    onClick={() => setChallenge(null)}
                    aria-label="Dispensar desafio"
                    className="absolute right-2.5 top-2.5 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-slate-950">
                      <Swords className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-black text-amber-300">
                        {challenge.from ? `Desafio de ${challenge.from}!` : 'Você recebeu um desafio!'}
                      </p>
                      <p className="mt-0.5 text-sm leading-snug text-slate-200">
                        {challenge.from ? `${challenge.from} fez ` : 'Fizeram '}
                        <b className="text-white">{challenge.pct}%</b> nos simulados policiais. Aceita o desafio de
                        superar essa nota?
                      </p>
                      <Button
                        onClick={onStartTrial}
                        className="mt-2.5 h-10 bg-amber-400 px-4 text-sm font-black text-slate-950 hover:bg-amber-300"
                      >
                        Aceitar desafio — começar agora
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Carreiras */}
            <div className="mt-8 flex flex-wrap gap-2">
              {CARREIRAS.map((c) => (
                <span
                  key={c.sigla}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200"
                >
                  <Landmark className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-amber-300">{c.sigla}</span> {c.nome}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* NÚMEROS */}
        <section className="border-b border-slate-200 bg-slate-50">
          <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-slate-200 px-4 py-6 sm:grid-cols-4">
            {[
              { valor: `${stats.totalQuestions}+`, rotulo: 'questões com gabarito' },
              { valor: String(stats.corporacoes), rotulo: 'corporações policiais' },
              { valor: '2', rotulo: 'modelos: C/E e A–E' },
              { valor: '100%', rotulo: 'no seu celular' },
            ].map((s) => (
              <div key={s.rotulo} className="px-3 py-1 text-center">
                <p className="text-2xl font-black text-slate-900 sm:text-3xl">{s.valor}</p>
                <p className="mt-0.5 text-[11px] leading-tight text-slate-500 sm:text-xs">{s.rotulo}</p>
              </div>
            ))}
          </div>
        </section>

        {/* RECURSOS */}
        <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <h2 className="text-center text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Tudo que você precisa para <span className="text-amber-500">passar</span>
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-sm leading-relaxed text-slate-500">
            Feito para a rotina do concurseiro policial: sessões curtas, questões de verdade e correção na hora.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: Math.min(i * 0.05, 0.3) }}
              >
                <Card className="h-full border-slate-200 transition-shadow hover:shadow-md">
                  <CardContent className="p-5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900">
                      <f.icon className="h-6 w-6 text-amber-300" />
                    </div>
                    <h3 className="mt-3.5 text-base font-bold text-slate-900">{f.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{f.text}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* COMO FUNCIONA */}
        <section className="border-y border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
            <h2 className="text-center text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Simples como estudar deve ser
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                {
                  icon: Smartphone,
                  passo: '1',
                  titulo: 'Abra no seu celular',
                  texto: 'Sem instalar nada: funciona no navegador e você pode adicionar à tela de início como um app.',
                },
                {
                  icon: Target,
                  passo: '2',
                  titulo: 'Estude as provas ou envie seu PDF',
                  texto: 'Escolha uma prova oficial com gabarito — Certo/Errado ou A–E — ou transforme seu material em questões.',
                },
                {
                  icon: TrendingUp,
                  passo: '3',
                  titulo: 'Acompanhe a evolução',
                  texto: 'Nota, tempo, desempenho por disciplina e revisão comentada de cada questão errada.',
                },
              ].map((p) => (
                <div key={p.passo} className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <span className="absolute -top-3 left-5 flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-sm font-black text-slate-950">
                    {p.passo}
                  </span>
                  <p.icon className="mt-2 h-7 w-7 text-slate-900" />
                  <h3 className="mt-2.5 font-bold text-slate-900">{p.titulo}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{p.texto}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PLANOS — comparação Grátis x Assinante (o teste vira plano gratuito) */}
        <section id="preco" className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <h2 className="text-center text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Comece grátis. Assine quando <span className="text-amber-500">sentir a diferença</span>
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-sm leading-relaxed text-slate-500">
            Você testa {cfg.trialDays} dias com TUDO liberado. Depois, continua no plano Grátis — ou assina para não
            colocar limite na sua aprovação.
          </p>

          <div className="mx-auto mt-10 grid max-w-4xl items-start gap-5 lg:grid-cols-2">
            {/* PLANO GRÁTIS */}
            <Card className="h-full border-slate-200">
              <div className="border-b border-slate-100 px-6 py-4">
                <p className="text-sm font-bold uppercase tracking-wide text-slate-500">Plano Grátis</p>
                <p className="mt-1 text-3xl font-black tracking-tight text-slate-900">R$ 0</p>
                <p className="text-xs text-slate-400">para sempre, mesmo depois do teste</p>
              </div>
              <CardContent className="p-6">
                <ul className="space-y-2.5 text-sm text-slate-700">
                  {[
                    `${cfg.trialDays} dias de teste com TUDO liberado (sem cartão)`,
                    `Depois: até ${cfg.simulados} simulados gerados por mês (PDF ou aleatório)`,
                    `Até ${cfg.questions} questões por dia`,
                    'Todas as provas oficiais para explorar',
                    'Desempenho básico e histórico de tentativas',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span className="leading-snug">{item}</span>
                    </li>
                  ))}
                  {[
                    'Sem comentários de professor nas questões',
                    'Limites diários e mensais',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-slate-400">
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
                      <span className="leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={onStartTrial}
                  variant="outline"
                  className="mt-6 h-12 w-full border-slate-300 font-bold text-slate-700 hover:bg-slate-50"
                >
                  <PlayCircle className="mr-2 h-5 w-5" /> Criar conta grátis
                </Button>
              </CardContent>
            </Card>

            {/* PLANO ASSINANTE — destaque */}
            <Card className="relative h-full border-2 border-amber-400 shadow-xl shadow-amber-100">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-slate-950 px-4 py-1.5 text-[11px] font-black uppercase tracking-wide text-amber-300 shadow-lg">
                ★ Mais escolhido
              </span>
              <div className="border-b border-amber-100 bg-slate-950 px-6 py-4 text-white">
                <p className="text-sm font-bold uppercase tracking-wide text-amber-300">Assinante Pro</p>
                <div className="mt-1 flex items-end gap-1">
                  <p className="text-3xl font-black tracking-tight">{cfg.price}</p>
                  <p className="pb-1 text-sm font-semibold text-slate-400">{SITE.period}</p>
                </div>
                <p className="text-xs text-slate-400">menos de R$ 0,60 por dia • cancele quando quiser</p>
              </div>
              <CardContent className="p-6">
                <ul className="space-y-2.5 text-sm text-slate-700">
                  {[
                    `Tudo do plano grátis, SEM limites — e as ${stats.totalQuestions}+ questões oficiais`,
                    'Simulados de PDF e aleatórios ILIMITADOS, para sempre',
                    'Questões SEM limite diário — estude o quanto aguentar',
                    'COMENTÁRIO DE PROFESSOR em todas as questões (o segredo para não repetir o erro)',
                    'Caderno de erros com revisão 3/7/15 dias até dominar',
                    'Estatísticas completas por disciplina + novas provas assim que saem',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <BookOpenCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span className="leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={handleSubscribe}
                  className="mt-6 h-12 w-full bg-amber-400 text-base font-black text-slate-950 shadow-lg shadow-amber-400/25 hover:bg-amber-300"
                >
                  Assinar agora — {cfg.price}{SITE.period}
                </Button>
                <p className="mt-2 text-center text-[11px] leading-relaxed text-slate-400">
                  Pix, Pix Automático ou cartão via Cakto • ativação na hora • sem multa por cancelamento
                </p>
              </CardContent>
            </Card>
          </div>

          <p className="mx-auto mt-8 max-w-2xl text-center text-sm font-semibold text-slate-600">
            Quem resolve mais questões todos os dias passa antes. Simples assim — não limite a sua preparação.
          </p>
        </section>

        {/* FAQ */}
        <section className="border-t border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
            <h2 className="text-center text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Perguntas frequentes
            </h2>
            <Accordion type="single" collapsible className="mt-6">
              {faqItems.map((item, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="border-slate-200">
                  <AccordionTrigger className="text-left text-sm font-bold text-slate-800 hover:no-underline sm:text-base">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-slate-600">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="bg-slate-950 text-white">
          <div className="mx-auto max-w-6xl px-4 py-12 text-center sm:py-14">
            <Sparkles className="mx-auto h-8 w-8 text-amber-400" />
            <h2 className="mx-auto mt-3 max-w-xl text-2xl font-black leading-tight sm:text-3xl">
              Sua aprovação começa com a primeira questão resolvida
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-300">
              Comece agora com {SITE.trialDays} dias grátis — sem cartão de crédito.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                onClick={onStartTrial}
                className="h-12 w-full max-w-xs bg-amber-400 px-6 font-black text-slate-950 hover:bg-amber-300 sm:w-auto"
              >
                <PlayCircle className="mr-2 h-5 w-5" /> Criar conta e testar grátis
              </Button>
              <Button
                onClick={onEnterAccess}
                variant="ghost"
                className="h-12 w-full max-w-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white sm:w-auto"
              >
                <Lock className="mr-2 h-4 w-4" /> Já sou assinante
              </Button>
              <Button
                onClick={shareApp}
                variant="ghost"
                className="h-12 w-full max-w-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white sm:w-auto"
              >
                <Share2 className="mr-2 h-4 w-4 text-amber-400" /> Compartilhar com os amigos
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <WifiOff className="h-3.5 w-3.5" /> Estude offline
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" /> Dados só no seu aparelho
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" /> PDFs ilimitados
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* Rodapé */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-950 py-5 text-center">
        <p className="px-4 text-xs leading-relaxed text-slate-500">
          {SITE.name} • Material de estudo independente baseado em provas públicas. Sem vínculo com as bancas
          organizadoras ou com os órgãos citados.
        </p>
        <p className="mt-1.5 px-4 text-xs text-slate-600">
          Dúvidas? {SITE.supportEmail} • Pagamentos por Cakto
        </p>
        <p className="mt-2 px-4">
          <a
            href="/admin"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-slate-700 underline decoration-slate-800 underline-offset-2 transition-colors hover:text-slate-500"
          >
            Acesso administrativo
          </a>
        </p>
      </footer>

      {/* Aviso: checkout ainda não configurado */}
      <AlertDialog open={paywallHint} onOpenChange={setPaywallHint}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Pagamento em configuração</AlertDialogTitle>
            <AlertDialogDescription>
              O link de pagamento da Cakto ainda está sendo vinculado. Enquanto isso, você pode começar agora
              mesmo com o teste grátis de {SITE.trialDays} dias e acesso completo a todas as provas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel>Mais tarde</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setPaywallHint(false)
                onStartTrial()
              }}
              className="bg-amber-400 font-bold text-slate-950 hover:bg-amber-300"
            >
              Começar teste grátis
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
