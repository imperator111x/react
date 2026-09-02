import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { format } from 'date-fns'
import {
  Calendar,
  MapPin,
  Heart,
  Shirt,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react'
import Countdown from '../components/Countdown'
import EnvelopeIntro from '../components/EnvelopeIntro'
import InvitationHero from '../components/InvitationHero'
import GallerySection from '../components/GallerySection'
import ItinerarySection from '../components/ItinerarySection'
import FaqSection from '../components/FaqSection'
import GuestbookSection from '../components/GuestbookSection'
import TravelInfoSection from '../components/TravelInfoSection'
import SeatingAssignmentSection from '../components/SeatingAssignmentSection'
import WeddingThemeWrapper from '../components/WeddingThemeWrapper'
import LanguageSwitcher from '../components/LanguageSwitcher'
import LocationMapsLinks from '../components/LocationMapsLinks'
import CalendarExportButtons from '../components/CalendarExportButtons'
import Button from '../components/Button'
import Input from '../components/Input'
import Textarea from '../components/Textarea'
import { LocaleProvider, useLocale } from '../context/LocaleContext'
import { getDateFnsLocale } from '../i18n'
import {
  formatEventDate,
  formatEventTime,
  getCeremonyDate,
  getCountdownDate,
} from '../lib/wedding-dates'
import { getPersonalGreeting, getRsvpPersonLimit, getRsvpPersonOptions } from '../lib/guests'
import { getGuestbookEntries } from '../lib/guestbook'
import { getSeatingTables } from '../lib/seating'
import { getGuestByInviteToken, getRsvpById, getWeddingBySlug, submitRsvp } from '../lib/supabase'
import { getGalleryImages } from '../lib/gallery'
import { getItineraryItems } from '../lib/itinerary'
import { getFaqItems } from '../lib/faq'
import { DEMO_WEDDING } from '../lib/demo'
import { DEMO_GUEST } from '../lib/demo-guest'
import { DEMO_ITINERARY } from '../lib/demo-itinerary'
import { DEMO_FAQ } from '../lib/demo-faq'
import { DEMO_GUESTBOOK } from '../lib/demo-guestbook'
import { DEMO_TABLES } from '../lib/demo-seating'
import type {
  FaqItem,
  GalleryImage,
  Guest,
  GuestbookEntry,
  ItineraryItem,
  SeatingTable,
  Wedding,
  RsvpStatus,
  Rsvp,
} from '../types/wedding'

export default function InvitationPage() {
  const { slug } = useParams<{ slug: string }>()
  return (
    <LocaleProvider slug={slug ?? 'demo'}>
      <InvitationPageContent />
    </LocaleProvider>
  )
}

function InvitationPageContent() {
  const { slug, guestToken } = useParams<{ slug: string; guestToken?: string }>()
  const { locale, t } = useLocale()
  const [wedding, setWedding] = useState<Wedding | null>(null)
  const [invitedGuest, setInvitedGuest] = useState<Guest | null>(null)
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
  const [itineraryItems, setItineraryItems] = useState<ItineraryItem[]>([])
  const [faqItems, setFaqItems] = useState<FaqItem[]>([])
  const [guestbookEntries, setGuestbookEntries] = useState<GuestbookEntry[]>([])
  const [seatingTables, setSeatingTables] = useState<SeatingTable[]>([])
  const [loading, setLoading] = useState(true)
  const [rsvpStatus, setRsvpStatus] = useState<RsvpStatus | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [editingRsvp, setEditingRsvp] = useState(false)
  const [existingRsvp, setExistingRsvp] = useState<Rsvp | null>(null)
  const [error, setError] = useState('')

  const [guestName, setGuestName] = useState('')
  const [email, setEmail] = useState('')
  const [guestCount, setGuestCount] = useState(1)
  const [dietaryNotes, setDietaryNotes] = useState('')
  const [message, setMessage] = useState('')
  const envelopeKey = `envelope-${slug}-${guestToken ?? 'general'}`
  const [showContent, setShowContent] = useState(() => {
    try {
      return sessionStorage.getItem(`envelope-${slug}-${guestToken ?? 'general'}`) === 'true'
    } catch {
      return false
    }
  })
  const handleEnvelopeComplete = useCallback(() => setShowContent(true), [])

  const isDemo = slug === 'demo'
  const isPersonalLink = Boolean(guestToken) || isDemo
  const rsvpPersonOptions = getRsvpPersonOptions(invitedGuest)

  const reloadGuestbook = useCallback(async (weddingId: string) => {
    const entries = await getGuestbookEntries(weddingId, true)
    setGuestbookEntries(entries)
  }, [])

  useEffect(() => {
    async function load() {
      if (isDemo) {
        setWedding(DEMO_WEDDING)
        setGalleryImages([])
        setItineraryItems(DEMO_ITINERARY)
        setFaqItems(DEMO_FAQ)
        setGuestbookEntries(DEMO_GUESTBOOK)
        setSeatingTables(DEMO_TABLES)
        setInvitedGuest(DEMO_GUEST)
        setGuestName(DEMO_GUEST.name)
        setGuestCount(DEMO_GUEST.guest_count)
        setLoading(false)
        return
      }

      const data = await getWeddingBySlug(slug!)
      setWedding(data)

      if (data) {
        const [gallery, itinerary, faq, guestbook, tables] = await Promise.all([
          getGalleryImages(data.id),
          getItineraryItems(data.id),
          getFaqItems(data.id),
          getGuestbookEntries(data.id, true),
          getSeatingTables(data.id),
        ])
        setGalleryImages(gallery)
        setItineraryItems(itinerary)
        setFaqItems(faq)
        setGuestbookEntries(guestbook)
        setSeatingTables(tables)
      }

      if (data && guestToken) {
        const guest = await getGuestByInviteToken(data.id, guestToken)
        if (guest) {
          setInvitedGuest(guest)
          setGuestName(guest.name)
          setGuestCount(guest.guest_count)

          if (guest.rsvp_id) {
            const rsvp = await getRsvpById(guest.rsvp_id)
            if (rsvp) {
              setExistingRsvp(rsvp)
              setRsvpStatus(rsvp.status)
              setEmail(rsvp.email ?? '')
              setGuestCount(rsvp.guest_count)
              setDietaryNotes(rsvp.dietary_notes ?? '')
              setMessage(rsvp.message ?? '')
              setSubmitted(true)
            }
          }
        }
      }

      setLoading(false)
    }
    load()
  }, [slug, guestToken, isDemo])

  const handleRsvp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!wedding || !rsvpStatus) return

    if (!guestName.trim()) {
      setError(t('rsvp.nameRequired'))
      return
    }

    if (rsvpStatus === 'accepted') {
      const maxPersons = getRsvpPersonLimit(invitedGuest)
      if (guestCount > maxPersons) {
        setError(
          t('rsvp.maxPersons', {
            count: maxPersons,
            persons: maxPersons === 1 ? t('common.person') : t('common.persons'),
          })
        )
        return
      }
    }

    if (isDemo) {
      setSubmitted(true)
      return
    }

    setSubmitting(true)
    setError('')
    try {
      const rsvp = await submitRsvp(wedding.id, {
        guest_name: guestName,
        email: email || undefined,
        status: rsvpStatus,
        guest_count: guestCount,
        dietary_notes: dietaryNotes || undefined,
        message: message || undefined,
        guest_id: invitedGuest?.id,
      })
      setExistingRsvp(rsvp)
      setSubmitted(true)
      setEditingRsvp(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('rsvp.submitError'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    )
  }

  if (!wedding) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <Heart className="w-12 h-12 text-gold/30 mb-4" />
        <h1 className="font-serif text-3xl font-semibold text-charcoal mb-2">{t('common.notFound')}</h1>
        <p className="text-warm-gray">{t('common.notFoundDesc')}</p>
      </div>
    )
  }

  if (guestToken && !invitedGuest && !isDemo) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <Heart className="w-12 h-12 text-gold/30 mb-4" />
        <h1 className="font-serif text-3xl font-semibold text-charcoal mb-2">
          Einladung nicht gefunden
        </h1>
        <p className="text-warm-gray">{t('common.invalidLink')}</p>
      </div>
    )
  }

  const weddingDate = getCeremonyDate(wedding) ?? new Date(wedding.wedding_date)
  const ceremonyDateIso = wedding.ceremony_date ?? wedding.wedding_date
  const receptionDateIso = wedding.reception_date
  const personalGreeting = invitedGuest
    ? getPersonalGreeting(invitedGuest.name, invitedGuest.salutation, locale)
    : null
  const rsvpDeadline = format(
    new Date(weddingDate.getTime() - 30 * 24 * 60 * 60 * 1000),
    locale === 'en' ? 'MMMM d, yyyy' : 'd. MMMM yyyy',
    { locale: getDateFnsLocale(locale) }
  )

  return (
    <>
      <EnvelopeIntro
        partner1={wedding.partner1_name}
        partner2={wedding.partner2_name}
        personalGreeting={personalGreeting}
        storageKey={envelopeKey}
        onComplete={handleEnvelopeComplete}
      />

      <WeddingThemeWrapper themeId={wedding.theme_id} className="min-h-screen">
      <LanguageSwitcher />
      <div
        className={`min-h-screen transition-all duration-1000 ${
          showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <InvitationHero
          wedding={wedding}
          personalGreeting={personalGreeting}
          invitedGuest={invitedGuest}
        />

        <section id="countdown" className="py-20 bg-white relative scroll-mt-4">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
          <div className="max-w-3xl mx-auto px-4 text-center">
            <div className="invitation-ornament mb-8">
              <h2 className="font-serif text-2xl text-warm-gray">{t('countdown.title')}</h2>
            </div>
            <Countdown targetDate={getCountdownDate(wedding)} />
          </div>
        </section>

        {wedding.story && (
          <section className="py-20 relative">
            <div className="max-w-2xl mx-auto px-4 text-center">
              <Heart className="w-7 h-7 text-gold mx-auto mb-5" />
              <div className="invitation-ornament mb-8">
                <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-charcoal">
                  {t('story.title')}
                </h2>
              </div>
              <p className="text-warm-gray leading-relaxed text-lg font-light">{wedding.story}</p>
            </div>
          </section>
        )}

        <GallerySection images={galleryImages} />

        <ItinerarySection items={itineraryItems} />

        <section className="py-20 bg-white">
          <div className="max-w-2xl mx-auto px-4 space-y-6">
            <div className="invitation-ornament mb-10">
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-charcoal">{t('details.title')}</h2>
            </div>

            {(wedding.ceremony_date ?? wedding.wedding_date ?? wedding.reception_date) && (
              <div className="mb-8">
                <h3 className="font-serif text-xl font-semibold text-charcoal mb-4 text-center">
                  {t('details.calendarCreate')}
                </h3>
                <CalendarExportButtons wedding={wedding} className="justify-center" />
              </div>
            )}

            {(wedding.ceremony_location || ceremonyDateIso) && (
              <div className="flex gap-5 p-7 rounded-2xl bg-cream border border-cream-dark/80 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-semibold text-charcoal mb-1">{t('hero.ceremony')}</h3>
                  {ceremonyDateIso && (
                    <p className="text-charcoal font-medium">{formatEventDate(ceremonyDateIso, locale)}</p>
                  )}
                  {ceremonyDateIso && (
                    <p className="text-gold text-sm mt-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {formatEventTime(ceremonyDateIso, locale)}
                    </p>
                  )}
                  {wedding.ceremony_location && (
                    <p className={`text-charcoal ${ceremonyDateIso ? 'mt-3' : ''}`}>
                      {wedding.ceremony_location}
                    </p>
                  )}
                  {wedding.ceremony_address && (
                    <p className="text-warm-gray text-sm mt-2 flex items-start gap-1.5">
                      <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-gold/70" />
                      {wedding.ceremony_address}
                    </p>
                  )}
                  <LocationMapsLinks
                    address={wedding.ceremony_address}
                    location={wedding.ceremony_location}
                  />
                </div>
              </div>
            )}

            {(wedding.reception_location || receptionDateIso) && (
              <div className="flex gap-5 p-7 rounded-2xl bg-cream border border-cream-dark/80 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                  <Heart className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-semibold text-charcoal mb-1">{t('hero.reception')}</h3>
                  {receptionDateIso && (
                    <p className="text-charcoal font-medium">{formatEventDate(receptionDateIso, locale)}</p>
                  )}
                  {receptionDateIso && (
                    <p className="text-gold text-sm mt-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {formatEventTime(receptionDateIso, locale)}
                    </p>
                  )}
                  {wedding.reception_location && (
                    <p className={`text-charcoal ${receptionDateIso ? 'mt-3' : ''}`}>
                      {wedding.reception_location}
                    </p>
                  )}
                  {wedding.reception_address && (
                    <p className="text-warm-gray text-sm mt-2 flex items-start gap-1.5">
                      <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-gold/70" />
                      {wedding.reception_address}
                    </p>
                  )}
                  <LocationMapsLinks
                    address={wedding.reception_address}
                    location={wedding.reception_location}
                  />
                </div>
              </div>
            )}

            {wedding.dress_code && (
              <div className="flex gap-5 p-7 rounded-2xl bg-cream border border-cream-dark/80 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                  <Shirt className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-semibold text-charcoal mb-1">{t('details.dresscode')}</h3>
                  <p className="text-warm-gray">{wedding.dress_code}</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {wedding.travel_info && <TravelInfoSection travelInfo={wedding.travel_info} />}

      <section className="py-20 sm:py-28 relative" id="rsvp">
        <div className="absolute inset-0 bg-gradient-to-b from-cream via-blush/20 to-cream" />
        <div className="relative max-w-lg mx-auto px-4">
          <div className="text-center mb-10">
            <div className="invitation-ornament mb-6">
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-charcoal">
                {personalGreeting
                  ? invitedGuest?.salutation === 'familie'
                    ? t('rsvp.titlePersonalPlural', { greeting: personalGreeting })
                    : t('rsvp.titlePersonalSingular', { greeting: personalGreeting })
                  : t('rsvp.titlePlural')}
              </h2>
            </div>
            <p className="text-warm-gray">{t('rsvp.deadline', { date: rsvpDeadline })}</p>
          </div>

          {submitted && !editingRsvp ? (
            <div className="text-center p-8 bg-white rounded-2xl border border-cream-dark space-y-4">
              <CheckCircle className="w-12 h-12 text-sage mx-auto mb-4" />
              <h3 className="font-serif text-2xl font-semibold text-charcoal mb-2">
                {t('rsvp.thankYou', {
                  greeting: personalGreeting ? t('rsvp.thankYouGreeting', { greeting: personalGreeting }) : '',
                })}
              </h3>
              <p className="text-warm-gray">
                {(existingRsvp?.status ?? rsvpStatus) === 'accepted'
                  ? t('rsvp.accepted')
                  : t('rsvp.declined')}
              </p>
              {isPersonalLink && invitedGuest && !isDemo && (
                <Button variant="outline" onClick={() => setEditingRsvp(true)}>
                  {t('rsvp.change')}
                </Button>
              )}
            </div>
          ) : (
            <form
              onSubmit={handleRsvp}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-cream-dark shadow-lg space-y-6"
            >
              {existingRsvp && editingRsvp && (
                <p className="text-sm text-warm-gray text-center">{t('rsvp.editHint')}</p>
              )}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRsvpStatus('accepted')}
                  className={`flex items-center justify-center gap-2 py-4 rounded-xl border-2 transition-all ${
                    rsvpStatus === 'accepted'
                      ? 'border-sage bg-sage/10 text-sage'
                      : 'border-cream-dark text-warm-gray hover:border-sage/50'
                  }`}
                >
                  <CheckCircle className="w-5 h-5" />
                  {t('rsvp.accept')}
                </button>
                <button
                  type="button"
                  onClick={() => setRsvpStatus('declined')}
                  className={`flex items-center justify-center gap-2 py-4 rounded-xl border-2 transition-all ${
                    rsvpStatus === 'declined'
                      ? 'border-red-400 bg-red-50 text-red-600'
                      : 'border-cream-dark text-warm-gray hover:border-red-200'
                  }`}
                >
                  <XCircle className="w-5 h-5" />
                  {t('rsvp.decline')}
                </button>
              </div>

              {rsvpStatus && (
                <>
                  <Input
                    label={t('rsvp.name')}
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder={t('rsvp.namePlaceholder')}
                    required
                    readOnly={isPersonalLink && Boolean(invitedGuest)}
                    className={isPersonalLink && invitedGuest ? 'bg-cream cursor-default' : ''}
                  />

                  <Input
                    label={t('rsvp.email')}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('rsvp.emailPlaceholder')}
                  />

                  {rsvpStatus === 'accepted' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-charcoal mb-1.5">
                          {t('rsvp.guestCount')}
                        </label>
                        <select
                          value={guestCount}
                          onChange={(e) => setGuestCount(Number(e.target.value))}
                          className="w-full px-4 py-3 rounded-xl border border-cream-dark bg-white focus:outline-none focus:ring-2 focus:ring-gold/40"
                        >
                          {rsvpPersonOptions.map((n) => (
                            <option key={n} value={n}>
                              {n} {n === 1 ? t('common.person') : t('common.persons')}
                            </option>
                          ))}
                        </select>
                        {invitedGuest && rsvpPersonOptions.length < 5 && (
                          <p className="text-xs text-warm-gray mt-1.5">
                            {t('rsvp.maxPersons', {
                              count: rsvpPersonOptions.length,
                              persons:
                                rsvpPersonOptions.length === 1
                                  ? t('common.person')
                                  : t('common.persons'),
                            })}
                          </p>
                        )}
                      </div>

                      <Input
                        label={t('rsvp.dietary')}
                        value={dietaryNotes}
                        onChange={(e) => setDietaryNotes(e.target.value)}
                        placeholder={t('rsvp.dietaryPlaceholder')}
                      />
                    </>
                  )}

                  <Textarea
                    label={t('rsvp.message')}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t('rsvp.messagePlaceholder')}
                  />

                  {error && (
                    <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>
                  )}

                  <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {t('rsvp.sending')}
                      </>
                    ) : existingRsvp && editingRsvp ? (
                      t('rsvp.update')
                    ) : (
                      t('rsvp.submit')
                    )}
                  </Button>

                  {existingRsvp && editingRsvp && (
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={() => {
                        setEditingRsvp(false)
                        setSubmitted(true)
                        setRsvpStatus(existingRsvp.status)
                        setEmail(existingRsvp.email ?? '')
                        setGuestCount(existingRsvp.guest_count)
                        setDietaryNotes(existingRsvp.dietary_notes ?? '')
                        setMessage(existingRsvp.message ?? '')
                      }}
                    >
                      {t('common.cancel')}
                    </Button>
                  )}
                </>
              )}
            </form>
          )}
        </div>
      </section>

      <SeatingAssignmentSection
        slug={slug!}
        guestToken={guestToken}
        tables={seatingTables}
        guest={invitedGuest}
      />

      <GuestbookSection
        weddingId={wedding.id}
        entries={guestbookEntries}
        invitedGuest={invitedGuest}
        isDemo={isDemo}
        onEntryAdded={() => !isDemo && reloadGuestbook(wedding.id)}
      />

      <FaqSection items={faqItems} />

      <footer className="py-10 text-center text-sm text-warm-gray border-t border-cream-dark bg-cream">
        <p className="font-serif text-xl text-charcoal mb-1">
          {wedding.partner1_name} <span className="text-gold italic">&</span> {wedding.partner2_name}
        </p>
        <p className="text-xs mt-2 opacity-60">{t('common.createdWith')}</p>
      </footer>
      </div>
      </WeddingThemeWrapper>
    </>
  )
}
