import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'

interface EnvelopeIntroProps {
  partner1: string
  partner2: string
  personalGreeting?: string | null
  storageKey: string
  onComplete: () => void
}

type Phase = 'idle' | 'opening' | 'letter' | 'exit'

export default function EnvelopeIntro({
  partner1,
  partner2,
  personalGreeting,
  storageKey,
  onComplete,
}: EnvelopeIntroProps) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (sessionStorage.getItem(storageKey) === 'true') {
      setVisible(false)
      onComplete()
    }
  }, [storageKey, onComplete])

  const handleOpen = () => {
    if (phase !== 'idle') return
    setPhase('opening')

    setTimeout(() => setPhase('letter'), 900)
    setTimeout(() => {
      setPhase('exit')
      sessionStorage.setItem(storageKey, 'true')
    }, 3200)
    setTimeout(() => {
      setVisible(false)
      onComplete()
    }, 4000)
  }

  if (!visible) return null

  const showEnvelope = phase === 'idle' || phase === 'opening'
  const showLetter = phase === 'opening' || phase === 'letter' || phase === 'exit'

  return (
    <div
      className={`envelope-overlay fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-700 ${
        phase === 'exit' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="envelope-bokeh absolute inset-0" />

      <div className="relative z-10 flex flex-col items-center px-6 w-full">
        {personalGreeting && phase === 'idle' && (
          <p className="font-serif text-2xl sm:text-3xl text-charcoal/90 mb-10 text-center animate-fade-in">
            {personalGreeting}
          </p>
        )}

        {showEnvelope && (
          <button
            type="button"
            onClick={handleOpen}
            disabled={phase !== 'idle'}
            className={`envelope-scene focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 ${
              phase === 'opening' ? 'envelope-scene--opening' : ''
            }`}
            aria-label="Einladung öffnen"
          >
            <svg
              viewBox="0 0 320 220"
              className="envelope-svg"
              aria-hidden
            >
              <defs>
                <linearGradient id="envPaper" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#faf7f2" />
                  <stop offset="100%" stopColor="#ede6dc" />
                </linearGradient>
                <linearGradient id="envFlap" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#f8f3ec" />
                  <stop offset="100%" stopColor="#f0ebe3" />
                </linearGradient>
                <radialGradient id="envSeal" cx="40%" cy="35%">
                  <stop offset="0%" stopColor="#f0c4c4" />
                  <stop offset="100%" stopColor="#d49090" />
                </radialGradient>
                <filter id="envShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="8" stdDeviation="12" floodOpacity="0.15" />
                </filter>
              </defs>

              <rect
                x="20"
                y="30"
                width="280"
                height="170"
                rx="3"
                fill="url(#envPaper)"
                stroke="#d4c4a8"
                strokeWidth="0.8"
                filter="url(#envShadow)"
              />

              <polygon
                points="20,200 160,120 300,200"
                fill="#ebe4da"
                stroke="#d4c4a8"
                strokeWidth="0.5"
              />

              <polygon
                points="20,30 160,120 20,200"
                fill="#f3ede5"
                stroke="#d4c4a8"
                strokeWidth="0.5"
                opacity="0.9"
              />
              <polygon
                points="300,30 160,120 300,200"
                fill="#f3ede5"
                stroke="#d4c4a8"
                strokeWidth="0.5"
                opacity="0.9"
              />

              <g className="envelope-svg__flap-group">
                <polygon
                  points="20,30 160,120 300,30"
                  fill="url(#envFlap)"
                  stroke="#d4c4a8"
                  strokeWidth="0.8"
                />
              </g>

              <g className="envelope-svg__seal-group">
                <circle cx="160" cy="118" r="26" fill="url(#envSeal)" />
                <circle cx="160" cy="118" r="24" fill="none" stroke="#c9a96e" strokeWidth="0.6" opacity="0.5" />
                <circle cx="152" cy="118" r="7" fill="none" stroke="#c9a96e" strokeWidth="1.5" />
                <circle cx="168" cy="118" r="7" fill="none" stroke="#c9a96e" strokeWidth="1.5" />
              </g>
            </svg>
          </button>
        )}

        {showLetter && (
          <div
            className={`letter-reveal ${phase === 'opening' ? 'letter-reveal--enter' : ''} ${
              phase === 'letter' ? 'letter-reveal--visible' : ''
            } ${phase === 'exit' ? 'letter-reveal--exit' : ''}`}
          >
            <div className="letter-reveal__card">
              <Heart className="w-6 h-6 text-gold mx-auto mb-4" />
              <p className="letter-reveal__label">Wir heiraten</p>
              <h2 className="letter-reveal__names">
                {partner1}
                <span className="letter-reveal__amp">&</span>
                {partner2}
              </h2>
              <div className="letter-reveal__line" />
              <p className="letter-reveal__hint">Eure Einladung</p>
            </div>
          </div>
        )}

        {phase === 'idle' && (
          <p className="mt-10 font-serif text-xs text-warm-gray tracking-[0.3em] uppercase opacity-70">
            Tippen zum Öffnen
          </p>
        )}
      </div>
    </div>
  )
}
