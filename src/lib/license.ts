'use client'

import { useCallback, useEffect, useState } from 'react'
import { SITE } from '@/config/site'

/**
 * Licença/assinatura — armazenada LOCALMENTE no aparelho do usuário
 * (localStorage). A recorrência em si é gerenciada 100% pela Cakto;
 * aqui apenas guardamos o código de acesso validado ou o período de teste.
 */

export type LicenseStatus = 'loading' | 'none' | 'trial' | 'active'

export interface LicenseState {
  status: 'trial' | 'active'
  /** código de acesso (quando assinante) */
  code?: string
  /** ms desde epoch da ativação da assinatura */
  activatedAt?: number
  /** ms desde epoch do início do teste grátis */
  trialStartedAt?: number
}

const STORAGE_KEY = 'spp-license-v1'
const UID_KEY = 'spp-uid-v1'

/* ------------------------------------------------------------------ */
/* Registro central (painel admin) — fire-and-forget, nunca bloqueia   */
/* ------------------------------------------------------------------ */

/** UUID estável do aparelho (não é dado pessoal; identifica a instalação) */
export function deviceUid(): string {
  try {
    let uid = window.localStorage.getItem(UID_KEY)
    if (!uid || !/^[a-zA-Z0-9_-]{8,64}$/.test(uid)) {
      const rand =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID().replace(/-/g, '')
          : Math.random().toString(36).slice(2) + Date.now().toString(36)
      uid = `u${rand.slice(0, 31)}`
      window.localStorage.setItem(UID_KEY, uid)
    }
    return uid
  } catch {
    return 'u' + Math.random().toString(36).slice(2, 14)
  }
}

function deviceSummary(): { device: string; platform: string } {
  try {
    const ua = navigator.userAgent
    const platform = /Android/i.test(ua)
      ? 'Android'
      : /iPhone|iPad|iPod/i.test(ua)
        ? 'iOS'
        : /Windows/i.test(ua)
          ? 'Windows'
          : /Macintosh/i.test(ua)
            ? 'macOS'
            : /Linux/i.test(ua)
              ? 'Linux'
              : 'Outro'
    const browser = /Edg\//.test(ua)
      ? 'Edge'
      : /OPR\//.test(ua)
        ? 'Opera'
        : /Chrome\//.test(ua)
          ? 'Chrome'
          : /Safari\//.test(ua)
            ? 'Safari'
            : /Firefox\//.test(ua)
              ? 'Firefox'
              : 'Navegador'
    return { device: browser, platform }
  } catch {
    return { device: 'Desconhecido', platform: 'Desconhecida' }
  }
}

interface TrackPatch {
  email?: string
  name?: string
  status?: 'trial' | 'active' | 'expired'
  ident?: string
  source?: 'trial' | 'cakto_email' | 'code'
  trialStartedAt?: number
  activatedAt?: number
}

/** Envia o estado da licença ao cadastro central (silencioso em caso de falha) */
export function trackRegistry(patch: TrackPatch): void {
  try {
    const { device, platform } = deviceSummary()
    void fetch('/api/registry/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: deviceUid(),
        ...patch,
        email: patch.email?.trim().toLowerCase() || undefined,
        device,
        platform,
      }),
      keepalive: true,
    }).catch(() => {})
  } catch {
    /* telemetria nunca deve quebrar o app */
  }
}

function readStored(): LicenseState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<LicenseState>
    if (parsed.status !== 'trial' && parsed.status !== 'active') return null
    return parsed as LicenseState
  } catch {
    return null
  }
}

function persist(state: LicenseState | null) {
  try {
    if (state) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    else window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* armazenamento indisponível */
  }
}

/** Dias restantes do teste grátis (0 quando expirou) */
export function trialDaysLeft(state: LicenseState, now = Date.now()): number {
  if (state.status !== 'trial' || !state.trialStartedAt) return 0
  const end = state.trialStartedAt + SITE.trialDays * 24 * 60 * 60 * 1000
  return Math.max(0, Math.ceil((end - now) / (24 * 60 * 60 * 1000)))
}

export function hasAccess(state: LicenseState | null, now = Date.now()): boolean {
  if (!state) return false
  if (state.status === 'active') return true
  if (state.status === 'trial' && state.trialStartedAt) {
    return now < state.trialStartedAt + SITE.trialDays * 24 * 60 * 60 * 1000
  }
  return false
}

export interface LicenseApi {
  status: LicenseStatus
  license: LicenseState | null
  /** true quando pode usar o app (assinatura válida ou teste em andamento) */
  allowed: boolean
  /** dias restantes do teste (null quando não está em teste) */
  daysLeft: number | null
  startTrial: (email?: string) => void
  activate: (code: string) => void
  signOut: () => void
}

export function useLicense(): LicenseApi {
  const [license, setLicense] = useState<LicenseState | null>(null)
  const [status, setStatus] = useState<LicenseStatus>('loading')

  useEffect(() => {
    let cancelled = false
    // Leitura adiada do armazenamento local (evita setState síncrono no effect)
    const timer = window.setTimeout(() => {
      if (cancelled) return
      const stored = readStored()
      if (stored && hasAccess(stored)) {
        setLicense(stored)
        setStatus(stored.status)
        return
      }
      if (stored) persist(null) // teste expirado
      setStatus('none')
    }, 0)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [])

  const startTrial = useCallback((email?: string) => {
    const next: LicenseState = { status: 'trial', trialStartedAt: Date.now() }
    persist(next)
    setLicense(next)
    setStatus('trial')
    trackRegistry({
      status: 'trial',
      source: 'trial',
      trialStartedAt: next.trialStartedAt,
      email,
    })
  }, [])

  const activate = useCallback((code: string) => {
    const next: LicenseState = { status: 'active', code, activatedAt: Date.now() }
    persist(next)
    setLicense(next)
    setStatus('active')
    trackRegistry({
      status: 'active',
      ident: code,
      activatedAt: next.activatedAt,
      // identificador em formato de e-mail alimenta o vínculo com a Cakto
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(code) ? code : undefined,
      source: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(code) ? 'cakto_email' : 'code',
    })
  }, [])

  const signOut = useCallback(() => {
    persist(null)
    setLicense(null)
    setStatus('none')
  }, [])

  const allowed = status !== 'loading' && status !== 'none' && hasAccess(license)

  return {
    status,
    license,
    allowed,
    daysLeft: license?.status === 'trial' ? trialDaysLeft(license) : null,
    startTrial,
    activate,
    signOut,
  }
}
