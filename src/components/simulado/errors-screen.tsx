'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  BookX,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Loader2,
  Sparkles,
  Trash2,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { OptionKey } from '@/data/types'
import {
  clearWrongQuestions,
  daysUntilReview,
  listWrongQuestions,
  markWrongQuestionResult,
  removeWrongQuestion,
  reviewStatusOf,
  type ReviewStatus,
  type WrongQuestion,
} from '@/lib/local-db'
import { HtmlContent } from './html-content'
import { TextBlockCard } from './text-block-card'
import { CommentLocked } from './comment-lock'

type ErrorFilter = 'todas' | 'hoje' | 'agendadas' | 'dominadas'

/** Rótulo/estilo do estado na repetição espaçada */
function statusInfo(status: ReviewStatus, q: WrongQuestion): { label: string; cls: string } {
  if (status === 'mastered') return { label: 'Dominada ✓', cls: 'bg-emerald-100 text-emerald-800' }
  if (status === 'scheduled') {
    const d = daysUntilReview(q)
    return { label: `Volta em ${d} ${d === 1 ? 'dia' : 'dias'}`, cls: 'bg-amber-100 text-amber-800' }
  }
  return { label: 'Revisar hoje', cls: 'bg-red-100 text-red-800' }
}

interface ErrorsScreenProps {
  onBack: () => void
  /** Plano grátis: comentários do professor bloqueados */
  planFree?: boolean
  /** Abre o pop-up de assinatura */
  onUpgrade?: () => void
}

