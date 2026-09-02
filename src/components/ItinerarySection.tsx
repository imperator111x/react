import type { ItineraryItem } from '../types/wedding'
import { ItineraryIcon } from '../lib/itinerary-icons'
import { formatItineraryTime } from '../lib/itinerary'

interface ItinerarySectionProps {
  items: ItineraryItem[]
}

export default function ItinerarySection({ items }: ItinerarySectionProps) {
  if (items.length === 0) return null

  return (
    <section className="py-20 sm:py-24 bg-white relative overflow-hidden">
      <div className="absolute top-4 left-2 w-28 h-28 opacity-[0.1] pointer-events-none text-sage">
        <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden>
          <ellipse cx="30" cy="70" rx="28" ry="12" fill="currentColor" transform="rotate(-30 30 70)" />
          <ellipse cx="55" cy="45" rx="24" ry="10" fill="currentColor" transform="rotate(15 55 45)" />
          <ellipse cx="75" cy="25" rx="20" ry="8" fill="currentColor" transform="rotate(40 75 25)" />
        </svg>
      </div>
      <div className="absolute bottom-4 right-2 w-32 h-32 opacity-[0.1] pointer-events-none text-sage rotate-180">
        <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden>
          <ellipse cx="30" cy="70" rx="28" ry="12" fill="currentColor" transform="rotate(-30 30 70)" />
          <ellipse cx="55" cy="45" rx="24" ry="10" fill="currentColor" transform="rotate(15 55 45)" />
          <ellipse cx="75" cy="25" rx="20" ry="8" fill="currentColor" transform="rotate(40 75 25)" />
        </svg>
      </div>

      <div className="max-w-sm mx-auto px-6 relative">
        <div className="invitation-ornament mb-12">
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-charcoal">Ablauf</h2>
        </div>

        <ul className="relative">
          <div
            className="absolute left-[1.625rem] top-3 bottom-3 w-px bg-cream-dark"
            aria-hidden
          />

          {items.map((item) => (
            <li key={item.id} className="relative flex gap-4 pb-10 last:pb-0">
              <div className="relative z-10 shrink-0 w-[3.25rem] flex justify-center">
                <div className="w-12 h-12 rounded-full bg-cream border border-cream-dark flex items-center justify-center text-sage">
                  <ItineraryIcon name={item.icon} className="w-5 h-5" />
                </div>
              </div>

              <div className="relative flex-1 pt-1.5 pl-4 border-l border-transparent">
                <div
                  className="absolute -left-[0.3125rem] top-2.5 w-2.5 h-2.5 rounded-full bg-sage ring-2 ring-white"
                  aria-hidden
                />
                <p className="font-serif text-xl sm:text-2xl font-semibold text-charcoal leading-tight mb-1.5">
                  {formatItineraryTime(item.time_label)}
                </p>
                <p className="text-[0.7rem] sm:text-xs tracking-[0.22em] uppercase text-warm-gray font-medium leading-relaxed">
                  {item.title}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
