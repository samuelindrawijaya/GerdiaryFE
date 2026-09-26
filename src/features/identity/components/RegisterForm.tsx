import { useEffect, useState, type CSSProperties, type FormEvent } from 'react'

import { ApiError } from '../api/identity.ts'
import type { FieldErrors } from '../api/identity.ts'
import { fieldError } from './fieldError.ts'
import { Icon } from './Icon.tsx'
import type { ToastState } from './Toast.tsx'

const AVATARS = [
  { id: 'cowo', name: 'Kakak Cowo', role: 'Sahabat Santai', img: '/img/avatar-cowo.jpg' },
  { id: 'cewe', name: 'Kakak Cewe', role: 'Teman Hangat', img: '/img/avatar-cewe.jpg' },
] as const
type AvatarId = (typeof AVATARS)[number]['id']
type RegisterTheme = 'calm' | 'kawaii'

const REGISTER_THEMES: Record<RegisterTheme, CSSProperties> = {
  calm: {
    '--register-bg': 'var(--color-background)',
    '--register-surface': 'var(--color-surface-container-lowest)',
    '--register-muted': 'var(--color-surface-container-low)',
    '--register-primary': 'var(--color-primary-container)',
    '--register-primary-hover': 'var(--color-primary)',
    '--register-secondary': 'var(--color-secondary-fixed)',
    '--register-accent': 'var(--color-tertiary-fixed)',
    '--register-ink': 'var(--color-ink)',
    '--register-copy': 'var(--color-on-surface-variant)',
    '--register-outline': 'var(--color-outline-variant)',
  } as CSSProperties,
  kawaii: {
    '--register-bg': 'var(--color-background)',
    '--register-surface': 'var(--color-surface-container-lowest)',
    '--register-muted': 'var(--color-surface-container-low)',
    '--register-primary': 'var(--color-primary-container)',
    '--register-primary-hover': 'var(--color-primary)',
    '--register-secondary': 'var(--color-secondary-fixed)',
    '--register-accent': 'var(--color-tertiary-fixed)',
    '--register-ink': 'var(--color-ink)',
    '--register-copy': 'var(--color-on-surface-variant)',
    '--register-outline': 'var(--color-outline-variant)',
  } as CSSProperties,
}

interface RegisterFormProps {
  busy: boolean
  error: ApiError | null
  onRegister: (input: { email: string; password: string; name?: string; journal_theme?: RegisterTheme }) => Promise<unknown>
  onSwitchToLogin: () => void
  showToast: (toast: ToastState) => void
  onThemeChange?: (theme: 'calm' | 'kawaii') => void
}

const fieldClass = (invalid: boolean) =>
  `h-[52px] w-full rounded-2xl border-2 bg-[var(--register-surface)] px-4 text-base text-[var(--color-on-surface)] shadow-[2px_2px_0_var(--register-ink)] outline-none transition placeholder:text-[var(--color-outline)] focus:border-[var(--register-ink)] focus:shadow-[3px_3px_0_var(--register-ink)] focus:-translate-y-0.5 ${invalid ? 'border-[var(--color-error)] ring-2 ring-[var(--color-error-container)]' : 'border-[var(--register-ink)]'}`

