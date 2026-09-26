import { useState, type FormEvent } from 'react'

import { ApiError } from '../api/identity.ts'
import type { FieldErrors } from '../api/identity.ts'
import { fieldError } from './fieldError.ts'
import { Icon } from './Icon.tsx'
import type { ToastState } from './Toast.tsx'

const TIPS = [
  'Catat makanan dalam 15 detik setelah makan agar pola asam lambungmu lebih mudah terdeteksi!',
  'Hindari makan berat kurang dari 3 jam sebelum tidur ya, lambungmu akan berterima kasih!',
  'Kunyah pelan dan nikmati suapan — makan terburu-buru memicu asam lambung naik.',
  'Minum air hangat setelah makan membantu menenangkan lambung lebih baik dari air es.',
]

interface LoginFormProps {
  busy: boolean
  error: ApiError | null
  onLogin: (input: { email: string; password: string }) => Promise<unknown>
  onSwitchToRegister: () => void
  showToast: (toast: ToastState) => void
}

const fieldClass = (invalid: boolean) =>
  `h-[52px] w-full rounded-2xl border-2 bg-[var(--color-surface-container-lowest)] px-4 text-base text-[var(--color-on-surface)] shadow-[2px_2px_0_var(--color-ink)] outline-none transition placeholder:text-[var(--color-outline)] focus:border-[var(--color-ink)] focus:shadow-[3px_3px_0_var(--color-ink)] focus:-translate-y-0.5 ${invalid ? 'border-[var(--color-error)] ring-2 ring-[var(--color-error-container)]' : 'border-[var(--color-ink)]'}`

