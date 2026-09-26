import { useEffect, useState } from 'react'

import './features/identity/identity.css'
import type { CSSProperties } from 'react'
import { fetchHealth } from './features/foundation/api/health.ts'
import { useIdentity } from './features/identity/hooks/useIdentity.ts'
import { Atmosphere } from './features/identity/components/Atmosphere.tsx'
import { Icon } from './features/identity/components/Icon.tsx'
import { LoginForm } from './features/identity/components/LoginForm.tsx'
import { OnboardingForm } from './features/identity/components/OnboardingForm.tsx'
import { RegisterForm } from './features/identity/components/RegisterForm.tsx'
import { Toast } from './features/identity/components/Toast.tsx'
import type { ToastState } from './features/identity/components/Toast.tsx'

type AuthTheme = 'calm' | 'kawaii'
type ColorMode = 'light' | 'dark'
const AUTH_THEMES: Record<AuthTheme, CSSProperties> = {
  kawaii: { '--auth-bg': '#fff8f4', '--auth-ink': '#1e1b18', '--auth-copy': '#51443e', '--auth-primary': '#f8be9e', '--auth-secondary': '#70d6ff', '--color-background': '#fff8f4', '--color-primary-container': '#f8be9e', '--color-on-primary-container': '#321204', '--color-secondary': '#006783', '--color-secondary-fixed': '#bce9ff', '--color-on-secondary-fixed': '#001f29', '--color-on-secondary-fixed-variant': '#004d63', '--color-tertiary-fixed': '#ffdf95', '--color-tertiary-fixed-dim': '#eec662', '--color-on-tertiary-fixed': '#251a00', '--color-on-tertiary-fixed-variant': '#5b4300', '--color-primary': '#80543a', '--color-tertiary': '#765a00', '--color-error': '#d6336c', '--color-error-container': '#fff0f4', '--color-on-error-container': '#8f1743', '--color-safe-container': '#d2f5e3', '--color-on-safe-container': '#1b6b3e' } as CSSProperties,
  calm: {
    '--auth-bg': '#f9f9ff', '--auth-ink': '#111c2d', '--auth-copy': '#3e4945', '--auth-primary': '#006857', '--auth-secondary': '#00687a',
    '--color-background': '#f9f9ff', '--color-surface': '#f9f9ff', '--color-surface-dim': '#cfdaf2', '--color-surface-bright': '#f9f9ff', '--color-on-background': '#111c2d', '--color-on-surface': '#111c2d', '--color-on-surface-variant': '#3e4945',
    '--color-primary': '#006857', '--color-on-primary': '#ffffff', '--color-primary-container': '#27826f', '--color-on-primary-container': '#f4fffa', '--color-primary-fixed': '#9df3dc', '--color-primary-fixed-dim': '#81d6c0', '--color-on-primary-fixed': '#00201a', '--color-on-primary-fixed-variant': '#005143',
    '--color-secondary': '#00687a', '--color-on-secondary': '#ffffff', '--color-secondary-container': '#97e9ff', '--color-on-secondary-container': '#006a7d', '--color-secondary-fixed': '#abedff', '--color-secondary-fixed-dim': '#7fd2e8', '--color-on-secondary-fixed': '#001f26', '--color-on-secondary-fixed-variant': '#004e5c',
    '--color-tertiary': '#755700', '--color-on-tertiary': '#ffffff', '--color-tertiary-container': '#917016', '--color-on-tertiary-container': '#fffbff', '--color-tertiary-fixed': '#ffdf9b', '--color-tertiary-fixed-dim': '#ebc162', '--color-on-tertiary-fixed': '#251a00', '--color-on-tertiary-fixed-variant': '#5b4300', '--color-error': '#d6336c', '--color-error-container': '#fff0f4', '--color-on-error-container': '#8f1743', '--color-safe-container': '#d2f5e3', '--color-on-safe-container': '#1b6b3e',
    '--color-surface-container-lowest': '#ffffff', '--color-surface-container-low': '#f0f3ff', '--color-surface-container': '#e7eeff', '--color-surface-container-high': '#dee8ff', '--color-surface-container-highest': '#d8e3fb', '--color-surface-variant': '#d8e3fb', '--color-inverse-surface': '#263143', '--color-inverse-on-surface': '#ecf1ff', '--color-outline': '#6e7975', '--color-outline-variant': '#bec9c4', '--color-ink': '#111c2d',
  } as CSSProperties,
}

