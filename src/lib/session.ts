'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { deviceUid } from '@/lib/license'

/**
 * Sessão do ALUNO (conta autenticada com um dispositivo por vez).
 *
 * • Registro/entrada vinculam ESTE aparelho à conta (deviceUid estável).
 * • Heartbeat (/api/auth/me) a cada 5 min + ao voltar para o app: se a conta
 *   for acessada em outro aparelho, este deixa de ter acesso (409/device)
 *   e a tela de acesso aparece com a mensagem de transferência.
 * • O status de acesso (teste grátis / assinante) vem do SERVIDOR — não há
 *   mais licença local autoconcedida.
 */

export interface SessionUser {
  name?: string
  email?: string
  /** foto de perfil (data URL) — segue a conta entre aparelhos */
  photo?: string
  /** criação da conta (epoch ms) */
  createdAt?: number
  /** aparelho vinculado (resumo do navegador/plataforma) */
  device?: string
  platform?: string
}

export interface AccessInfo {
  status: 'active' | 'trial' | 'expired' | 'canceled'
  trialDaysLeft: number | null
  /** ISO — fim exato do teste grátis (cronômetro de urgência) */
  trialEndsAt?: string | null
}

export interface SessionState {
  loading: boolean
  authed: boolean
  user: SessionUser | null
  access: AccessInfo | null
  /** conta em uso em outro aparelho */
  takenOver: boolean
  /** bloqueada/revogada pelo admin */
  blocked: '' | 'banned' | 'revoked'
  message: string
}

export interface RegisterResult {
  ok: boolean
  message?: string
  trial?: { started: boolean; reason?: string }
}

export interface ActivateResult {
  valid: boolean
  message?: string
}

export interface SessionApi extends SessionState {
  refresh: () => Promise<void>
  register: (opts: { name?: string; email: string; password: string }) => Promise<RegisterResult>
  login: (opts: { email: string; password: string }) => Promise<{ ok: boolean; message?: string }>
  logout: () => Promise<void>
  startTrial: () => Promise<{ ok: boolean; message?: string }>
  activate: (opts: { email?: string; code?: string }) => Promise<ActivateResult>
}

interface MeResponse {
  ok?: boolean
  authenticated?: boolean
  user?: SessionUser
  access?: AccessInfo
  reason?: string
  message?: string
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

const IDLE: SessionState = {
  loading: true,
  authed: false,
  user: null,
  access: null,
  takenOver: false,
  blocked: '',
  message: '',
}

export function useSession(): SessionApi {
  const [state, setState] = useState<SessionState>(IDLE)
  const alive = useRef(true)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' })
      const data = (await res.json().catch(() => ({}))) as MeResponse
      if (!alive.current) return
      if (res.ok && data.authenticated) {
        setState({
          loading: false,
          authed: true,
          user: data.user ?? null,
          access: data.access ?? null,
          takenOver: false,
          blocked: '',
          message: '',
        })
        return
      }
      setState({
        loading: false,
        authed: false,
        user: null,
        access: null,
        takenOver: data.reason === 'device',
        blocked: data.reason === 'banned' ? 'banned' : data.reason === 'revoked' ? 'revoked' : '',
        message: data.message ?? '',
      })
    } catch {
      if (!alive.current) return
      setState((s) => ({ ...s, loading: false }))
    }
  }, [])

  useEffect(() => {
    alive.current = true
    // Leitura adiada (evita setState síncrono no effect)
    const t = window.setTimeout(() => {
      if (alive.current) void refresh()
    }, 0)
    // Heartbeat: um dispositivo por vez é verificado no servidor
    const iv = window.setInterval(() => {
      if (document.visibilityState === 'visible') void refresh()
    }, 5 * 60 * 1000)
    const onVisible = () => {
      if (document.visibilityState === 'visible') void refresh()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      alive.current = false
      window.clearTimeout(t)
      window.clearInterval(iv)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [refresh])

  const register = useCallback(
    async (opts: { name?: string; email: string; password: string }): Promise<RegisterResult> => {
      const { device, platform } = deviceSummary()
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...opts, deviceUid: deviceUid(), device, platform }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean
        message?: string
        trial?: { started: boolean; reason?: string }
      }
      if (data.ok) await refresh()
      return { ok: Boolean(data.ok), message: data.message, trial: data.trial }
    },
    [refresh],
  )

  const login = useCallback(
    async (opts: { email: string; password: string }): Promise<{ ok: boolean; message?: string }> => {
      const { device, platform } = deviceSummary()
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...opts, deviceUid: deviceUid(), device, platform }),
      })
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string }
      if (data.ok) await refresh()
      return { ok: Boolean(data.ok), message: data.message }
    },
    [refresh],
  )

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    setState({
      loading: false,
      authed: false,
      user: null,
      access: null,
      takenOver: false,
      blocked: '',
      message: '',
    })
  }, [])

  const startTrial = useCallback(async (): Promise<{ ok: boolean; message?: string }> => {
    const res = await fetch('/api/auth/trial', { method: 'POST' })
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string }
    await refresh()
    return { ok: Boolean(data.ok), message: data.message }
  }, [refresh])

  const activate = useCallback(
    async (opts: { email?: string; code?: string }): Promise<ActivateResult> => {
      const res = await fetch('/api/license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(opts.email ? { email: opts.email } : { code: opts.code }),
      })
      const data = (await res.json().catch(() => ({}))) as { valid?: boolean; message?: string }
      if (data.valid) await refresh()
      return { valid: Boolean(data.valid), message: data.message }
    },
    [refresh],
  )

  return { ...state, refresh, register, login, logout, startTrial, activate }
}
