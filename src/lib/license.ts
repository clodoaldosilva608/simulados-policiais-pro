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
  startTrial: () => void
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

  const startTrial = useCallback(() => {
    const next: LicenseState = { status: 'trial', trialStartedAt: Date.now() }
    persist(next)
    setLicense(next)
    setStatus('trial')
  }, [])

  const activate = useCallback((code: string) => {
    const next: LicenseState = { status: 'active', code, activatedAt: Date.now() }
    persist(next)
    setLicense(next)
    setStatus('active')
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