const DARK_THEME_OVERRIDES: Record<AuthTheme, CSSProperties> = {
  kawaii: {
    '--auth-bg': '#211b18', '--auth-ink': '#fff1e9', '--auth-copy': '#eadbd2', '--auth-primary': '#f4ba9a', '--auth-secondary': '#6cd3fc',
    '--color-background': '#211b18', '--color-surface': '#211b18', '--color-surface-dim': '#171210', '--color-surface-bright': '#2b2420', '--color-on-background': '#fff1e9', '--color-on-surface': '#fff1e9', '--color-on-surface-variant': '#eadbd2',
    '--color-primary': '#ffb78e', '--color-on-primary': '#512300', '--color-primary-container': '#75462d', '--color-on-primary-container': '#ffdbc9', '--color-secondary': '#74d6fb', '--color-on-secondary': '#003544', '--color-secondary-container': '#004d63', '--color-on-secondary-container': '#bce9ff', '--color-secondary-fixed': '#004d63', '--color-secondary-fixed-dim': '#003b4c', '--color-on-secondary-fixed': '#bce9ff', '--color-on-secondary-fixed-variant': '#8fdcff', '--color-tertiary-container': '#594400', '--color-on-tertiary-container': '#ffdf95', '--color-tertiary-fixed': '#594400', '--color-tertiary-fixed-dim': '#463500', '--color-on-tertiary-fixed': '#ffdf95', '--color-on-tertiary-fixed-variant': '#f1c95f', '--color-error': '#ff8fab', '--color-error-container': '#5e2131', '--color-on-error-container': '#ffd9e1', '--color-safe-container': '#164d39', '--color-on-safe-container': '#b8f5d6',
    '--color-surface-container-lowest': '#2b2420', '--color-surface-container-low': '#352d28', '--color-surface-container': '#403732', '--color-surface-container-high': '#4b413b', '--color-surface-container-highest': '#564b45', '--color-surface-variant': '#51443e', '--color-inverse-surface': '#fff1e9', '--color-inverse-on-surface': '#33302c', '--color-outline': '#a99a91', '--color-outline-variant': '#51443e', '--color-ink': '#fff1e9',
  } as CSSProperties,
  calm: {
    '--auth-bg': '#111c1a', '--auth-ink': '#e6fff7', '--auth-copy': '#c9dfd8', '--auth-primary': '#81d6c0', '--auth-secondary': '#7fd2e8',
    '--color-background': '#111c1a', '--color-surface': '#111c1a', '--color-surface-dim': '#0b1513', '--color-surface-bright': '#192421', '--color-on-background': '#e6fff7', '--color-on-surface': '#e6fff7', '--color-on-surface-variant': '#c9dfd8',
    '--color-primary': '#81d6c0', '--color-on-primary': '#00382e', '--color-primary-container': '#005143', '--color-on-primary-container': '#9df3dc', '--color-secondary': '#7fd2e8', '--color-on-secondary': '#003640', '--color-secondary-container': '#004e5c', '--color-on-secondary-container': '#abedff', '--color-secondary-fixed': '#004e5c', '--color-secondary-fixed-dim': '#003b46', '--color-on-secondary-fixed': '#abedff', '--color-on-secondary-fixed-variant': '#7fd2e8', '--color-tertiary-container': '#5b4300', '--color-on-tertiary-container': '#ffdf9b', '--color-tertiary-fixed': '#5b4300', '--color-tertiary-fixed-dim': '#463300', '--color-on-tertiary-fixed': '#ffdf9b', '--color-on-tertiary-fixed-variant': '#ebc162', '--color-error': '#ff8fab', '--color-error-container': '#5e2131', '--color-on-error-container': '#ffd9e1', '--color-safe-container': '#164d39', '--color-on-safe-container': '#b8f5d6',
    '--color-surface-container-lowest': '#192421', '--color-surface-container-low': '#22302c', '--color-surface-container': '#2d3b36', '--color-surface-container-high': '#384641', '--color-surface-container-highest': '#43514b', '--color-surface-variant': '#3e4945', '--color-inverse-surface': '#e6fff7', '--color-inverse-on-surface': '#263143', '--color-outline': '#9baca5', '--color-outline-variant': '#3e4945', '--color-ink': '#e6fff7',
  } as CSSProperties,
}

