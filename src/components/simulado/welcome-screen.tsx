'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  CheckCheck,
  Clock,
  Eraser,
  FileText,
  GraduationCap,
  ListChecks,
  PenLine,
  Play,
  Save,
  Trophy,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { formatDurationLabel, packFormatLabel, type ExamMode, type SimuladoPack } from '@/data/simulado'
import { Crown, Lock } from 'lucide-react'

export interface AttemptInfo {
  name: string
  mode: string
  correct: number
  total: number
  pct: number
  timeUsedMs: number
  createdAt: string
}

interface WelcomeScreenProps {
  pack: SimuladoPack
  defaultName?: string
  defaultMode?: ExamMode
  hasSaved: boolean
  savedFinished: boolean
  attempts: AttemptInfo[]
  /** Plano grátis: aviso de cota diária + comentários bloqueados */
  planFree?: boolean
  /** Questões que ainda podem ser respondidas hoje (null = ilimitado) */
  questionsLeft?: number | null
  /** Simulados que ainda podem ser gerados neste mês (informativo) */
  simuladosLeft?: number | null
  /** Abre o pop-up de assinatura */
  onUpgrade?: () => void
  onStart: (name: string, mode: ExamMode) => void
  onContinue: () => void
  onViewResults: () => void
  onDiscard: () => void
  onBack: () => void
}

