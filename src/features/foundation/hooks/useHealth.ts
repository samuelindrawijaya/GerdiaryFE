import { useEffect, useState } from 'react'

import { fetchHealth, type HealthStatus } from '../api/health.ts'

export type HealthPhase = 'loading' | 'ready'

export interface HealthState {
  phase: HealthPhase
  status: HealthStatus | null
}

export function useHealth(): HealthState {
  const [state, setState] = useState<HealthState>({ phase: 'loading', status: null })

  useEffect(() => {
    const controller = new AbortController()
    let active = true

    void fetchHealth(controller.signal)
      .then((status) => {
        if (active) setState({ phase: 'ready', status })
      })
      .catch(() => {
        if (active) setState({ phase: 'ready', status: 'unavailable' })
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [])

  return state
}
