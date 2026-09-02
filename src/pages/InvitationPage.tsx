import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import {
  Calendar,
  MapPin,
  Heart,
  Shirt,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react'
import Countdown from '../components/Countdown'
import EnvelopeIntro from '../components/EnvelopeIntro'
import GallerySection from '../components/GallerySection'
import ItinerarySection from '../components/ItinerarySection'
import Button from '../components/Button'
import Input from '../components/Input'
import Textarea from '../components/Textarea'
import { getPersonalGreeting } from '../lib/guests'
import { getGuestByInviteToken, getWeddingBySlug, submitRsvp } from '../lib/supabase'
import { getGalleryImages } from '../lib/gallery'
import { getItineraryItems } from '../lib/itinerary'
import { DEMO_WEDDING } from '../lib/demo'
import { DEMO_GUEST } from '../lib/demo-guest'
import { DEMO_ITINERARY } from '../lib/demo-itinerary'
import type { GalleryImage, Guest, ItineraryItem, Wedding, RsvpStatus } from '../types/wedding'

export default function InvitationPage() {
  const { slug, guestToken } = useParams<{ slug: string; guestToken?: string }>()
  const [wedding, setWedding] = useState<Wedding | null>(null)
  const [invitedGuest, setInvitedGuest] = useState<Guest | null>(null)
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
  const [itineraryItems, setItineraryItems] = useState<ItineraryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [rsvpStatus, setRsvpStatus] = useState<RsvpStatus | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
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

  const isPersonalLink = Boolean(guestToken)
  const isDemo = slug === 'demo'

  useEffect(() => {
    async function load() {
      if (isDemo) {
        setWedding(DEMO_WEDDING)
        setGalleryImages([])
        setItineraryItems(DEMO_ITINERARY)
        if (guestToken === 'demo-gast') {
          setInvitedGuest(DEMO_GUEST)
          setGuestName(DEMO_GUEST.name)
          setGuestCount(DEMO_GUEST.guest_count)
        }
        setLoading(false)
        return
      }

      const data = await getWeddingBySlug(slug!)
      setWedding(data)

      if (data) {
        const [gallery, itinerary] = await Promise.all([
          getGalleryImages(data.id),
          getItineraryItems(data.id),
        ])
        setGalleryImages(gallery)
        setItineraryItems(itinerary)
      }

      if (data && guestToken) {
        const guest = await getGuestByInviteToken(data.id, guestToken)
        if (guest) {
          setInvitedGuest(guest)
          setGuestName(guest.name)
          setGuestCount(guest.guest_count)
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
      setError('Bitte gebt euren Namen ein.')
      return
    }

    if (isDemo) {
      setSubmitted(true)
      return
    }

    setSubmitting(true)
    setError('')
    try {
      await submitRsvp(wedding.id, {
        guest_name: guestName,
        email: email || undefined,
        status: rsvpStatus,
        guest_count: guestCount,
        dietary_notes: dietaryNotes || undefined,
        message: message || undefined,
        guest_id: invitedGuest?.id,
      })
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Senden der Antwort.')
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
        <h1 className="font-serif text-3xl font-semibold text-charcoal mb-2">
          Einladung nicht gefunden
        </h1>
        <p className="text-warm-gray">Diese Hochzeitseinladung existiert leider nicht.</p>
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
        <p className="text-warm-gray">Dieser persönliche Link ist ungültig.</p>
      </div>
    )
  }

  const weddingDate = new Date(wedding.wedding_date)
  const personalGreeting = invitedGuest
    ? getPersonalGreeting(invitedGuest.name, invitedGuest.salutation)
    : null

  return (
    <>
      <EnvelopeIntro
        partner1={wedding.partner1_name}
        partner2={wedding.partner2_name}
        personalGreeting={personalGreeting}
        storageKey={envelopeKey}
        onComplete={handleEnvelopeComplete}
      />

      <div
        className={`min-h-screen transition-all duration-1000 ${
          showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blush/50 via-cream to-cream" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
          <div className="absolute top-10 left-1/4 w-72 h-72 bg-gold/10 rounded-full blur-3xl animate-pulse-soft" />
          <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-blush/30 rounded-full blur-3xl" />

          <div className="relative text-center px-4 py-24 max-w-3xl mx-auto">
            {personalGreeting && (
              <p className="font-serif text-2xl sm:text-3xl text-charcoal mb-6">{personalGreeting},</p>
            )}
            <div className="invitation-ornament mb-6">
              <p className="text-gold uppercase tracking-[0.35em] text-xs sm:text-sm">Wir heiraten</p>
            </div>
            <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-semibold text-charcoal mb-6 leading-tight">
              {wedding.partner1_name}
              <span className="block text-3xl sm:text-5xl text-gold italic my-3 font-normal">&</span>
              {wedding.partner2_name}
            </h1>
            <p className="text-warm-gray text-lg sm:text-xl font-light">
              {format(weddingDate, "EEEE, d. MMMM yyyy", { locale: de })}
            </p>
            <p className="text-gold text-base mt-2">
              {format(weddingDate, "HH:mm 'Uhr'", { locale: de })}
            </p>
            {personalGreeting && (
              <p className="text-charcoal mt-8 text-lg max-w-lg mx-auto leading-relaxed font-light">
                {invitedGuest?.salutation === 'familie'
                  ? 'wir laden euch herzlich zu unserer Hochzeit ein und würden uns sehr freuen, wenn ihr dabei seid!'
                  : 'wir laden dich herzlich zu unserer Hochzeit ein und würden uns sehr freuen, wenn du dabei bist!'}
              </p>
            )}
            <div className="mt-12 flex justify-center">
              <div className="w-px h-16 bg-gradient-to-b from-gold/60 to-transparent" />
            </div>
          </div>
        </section>

        <section className="py-20 bg-white relative">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
          <div className="max-w-3xl mx-auto px-4 text-center">
            <div className="invitation-ornament mb-8">
              <h2 className="font-serif text-2xl text-warm-gray">Noch bis zum großen Tag</h2>
            </div>
            <Countdown targetDate={wedding.wedding_date} />
          </div>
        </section>

        {wedding.story && (
          <section className="py-20 relative">
            <div className="max-w-2xl mx-auto px-4 text-center">
              <Heart className="w-7 h-7 text-gold mx-auto mb-5" />
              <div className="invitation-ornament mb-8">
                <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-charcoal">
                  Unsere Geschichte
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
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-charcoal">Details</h2>
            </div>

            {wedding.ceremony_location && (
              <div className="flex gap-5 p-7 rounded-2xl bg-cream border border-cream-dark/80 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-semibold text-charcoal mb-1">Trauung</h3>
                  <p className="text-charcoal">{wedding.ceremony_location}</p>
                  {wedding.ceremony_address && (
                    <p className="text-warm-gray text-sm mt-2 flex items-start gap-1.5">
                      <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-gold/70" />
                      {wedding.ceremony_address}
                    </p>
                  )}
                </div>
              </div>
            )}

            {wedding.reception_location && (
              <div className="flex gap-5 p-7 rounded-2xl bg-cream border border-cream-dark/80 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                  <Heart className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-semibold text-charcoal mb-1">Feier</h3>
                  <p className="text-charcoal">{wedding.reception_location}</p>
                  {wedding.reception_address && (
                    <p className="text-warm-gray text-sm mt-2 flex items-start gap-1.5">
                      <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-gold/70" />
                      {wedding.reception_address}
                    </p>
                  )}
                </div>
              </div>
            )}

            {wedding.dress_code && (
              <div className="flex gap-5 p-7 rounded-2xl bg-cream border border-cream-dark/80 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                  <Shirt className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-semibold text-charcoal mb-1">Dresscode</h3>
                  <p className="text-warm-gray">{wedding.dress_code}</p>
                </div>
              </div>
            )}
          </div>
        </section>

      <section className="py-20 sm:py-28 relative" id="rsvp">
        <div className="absolute inset-0 bg-gradient-to-b from-cream via-blush/20 to-cream" />
        <div className="relative max-w-lg mx-auto px-4">
          <div className="text-center mb-10">
            <div className="invitation-ornament mb-6">
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-charcoal">
                {personalGreeting
                  ? invitedGuest?.salutation === 'familie'
                    ? `${personalGreeting}, seid ihr dabei?`
                    : `${personalGreeting}, bist du dabei?`
                  : 'Seid ihr dabei?'}
              </h2>
            </div>
            <p className="text-warm-gray">
              Bitte gebt uns bis zum{' '}
              {format(new Date(weddingDate.getTime() - 30 * 24 * 60 * 60 * 1000), 'd. MMMM yyyy', {
                locale: de,
              })}{' '}
              Bescheid.
            </p>
          </div>

          {submitted ? (
            <div className="text-center p-8 bg-white rounded-2xl border border-cream-dark">
              <CheckCircle className="w-12 h-12 text-sage mx-auto mb-4" />
              <h3 className="font-serif text-2xl font-semibold text-charcoal mb-2">
                Vielen Dank{personalGreeting ? `, ${personalGreeting}` : ''}!
              </h3>
              <p className="text-warm-gray">
                {rsvpStatus === 'accepted'
                  ? 'Wir freuen uns riesig auf euch!'
                  : 'Schade, dass ihr nicht kommen könnt. Wir werden an euch denken!'}
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleRsvp}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-cream-dark shadow-lg space-y-6"
            >
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
                  Zusagen
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
                  Absagen
                </button>
              </div>

              {rsvpStatus && (
                <>
                  <Input
                    label="Euer Name *"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Vor- und Nachname"
                    required
                    readOnly={isPersonalLink && Boolean(invitedGuest)}
                    className={isPersonalLink && invitedGuest ? 'bg-cream cursor-default' : ''}
                  />

                  <Input
                    label="E-Mail (optional)"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@beispiel.de"
                  />

                  {rsvpStatus === 'accepted' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-charcoal mb-1.5">
                          Anzahl Personen
                        </label>
                        <select
                          value={guestCount}
                          onChange={(e) => setGuestCount(Number(e.target.value))}
                          className="w-full px-4 py-3 rounded-xl border border-cream-dark bg-white focus:outline-none focus:ring-2 focus:ring-gold/40"
                        >
                          {[1, 2, 3, 4, 5].map((n) => (
                            <option key={n} value={n}>
                              {n} {n === 1 ? 'Person' : 'Personen'}
                            </option>
                          ))}
                        </select>
                      </div>

                      <Input
                        label="Allergien / Ernährung (optional)"
                        value={dietaryNotes}
                        onChange={(e) => setDietaryNotes(e.target.value)}
                        placeholder="z.B. vegetarisch, glutenfrei"
                      />
                    </>
                  )}

                  <Textarea
                    label="Nachricht an das Brautpaar (optional)"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Wir freuen uns auf euch!"
                  />

                  {error && (
                    <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>
                  )}

                  <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Wird gesendet...
                      </>
                    ) : (
                      'Antwort senden'
                    )}
                  </Button>
                </>
              )}
            </form>
          )}
        </div>
      </section>

      <footer className="py-10 text-center text-sm text-warm-gray border-t border-cream-dark bg-white">
        <p className="font-serif text-xl text-charcoal mb-1">
          {wedding.partner1_name} <span className="text-gold italic">&</span> {wedding.partner2_name}
        </p>
        <p className="text-xs mt-2 opacity-60">Mit Liebe erstellt mit UnsereHochzeit</p>
      </footer>
      </div>
    </>
  )
}
