export type HealthStatus = 'available' | 'unavailable'

export interface HealthEnvelope {
  data: { status: string }
  meta: Record<string, unknown>
}

export async function fetchHealth(signal?: AbortSignal): Promise<HealthStatus> {
  const response = await fetch('/api/v1/health', {
    signal,
    credentials: 'include',
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    return 'unavailable'
  }

  const body = (await response.json()) as HealthEnvelope
  return body.data.status === 'available' ? 'available' : 'unavailable'
}
