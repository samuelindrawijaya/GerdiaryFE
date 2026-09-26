import { useEffect, useState } from 'react'

import { ApiError } from '../api/identity.ts'
import type { OnboardingInput, UserDto } from '../api/identity.ts'
import { Icon } from './Icon.tsx'

type TriggerLevel = 'kuat' | 'ringan' | 'aman'
interface TriggerPreference { id: string; label: string; emoji: string; level: TriggerLevel }
interface Draft { name: string; sleepTime: string; timezone: string; triggers: TriggerPreference[] }
interface OnboardingFormProps { user: UserDto; busy: boolean; error: ApiError | null; onSave: (input: OnboardingInput) => Promise<UserDto> }

const STORAGE_KEY = 'gerdiary.onboarding.draft.v1'
const PRESETS = [{ time: '22:00', hint: 'Lebih Awal' }, { time: '23:00', hint: 'Pilihanmu' }, { time: '00:00', hint: 'Larut' }]
const TRIGGER_OPTIONS = [
  { id: 'pedas', label: 'Pedas', emoji: '🌶️' }, { id: 'asam', label: 'Asam', emoji: '🍋' },
  { id: 'bersantan', label: 'Bersantan', emoji: '🥥' }, { id: 'kopi', label: 'Kopi', emoji: '☕' },
  { id: 'bersoda', label: 'Bersoda', emoji: '🥤' }, { id: 'gorengan', label: 'Gorengan', emoji: '🍟' },
]

