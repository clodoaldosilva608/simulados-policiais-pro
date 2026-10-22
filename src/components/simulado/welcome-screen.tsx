'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Eraser,
  FileText,
  ListChecks,
  PenLine,
  Play,
  Save,
  ShieldCheck,
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
import type { ExamMode } from '@/data/types'
import { EXAM_META, TOTAL_QUESTIONS } from '@/data/simulado'

interface WelcomeScreenProps {
  defaultName?: string
  defaultMode?: ExamMode
  hasSaved: boolean
  savedFinished: boolean
  onStart: (name: string, mode: ExamMode) => void
  onContinue: () => void
  onViewResults: () => void
  onDiscard: () => void
}

const INSTRUCTIONS = [
  `${TOTAL_QUESTIONS} questões objetivas com 5 alternativas (a–e), cobrindo 11 disciplinas do edital.`,
  'Duração: 5 horas e 30 minutos — mesma janela do simulado original (das 8h00 às 13h30).',
  'Questões inéditas elaboradas com base no perfil da banca organizadora.',
  'Ao final, você recebe a nota por disciplina, o gabarito oficial e o comentário de cada questão.',
  'Seu progresso é salvo automaticamente neste navegador — você pode retomar quando quiser.',
]

export function WelcomeScreen({ defaultName = '', defaultMode = 'prova', hasSaved, savedFinished, onStart, onContinue, onViewResults, onDiscard }: WelcomeScreenProps) {
  const [name, setName] = useState(defaultName)
  const [mode, setMode] = useState<ExamMode>(defaultMode)

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          {/* Hero */}
          <Card className="overflow-hidden border-0 bg-slate-900 text-white shadow-xl">
            <CardContent className="relative p-6 sm:p-10">
              <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-amber-400/10" />
              <div className="pointer-events-none absolute -bottom-16 -left-8 h-52 w-52 rounded-full bg-amber-400/5" />
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400 text-slate-950">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-amber-300">{EXAM_META.subtitle}</p>
                  <h1 className="text-2xl font-bold sm:text-3xl">Simulado PC PE – Agente</h1>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-base">
                Simulado interativo completo: responda com cronômetro real, marque questões para revisão e receba
                <span className="font-semibold text-white"> desempenho por disciplina</span> com
                <span className="font-semibold text-white"> gabarito comentado</span> ao final.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 text-xs font-medium">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5">
                  <FileText className="h-3.5 w-3.5 text-amber-300" /> {TOTAL_QUESTIONS} questões
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5">
                  <Clock className="h-3.5 w-3.5 text-amber-300" /> 5h30 de prova
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

          {/* Retomar / resultado anterior */}
          {hasSaved && (
            <Card className="mt-6 border-emerald-200 bg-emerald-50">
              <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                  <p className="text-sm font-medium text-emerald-900">
                    {savedFinished
                      ? 'Você já finalizou um simulado anteriormente neste navegador.'
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
                    Cronômetro regressivo de <b>5h30</b>, como no dia real. O gabarito é revelado apenas ao finalizar.
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

          <p className="mt-6 text-center text-xs leading-relaxed text-slate-400">
            Conteúdo original: simulado inédito “PC PE – Agente, Pós-Edital • BANCA: CEBRASPE” ({EXAM_META.reference}).
            <br />Aplicação de estudo sem vínculo com a banca ou com o órgão organizador.
          </p>
        </motion.div>
      </main>
    </div>
  )
}
