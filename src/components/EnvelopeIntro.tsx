import { useEffect, useState } from 'react'

interface EnvelopeIntroProps {
  partner1: string
  partner2: string
  personalGreeting?: string | null
  storageKey: string
  onComplete: () => void
}

type Phase = 'idle' | 'opening' | 'revealed' | 'exit'

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

    setTimeout(() => setPhase('revealed'), 1400)
    setTimeout(() => {
      setPhase('exit')
      sessionStorage.setItem(storageKey, 'true')
    }, 2400)
    setTimeout(() => {
      setVisible(false)
      onComplete()
    }, 3100)
  }

  if (!visible) return null

  const isAnimating = phase !== 'idle'

  return (
    <div
      className={`envelope-overlay fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-700 ${
        phase === 'exit' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="envelope-bokeh absolute inset-0" />

      <div className="relative z-10 flex flex-col items-center px-6 w-full max-w-sm">
        {personalGreeting && phase === 'idle' && (
          <p className="font-serif text-2xl text-charcoal/90 mb-10 text-center animate-fade-in">
            {personalGreeting}
          </p>
        )}

        <button
          type="button"
          onClick={handleOpen}
          disabled={isAnimating}
          className="envelope-scene focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 rounded-sm"
          aria-label="Einladung öffnen"
        >
          <div
            className={[
              'envelope',
              phase === 'opening' && 'envelope--opening',
              phase === 'revealed' && 'envelope--revealed',
              phase === 'exit' && 'envelope--exit',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <div className="envelope__shadow" />

            <div className="envelope__body">
              <div className="envelope__card">
                <div className="envelope__card-content">
                  <p className="envelope__card-label">Wir heiraten</p>
                  <p className="envelope__card-names">
                    {partner1}
                    <span className="envelope__card-amp">&</span>
                    {partner2}
                  </p>
                </div>
              </div>

              <div className="envelope__pocket-left" />
              <div className="envelope__pocket-right" />
              <div className="envelope__pocket-bottom" />

              <div className="envelope__flap">
                <div className="envelope__flap-inner" />
              </div>

              <div className="envelope__seal">
                <svg viewBox="0 0 64 64" className="envelope__seal-svg" aria-hidden>
                  <defs>
                    <radialGradient id="sealGrad" cx="40%" cy="35%">
                      <stop offset="0%" stopColor="#f0c4c4" />
                      <stop offset="100%" stopColor="#d49090" />
                    </radialGradient>
                  </defs>
                  <circle cx="32" cy="32" r="30" fill="url(#sealGrad)" />
                  <circle cx="32" cy="32" r="28" fill="none" stroke="#c9a96e" strokeWidth="0.5" opacity="0.4" />
                  <circle cx="24" cy="32" r="8" fill="none" stroke="#c9a96e" strokeWidth="1.8" />
                  <circle cx="40" cy="32" r="8" fill="none" stroke="#c9a96e" strokeWidth="1.8" />
                  <path
                    d="M 24 32 L 40 32"
                    stroke="#c9a96e"
                    strokeWidth="1.2"
                    fill="none"
                    opacity="0.5"
                  />
                </svg>
              </div>
            </div>
          </div>
        </button>

        <p
          className={`mt-10 font-serif text-xs text-warm-gray tracking-[0.3em] uppercase transition-all duration-500 ${
            phase === 'idle' ? 'opacity-70' : 'opacity-0 translate-y-2'
          }`}
        >
          Tippen zum Öffnen
        </p>
      </div>
    </div>
  )
}
