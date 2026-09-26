import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import App from './App.tsx'

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function okFetch() {
  return vi
    .spyOn(globalThis, 'fetch')
    .mockImplementation(async (input) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
      if (url.endsWith('/api/v1/health')) {
        return jsonResponse({ data: { status: 'available' }, meta: {} })
      }
      if (url.endsWith('/api/v1/auth/me')) {
        return jsonResponse(
          { error: { code: 'unauthenticated', message: 'Sesi tidak valid.', fields: {}, request_id: 'x' } },
          401,
        )
      }
      throw new Error(`unexpected fetch: ${url}`)
    })
}

function guestSession() {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
    if (url.endsWith('/api/v1/health')) {
      return jsonResponse({ data: { status: 'available' }, meta: {} })
    }
    if (url.endsWith('/api/v1/auth/me')) {
      return jsonResponse(
        { error: { code: 'unauthenticated', message: 'Sesi tidak valid.', fields: {}, request_id: 'x' } },
        401,
      )
    }
    if (url.endsWith('/api/v1/auth/login')) {
      return jsonResponse(
        {
          data: {
            id: 'u1',
            email: 'ayu@example.com',
            name: 'Ayu',
            auth_provider: 'local',
            sleep_time: null,
            timezone: null,
            sensitivity_level: null,
            currency: null,
            onboarding_completed: false,
          },
          meta: {},
        },
        200,
      )
    }
    throw new Error(`unexpected fetch: ${url}`)
  })
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('App shell', () => {
  it('shows the checking state while the session probe is in flight', () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() => new Promise(() => {}))

    render(<App />)

    expect(screen.getByText('Memeriksa sesiâ€¦')).toBeInTheDocument()
  })

  it('shows the login form for guests', async () => {
    okFetch()

    render(<App />)

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Selamat datang kembali' })).toBeInTheDocument(),
    )
  })

  it('logs in with valid credentials and reveals onboarding', async () => {
    const user = userEvent.setup()
    guestSession()

    render(<App />)
    await waitFor(() => expect(screen.getByLabelText('Email Kamu')).toBeInTheDocument())

    await user.type(screen.getByLabelText('Email Kamu'), 'ayu@example.com')
    await user.type(screen.getByLabelText('Kata Sandi'), 'portrait-of-you-1961')
    await user.click(screen.getByRole('button', { name: /Masuk ke Jurnal/ }))

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Kenalan dulu, yuk' })).toBeInTheDocument(),
    )
  })

  it('shows a serious alert when login fails', async () => {
    const user = userEvent.setup()
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
      if (url.endsWith('/api/v1/health')) {
        return jsonResponse({ data: { status: 'available' }, meta: {} })
      }
      if (url.endsWith('/api/v1/auth/me')) {
        return jsonResponse(
          { error: { code: 'unauthenticated', message: 'Sesi tidak valid.', fields: {}, request_id: 'x' } },
          401,
        )
      }
      if (url.endsWith('/api/v1/auth/login')) {
        return jsonResponse(
          {
            error: {
              code: 'invalid_credentials',
              message: 'Email atau password salah.',
              fields: {},
              request_id: 'x',
            },
          },
          401,
        )
      }
      throw new Error(`unexpected fetch: ${url}`)
    })

    render(<App />)
    await waitFor(() => expect(screen.getByLabelText('Email Kamu')).toBeInTheDocument())

    await user.type(screen.getByLabelText('Email Kamu'), 'ayu@example.com')
    await user.type(screen.getByLabelText('Kata Sandi'), 'wrong-password-123')
    await user.click(screen.getByRole('button', { name: /Masuk ke Jurnal/ }))

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Email atau password salah.'),
    )
  })

  it('switches between login and register views', async () => {
    const user = userEvent.setup()
    okFetch()

    render(<App />)
    await waitFor(() => expect(screen.getByRole('button', { name: /Daftar Sekarang/ })).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: /Daftar Sekarang/ }))

    expect(screen.getByRole('heading', { name: 'Mulai Jurnal Ramah Lambungmu' })).toBeInTheDocument()
  })

  it('still reports an unreachable backend even when signed out', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
      if (url.endsWith('/api/v1/auth/me')) {
        return jsonResponse(
          { error: { code: 'unauthenticated', message: 'Sesi tidak valid.', fields: {}, request_id: 'x' } },
          401,
        )
      }
      throw new Error('network down')
    })

    render(<App />)

    await waitFor(() =>
      expect(screen.getByText('Backend belum tersedia')).toBeInTheDocument(),
    )
  })
})

