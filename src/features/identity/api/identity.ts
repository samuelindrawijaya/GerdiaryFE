export interface FieldErrors {
  [field: string]: string[]
}

export class ApiError extends Error {
  readonly code: string
  readonly status: number
  readonly fields: FieldErrors

  constructor(code: string, message: string, status: number, fields: FieldErrors) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
    this.fields = fields
  }
}

interface ErrorEnvelope {
  error: {
    code: string
    message: string
    fields: Record<string, string[]>
    request_id: string
  }
}

export async function parseError(response: Response): Promise<ApiError> {
  let code = 'http_error'
  let message = 'Terjadi kesalahan. Coba lagi.'
  let fields: FieldErrors = {}

  try {
    const body = (await response.json()) as ErrorEnvelope
    code = body.error?.code ?? code
    message = body.error?.message ?? message
    fields = body.error?.fields ?? {}
  } catch {
    // keep defaults
  }

  return new ApiError(code, message, response.status, fields)
}

export async function requestJson<T>(
  path: string,
  options: { method?: string; body?: unknown; signal?: AbortSignal } = {},
): Promise<T> {
  const response = await fetch(path, {
    method: options.method ?? 'GET',
    signal: options.signal,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
  })

  if (!response.ok) {
    throw await parseError(response)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export interface UserDto {
  id: string
  email: string
  name: string | null
  auth_provider: string
  sleep_time: string | null
  timezone: string | null
  sensitivity_level: 'mild' | 'moderate' | 'severe' | null
  currency: string | null
  onboarding_completed: boolean
  journal_theme: 'calm' | 'kawaii'
}

interface DataEnvelope {
  data: UserDto
}

export async function register(input: {
  email: string
  password: string
  name?: string
  journal_theme?: 'calm' | 'kawaii'
}): Promise<UserDto> {
  const body = await requestJson<DataEnvelope>('/api/v1/auth/register', {
    method: 'POST',
    body: input,
  })
  return body.data
}

export async function login(input: { email: string; password: string }): Promise<UserDto> {
  const body = await requestJson<DataEnvelope>('/api/v1/auth/login', {
    method: 'POST',
    body: input,
  })
  return body.data
}

export async function fetchMe(): Promise<UserDto> {
  const body = await requestJson<DataEnvelope>('/api/v1/auth/me')
  return body.data
}

export async function logout(): Promise<void> {
  await requestJson<undefined>('/api/v1/auth/logout', { method: 'POST' })
}

export interface OnboardingInput {
  name?: string
  sleep_time?: string
  timezone?: string
  sensitivity_level?: 'mild' | 'moderate' | 'severe'
  currency?: string
}

export async function completeOnboarding(input: OnboardingInput): Promise<UserDto> {
  const body = await requestJson<DataEnvelope>('/api/v1/onboarding/complete', {
    method: 'POST',
    body: input,
  })
  return body.data
}
