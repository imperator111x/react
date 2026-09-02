import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'

interface EnvelopeIntroProps {
  partner1: string
  partner2: string
  personalGreeting?: string | null
  storageKey: string
  onComplete: () => void
}

type Phase = 'closed' | 'opening' | 'done'

export default function EnvelopeIntro({
  partner1,
  partner2,
  personalGreeting,
  storageKey,
  onComplete,
}: EnvelopeIntroProps) {
  const [phase, setPhase] = useState<Phase>('closed')
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (sessionStorage.getItem(storageKey) === 'true') {
      setVisible(false)
      onComplete()
    }
  }, [storageKey, onComplete])

  const handleOpen = () => {
    if (phase !== 'closed') return
    setPhase('opening')
    setTimeout(() => {
      setPhase('done')
      sessionStorage.setItem(storageKey, 'true')
      setTimeout(() => {
        setVisible(false)
        onComplete()
      }, 600)
    }, 2200)
  }

  if (!visible) return null

  return (
    <div
      className={`envelope-overlay fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-700 ${
        phase === 'done' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="envelope-bokeh absolute inset-0" />

      <div className="relative z-10 flex flex-col items-center px-6">
        {personalGreeting && (
          <p className="font-serif text-xl text-charcoal/80 mb-6 text-center animate-fade-in">
            {personalGreeting}
          </p>
        )}

        <button
          type="button"
          onClick={handleOpen}
          disabled={phase !== 'closed'}
          className="envelope-scene group focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 rounded-lg"
          aria-label="Einladung öffnen"
        >
          <div className={`envelope ${phase === 'opening' ? 'envelope--opening' : ''} ${phase === 'done' ? 'envelope--done' : ''}`}>
            <div className="envelope__shadow" />

            <div className="envelope__card">
              <div className="envelope__card-inner">
                <Heart className="w-5 h-5 text-gold mx-auto mb-2" />
                <p className="font-serif text-lg text-charcoal leading-tight">
                  {partner1}
                  <span className="text-gold italic mx-1">&</span>
                  {partner2}
                </p>
                <p className="text-[10px] uppercase tracking-[0.25em] text-warm-gray mt-2">
                  Hochzeit
                </p>
              </div>
            </div>

            <div className="envelope__pocket" />
            <div className="envelope__flap" />

            <div className={`envelope__seal ${phase === 'opening' ? 'envelope__seal--break' : ''}`}>
              <svg viewBox="0 0 48 48" className="w-10 h-10" aria-hidden>
                <circle cx="24" cy="24" r="22" fill="#d4a5a5" />
                <circle cx="24" cy="24" r="20" fill="#e8b4b4" />
                <circle cx="18" cy="24" r="7" fill="none" stroke="#c9a96e" strokeWidth="2" />
                <circle cx="30" cy="24" r="7" fill="none" stroke="#c9a96e" strokeWidth="2" />
                <circle cx="18" cy="24" r="2" fill="#c9a96e" opacity="0.6" />
                <circle cx="30" cy="24" r="2" fill="#c9a96e" opacity="0.6" />
              </svg>
            </div>
          </div>
        </button>

        <p
          className={`mt-8 font-serif text-sm text-warm-gray tracking-widest uppercase transition-opacity duration-500 ${
            phase === 'closed' ? 'opacity-100 animate-pulse-soft' : 'opacity-0'
          }`}
        >
          Tippen zum Öffnen
        </p>
      </div>
    </div>
  )
}
