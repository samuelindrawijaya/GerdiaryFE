import { useCallback, useEffect, useState } from 'react'

import {
  ApiError,
  completeOnboarding,
  fetchMe,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
} from '../api/identity.ts'
import type { OnboardingInput, UserDto } from '../api/identity.ts'

type Phase = 'loading' | 'authenticated' | 'guest'

export function useIdentity() {
  const [phase, setPhase] = useState<Phase>('loading')
  const [user, setUser] = useState<UserDto | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    fetchMe()
      .then((found) => {
        setUser(found)
        setPhase('authenticated')
      })
      .catch(() => {
        setUser(null)
        setPhase('guest')
      })
    return () => controller.abort()
  }, [])

  const register = useCallback(async (input: { email: string; password: string; name?: string; journal_theme?: 'calm' | 'kawaii' }) => {
    setBusy(true)
    setError(null)
    try {
      const created = await registerRequest(input)
      setUser(created)
      setPhase('authenticated')
      return created
    } catch (caught) {
      const apiError = caught instanceof ApiError ? caught : new ApiError('network_error', 'Tidak dapat menghubungi server.', 0, {})
      setError(apiError)
    } finally {
      setBusy(false)
    }
  }, [])

  const login = useCallback(async (input: { email: string; password: string }) => {
    setBusy(true)
    setError(null)
    try {
      const found = await loginRequest(input)
      setUser(found)
      setPhase('authenticated')
      return found
    } catch (caught) {
      const apiError = caught instanceof ApiError ? caught : new ApiError('network_error', 'Tidak dapat menghubungi server.', 0, {})
      setError(apiError)
    } finally {
      setBusy(false)
    }
  }, [])

  const logout = useCallback(async () => {
    setBusy(true)
    try {
      await logoutRequest()
    } finally {
      setUser(null)
      setPhase('guest')
      setBusy(false)
    }
  }, [])

  const saveOnboarding = useCallback(async (input: OnboardingInput) => {
    setBusy(true)
    setError(null)
    try {
      const updated = await completeOnboarding(input)
      setUser(updated)
      return updated
    } catch (caught) {
      const apiError = caught instanceof ApiError ? caught : new ApiError('network_error', 'Tidak dapat menghubungi server.', 0, {})
      setError(apiError)
    } finally {
      setBusy(false)
    }
  }, [])

  return { phase, user, busy, error, register, login, logout, saveOnboarding }
}

