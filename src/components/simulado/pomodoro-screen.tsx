'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Pause, Play, RotateCcw, SkipForward, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  DEFAULT_POMODORO_CONFIG,
  loadPomodoroConfig,
  loadPomodoroRuntime,
  phaseTotalMs,
  playEndSignal,
  playStartSignal,
  savePomodoroConfig,
  setPomodoroRuntime,
  type PomodoroConfig,
  type PomodoroPhase,
  type PomodoroStatus,
} from '@/lib/pomodoro'

function formatClock(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const FOCUS_PRESETS = [15, 25, 30, 45, 60]
const BREAK_PRESETS = [3, 5, 10, 15]

export function PomodoroScreen({ onBack }: { onBack: () => void }) {
  const [config, setConfig] = useState<PomodoroConfig>(DEFAULT_POMODORO_CONFIG)
  const [runtime, setRuntime] = useState<{ phase: PomodoroPhase; status: PomodoroStatus; remainingMs: number }>({
    phase: 'foco',
    status: 'parado',
    remainingMs: DEFAULT_POMODORO_CONFIG.focusMin * 60_000,
  })
  const [booted, setBooted] = useState(false)
  const configRef = useRef(config)
  useEffect(() => {
    configRef.current = config
  }, [config])

  // Carrega config + estado de execução (sobreviveu à troca de telas).
  // Deferido pós-pintura: evita mismatch de hidratação e lê estado de módulo.
  useEffect(() => {
    const id = window.setTimeout(() => {
      const loaded = loadPomodoroConfig()
      setConfig(loaded)
      const rt = loadPomodoroRuntime()
      // Sincroniza o estado de módulo com o persistido (após reload do app)
      setPomodoroRuntime({ phase: rt.phase, status: rt.status, endsAt: rt.endsAt, remainingMs: rt.remainingMs })
      // Se o tempo esgotou enquanto o aluno estava em outra tela, conclui a fase agora
      if (rt.status === 'rodando' && rt.endsAt && rt.endsAt <= Date.now()) {
        const nextPhase: PomodoroPhase = rt.phase === 'foco' ? 'intervalo' : 'foco'
        if (loaded.autoNext) {
          setPomodoroRuntime({ phase: nextPhase, status: 'rodando', endsAt: Date.now() + phaseTotalMs(loaded, nextPhase), remainingMs: 0 })
          setRuntime({ phase: nextPhase, status: 'rodando', remainingMs: phaseTotalMs(loaded, nextPhase) })
        } else {
          setPomodoroRuntime({ phase: nextPhase, status: 'parado', endsAt: null, remainingMs: phaseTotalMs(loaded, nextPhase) })
          setRuntime({ phase: nextPhase, status: 'parado', remainingMs: phaseTotalMs(loaded, nextPhase) })
        }
      } else {
        const remaining =
          rt.status === 'rodando' && rt.endsAt
            ? Math.max(0, rt.endsAt - Date.now())
            : rt.status === 'pausado'
              ? rt.remainingMs
              : phaseTotalMs(loaded, rt.phase)
        setRuntime({ phase: rt.phase, status: rt.status, remainingMs: remaining })
      }
      setBooted(true)
    }, 0)
    return () => window.clearTimeout(id)
  }, [])

  const handlePhaseEnd = useCallback(() => {
    const cfg = configRef.current
    const nextPhase: PomodoroPhase = runtime.phase === 'foco' ? 'intervalo' : 'foco'
    if (cfg.sound) playEndSignal()
    if (cfg.autoNext) {
      setPomodoroRuntime({ phase: nextPhase, status: 'rodando', endsAt: Date.now() + phaseTotalMs(cfg, nextPhase), remainingMs: 0 })
      setRuntime({ phase: nextPhase, status: 'rodando', remainingMs: phaseTotalMs(cfg, nextPhase) })
    } else {
      setPomodoroRuntime({ phase: nextPhase, status: 'parado', endsAt: null, remainingMs: phaseTotalMs(cfg, nextPhase) })
      setRuntime({ phase: nextPhase, status: 'parado', remainingMs: phaseTotalMs(cfg, nextPhase) })
    }
  }, [runtime.phase])

  // Tick do cronômetro (timestamp-based: imune a throttling de setInterval)
  useEffect(() => {
    if (runtime.status !== 'rodando' || runtime.endsAt === null) return
    const id = window.setInterval(() => {
      const remaining = runtime.endsAt ? runtime.endsAt - Date.now() : 0
      if (remaining <= 0) {
        handlePhaseEnd()
      } else {
        setRuntime((r) => (r.status === 'rodando' ? { ...r, remainingMs: remaining } : r))
      }
    }, 250)
    return () => window.clearInterval(id)
  }, [runtime.status, runtime.endsAt, handlePhaseEnd])

  const totalMs = phaseTotalMs(config, runtime.phase)

  const start = () => {
    const remaining = runtime.status === 'pausado' ? Math.max(0, runtime.remainingMs) : totalMs
    const endsAt = Date.now() + remaining
    setPomodoroRuntime({ status: 'rodando', endsAt, remainingMs: remaining })
    setRuntime((r) => ({ ...r, status: 'rodando', remainingMs: remaining }))
    if (config.sound) playStartSignal()
  }

  const pause = () => {
    const remaining = runtime.endsAt ? Math.max(0, runtime.endsAt - Date.now()) : runtime.remainingMs
    setPomodoroRuntime({ status: 'pausado', endsAt: null, remainingMs: remaining })
    setRuntime((r) => ({ ...r, status: 'pausado', remainingMs: remaining }))
  }

  const reset = () => {
    setPomodoroRuntime({ status: 'parado', endsAt: null, remainingMs: totalMs })
    setRuntime((r) => ({ ...r, status: 'parado', remainingMs: totalMs }))
  }

  const skipPhase = () => {
    const nextPhase: PomodoroPhase = runtime.phase === 'foco' ? 'intervalo' : 'foco'
    const nextTotal = phaseTotalMs(config, nextPhase)
    if (config.sound) playEndSignal()
    if (runtime.status === 'rodando' && config.autoNext) {
      setPomodoroRuntime({ phase: nextPhase, status: 'rodando', endsAt: Date.now() + nextTotal, remainingMs: 0 })
      setRuntime({ phase: nextPhase, status: 'rodando', remainingMs: nextTotal })
    } else {
      setPomodoroRuntime({ phase: nextPhase, status: 'parado', endsAt: null, remainingMs: nextTotal })
      setRuntime({ phase: nextPhase, status: 'parado', remainingMs: nextTotal })
    }
  }

  const updateConfig = (patch: Partial<PomodoroConfig>) => {
    setConfig((c) => {
      const next = { ...c, ...patch }
      savePomodoroConfig(next)
      // Ajusta o relógio imediatamente quando parado; em execução vale na próxima fase
      if (next !== configRef.current && runtime.status === 'parado') {
        const newTotal = phaseTotalMs(next, runtime.phase)
        setPomodoroRuntime({ remainingMs: newTotal })
        setRuntime((r) => ({ ...r, remainingMs: newTotal }))
      }
      return next
    })
  }

  const remainingMs =
    runtime.status === 'rodando'
      ? Math.max(0, runtime.remainingMs)
      : runtime.status === 'pausado'
        ? runtime.remainingMs
        : totalMs

  const progress = totalMs > 0 ? Math.min(1, Math.max(0, 1 - remainingMs / totalMs)) : 0
  const R = 96
  const CIRC = 2 * Math.PI * R
  const phaseLabel = runtime.phase === 'foco' ? 'Foco' : 'Intervalo'
  const phaseHint =
    runtime.status === 'rodando'
      ? 'Em andamento — termine a fase antes de trocar de tela'
      : runtime.status === 'pausado'
        ? 'Pausado — retome quando quiser'
        : 'Pronto para começar'

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
            <p className="truncate text-base font-bold leading-tight">Pomodoro</p>
            <p className="truncate text-xs text-slate-400">Foco com intervalos para estudar melhor</p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-4 py-6">
        {/* Cronômetro */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="flex flex-col items-center">
            <span
              className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${
                runtime.phase === 'foco' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {phaseLabel}
            </span>
            <div className="relative mt-4">
              <svg viewBox="0 0 224 224" className="h-56 w-56" role="img" aria-label={`Cronômetro ${phaseLabel}: ${formatClock(remainingMs)}`}>
                <circle cx="112" cy="112" r={R} fill="none" stroke="#94a3b8" strokeOpacity="0.25" strokeWidth="12" />
                <circle
                  cx="112"
                  cy="112"
                  r={R}
                  fill="none"
                  stroke={runtime.phase === 'foco' ? '#f59e0b' : '#10b981'}
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={CIRC}
                  strokeDashoffset={CIRC * (1 - progress)}
                  transform="rotate(-90 112 112)"
                  className="transition-[stroke-dashoffset] duration-300"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-5xl font-black tabular-nums tracking-tight text-slate-900">{formatClock(remainingMs)}</p>
                <p className="mt-1 text-xs font-medium text-slate-500">{phaseHint}</p>
              </div>
            </div>

            <div className="mt-5 flex w-full items-center justify-center gap-2">
              {runtime.status === 'rodando' ? (
                <Button onClick={pause} className="h-12 min-w-[132px] bg-slate-900 text-base font-bold text-white hover:bg-slate-800">
                  <Pause className="mr-1.5 h-5 w-5" /> Pausar
                </Button>
              ) : (
                <Button
                  onClick={start}
                  className="h-12 min-w-[132px] bg-slate-900 text-base font-bold text-white hover:bg-slate-800"
                >
                  <Play className="mr-1.5 h-5 w-5" /> {runtime.status === 'pausado' ? 'Retomar' : 'Iniciar'}
                </Button>
              )}
              <Button
                onClick={reset}
                variant="outline"
                aria-label="Zerar cronômetro"
                className="h-12 w-12 border-slate-300 p-0 text-slate-600 hover:bg-slate-100"
              >
                <RotateCcw className="h-5 w-5" />
              </Button>
              <Button
                onClick={skipPhase}
                variant="outline"
                aria-label="Pular para a próxima fase"
                className="h-12 w-12 border-slate-300 p-0 text-slate-600 hover:bg-slate-100"
              >
                <SkipForward className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Configuração */}
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Configuração</p>

          <div className="mt-3">
            <p className="text-xs font-semibold text-slate-600">Foco</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {FOCUS_PRESETS.map((min) => (
                <button
                  key={min}
                  type="button"
                  aria-pressed={config.focusMin === min}
                  onClick={() => updateConfig({ focusMin: min })}
                  className={`h-9 min-w-[52px] rounded-lg border px-2 text-sm font-bold transition-colors ${
                    config.focusMin === min
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {min} min
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3">
            <p className="text-xs font-semibold text-slate-600">Intervalo</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {BREAK_PRESETS.map((min) => (
                <button
                  key={min}
                  type="button"
                  aria-pressed={config.breakMin === min}
                  onClick={() => updateConfig({ breakMin: min })}
                  className={`h-9 min-w-[52px] rounded-lg border px-2 text-sm font-bold transition-colors ${
                    config.breakMin === min
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {min} min
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
            <label className="flex items-center justify-between gap-3">
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-slate-800">Próxima fase automática</span>
                <span className="block text-xs text-slate-500">
                  Ao encerrar, inicia {runtime.phase === 'foco' ? 'o intervalo' : 'o foco'} sozinho
                </span>
              </span>
              <Switch checked={config.autoNext} onCheckedChange={(v) => updateConfig({ autoNext: v })} aria-label="Próxima fase automática" />
            </label>
            <label className="flex items-center justify-between gap-3">
              <span className="min-w-0">
                <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                  {config.sound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />} Sinal sonoro
                </span>
                <span className="block text-xs text-slate-500">Ao iniciar e ao encerrar cada fase</span>
              </span>
              <Switch checked={config.sound} onCheckedChange={(v) => updateConfig({ sound: v })} aria-label="Sinal sonoro" />
            </label>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-slate-400">
            {booted ? 'O tempo continua contando mesmo se você trocar de tela dentro do app.' : ' '}
          </p>
        </div>
      </main>
    </div>
  )
}