export function App() {
  const identity = useIdentity()
  const [apiOffline, setApiOffline] = useState(false)
  const [authView, setAuthView] = useState<'login' | 'register'>('login')
  const [authTheme, setAuthTheme] = useState<AuthTheme>('kawaii')
  const [colorMode, setColorMode] = useState<ColorMode>(() =>
    localStorage.getItem('gerdiary-color-mode') === 'dark' ? 'dark' : 'light',
  )
  const [toast, setToast] = useState<ToastState | null>(null)

  useEffect(() => {
    let active = true
    fetchHealth()
      .then((status) => {
        if (active && status !== 'available') setApiOffline(true)
      })
      .catch(() => {
        if (active) setApiOffline(true)
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (identity.user?.journal_theme) setAuthTheme(identity.user.journal_theme)
  }, [identity.user?.journal_theme])

  useEffect(() => {
    const root = document.documentElement
    const theme = { ...AUTH_THEMES[authTheme], ...(colorMode === 'dark' ? DARK_THEME_OVERRIDES[authTheme] : {}) }
    Object.entries(theme).forEach(([property, value]) => {
      if (typeof value === 'string') root.style.setProperty(property, value)
    })
    root.style.colorScheme = colorMode
    localStorage.setItem('gerdiary-color-mode', colorMode)
    return () => {
      Object.keys(theme).forEach((property) => root.style.removeProperty(property))
      root.style.removeProperty('color-scheme')
    }
  }, [authTheme, colorMode])

  const showToast = (next: ToastState) => setToast(next)
  const dismissToast = () => setToast(null)
  const guest = identity.phase === 'guest'
  const onboarding = identity.phase === 'authenticated' && Boolean(identity.user) && !identity.user?.onboarding_completed

  return (
    <div className={guest ? 'relative min-h-screen overflow-x-hidden bg-[var(--auth-bg)] text-[var(--auth-ink)] transition-colors duration-300' : onboarding ? 'app-shell app-shell--onboarding' : 'app-shell'} style={guest || onboarding ? { ...AUTH_THEMES[authTheme], ...(colorMode === 'dark' ? DARK_THEME_OVERRIDES[authTheme] : {}) } : undefined} data-auth-theme={authTheme} data-color-mode={colorMode}>
      {guest ? <Atmosphere /> : null}

      <header
        className={
          guest
            ? 'relative z-20 mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-4 text-[var(--auth-ink)] sm:px-6 lg:px-8'
            : onboarding ? 'app-header app-header--onboarding' : 'app-header'
        }
      >
        <img
          className={guest ? 'h-10 w-10 rounded-xl bg-[var(--auth-primary)] object-cover shadow-[2px_2px_0_var(--auth-ink)]' : 'app-logo'}
          src="/img/logo.jpg"
          alt=""
          width={32}
          height={32}
        />
        <div>
          <div className={guest ? 'font-[Nunito_Sans] text-xl font-black tracking-tight' : 'app-title'}>Gerdiary {onboarding ? <span className="app-step-badge">Langkah awal</span> : null}</div>
          <p className={guest ? 'm-0 text-xs font-medium text-[var(--auth-copy)]' : 'app-tagline'}>
            {onboarding ? 'Persiapan Lambung Tenang' : 'Jurnal lambung yang hangat & personal'}
          </p>
        </div>
        <div className={guest ? 'ml-auto flex items-center gap-2' : 'app-header__actions'}>
          <button
            type="button"
            className={guest ? 'flex min-h-11 min-w-11 items-center justify-center rounded-full border-2 border-[var(--auth-ink)] bg-[var(--color-surface-container-lowest)] px-3 text-[var(--auth-ink)] shadow-[2px_2px_0_var(--auth-ink)] transition hover:-translate-y-0.5 hover:bg-[var(--auth-secondary)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none' : 'btn btn--ghost'}
            aria-label={colorMode === 'dark' ? 'Gunakan mode terang' : 'Gunakan mode gelap'}
            aria-pressed={colorMode === 'dark'}
            onClick={() => setColorMode((current) => current === 'dark' ? 'light' : 'dark')}
          >
            <Icon name={colorMode === 'dark' ? 'sun' : 'moon-stars'} size={20} />
          </button>
          <button
            type="button"
            className={
              guest
                ? 'flex min-h-11 items-center justify-center rounded-full border-2 border-[var(--auth-ink)] bg-[var(--color-surface-container-lowest)] px-3 text-[var(--auth-ink)] shadow-[2px_2px_0_var(--auth-ink)] transition hover:-translate-y-0.5 hover:bg-[var(--auth-secondary)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none'
                : 'btn btn--ghost'
            }
            aria-label="Bahasa"
            onClick={() => showToast({ message: 'Bahasa Indonesia terpilih (ID)', icon: 'info' })}
          >
            <Icon name="globe" size={20} />
          </button>
          {identity.phase === 'authenticated' ? (
            <button
              type="button"
              className={guest ? 'min-h-11 rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-surface-container-lowest)] px-4 font-[Nunito_Sans] font-extrabold text-[var(--color-on-surface)] shadow-[2px_2px_0_var(--color-ink)] transition hover:-translate-y-0.5 hover:bg-[var(--color-secondary-container)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none' : 'btn btn--ghost'}
              onClick={() => void identity.logout()}
              disabled={identity.busy}
            >
              Keluar
            </button>
          ) : null}
        </div>
      </header>

      <main
        className={
          guest
            ? 'relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-10 sm:px-6 lg:px-8'
            : onboarding ? 'app-main app-main--onboarding' : 'app-main'
        }
      >
        {apiOffline ? (
          <section className="status-card" aria-live="polite">
            <span className="status-pill status-pill--danger">
              <span className="status-dot" aria-hidden="true" />
              Backend belum tersedia
            </span>
            <p className="status-hint">Pastikan API berjalan, lalu muat ulang halaman ini.</p>
          </section>
        ) : identity.phase === 'loading' ? (
          <section className="status-card" aria-live="polite">
            <span className="status-pill">
              <span className="status-dot" aria-hidden="true" />
              Memeriksa sesiâ€¦
            </span>
          </section>
        ) : identity.phase === 'authenticated' && identity.user ? (
          identity.user.onboarding_completed ? (
            <section className="status-card" aria-live="polite">
              <span className="status-pill status-pill--success">
                <span className="status-dot" aria-hidden="true" />
                Hai, {identity.user.name ?? identity.user.email}
              </span>
              <p className="status-hint">
                Jurnal harianmu hadir di langkah berikutnya. Fondasi akunmu sudah siap.
              </p>
            </section>
          ) : (
            <OnboardingForm
              user={identity.user}
              busy={identity.busy}
              error={identity.error}
              onSave={async (input) => {
                const updated = await identity.saveOnboarding(input)
                if (!updated) throw new Error('onboarding failed')
                return updated
              }}
            />
          )
        ) : authView === 'login' ? (
          <LoginForm
            busy={identity.busy}
            error={identity.error}
            onLogin={identity.login}
            onSwitchToRegister={() => setAuthView('register')}
            showToast={showToast}
          />
        ) : (
          <RegisterForm
            busy={identity.busy}
            error={identity.error}
            onRegister={identity.register}
            onSwitchToLogin={() => setAuthView('login')}
            showToast={showToast}
            onThemeChange={setAuthTheme}
          />
        )}
      </main>

      <Toast toast={toast} onDone={dismissToast} />
    </div>
  )
}


export default App
