'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  CheckCircle2,
  Flag,
  HelpCircle,
  Lightbulb,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { HtmlContent } from './html-content'
import { TextBlockCard } from './text-block-card'
import { getPackSubject, type OptionKey, type SimuladoPack } from '@/data/simulado'

type FilterKey = 'todas' | 'acertos' | 'erros' | 'branco' | 'sinalizadas'

interface ReviewScreenProps {
  pack: SimuladoPack
  answers: Record<number, OptionKey>
  marked: number[]
  onBack: () => void
}

function statusOf(
  questions: ReviewScreenProps['pack']['questions'],
  answers: Record<number, OptionKey>,
  qid: number,
): 'acertos' | 'erros' | 'branco' {
  const a = answers[qid]
  const q = questions.find((x) => x.id === qid)!
  if (!a) return 'branco'
  return a === q.answer ? 'acertos' : 'erros'
}

export function ReviewScreen({ pack, answers, marked, onBack }: ReviewScreenProps) {
  const [filter, setFilter] = useState<FilterKey>('todas')
  const markedSet = new Set(marked)
  const QUESTIONS = pack.questions

  const counts = useMemo(() => {
    let acertos = 0
    let erros = 0
    let branco = 0
    QUESTIONS.forEach((q) => {
      const s = statusOf(QUESTIONS, answers, q.id)
      if (s === 'acertos') acertos++
      else if (s === 'erros') erros++
      else branco++
    })
    return { todas: QUESTIONS.length, acertos, erros, branco, sinalizadas: marked.length }
  }, [QUESTIONS, answers, marked])

  const visible = QUESTIONS.filter((q) => {
    if (filter === 'todas') return true
    if (filter === 'sinalizadas') return markedSet.has(q.id)
    return statusOf(QUESTIONS, answers, q.id) === filter
  })

  const tabLabel: Record<FilterKey, string> = {
    todas: 'Todas',
    acertos: 'Acertos',
    erros: 'Erros',
    branco: 'Em branco',
    sinalizadas: 'Sinalizadas',
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Cabeçalho */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
          <Button variant="outline" size="sm" onClick={onBack} className="border-slate-300 bg-white">
            <ArrowLeft className="mr-1 h-4 w-4" /> Voltar
          </Button>
          <div>
            <h1 className="text-sm font-bold text-slate-900 sm:text-base">Revisão comentada — Gabarito oficial</h1>
            <p className="text-[11px] text-slate-500">
              {counts.acertos} acertos • {counts.erros} erros • {counts.branco} em branco
            </p>
          </div>
        </div>
        <div className="mx-auto max-w-4xl px-4 pb-3">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterKey)}>
            <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-slate-100 p-1">
              {(Object.keys(tabLabel) as FilterKey[]).map((k) => (
                <TabsTrigger key={k} value={k} className="gap-1.5 text-xs sm:text-sm">
                  {tabLabel[k]}
                  <span className="rounded-full bg-slate-900/80 px-1.5 text-[10px] font-bold text-white">
                    {counts[k]}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-5 px-4 py-6">
        {visible.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-2 p-10 text-center">
              <HelpCircle className="h-8 w-8 text-slate-300" />
              <p className="text-sm text-slate-500">Nenhuma questão neste filtro.</p>
            </CardContent>
          </Card>
        )}

        {visible.map((q) => {
          const subject = getPackSubject(pack, q.subjectId)
          const userAnswer = answers[q.id]
          const status = statusOf(QUESTIONS, answers, q.id)
          return (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.25 }}
            >
              <Card className="border-slate-200">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="rounded-lg bg-slate-900 px-3 py-1 text-sm font-bold text-amber-300">
                      Questão {String(q.id).padStart(2, '0')}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {subject.name}
                    </span>
                    {markedSet.has(q.id) && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-800">
                        <Flag className="h-3 w-3 fill-amber-500 text-amber-600" /> Sinalizada
                      </span>
                    )}
                    <span
                      className={`ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                        status === 'acertos'
                          ? 'bg-emerald-100 text-emerald-800'
                          : status === 'erros'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {status === 'acertos' && <CheckCircle2 className="h-3.5 w-3.5" />}
                      {status === 'erros' && <XCircle className="h-3.5 w-3.5" />}
                      {status === 'branco' && <HelpCircle className="h-3.5 w-3.5" />}
                      {status === 'acertos' ? 'Acertou' : status === 'erros' ? 'Errou' : 'Sem resposta'}
                    </span>
                  </div>

                  {q.textRef && pack.textBlocks[q.textRef] && (
                    <div className="mt-5">
                      <TextBlockCard text={pack.textBlocks[q.textRef]} />
                    </div>
                  )}

                  <div className="mt-5">
                    <HtmlContent html={q.statement} />
                  </div>

                  <div className="mt-4 space-y-2.5">
                    {q.options.map((opt) => {
                      const isGabarito = opt.key === q.answer
                      const isSelected = userAnswer === opt.key
                      let cls = 'border-slate-200 bg-white'
                      let badgeCls = 'border border-slate-300 bg-white text-slate-600'
                      if (isGabarito) {
                        cls = 'border-emerald-500 bg-emerald-50'
                        badgeCls = 'border border-emerald-600 bg-emerald-600 text-white'
                      } else if (isSelected) {
                        cls = 'border-red-400 bg-red-50'
                        badgeCls = 'border border-red-500 bg-red-500 text-white'
                      }
                      return (
                        <div
                          key={opt.key}
                          className={`flex items-start gap-3 rounded-xl border-2 p-3.5 sm:p-4 ${cls}`}
                        >
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold uppercase ${badgeCls}`}
                          >
                            {opt.key}
                          </span>
                          <HtmlContent html={opt.html} className="pt-0.5" />
                          <span className="ml-auto shrink-0">
                            {isGabarito && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
                            {isSelected && !isGabarito && <XCircle className="h-5 w-5 text-red-500" />}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  {userAnswer && userAnswer !== q.answer && (
                    <p className="mt-3 text-xs text-red-600">
                      Sua resposta: alternativa “{userAnswer}” • Gabarito: alternativa “{q.answer}”.
                    </p>
                  )}

                  <div className="mt-5 rounded-lg border-l-4 border-amber-400 bg-amber-50/70 px-4 py-3">
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-amber-700">
                      <Lightbulb className="h-4 w-4" /> Comentário
                    </p>
                    <HtmlContent html={q.comment} className="text-sm" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </main>
    </div>
  )
}
