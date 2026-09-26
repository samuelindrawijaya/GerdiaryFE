import { useRef, useState } from 'react'

interface Heart {
  id: number
  dx: number
}

interface MascotHeroProps {
  title: string
  subtitle: string
}

export function MascotHero({ title, subtitle }: MascotHeroProps) {
  const [hearts, setHearts] = useState<Heart[]>([])
  const [wobble, setWobble] = useState(false)
  const nextId = useRef(0)

  const onTap = () => {
    const id = nextId.current++
    setHearts((prev) => [...prev, { id, dx: Math.round(Math.random() * 48) - 24 }])
    window.setTimeout(() => setHearts((prev) => prev.filter((h) => h.id !== id)), 800)
    setWobble(false)
    requestAnimationFrame(() => setWobble(true))
  }

  return (
    <div className="mascot-hero">
      <div className="mascot-hero__tape" aria-hidden="true" />
      <button
        type="button"
        className={`mascot-hero__stage${wobble ? ' mascot-wobble-active' : ''}`}
        onClick={onTap}
        onAnimationEnd={() => setWobble(false)}
        aria-label="Sapa maskot Gerdiary"
      >
        <span className="mascot-hero__hearts" aria-hidden="true">
          {hearts.map((heart) => (
            <span
              key={heart.id}
              className="mascot-hero__heart heart-pop"
              style={{ marginLeft: `${heart.dx}px` }}
            >
              ♥
            </span>
          ))}
        </span>
        <img
          className="mascot-hero__badge animate-float"
          src="/img/mascot.jpg"
          alt="Maskot Gerdiary — lambung lucu berwajah ceria"
          width={128}
          height={128}
        />
        <span className="mascot-hero__sparkle mascot-hero__sparkle--top animate-twinkle" aria-hidden="true">
          ✦
        </span>
        <span className="mascot-hero__sparkle mascot-hero__sparkle--bottom animate-sway" aria-hidden="true">
          ✿
        </span>
        <span className="speech-bubble animate-entrance">
          <span className="speech-bubble__title">
            {title} <span aria-hidden="true">👋</span>
          </span>
          <span className="speech-bubble__subtitle">{subtitle}</span>
        </span>
      </button>
    </div>
  )
}