export function RegisterForm({ busy, error, onRegister, onSwitchToLogin, showToast, onThemeChange }: RegisterFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [avatar, setAvatar] = useState<AvatarId>('cowo')
  const registerTheme: RegisterTheme = avatar === 'cowo' ? 'calm' : 'kawaii'
  const themeStyle = REGISTER_THEMES[registerTheme]
  useEffect(() => {
    onThemeChange?.(registerTheme)
  }, [onThemeChange, registerTheme])
  const fields: FieldErrors = error?.fields ?? {}
  const emailError = fieldError(fields, 'email')
  const passwordError = fieldError(fields, 'password')

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (busy) return
    const trimmed = name.trim()
    void onRegister({ email: email.trim(), password, journal_theme: registerTheme, ...(trimmed ? { name: trimmed } : {}) })
  }

  return (
    <section className="auth-motion grid w-full flex-1 items-center gap-8 rounded-[2rem] bg-[var(--register-bg)] py-6 text-[var(--register-ink)] transition-colors duration-300 lg:grid-cols-[1fr_500px] lg:gap-20 lg:py-12" style={themeStyle} data-register-theme={registerTheme}>
      <div className="hidden lg:block"><div className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-[var(--register-ink)] bg-[var(--register-accent)] px-4 py-2 font-[Nunito_Sans] text-sm font-extrabold shadow-[2px_2px_0_var(--register-ink)]"><Icon name="sparkle" size={17} /> Jurnal personalmu dimulai di sini</div><h1 className="max-w-xl font-[Nunito_Sans] text-5xl font-black leading-[1.05] tracking-tight xl:text-6xl">Rawat dirimu lewat cerita kecil setiap hari.</h1><p className="mt-6 max-w-lg text-lg leading-8 text-[var(--register-copy)]">Buat ruang yang nyaman untuk memahami pola makanan, waktu makan, dan sinyal dari tubuhmu.</p><div className="mt-10 flex items-center gap-4"><img className="h-28 w-28 rounded-[2rem] border-[3px] border-[var(--register-ink)] bg-[var(--register-primary)] object-cover shadow-[5px_5px_0_var(--register-ink)]" src="/img/mascot.jpg" alt="Maskot Gerdiary" /><div className="rounded-3xl border-2 border-[var(--register-ink)] bg-[var(--register-surface)] px-5 py-4 shadow-[3px_3px_0_var(--register-ink)]"><p className="m-0 font-[Nunito_Sans] font-extrabold">Senang bertemu denganmu! 💛</p><p className="m-0 mt-1 text-sm text-[var(--register-copy)]">Kita mulai pelan-pelan, ya.</p></div></div></div>
      <div className="w-full max-w-xl justify-self-center lg:max-w-[500px]"><div className="relative rounded-[2rem] border-[3px] border-[var(--register-ink)] bg-[var(--register-surface)] p-5 shadow-[5px_5px_0_var(--register-ink)] sm:p-8"><div className="absolute -top-3 left-1/2 h-4 w-16 -translate-x-1/2 rotate-2 rounded-sm bg-[var(--register-accent)]" aria-hidden="true" /><div className="mb-6 flex items-start gap-4"><div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--register-primary)] p-2"><img src="/img/logo.jpg" alt="" className="h-full w-full rounded-xl object-cover" /></div><div><h1 className="font-[Nunito_Sans] text-2xl font-black tracking-tight sm:text-3xl">Mulai jurnal ramah lambungmu</h1><h2 className="sr-only">Mulai Jurnal Ramah Lambungmu</h2><p className="mt-1 text-sm leading-6 text-[var(--register-copy)]">Catat makanan &amp; gejala dengan santai tanpa cemas.</p></div></div>
        <div className="mb-6 rounded-2xl bg-[var(--register-muted)] p-4"><div className="flex items-center justify-between gap-3"><p className="m-0 flex items-center gap-2 font-[Nunito_Sans] text-sm font-extrabold"><Icon name="smile" size={18} /> Pilih karakter jurnalmu</p><span className="rounded-full bg-[var(--register-accent)] px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide">Tema {registerTheme === 'calm' ? 'Calm' : 'Kawaii'}</span></div><p className="m-0 mt-2 text-xs leading-5 text-[var(--register-copy)]">Pilih karakter untuk mencoba nuansa {registerTheme === 'calm' ? 'Calm' : 'Kawaii'}.</p><div className="mt-4 grid grid-cols-2 gap-3" role="radiogroup" aria-label="Karakter jurnal">{AVATARS.map((option) => { const selected = avatar === option.id; return <button key={option.id} type="button" role="radio" aria-checked={selected} className={`relative flex min-h-32 flex-col items-center justify-center rounded-2xl border-2 p-2 text-center transition ${selected ? 'border-[var(--register-ink)] bg-[var(--register-primary)] shadow-[2px_2px_0_var(--register-ink)]' : 'border-[var(--register-outline)] bg-[var(--register-surface)] opacity-70 hover:opacity-100'}`} onClick={() => { setAvatar(option.id); onThemeChange?.(option.id === 'cowo' ? 'calm' : 'kawaii'); showToast({ message: `${option.name} menemani jurnalmu! Tema ${option.id === 'cowo' ? 'Calm' : 'Kawaii'} aktif.`, icon: 'check' }) }} >{selected ? <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[var(--register-ink)] bg-[var(--register-accent)]"><Icon name="check" size={14} /></span> : null}<img src={option.img} alt={`${option.name} avatar`} className="h-16 w-16 rounded-full object-cover" /><span className="mt-2 font-[Nunito_Sans] text-sm font-extrabold">{option.name}</span><span className="text-[11px] text-[var(--register-copy)]">{option.role}</span></button> })}</div></div>
        <form className="flex flex-col gap-5" onSubmit={onSubmit} noValidate><div className="flex flex-col gap-2"><label className="pl-1 font-[Nunito_Sans] text-sm font-extrabold" htmlFor="reg-name">Nama Panggilan</label><div className="relative"><input id="reg-name" className={`${fieldClass(false)} pr-14`} type="text" name="name" autoComplete="nickname" placeholder="Contoh: Arga" value={name} onChange={(event) => setName(event.target.value)} /><span className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-[var(--register-copy)]"><Icon name="smile" size={20} /></span></div></div><div className="flex flex-col gap-2"><label className="pl-1 font-[Nunito_Sans] text-sm font-extrabold" htmlFor="reg-email">Alamat Email <span className="text-[var(--color-error)]">*</span></label><div className="relative"><input id="reg-email" className={`${fieldClass(Boolean(emailError))} pr-14`} type="email" name="email" autoComplete="email" placeholder="nama@email.com" required value={email} onChange={(event) => setEmail(event.target.value)} /><span className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-[var(--register-copy)]"><Icon name="mail" size={20} /></span></div>{emailError ? <span className="pl-1 text-xs font-bold text-[var(--color-error)]" role="alert">{emailError}</span> : null}</div><div className="flex flex-col gap-2"><label className="pl-1 font-[Nunito_Sans] text-sm font-extrabold" htmlFor="reg-password">Kata Sandi <span className="text-[var(--color-error)]">*</span></label><div className="relative"><input id="reg-password" className={`${fieldClass(Boolean(passwordError))} pr-14`} type={showPassword ? 'text' : 'password'} name="password" autoComplete="new-password" placeholder="Minimal 12 karakter" required minLength={12} value={password} onChange={(event) => setPassword(event.target.value)} /><button type="button" className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-[var(--register-copy)] hover:bg-[var(--register-muted)]" aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'} onClick={() => setShowPassword((value) => !value)}><Icon name={showPassword ? 'eye-off' : 'eye'} size={20} /></button></div>{passwordError ? <span className="pl-1 text-xs font-bold text-[var(--color-error)]" role="alert">{passwordError}</span> : null}</div>{error ? <p className="m-0 rounded-2xl border-2 border-[var(--color-error)] bg-[var(--color-error-container)] px-4 py-3 text-sm font-bold leading-5 text-[var(--color-on-error-container)]" role="alert">{error.message}</p> : null}<button type="submit" className="flex min-h-[52px] items-center justify-center gap-2 rounded-full border-2 border-[var(--register-ink)] bg-[var(--register-primary)] px-5 font-[Nunito_Sans] text-base font-black text-[var(--color-on-primary-container)] shadow-[3px_3px_0_var(--register-ink)] transition hover:-translate-y-0.5 hover:bg-[var(--register-primary-hover)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:cursor-wait disabled:opacity-60" disabled={busy}>{busy ? 'Menyiapkan…' : 'Mulai Jurnalanku'} {!busy ? <Icon name="arrow-right" size={20} /> : null}</button></form><div className="mt-6 flex items-center gap-3 rounded-2xl bg-[var(--register-muted)] px-4 py-3 text-sm text-[var(--register-copy)]"><Icon name="shield" size={19} className="shrink-0 text-[var(--register-primary)]" /><p className="m-0">Data jurnalmu tersimpan aman &amp; privat.</p></div></div><p className="mt-6 text-center text-sm text-[var(--register-copy)]">Sudah punya akun? <button type="button" className="min-h-11 rounded-lg px-2 font-bold text-[var(--color-primary)] underline underline-offset-4 hover:bg-[var(--register-muted)]" onClick={onSwitchToLogin}>Masuk di sini</button></p></div>
    </section>
  )
}