export function LoginForm({ busy, error, onLogin, onSwitchToRegister, showToast }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [tipIndex, setTipIndex] = useState(0)
  const fields: FieldErrors = error?.fields ?? {}
  const emailError = fieldError(fields, 'email')
  const passwordError = fieldError(fields, 'password')

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!busy) void onLogin({ email: email.trim(), password })
  }

  return (
    <section className="auth-motion grid w-full flex-1 items-center gap-8 py-6 lg:grid-cols-[1fr_440px] lg:gap-20 lg:py-12">
      <h1 className="sr-only">Selamat datang kembali</h1>
      <div className="hidden lg:block">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-tertiary-fixed)] px-4 py-2 font-[Nunito_Sans] text-sm font-extrabold text-[var(--color-on-tertiary-fixed)] shadow-[2px_2px_0_var(--color-ink)]"><Icon name="heart" size={17} /> Ruang aman untuk mencatat</div>
        <h1 className="max-w-xl font-[Nunito_Sans] text-5xl font-black leading-[1.05] tracking-tight text-[var(--color-on-surface)] xl:text-6xl">Kenali ritme tubuhmu, satu catatan kecil setiap hari.</h1>
        <p className="mt-6 max-w-lg text-lg leading-8 text-[var(--color-on-surface-variant)]">Gerdiary membantumu merekam makanan dan gejala dengan cara yang hangat, privat, dan tanpa menghakimi.</p>
        <div className="mt-10 flex items-end gap-5"><img className="h-36 w-36 rounded-[2rem] border-[3px] border-[var(--color-ink)] bg-[var(--color-primary-container)] object-cover shadow-[5px_5px_0_var(--color-ink)]" src="/img/mascot.jpg" alt="Maskot Gerdiary" /><div className="relative mb-5 max-w-xs rounded-3xl border-2 border-[var(--color-ink)] bg-[var(--color-surface-container-lowest)] px-5 py-4 text-[var(--color-on-surface)] shadow-[3px_3px_0_var(--color-ink)]"><span className="absolute -bottom-3 left-8 h-5 w-5 rotate-45 border-b-2 border-r-2 border-[var(--color-ink)] bg-[var(--color-surface-container-lowest)]" aria-hidden="true" /><p className="relative m-0 font-[Nunito_Sans] font-extrabold">Halo lagi! 👋</p><p className="relative m-0 mt-1 text-sm text-[var(--color-on-surface-variant)]">Yuk catat harimu dengan nyaman.</p></div></div>
      </div>
      <div className="w-full max-w-xl justify-self-center lg:max-w-[440px]">
        <div className="relative rounded-[2rem] border-[3px] border-[var(--color-ink)] bg-[var(--color-surface-container-lowest)] p-5 text-[var(--color-on-surface)] shadow-[5px_5px_0_var(--color-ink)] sm:p-8">
          <div className="absolute -top-3 left-1/2 h-4 w-16 -translate-x-1/2 -rotate-2 rounded-sm bg-[var(--color-tertiary-fixed)]" aria-hidden="true" />
          <div className="mb-7 text-center lg:text-left"><div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary-container)] p-2 lg:mx-0"><img src="/img/logo.jpg" alt="" className="h-full w-full rounded-xl object-cover" /></div><h2 className="font-[Nunito_Sans] text-3xl font-black tracking-tight">Masuk ke jurnalmu</h2><p className="mt-2 text-sm leading-6 text-[var(--color-on-surface-variant)]">Lanjutkan perjalanan memahami tubuhmu dengan tenang.</p></div>
          <form className="flex flex-col gap-5" onSubmit={onSubmit} noValidate>
            <div className="flex flex-col gap-2"><label className="flex items-center gap-2 pl-1 font-[Nunito_Sans] text-sm font-extrabold" htmlFor="login-email"><Icon name="mail" size={17} /> Email Kamu</label><input id="login-email" className={fieldClass(Boolean(emailError))} type="email" name="email" autoComplete="email" placeholder="nama@email.com" required value={email} onChange={(event) => setEmail(event.target.value)} />{emailError ? <span className="pl-1 text-xs font-bold text-[var(--color-error)]" role="alert">{emailError}</span> : null}</div>
            <div className="flex flex-col gap-2"><div className="flex items-center justify-between pl-1"><label className="flex items-center gap-2 font-[Nunito_Sans] text-sm font-extrabold" htmlFor="login-password"><Icon name="lock" size={17} /> Kata Sandi</label><button type="button" className="min-h-11 rounded-lg px-2 text-xs font-bold text-[var(--color-secondary)] underline underline-offset-4 hover:bg-[var(--color-secondary-container)]" onClick={() => showToast({ message: 'Hubungi admin untuk reset sandi ya!', icon: 'info' })}>Lupa sandi?</button></div><div className="relative"><input id="login-password" className={`${fieldClass(Boolean(passwordError))} pr-14`} type={showPassword ? 'text' : 'password'} name="password" autoComplete="current-password" placeholder="Kata sandimu" required value={password} onChange={(event) => setPassword(event.target.value)} /><button type="button" className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-low)]" aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'} onClick={() => setShowPassword((value) => !value)}><Icon name={showPassword ? 'eye-off' : 'eye'} size={20} /></button></div>{passwordError ? <span className="pl-1 text-xs font-bold text-[var(--color-error)]" role="alert">{passwordError}</span> : null}</div>
            {error ? <p className="m-0 rounded-2xl border-2 border-[var(--color-error)] bg-[var(--color-error-container)] px-4 py-3 text-sm font-bold leading-5 text-[var(--color-on-error-container)]" role="alert">{error.message}</p> : null}
            <button type="submit" className="flex min-h-[52px] items-center justify-center gap-2 rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-primary-container)] px-5 font-[Nunito_Sans] text-base font-black text-[var(--color-on-primary-container)] shadow-[3px_3px_0_var(--color-ink)] transition hover:-translate-y-0.5 hover:bg-[var(--color-primary)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:cursor-wait disabled:opacity-60" disabled={busy}>{busy ? 'Memeriksa…' : 'Masuk ke Jurnal'} {!busy ? <Icon name="arrow-right" size={20} /> : null}</button>
          </form>
          <div className="mt-6 flex items-center gap-3 rounded-2xl bg-[var(--color-surface-container-low)] px-4 py-3 text-sm text-[var(--color-on-surface-variant)]"><Icon name="shield" size={19} className="shrink-0 text-[var(--color-secondary)]" /><p className="m-0">Data jurnalmu tersimpan aman &amp; privat.</p></div>
        </div>
        <div className="mt-6 flex items-center justify-between gap-4 rounded-3xl border-2 border-[var(--color-ink)] bg-[var(--color-secondary-fixed)] p-4 text-[var(--color-on-secondary-fixed)] shadow-[3px_3px_0_var(--color-ink)]"><div><p className="m-0 font-[Nunito_Sans] font-extrabold">Belum punya akun?</p><p className="m-0 mt-1 text-xs text-[var(--color-on-secondary-fixed-variant)]">Mulai rawat lambungmu hari ini</p></div><button type="button" className="min-h-11 shrink-0 rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-surface-container-lowest)] px-4 font-[Nunito_Sans] text-sm font-extrabold text-[var(--color-on-surface)] shadow-[2px_2px_0_var(--color-ink)] transition hover:-translate-y-0.5 hover:bg-[var(--color-tertiary-fixed)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none" onClick={onSwitchToRegister}>Daftar Sekarang</button></div>
        <button type="button" className="mt-5 flex w-full items-start gap-3 rounded-3xl border-2 border-[var(--color-ink)] bg-[var(--color-tertiary-fixed)] p-4 text-left text-[var(--color-on-tertiary-fixed)] shadow-[3px_3px_0_var(--color-ink)]" onClick={() => setTipIndex((index) => (index + 1) % TIPS.length)}><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-tertiary-fixed-dim)] text-[var(--color-on-tertiary-fixed)]"><Icon name="bulb" size={18} /></span><span><span className="flex items-center gap-2 font-[Nunito_Sans] text-sm font-extrabold">Tips Santai Hari Ini <Icon name="sparkle" size={14} /></span><span className="mt-1 block text-xs leading-5 text-[var(--color-on-tertiary-fixed-variant)]">{TIPS[tipIndex]}</span></span></button>
      </div>
    </section>
  )
}