function cutoff(time: string) {
  const [hour, minute] = time.split(':').map(Number)
  const total = ((hour - 3 + 24) % 24) * 60 + (minute || 0)
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

function readDraft(user: UserDto): Draft {
  try {
    const saved = localStorage.getItem(`${STORAGE_KEY}.${user.id}`)
    if (saved) return JSON.parse(saved) as Draft
  } catch { /* local storage is best effort */ }
  return { name: user.name ?? '', sleepTime: user.sleep_time ?? '23:00', timezone: user.timezone ?? 'Asia/Jakarta', triggers: [] }
}

export function OnboardingForm({ user, busy, error, onSave }: OnboardingFormProps) {
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<Draft>(() => readDraft(user))
  const [customTrigger, setCustomTrigger] = useState('')
  const saveDraft = (next: Draft) => { setDraft(next); try { localStorage.setItem(`${STORAGE_KEY}.${user.id}`, JSON.stringify(next)) } catch { /* best effort */ } }
  const setField = <K extends keyof Draft>(key: K, value: Draft[K]) => saveDraft({ ...draft, [key]: value })
  const updateTrigger = (id: string, level: TriggerLevel) => saveDraft({ ...draft, triggers: draft.triggers.map((item) => item.id === id ? { ...item, level } : item) })
  const removeTrigger = (id: string) => saveDraft({ ...draft, triggers: draft.triggers.filter((item) => item.id !== id) })
  const addTrigger = (label: string, emoji = '🍽️', id?: string) => {
    const clean = label.trim()
    if (!clean || draft.triggers.some((item) => item.label.toLowerCase() === clean.toLowerCase())) { setCustomTrigger(''); return }
    saveDraft({ ...draft, triggers: [...draft.triggers, { id: id ?? `custom-${Date.now()}`, label: clean, emoji, level: 'ringan' }] })
    setCustomTrigger('')
  }
  const submit = () => void onSave({ name: draft.name.trim() || undefined, sleep_time: draft.sleepTime, timezone: draft.timezone, sensitivity_level: draft.triggers.some((item) => item.level === 'kuat') ? 'severe' : draft.triggers.some((item) => item.level === 'ringan') ? 'moderate' : 'mild' })
  useEffect(() => { if (user.onboarding_completed) localStorage.removeItem(`${STORAGE_KEY}.${user.id}`) }, [user.id, user.onboarding_completed])

  return <section className="onb" aria-label="Onboarding">
    <h1 className="sr-only">Kenalan dulu, yuk</h1>
    <div className="onb__journey"><div className="onb__progress" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={4}>{[1, 2, 3, 4].map((item) => <span key={item} className={`onb__bar${item - 1 < step ? ' onb__bar--done' : item - 1 === step ? ' onb__bar--active' : ''}`} />)}</div><div className="onb__labels">{['1. Jam Lambung', '2. Pantangan', '3. Sensitivitas', '4. Siap Mulai'].map((label, index) => <span key={label} className={index === step ? 'onb__label--active' : undefined}>{label}</span>)}</div></div>
    <div className="onb__panel">
      <div key={step} className="onb__stage">
      {step === 0 ? <div className="onb__step"><section className="onb__hero"><span className="onb__step-emoji" aria-hidden="true">🌙</span><div><p className="onb__eyebrow">LANGKAH 1 DARI 4</p><h2 className="onb__step-title">Kunci Ritme: Jeda 3 Jam Sebelum Tidur</h2><p className="onb__step-desc">Lambung butuh waktu minimal <strong>3 jam</strong> untuk mengosongkan makanan agar asam lambung tidak naik saat kamu berbaring santai di malam hari.</p></div></section><section className="onb__setting onb__setting--only"><div className="onb__setting-head"><div><span className="onb__section-label">Pengaturan utama</span><h2 className="onb__step-title onb__setting-title">Jam Berapa Kamu Biasanya Tidur?</h2></div><span className="onb__step-icon onb__step-icon--sleep" aria-hidden="true"><Icon name="moon" size={24} /></span></div><div className="preset-grid">{PRESETS.map((preset) => <button key={preset.time} type="button" className={`preset${draft.sleepTime === preset.time ? ' preset--selected' : ''}`} aria-pressed={draft.sleepTime === preset.time} onClick={() => setField('sleepTime', preset.time)}>{draft.sleepTime === preset.time ? <span className="preset__flag">Paling Pas</span> : null}<span className="preset__time">{preset.time}</span><span className="preset__hint">{draft.sleepTime === preset.time ? 'Pilihanmu' : preset.hint}</span></button>)}</div><label className="field onb__manual-time"><span className="field-label"><Icon name="moon" /> Atur waktu tidur manual</span><input className="input" type="time" value={draft.sleepTime} onChange={(event) => setField('sleepTime', event.target.value)} /></label><div className="result-badge"><span className="result-badge__icon" aria-hidden="true">🍽️</span><div><p className="result-badge__label">Batas akhir makan malam:</p><p className="result-badge__value">Pukul {cutoff(draft.sleepTime)} WIB</p></div><span className="result-badge__ok"><Icon name="check" size={12} /> Jeda 3 Jam Aman</span></div></section></div> : null}
      {step === 1 ? <div className="onb__step onb__step--choices"><section className="trigger-panel trigger-panel--choices"><div className="trigger-panel__heading"><div><p className="onb__eyebrow">LANGKAH 2 DARI 4</p><h2 className="onb__step-title">Pilih Pantangan Awal</h2><p className="onb__step-desc">Gerdiary akan mengingatkan saat kamu mencatat makanan ini.</p></div><span className="trigger-count" aria-live="polite">{draft.triggers.length} Terpilih</span></div><div className="trigger-chips">{TRIGGER_OPTIONS.map((option) => { const selected = draft.triggers.some((item) => item.id === option.id); return <button key={option.id} type="button" className={`trigger-chip${selected ? ' trigger-chip--selected' : ''}`} aria-pressed={selected} onClick={() => selected ? removeTrigger(option.id) : addTrigger(option.label, option.emoji, option.id)}>{option.emoji} {option.label}</button> })}</div></section><section className="custom-trigger"><h3><span aria-hidden="true">⊕</span> Punya Pantangan Lain?</h3><div className="custom-trigger__form"><input className="input" value={customTrigger} onChange={(event) => setCustomTrigger(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') addTrigger(customTrigger) }} placeholder="Misal: Cokelat pekat, susu sapi..." aria-label="Pantangan lain" /><button type="button" className="custom-trigger__add" onClick={() => addTrigger(customTrigger)}>+ Tambah</button></div><span className="onb__section-label">Saran pemicu populer:</span><div className="custom-trigger__suggestions">{['Cokelat Pekat', 'Minuman Soda', 'Santan Kental'].map((item) => <button type="button" key={item} onClick={() => addTrigger(item)}>+ {item}</button>)}</div>{draft.triggers.length ? <div className="custom-trigger__selected"><span className="onb__section-label">Pilihanmu:</span>{draft.triggers.map((item) => <button type="button" key={item.id} onClick={() => removeTrigger(item.id)}>{item.emoji} {item.label} ×</button>)}</div> : null}</section></div> : null}
      {step === 2 ? <div className="onb__step onb__step--triggers"><section className="onb__guidance onb__guidance--sensitivity"><span className="onb__guidance-icon"><Icon name="sparkle" size={18} /></span><div><p className="onb__eyebrow">LANGKAH 3 DARI 4</p><h2 className="onb__step-title">Atur Sensitivitas Pemicu ✨</h2><p className="onb__step-desc">Tentukan mana yang memicu sensasi terbakar (kuat), kembung ringan, atau aman.</p></div></section><section className="trigger-cards" aria-label="Sensitivitas pantangan">{draft.triggers.length ? draft.triggers.map((item) => <article className={`trigger-card trigger-card--${item.id}`} key={item.id}><div className="trigger-card__head"><span className="trigger-card__emoji" aria-hidden="true">{item.emoji}</span><div className="trigger-card__copy"><h3>{item.label}</h3><p>Sesuaikan tingkat respons lambungmu</p></div><span className={`trigger-card__badge trigger-card__badge--${item.level}`}>{item.level === 'kuat' ? '🔥 Pemicu Kuat' : item.level === 'ringan' ? '⚠️ Pemicu Ringan' : '🌿 Aman'}</span></div><div className="trigger-levels">{(['kuat', 'ringan', 'aman'] as TriggerLevel[]).map((level) => <button key={level} type="button" className={item.level === level ? `trigger-level trigger-level--${level}` : 'trigger-level'} aria-pressed={item.level === level} onClick={() => updateTrigger(item.id, level)}>{level === 'kuat' ? '🔥 Kuat' : level === 'ringan' ? '⚠️ Ringan' : '🌿 Aman'}</button>)}</div></article>) : <p className="onb__empty">Belum ada pantangan. Kembali ke langkah 2 untuk memilih.</p>}</section><section className="onb__flex-tip"><span className="onb__flex-tip-icon"><Icon name="bulb" size={19} /></span><div><h3>Preferensi ini sangat fleksibel!</h3><p>Kamu bisa mengubah pilihan ini kapan saja.</p></div></section></div> : null}
      {step === 3 ? <div className="onb__step onb__step--ready"><section className="ready-card"><span className="ready-card__icon" aria-hidden="true">🎉</span><p className="onb__eyebrow">LANGKAH 4 DARI 4</p><h2 className="onb__step-title">Siap Mulai?</h2><p className="onb__step-desc">Profil jurnalmu sudah siap. Kita mulai dengan ritme yang nyaman untuk lambungmu.</p></section><section className="ready-summary"><span className="onb__section-label">Rangkuman pilihanmu</span><div className="ready-summary__row"><span><Icon name="moon" size={16} /> Jam tidur</span><strong>{draft.sleepTime}</strong></div><div className="ready-summary__row"><span><Icon name="clock" size={16} /> Jeda aman</span><strong>sampai {cutoff(draft.sleepTime)}</strong></div><div className="ready-summary__row"><span><Icon name="heart" size={16} /> Pantangan</span><strong>{draft.triggers.length} dipilih</strong></div></section><label className="field"><span className="field-label"><Icon name="smile" /> Nama panggilan</span><input className="input" type="text" autoComplete="nickname" placeholder="Contoh: Arga" value={draft.name} onChange={(event) => setField('name', event.target.value)} /></label><label className="field"><span className="field-label"><Icon name="globe" /> Zona waktu</span><select className="input" value={draft.timezone} onChange={(event) => setField('timezone', event.target.value)}><option value="Asia/Jakarta">Asia/Jakarta (WIB)</option><option value="Asia/Makassar">Asia/Makassar (WITA)</option><option value="Asia/Jayapura">Asia/Jayapura (WIT)</option></select></label>{error ? <p className="form-alert" role="alert">{error.message}</p> : null}</div> : null}
      <div className="onb__nav">{step > 0 ? <button type="button" className="btn btn--ghost" onClick={() => setStep((current) => current - 1)}>Kembali</button> : null}{step < 3 ? <button type="button" className="btn btn--primary btn-shimmer" onClick={() => setStep((current) => current + 1)}>{step === 0 ? 'Lanjut ke Langkah 2' : step === 1 ? 'Lanjut ke Langkah 3' : 'Lanjut ke Langkah 4'} <Icon name="arrow-right" size={20} /></button> : <button type="button" className="btn btn--primary btn-shimmer" disabled={busy} onClick={submit}>{busy ? 'Menyiapkan…' : 'Mulai Menjelajah'} {!busy ? <Icon name="arrow-right" size={20} /> : null}</button>}</div><p className="onb__privacy">🔒 Data kesehatan dan rutinitasmu tersimpan privat &amp; aman.</p>
      </div>
    </div>
  </section>
}
