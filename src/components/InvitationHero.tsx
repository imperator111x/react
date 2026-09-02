import { ChevronDown, MapPin } from 'lucide-react'
import {
  formatEventDate,
  formatEventTime,
} from '../lib/wedding-dates'
import { useLocale } from '../context/LocaleContext'
import { getInvitationText } from '../lib/invitation-text'
import LocationMapsLinks from './LocationMapsLinks'
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

function HeroEventBlock({
  label,
  dateIso,
  location,
  address,
  locale,
}: {
  label: string
  dateIso: string
  location?: string | null
  address?: string | null
  locale: 'de' | 'en'
}) {
  return (
    <div className="text-center">
      <p className="text-gold/70 uppercase tracking-[0.28em] text-[0.6rem] sm:text-xs mb-3">
        {label}
      </p>
      <p className="font-serif text-lg sm:text-xl text-charcoal mb-0.5">
        {formatEventDate(dateIso, locale)}
      </p>
      <p className="inline-block mt-3 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm tracking-wide">
        {formatEventTime(dateIso, locale)}
      </p>
      {location && (
        <p className="mt-4 flex items-center justify-center gap-2 text-warm-gray text-sm sm:text-base">
          <MapPin className="w-4 h-4 text-gold/70 shrink-0" />
          <span>{location}</span>
        </p>
      )}
      {address && !location && (
        <p className="mt-4 text-warm-gray text-sm">{address}</p>
      )}
      {address && location && (
        <p className="mt-1 text-warm-gray text-xs sm:text-sm">{address}</p>
      )}
      <LocationMapsLinks
        address={address}
        location={location}
        className="mt-4 flex flex-wrap justify-center gap-2"
      />
    </div>
  )
}

export default function InvitationHero({
  wedding,
  personalGreeting,
  invitedGuest,
}: InvitationHeroProps) {
  const { locale, t } = useLocale()
  const ceremonyIso = wedding.ceremony_date ?? wedding.wedding_date
  const receptionIso = wedding.reception_date

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
              {getInvitationText(wedding.invitation_text, invitedGuest?.salutation, locale)}
            </p>
          </div>
        )}

        {wedding.cover_image_url && (
          <div className="mb-10 mx-auto max-w-3xl w-full">
            <div className="rounded-2xl overflow-hidden shadow-xl ring-1 ring-gold/25 aspect-[16/10] sm:aspect-[2/1]">
              <img
                src={wedding.cover_image_url}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        <div className="invitation-ornament mb-8">
          <p className="text-gold uppercase tracking-[0.4em] text-[0.65rem] sm:text-xs font-medium">
            {t('hero.saveTheDate')}
          </p>
        </div>

        <div className="invitation-hero__card mx-auto max-w-2xl px-8 sm:px-12 py-10 sm:py-14">
          <div className="invitation-hero__corner invitation-hero__corner--tl" aria-hidden />
          <div className="invitation-hero__corner invitation-hero__corner--tr" aria-hidden />
          <div className="invitation-hero__corner invitation-hero__corner--bl" aria-hidden />
          <div className="invitation-hero__corner invitation-hero__corner--br" aria-hidden />

          <p className="text-gold/80 uppercase tracking-[0.35em] text-[0.6rem] sm:text-xs mb-6">
            {t('hero.weMarry')}
          </p>

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-semibold text-charcoal leading-tight">
            {wedding.partner1_name}
            <span className="block text-2xl sm:text-4xl lg:text-5xl text-gold italic my-3 sm:my-4 font-normal">
              &
            </span>
            {wedding.partner2_name}
          </h1>

          <div className="mt-8 sm:mt-10 pt-8 border-t border-gold/15 space-y-8">
            {ceremonyIso && (
              <HeroEventBlock
                label={t('hero.ceremony')}
                dateIso={ceremonyIso}
                location={wedding.ceremony_location}
                address={wedding.ceremony_address}
                locale={locale}
              />
            )}

            {receptionIso && (
              <>
                {ceremonyIso && <div className="h-px bg-gold/10 max-w-xs mx-auto" />}
                <HeroEventBlock
                  label={t('hero.reception')}
                  dateIso={receptionIso}
                  location={wedding.reception_location}
                  address={wedding.reception_address}
                  locale={locale}
                />
              </>
            )}
          </div>
        </div>

        <a
          href="#countdown"
          className="mt-12 inline-flex flex-col items-center gap-2 text-warm-gray/70 hover:text-gold transition-colors group"
          aria-label="Weiter scrollen"
        >
          <span className="text-[0.65rem] uppercase tracking-[0.25em]">{t('common.scrollMore')}</span>
          <ChevronDown className="w-5 h-5 animate-bounce group-hover:text-gold" />
        </a>
      </div>
    </section>
  )
}