export function ErrorsScreen({ onBack, planFree = false, onUpgrade }: ErrorsScreenProps) {
  const [items, setItems] = useState<WrongQuestion[] | null>(null)
  const [filter, setFilter] = useState<ErrorFilter>('todas')
  const [openId, setOpenId] = useState<string | null>(null)
  const [reviewed, setReviewed] = useState<Record<string, { given: OptionKey; correct: boolean }>>({})
  const [confirmClear, setConfirmClear] = useState(false)

  const load = useCallback(() => {
    void listWrongQuestions().then(setItems)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const answerQuestion = (item: WrongQuestion, key: OptionKey) => {
    const correct = key === item.answer
    setReviewed((r) => ({ ...r, [item.id]: { given: key, correct } }))
    void markWrongQuestionResult(item.id, correct).then(load)
  }

  /** Permite responder a mesma questão de novo (treino extra) */
  const allowRetry = (id: string) => {
    setReviewed((r) => {
      const next = { ...r }
      delete next[id]
      return next
    })
  }

  const removeItem = (id: string) => {
    void removeWrongQuestion(id).then(() => {
      if (openId === id) setOpenId(null)
      load()
    })
  }

  const clearAll = () => {
    void clearWrongQuestions().then(() => {
      setConfirmClear(false)
      setOpenId(null)
      setReviewed({})
      load()
    })
  }

  const statusOf = useCallback((q: WrongQuestion): ReviewStatus => reviewStatusOf(q), [])

  const all = items ?? []
  const dueCount = all.filter((q) => statusOf(q) === 'due').length
  const scheduledCount = all.filter((q) => statusOf(q) === 'scheduled').length
  const masteredCount = all.filter((q) => statusOf(q) === 'mastered').length

  const filtered = all.filter((q) => {
    const status = statusOf(q)
    if (filter === 'todas') return true
    if (filter === 'hoje') return status === 'due'
    if (filter === 'agendadas') return status === 'scheduled'
    return status === 'mastered'
  })

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900 text-white shadow-lg">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3.5">
          <Button
            onClick={onBack}
            variant="ghost"
            size="icon"
            aria-label="Voltar para a biblioteca"
            className="h-9 w-9 shrink-0 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <p className="truncate text-base font-bold leading-tight">Caderno de erros</p>
            <p className="truncate text-xs text-slate-400">
              {items && items.length > 0
                ? dueCount > 0
                  ? `${dueCount} ${dueCount === 1 ? 'questão para revisar hoje' : 'questões para revisar hoje'}`
                  : 'Tudo revisado por enquanto — as agendadas voltam no prazo'
                : 'Revise as questões que você errou'}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-5">
        {items === null ? (
          <div className="flex items-center justify-center gap-3 py-16 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-sm">Carregando caderno...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 text-center">
            <BookX className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm font-bold text-slate-800">Seu caderno está em branco</p>
            <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
              Erre sem medo: cada questão que você erra em qualquer simulado entra automaticamente aqui para você
              revisar e responder de novo mais tarde.
            </p>
          </div>
        ) : (
          <>
            {/* Faixa de repetição espaçada */}
            <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3">
              <CalendarClock className="mt-0.5 h-4.5 w-4.5 shrink-0 text-amber-600" />
              <p className="text-xs leading-relaxed text-slate-600">
                <b className="text-slate-800">Repetição espaçada:</b> acertou na revisão? A questão volta em{' '}
                <b>3</b>, depois <b>7</b> e depois <b>15</b> dias — o método cientificamente otimizado para fixar o
                conteúdo. Após as 3 revisões ela fica <b className="text-emerald-700">dominada</b>.
              </p>
            </div>

            {/* Filtros */}
            <div className="mt-3 grid grid-cols-4 gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1" role="group" aria-label="Filtrar questões">
              {(
                [
                  ['todas', 'Todas'],
                  ['hoje', 'Hoje'],
                  ['agendadas', 'Agendadas'],
                  ['dominadas', 'Dominadas'],
                ] as [ErrorFilter, string][]
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={filter === key}
                  onClick={() => setFilter(key)}
                  className={`flex h-9 items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                    filter === key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500" aria-live="polite">
              {dueCount} para hoje • {scheduledCount} agendadas • {masteredCount}{' '}
              {masteredCount === 1 ? 'dominada' : 'dominadas'}
            </p>

            {/* Lista de questões */}
            <ul className="mt-3 space-y-2.5" aria-label="Questões erradas">
              {filtered.map((item) => {
                const open = openId === item.id
                const result = reviewed[item.id]
                const status = statusOf(item)
                const info = statusInfo(status, item)
                return (
                  <motion.li
                    key={item.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                      {/* Cabeçalho clicável */}
                      <button
                        type="button"
                        onClick={() => setOpenId(open ? null : item.id)}
                        aria-expanded={open}
                        className="flex w-full items-start gap-3 p-4 pb-3 text-left"
                      >
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                            status === 'mastered'
                              ? 'bg-emerald-100 text-emerald-700'
                              : status === 'scheduled'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {status === 'mastered' ? (
                            <Sparkles className="h-4.5 w-4.5" />
                          ) : status === 'scheduled' ? (
                            <Clock3 className="h-5 w-5" />
                          ) : (
                            <XCircle className="h-5 w-5" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <Badge variant="secondary" className="h-auto bg-slate-900 px-1.5 py-0 text-[10px] font-bold text-amber-300 hover:bg-slate-900">
                              {item.subject || 'Geral'}
                            </Badge>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${info.cls}`}>
                              {info.label}
                            </span>
                          </div>
                          <HtmlContent html={item.statement} className={`mt-1 text-sm ${open ? '' : 'line-clamp-2'}`} />
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500">
                            <span className="font-bold text-red-700">errou {item.timesMissed}×</span>
                            {item.timesCorrectReview > 0 && (
                              <span className="font-bold text-emerald-700">
                                acertou {item.timesCorrectReview}× na revisão
                              </span>
                            )}
                            <span className="truncate">• {item.docTitle}</span>
                          </div>
                        </div>
                        <ChevronDown
                          className={`mt-1 h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
                        />
                      </button>

                      {/* Expandido: texto base, opções e gabarito */}
                      {open && (
                        <div className="border-t border-slate-100 px-4 pb-4 pt-3">
                          {item.textBlock && <TextBlockCard text={item.textBlock} />}

                          <div className="space-y-2">
                            {item.options.map((opt) => {
                              const isAnswer = opt.key === item.answer
                              const chosen = result?.given === opt.key
                              let cls = 'border-slate-200 bg-white hover:border-slate-400'
                              let badgeCls = 'bg-slate-100 text-slate-600'
                              if (result) {
                                if (isAnswer) {
                                  cls = 'border-emerald-500 bg-emerald-50'
                                  badgeCls = 'bg-emerald-600 text-white'
                                } else if (chosen) {
                                  cls = 'border-red-400 bg-red-50'
                                  badgeCls = 'bg-red-600 text-white'
                                }
                              }
                              return (
                                <button
                                  key={opt.key}
                                  type="button"
                                  disabled={Boolean(result)}
                                  onClick={() => answerQuestion(item, opt.key)}
                                  className={`flex w-full items-start gap-3 rounded-xl border-2 p-3 text-left transition-colors ${
                                    result ? 'cursor-default' : 'cursor-pointer'
                                  } ${cls}`}
                                >
                                  <span
                                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold uppercase ${badgeCls}`}
                                  >
                                    {opt.key}
                                  </span>
                                  <HtmlContent html={opt.html} className="pt-0.5 text-sm" />
                                  {result && isAnswer && <CheckCircle2 className="ml-auto h-5 w-5 shrink-0 text-emerald-600" />}
                                  {result && chosen && !isAnswer && <XCircle className="ml-auto h-5 w-5 shrink-0 text-red-500" />}
                                </button>
                              )
                            })}
                          </div>

                          {/* Resultado da revisão */}
                          {result && (
                            <motion.div
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.15 }}
                              className="mt-3"
                            >
                              <div
                                className={`flex items-center gap-2 rounded-lg border px-3.5 py-2.5 text-sm font-semibold ${
                                  result.correct
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                    : 'border-red-200 bg-red-50 text-red-800'
                                }`}
                              >
                                {result.correct ? (
                                  <>
                                    <CheckCircle2 className="h-4 w-4" /> Acertou! A questão volta para você revisar
                                    em 3, 7 e 15 dias até ficar dominada.
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="h-4 w-4" /> Errou de novo — a questão voltou para o início
                                    da fila para reforçar hoje.
                                  </>
                                )}
                              </div>
                              {item.comment && (planFree ? (
                                <div className="mt-2">
                                  <CommentLocked onUpgrade={() => onUpgrade?.()} />
                                </div>
                              ) : (
                                <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3">
                                  <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">Comentário</p>
                                  <HtmlContent html={item.comment} className="text-sm" />
                                </div>
                              ))}
                              <div className="mt-2 text-center">
                                <Button
                                  onClick={() => allowRetry(item.id)}
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                                >
                                  Responder de novo
                                </Button>
                              </div>
                            </motion.div>
                          )}

                          {!result && status === 'scheduled' && (
                            <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-[11px] text-amber-700">
                              <Clock3 className="h-3.5 w-3.5" />
                              Agendada pela repetição espaçada — responda agora ou espere o prazo para treinar a memória
                            </p>
                          )}

                          <div className="mt-3 flex items-center justify-between gap-2">
                            <Button
                              onClick={() => removeItem(item.id)}
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-red-700"
                            >
                              <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Remover do caderno
                            </Button>
                            <span className="text-[11px] text-slate-400">
                              {result ? 'Resposta registrada' : 'Responda para revisar'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.li>
                )
              })}
            </ul>

            {filtered.length === 0 && (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 text-center">
                <BookX className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-3 text-sm font-bold text-slate-800">
                  {filter === 'dominadas'
                    ? 'Nenhuma questão dominada ainda'
                    : filter === 'hoje'
                      ? 'Nada para revisar hoje 🎉'
                      : filter === 'agendadas'
                        ? 'Nenhuma questão agendada'
                        : 'Nada por aqui'}
                </p>
                <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
                  {filter === 'dominadas'
                    ? 'Revise as questões do caderno: após acertar nas revisões de 3, 7 e 15 dias a questão fica dominada.'
                    : filter === 'hoje'
                      ? 'As questões que você acertou estão agendadas pela repetição espaçada e voltam automaticamente no prazo. Conclua um novo simulado para treinar mais.'
                      : filter === 'agendadas'
                        ? 'Responda as questões de hoje: cada acerto agenda a próxima revisão em 3, 7 ou 15 dias.'
                        : 'Conclua um novo simulado para alimentar o caderno de erros.'}
                </p>
              </div>
            )}

            {/* Limpar tudo */}
            <div className="mt-6 text-center">
              {confirmClear ? (
                <div className="inline-flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600">Apagar todas as {items.length} questões?</span>
                  <Button onClick={clearAll} size="sm" variant="destructive" className="h-8 text-xs font-bold">
                    Apagar
                  </Button>
                  <Button onClick={() => setConfirmClear(false)} size="sm" variant="outline" className="h-8 text-xs font-bold">
                    Cancelar
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setConfirmClear(true)}
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs font-semibold text-slate-400 hover:bg-slate-100 hover:text-red-700"
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Limpar caderno
                </Button>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
