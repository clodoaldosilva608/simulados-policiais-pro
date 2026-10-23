'use client'

/**
 * POMODORO — cronômetro de estudo com técnica de foco/intervalo.
 *
 * O estado de execução vive em escopo de MÓDULO: se o aluno trocar de tela
 * (biblioteca, provas...), o tempo continua contando pelo timestamp `endsAt`
 * e a tela recupera o estado ao remontar. Config persistida no localStorage.
 */

export type PomodoroPhase = 'foco' | 'intervalo'
export type PomodoroStatus = 'parado' | 'rodando' | 'pausado'

export interface PomodoroConfig {
  /** minutos de foco (5–90) */
  focusMin: number
  /** minutos de intervalo (1–30) */
  breakMin: number
  /** iniciar a próxima fase automaticamente ao encerrar a atual */
  autoNext: boolean
  /** sinal sonoro ao iniciar e ao encerrar cada fase */
  sound: boolean
}

export const DEFAULT_POMODORO_CONFIG: PomodoroConfig = {
  focusMin: 25,
  breakMin: 5,
  autoNext: true,
  sound: true,
}

const CONFIG_KEY = 'spp-pomodoro-v1'

export function loadPomodoroConfig(): PomodoroConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY)
    if (!raw) return { ...DEFAULT_POMODORO_CONFIG }
    const parsed = JSON.parse(raw) as Partial<PomodoroConfig>
    return {
      focusMin: clampMinutes(parsed.focusMin, 5, 90, DEFAULT_POMODORO_CONFIG.focusMin),
      breakMin: clampMinutes(parsed.breakMin, 1, 30, DEFAULT_POMODORO_CONFIG.breakMin),
      autoNext: typeof parsed.autoNext === 'boolean' ? parsed.autoNext : DEFAULT_POMODORO_CONFIG.autoNext,
      sound: typeof parsed.sound === 'boolean' ? parsed.sound : DEFAULT_POMODORO_CONFIG.sound,
    }
  } catch {
    return { ...DEFAULT_POMODORO_CONFIG }
  }
}

export function savePomodoroConfig(config: PomodoroConfig): void {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
  } catch {
    /* persistência é opcional */
  }
}

function clampMinutes(value: unknown, min: number, max: number, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback
  return Math.min(max, Math.max(min, Math.round(value)))
}

/** Estado de execução que sobrevive à troca de telas (escopo de módulo) */
export interface PomodoroRuntime {
  phase: PomodoroPhase
  status: PomodoroStatus
  /** timestamp (ms) em que a fase atual termina; null quando parado/pausado */
  endsAt: number | null
  /** ms restantes no momento da pausa */
  remainingMs: number
}

const runtime: PomodoroRuntime = { phase: 'foco', status: 'parado', endsAt: null, remainingMs: 0 }

export function getPomodoroRuntime(): PomodoroRuntime {
  return runtime
}

export function setPomodoroRuntime(patch: Partial<PomodoroRuntime>): void {
  Object.assign(runtime, patch)
}

export function phaseTotalMs(config: PomodoroConfig, phase: PomodoroPhase): number {
  return (phase === 'foco' ? config.focusMin : config.breakMin) * 60_000
}

/* ---------------------------------- SOM ---------------------------------- */

let audioCtx: AudioContext | null = null

function audio(): AudioContext | null {
  try {
    if (!audioCtx) {
      const AC =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AC) return null
      audioCtx = new AC()
    }
    if (audioCtx.state === 'suspended') void audioCtx.resume()
    return audioCtx
  } catch {
    return null
  }
}

function beep(frequency: number, delayMs: number, durationMs: number): void {
  const ac = audio()
  if (!ac) return
  try {
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.type = 'sine'
    osc.frequency.value = frequency
    const t0 = ac.currentTime + delayMs / 1000
    gain.gain.setValueAtTime(0.0001, t0)
    gain.gain.exponentialRampToValueAtTime(0.22, t0 + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + durationMs / 1000)
    osc.connect(gain)
    gain.connect(ac.destination)
    osc.start(t0)
    osc.stop(t0 + durationMs / 1000 + 0.05)
  } catch {
    /* som é opcional */
  }
}

/** Sinal sonoro curto ao INICIAR uma fase (1 bipe) */
export function playStartSignal(): void {
  beep(660, 0, 180)
}

/** Sinal sonoro de ENCERRAMENTO da fase (melodia de 3 bipos ascendentes) */
export function playEndSignal(): void {
  beep(660, 0, 150)
  beep(880, 200, 150)
  beep(1100, 400, 260)
}
