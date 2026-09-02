import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { ChevronDown, MapPin } from 'lucide-react'
import type { Guest, Wedding } from '../types/wedding'

interface InvitationHeroProps {
  wedding: Wedding
  personalGreeting?: string | null
  invitedGuest?: Guest | null
}

function BotanicalCorner({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      className={className}
      aria-hidden
      fill="none"
    >
      <path
        d="M8 62 C18 48 28 38 42 34 C32 28 22 18 14 8"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <ellipse cx="46" cy="30" rx="10" ry="4" fill="currentColor" opacity="0.35" transform="rotate(-25 46 30)" />
      <ellipse cx="34" cy="42" rx="8" ry="3.5" fill="currentColor" opacity="0.25" transform="rotate(10 34 42)" />
      <ellipse cx="22" cy="24" rx="7" ry="3" fill="currentColor" opacity="0.2" transform="rotate(-40 22 24)" />
    </svg>
  )
}

export default function InvitationHero({
  wedding,
  personalGreeting,
  invitedGuest,
}: InvitationHeroProps) {
  const weddingDate = new Date(wedding.wedding_date)

  return (
    <section className="invitation-hero relative min-h-[88vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-blush/40 via-cream to-cream" />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, var(--color-gold) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
        aria-hidden
      />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
      <div className="absolute top-16 left-[10%] w-64 h-64 bg-gold/10 rounded-full blur-3xl animate-pulse-soft" />
      <div className="absolute bottom-20 right-[8%] w-80 h-80 bg-blush/40 rounded-full blur-3xl" />
      <div className="absolute top-1/3 right-[15%] w-40 h-40 bg-sage/10 rounded-full blur-2xl" />

      <BotanicalCorner className="absolute top-8 left-6 w-16 h-16 sm:w-20 sm:h-20 text-sage/30" />
      <BotanicalCorner className="absolute top-8 right-6 w-16 h-16 sm:w-20 sm:h-20 text-sage/30 scale-x-[-1]" />
      <BotanicalCorner className="absolute bottom-24 left-8 w-14 h-14 sm:w-18 sm:h-18 text-sage/20 rotate-180" />
      <BotanicalCorner className="absolute bottom-24 right-8 w-14 h-14 sm:w-18 sm:h-18 text-sage/20 scale-x-[-1] rotate-180" />

      <div className="relative text-center px-4 py-20 sm:py-24 max-w-3xl mx-auto w-full">
        {personalGreeting && (
          <div className="mb-8 animate-fade-in">
            <p className="font-serif text-2xl sm:text-3xl text-charcoal mb-4">
              {personalGreeting},
            </p>
            <p className="text-charcoal text-base sm:text-lg max-w-lg mx-auto leading-relaxed font-light px-2">
              {invitedGuest?.salutation === 'familie'
                ? 'wir laden euch herzlich zu unserer Hochzeit ein und würden uns sehr freuen, wenn ihr dabei seid!'
                : 'wir laden dich herzlich zu unserer Hochzeit ein und würden uns sehr freuen, wenn du dabei bist!'}
            </p>
          </div>
        )}

        <div className="invitation-ornament mb-8">
          <p className="text-gold uppercase tracking-[0.4em] text-[0.65rem] sm:text-xs font-medium">
            Save the Date
          </p>
        </div>

        <div className="invitation-hero__card mx-auto max-w-2xl px-8 sm:px-12 py-10 sm:py-14">
          <div className="invitation-hero__corner invitation-hero__corner--tl" aria-hidden />
          <div className="invitation-hero__corner invitation-hero__corner--tr" aria-hidden />
          <div className="invitation-hero__corner invitation-hero__corner--bl" aria-hidden />
          <div className="invitation-hero__corner invitation-hero__corner--br" aria-hidden />

          <p className="text-gold/80 uppercase tracking-[0.35em] text-[0.6rem] sm:text-xs mb-6">
            Wir heiraten
          </p>

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-semibold text-charcoal leading-tight">
            {wedding.partner1_name}
            <span className="block text-2xl sm:text-4xl lg:text-5xl text-gold italic my-3 sm:my-4 font-normal">
              &
            </span>
            {wedding.partner2_name}
          </h1>

          <div className="mt-8 sm:mt-10 pt-8 border-t border-gold/15">
            <p className="font-serif text-xl sm:text-2xl text-charcoal mb-1">
              {format(weddingDate, 'EEEE', { locale: de })}
            </p>
            <p className="text-warm-gray text-base sm:text-lg font-light">
              {format(weddingDate, 'd. MMMM yyyy', { locale: de })}
            </p>
            <p className="inline-block mt-4 px-5 py-2 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm tracking-wide">
              {format(weddingDate, "HH:mm 'Uhr'", { locale: de })}
            </p>

            {wedding.ceremony_location && (
              <p className="mt-5 flex items-center justify-center gap-2 text-warm-gray text-sm sm:text-base">
                <MapPin className="w-4 h-4 text-gold/70 shrink-0" />
                <span>{wedding.ceremony_location}</span>
              </p>
            )}
          </div>
        </div>

        <a
          href="#countdown"
          className="mt-12 inline-flex flex-col items-center gap-2 text-warm-gray/70 hover:text-gold transition-colors group"
          aria-label="Weiter scrollen"
        >
          <span className="text-[0.65rem] uppercase tracking-[0.25em]">Mehr entdecken</span>
          <ChevronDown className="w-5 h-5 animate-bounce group-hover:text-gold" />
        </a>
      </div>
    </section>
  )
}
