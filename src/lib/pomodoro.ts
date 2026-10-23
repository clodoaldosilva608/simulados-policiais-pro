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
  /** notificações do navegador ao encerrar cada fase (funciona com aba em 2º plano) */
  notify: boolean
  /** lembrete diário de estudo ("seu Pomodoro de hoje te espera") */
  dailyReminder: boolean
  /** horário do lembrete diário (HH:MM) */
  reminderTime: string
  /** último dia (YYYY-MM-DD) em que o lembrete disparou */
  lastReminderDay?: string
  /** último dia (YYYY-MM-DD) em que uma fase de foco foi concluída */
  lastFocusDay?: string
}

export const DEFAULT_POMODORO_CONFIG: PomodoroConfig = {
  focusMin: 25,
  breakMin: 5,
  autoNext: true,
  sound: true,
  notify: false,
  dailyReminder: false,
  reminderTime: '19:00',
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
      notify: typeof parsed.notify === 'boolean' ? parsed.notify : DEFAULT_POMODORO_CONFIG.notify,
      dailyReminder: typeof parsed.dailyReminder === 'boolean' ? parsed.dailyReminder : DEFAULT_POMODORO_CONFIG.dailyReminder,
      reminderTime: typeof parsed.reminderTime === 'string' && /^\d{2}:\d{2}$/.test(parsed.reminderTime) ? parsed.reminderTime : DEFAULT_POMODORO_CONFIG.reminderTime,
      lastReminderDay: typeof parsed.lastReminderDay === 'string' ? parsed.lastReminderDay : undefined,
      lastFocusDay: typeof parsed.lastFocusDay === 'string' ? parsed.lastFocusDay : undefined,
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

const RUNTIME_KEY = 'spp-pomodoro-runtime-v1'

export function getPomodoroRuntime(): PomodoroRuntime {
  return runtime
}

export function setPomodoroRuntime(patch: Partial<PomodoroRuntime>): void {
  Object.assign(runtime, patch)
  try {
    localStorage.setItem(RUNTIME_KEY, JSON.stringify(runtime))
  } catch {
    /* persistência é opcional */
  }
}

/** Recupera o runtime persistido (sobrevive a reload do app/PWA) */
export function loadPomodoroRuntime(): PomodoroRuntime {
  try {
    const raw = localStorage.getItem(RUNTIME_KEY)
    if (!raw) return { ...runtime }
    const p = JSON.parse(raw) as Partial<PomodoroRuntime>
    return {
      phase: p.phase === 'intervalo' ? 'intervalo' : 'foco',
      status: p.status === 'rodando' ? 'rodando' : p.status === 'pausado' ? 'pausado' : 'parado',
      endsAt: typeof p.endsAt === 'number' ? p.endsAt : null,
      remainingMs: typeof p.remainingMs === 'number' ? p.remainingMs : 0,
    }
  } catch {
    return { ...runtime }
  }
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

/* ------------------------- NOTIFICAÇÕES DO NAVEGADOR ------------------------- */

export function notifySupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function notificationPermission(): NotificationPermission | 'unsupported' {
  if (!notifySupported()) return 'unsupported'
  return Notification.permission
}

/** Pede permissão e devolve true quando concedida */
export async function requestNotifyPermission(): Promise<boolean> {
  if (!notifySupported()) return false
  try {
    if (Notification.permission === 'granted') return true
    if (Notification.permission === 'denied') return false
    const result = await Notification.requestPermission()
    return result === 'granted'
  } catch {
    return false
  }
}

function todayKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function fireNotification(title: string, body: string): void {
  try {
    if (!notifySupported() || Notification.permission !== 'granted') return
    new Notification(title, { body, icon: '/icons/icon-192.png', badge: '/icons/icon-192.png' })
  } catch {
    /* notificação é opcional */
  }
}

/**
 * Notifica o fim da fase do Pomodoro (só quando a aba está em 2º plano —
 * em primeiro plano o sinal sonoro já avisa).
 */
export function notifyPhaseEnd(phase: PomodoroPhase): void {
  if (typeof document !== 'undefined' && !document.hidden) return
  if (phase === 'foco') {
    fireNotification('Foco concluído! 🍅', 'Hora do intervalo — levante, beba água e respire.')
  } else {
    fireNotification('Intervalo encerrado ⏱️', 'De volta ao foco: seu Pomodoro recomeçou.')
  }
}

/** Registra que uma fase de foco foi concluída hoje (silencia o lembrete do dia) */
export function markFocusCompleted(config: PomodoroConfig): PomodoroConfig {
  const next = { ...config, lastFocusDay: todayKey() }
  savePomodoroConfig(next)
  return next
}

/**
 * LEMBRETE DIÁRIO — dispara a notificação "seu Pomodoro de hoje te espera"
 * quando: ativo, já passou do horário hoje, ainda não disparou hoje e o
 * aluno não concluiu foco hoje. Funciona com o app/PWA aberto (aba em
 * primeiro ou segundo plano) — o navegador não permite push com app fechado
 * sem serviço de push externo.
 */
export function maybeFireDailyReminder(config: PomodoroConfig): PomodoroConfig {
  if (!config.dailyReminder || !notifySupported() || Notification.permission !== 'granted') return config
  const today = todayKey()
  if (config.lastReminderDay === today) return config
  if (config.lastFocusDay === today) return config
  const [h, m] = config.reminderTime.split(':').map(Number)
  const now = new Date()
  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h || 0, m || 0)
  if (now.getTime() < target.getTime()) return config
  fireNotification('Seu Pomodoro de hoje te espera 🍅', 'Dê o primeiro passo: 25 minutos de foco já valem a pena.')
  const next = { ...config, lastReminderDay: today }
  savePomodoroConfig(next)
  return next
}