export function WelcomeScreen({
  pack,
  defaultName = '',
  defaultMode = 'prova',
  hasSaved,
  savedFinished,
  attempts,
  planFree = false,
  questionsLeft = null,
  simuladosLeft = null,
  onUpgrade,
  onStart,
  onContinue,
  onViewResults,
  onDiscard,
  onBack,
}: WelcomeScreenProps) {
  const [name, setName] = useState(defaultName)
  const [mode, setMode] = useState<ExamMode>(defaultMode)

  const total = pack.questions.length
  const multiChoice = total > 0 && pack.questions[0].options.length > 2
  const durLabel = formatDurationLabel(pack.durationMinutes)
  const formatLabel = packFormatLabel(pack)

  const INSTRUCTIONS = [
    `${total} questões ${multiChoice ? 'objetivas com 5 alternativas (A–E), uma correta' : 'no modelo Certo/Errado (C/E), como na prova da banca'}.`,
    `Duração: ${durLabel} no modo prova — cronômetro regressivo, como na prova real.`,
    'Ao final, você recebe a nota geral, o desempenho por assunto e o gabarito comentado de cada questão.',
    'Seu progresso é salvo automaticamente neste navegador — você pode retomar quando quiser.',
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-12">
        <div className="mb-4">
          <Button variant="outline" onClick={onBack} className="border-slate-300 bg-white">
            <ArrowLeft className="mr-1 h-4 w-4" /> Biblioteca de simulados
          </Button>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          {/* Hero */}
          <Card className="overflow-hidden border-0 bg-slate-900 text-white shadow-xl">
            <CardContent className="relative p-6 sm:p-10">
              <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-amber-400/10" />
              <div className="pointer-events-none absolute -bottom-16 -left-8 h-52 w-52 rounded-full bg-amber-400/5" />
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400 text-slate-950">
                  <GraduationCap className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-amber-300">{pack.subtitle}</p>
                  <h1 className="text-2xl font-bold sm:text-3xl">{pack.title}</h1>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-base">
                Simulado interativo: responda com cronômetro real, marque questões para revisão e receba
                <span className="font-semibold text-white"> desempenho por assunto</span> com
                <span className="font-semibold text-white"> gabarito comentado</span> ao final.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 text-xs font-medium">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5">
                  <FileText className="h-3.5 w-3.5 text-amber-300" /> {total} questões
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5">
                  <CheckCheck className="h-3.5 w-3.5 text-amber-300" /> Modelo: {formatLabel}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5">
                  <Clock className="h-3.5 w-3.5 text-amber-300" /> {durLabel} de prova
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-amber-300" /> Gabarito comentado
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5">
                  <Save className="h-3.5 w-3.5 text-amber-300" /> Salvamento automático
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Aviso do plano grátis: cota de hoje + comentários bloqueados */}
          {planFree && questionsLeft !== null && (
            <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-5">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 shrink-0 text-amber-600" />
                <p className="text-sm font-bold text-amber-900">
                  {questionsLeft <= 0
                    ? 'Plano grátis: sua cota de questões de hoje já acabou'
                    : `Plano grátis: você pode responder ${questionsLeft} ${questionsLeft === 1 ? 'questão' : 'questões'} hoje`}
                </p>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-amber-900/80">
                {questionsLeft > 0 && total > questionsLeft
                  ? `Este simulado tem ${total} questões — hoje o seu limite permite responder ${questionsLeft}. `
                  : ''}
                {simuladosLeft !== null && simuladosLeft <= 2
                  ? `Restam apenas ${simuladosLeft} simulados para gerar neste mês. `
                  : ''}
                No plano <b>Assinante</b> você resolve questões SEM LIMITE e ainda vê o comentário do professor em
                cada uma — é a diferença entre treinar e aprender de verdade.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button
                  onClick={() => onUpgrade?.()}
                  className="h-10 bg-slate-950 font-bold text-amber-300 hover:bg-slate-800"
                >
                  <Crown className="mr-1.5 h-4 w-4" /> Liberar tudo — R$ 17,90/mês
                </Button>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-800">
                  <Lock className="h-3 w-3" /> comentários bloqueados no plano grátis
                </span>
              </div>
            </div>
          )}

          {/* Instruções */}
          <Card className="mt-6">
            <CardContent className="p-5 sm:p-6">
              <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                <ListChecks className="h-5 w-5 text-amber-600" /> Informações sobre o simulado
              </h2>
              <ol className="mt-4 space-y-3">
                {INSTRUCTIONS.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-amber-300">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {/* Tentativas anteriores */}
          {attempts.length > 0 && (
            <Card className="mt-6">
              <CardContent className="p-5 sm:p-6">
                <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                  <Trophy className="h-5 w-5 text-amber-600" /> Tentativas anteriores
                </h2>
                <div className="mt-4 space-y-2">
                  {attempts.slice(0, 5).map((a, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3.5 py-2.5 text-sm"
                    >
                      <span
                        className={`inline-flex h-8 w-12 shrink-0 items-center justify-center rounded-md text-xs font-bold tabular-nums ${
                          a.pct >= pack.passPct
                            ? 'bg-emerald-100 text-emerald-800'
                            : a.pct >= 50
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {a.pct}%
                      </span>
                      <span className="min-w-0 truncate text-slate-700">
                        {a.name ? a.name : 'Candidato'} • {a.correct}/{a.total} acertos
                      </span>
                      <span className="ml-auto shrink-0 text-xs text-slate-400">
                        {a.mode === 'prova' ? 'Modo prova' : 'Modo estudo'} •{' '}
                        {new Date(a.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Retomar / resultado anterior */}
          {hasSaved && (
            <Card className="mt-6 border-emerald-200 bg-emerald-50">
              <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                  <p className="text-sm font-medium text-emerald-900">
                    {savedFinished
                      ? 'Você já finalizou uma tentativa anteriormente neste navegador.'
                      : 'Você possui um simulado em andamento salvo neste navegador.'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {savedFinished ? (
                    <Button onClick={onViewResults} className="bg-slate-900 text-white hover:bg-slate-800">
                      <Trophy className="mr-2 h-4 w-4" /> Ver meu resultado
                    </Button>
                  ) : (
                    <Button onClick={onContinue} className="bg-emerald-600 text-white hover:bg-emerald-700">
                      <Play className="mr-2 h-4 w-4" /> Continuar simulado
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700">
                        <Eraser className="mr-2 h-4 w-4" /> Descartar
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Descartar progresso salvo?</AlertDialogTitle>
                        <AlertDialogDescription>
                          As respostas, marcações e o tempo decorrido do simulado salvo serão apagados definitivamente.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Voltar</AlertDialogCancel>
                        <AlertDialogAction onClick={onDiscard} className="bg-red-600 text-white hover:bg-red-700">
                          Sim, descartar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Configuração */}
          <Card className="mt-6">
            <CardContent className="p-5 sm:p-6">
              <div className="space-y-1.5">
                <Label htmlFor="nome" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <PenLine className="h-4 w-4 text-slate-500" /> Nome do candidato <span className="font-normal text-slate-400">(opcional)</span>
                </Label>
                <Input
                  id="nome"
                  placeholder="Ex.: João da Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="max-w-md"
                />
              </div>

              <p className="mt-6 mb-3 text-sm font-semibold text-slate-900">Escolha o modo:</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setMode('prova')}
                  aria-pressed={mode === 'prova'}
                  className={`rounded-xl border-2 p-4 text-left transition-all ${
                    mode === 'prova'
                      ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-400/40'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Clock className={`h-5 w-5 ${mode === 'prova' ? 'text-amber-600' : 'text-slate-400'}`} />
                    <span className="font-semibold text-slate-900">Modo prova</span>
                    <span className="ml-auto rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-300">
                      Recomendado
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">
                    Cronômetro regressivo de <b>{durLabel}</b>. O gabarito é revelado apenas ao finalizar.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('estudo')}
                  aria-pressed={mode === 'estudo'}
                  className={`rounded-xl border-2 p-4 text-left transition-all ${
                    mode === 'estudo'
                      ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-400/40'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className={`h-5 w-5 ${mode === 'estudo' ? 'text-amber-600' : 'text-slate-400'}`} />
                    <span className="font-semibold text-slate-900">Modo estudo</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">
                    Sem cronômetro. A cada resposta, veja imediatamente o acerto e o <b>comentário da questão</b>.
                  </p>
                </button>
              </div>

              <Button
                onClick={() => onStart(name.trim(), mode)}
                className="mt-6 h-12 w-full bg-amber-500 text-base font-bold text-slate-950 shadow-md shadow-amber-500/30 hover:bg-amber-400 sm:w-auto sm:px-10"
              >
                <Play className="mr-2 h-5 w-5 fill-slate-950" /> Iniciar simulado
              </Button>
            </CardContent>
          </Card>

          {pack.footer && (
            <p className="mt-6 text-center text-xs leading-relaxed text-slate-400">{pack.footer}</p>
          )}
        </motion.div>
      </main>
    </div>
  )
}
