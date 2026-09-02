import { useEffect, useState } from 'react'
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
import Button from '../components/Button'
import Input from '../components/Input'
import Textarea from '../components/Textarea'
import { getPersonalGreeting } from '../lib/guests'
import { getGuestByInviteToken, getWeddingBySlug, submitRsvp } from '../lib/supabase'
import { DEMO_WEDDING } from '../lib/demo'
import { DEMO_GUEST } from '../lib/demo-guest'
import type { Guest, Wedding, RsvpStatus } from '../types/wedding'

export default function InvitationPage() {
  const { slug, guestToken } = useParams<{ slug: string; guestToken?: string }>()
  const [wedding, setWedding] = useState<Wedding | null>(null)
  const [invitedGuest, setInvitedGuest] = useState<Guest | null>(null)
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

  const isPersonalLink = Boolean(guestToken)
  const isDemo = slug === 'demo'

  useEffect(() => {
    async function load() {
      if (isDemo) {
        setWedding(DEMO_WEDDING)
        if (guestToken === 'demo-gast') {
          setInvitedGuest(DEMO_GUEST)
          setGuestName(DEMO_GUEST.name)
          setEmail(DEMO_GUEST.email ?? '')
          setGuestCount(DEMO_GUEST.guest_count)
        }
        setLoading(false)
        return
      }

      const data = await getWeddingBySlug(slug!)
      setWedding(data)

      if (data && guestToken) {
        const guest = await getGuestByInviteToken(data.id, guestToken)
        if (guest) {
          setInvitedGuest(guest)
          setGuestName(guest.name)
          setEmail(guest.email ?? '')
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
  const personalGreeting = invitedGuest ? getPersonalGreeting(invitedGuest.name) : null

  return (
    <div className="min-h-screen">
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blush/40 via-cream to-cream" />
        <div className="absolute top-10 left-1/4 w-64 h-64 bg-gold/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-sage/10 rounded-full blur-3xl" />

        <div className="relative text-center px-4 py-20 max-w-3xl mx-auto">
          {personalGreeting && (
            <p className="text-warm-gray text-lg mb-4">{personalGreeting},</p>
          )}
          <p className="text-gold uppercase tracking-[0.3em] text-sm mb-6">Wir heiraten</p>
          <h1 className="font-serif text-5xl sm:text-7xl font-semibold text-charcoal mb-4">
            {wedding.partner1_name}
            <span className="block text-3xl sm:text-4xl text-gold italic my-2">&</span>
            {wedding.partner2_name}
          </h1>
          <p className="text-warm-gray text-lg sm:text-xl">
            {format(weddingDate, "EEEE, d. MMMM yyyy 'um' HH:mm 'Uhr'", { locale: de })}
          </p>
          {personalGreeting && (
            <p className="text-charcoal mt-6 text-lg max-w-xl mx-auto leading-relaxed">
              wir laden dich herzlich zu unserer Hochzeit ein und würden uns sehr freuen, wenn du dabei bist!
            </p>
          )}
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-serif text-2xl text-warm-gray mb-8">Noch bis zum großen Tag</h2>
          <Countdown targetDate={wedding.wedding_date} />
        </div>
      </section>

      {wedding.story && (
        <section className="py-16">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <Heart className="w-6 h-6 text-gold mx-auto mb-4" />
            <h2 className="font-serif text-3xl font-semibold text-charcoal mb-6">Unsere Geschichte</h2>
            <p className="text-warm-gray leading-relaxed text-lg">{wedding.story}</p>
          </div>
        </section>
      )}

      <section className="py-16 bg-white">
        <div className="max-w-2xl mx-auto px-4 space-y-10">
          <h2 className="font-serif text-3xl font-semibold text-charcoal text-center mb-8">Details</h2>

          {wedding.ceremony_location && (
            <div className="flex gap-4 p-6 rounded-2xl bg-cream">
              <Calendar className="w-6 h-6 text-gold shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-charcoal mb-1">Trauung</h3>
                <p className="text-charcoal">{wedding.ceremony_location}</p>
                {wedding.ceremony_address && (
                  <p className="text-warm-gray text-sm mt-1 flex items-start gap-1">
                    <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                    {wedding.ceremony_address}
                  </p>
                )}
              </div>
            </div>
          )}

          {wedding.reception_location && (
            <div className="flex gap-4 p-6 rounded-2xl bg-cream">
              <Heart className="w-6 h-6 text-gold shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-charcoal mb-1">Feier</h3>
                <p className="text-charcoal">{wedding.reception_location}</p>
                {wedding.reception_address && (
                  <p className="text-warm-gray text-sm mt-1 flex items-start gap-1">
                    <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                    {wedding.reception_address}
                  </p>
                )}
              </div>
            </div>
          )}

          {wedding.dress_code && (
            <div className="flex gap-4 p-6 rounded-2xl bg-cream">
              <Shirt className="w-6 h-6 text-gold shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-charcoal mb-1">Dresscode</h3>
                <p className="text-warm-gray">{wedding.dress_code}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 sm:py-24" id="rsvp">
        <div className="max-w-lg mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-charcoal mb-3">
              {personalGreeting ? `${personalGreeting}, seid ihr dabei?` : 'Seid ihr dabei?'}
            </h2>
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
                Vielen Dank{personalGreeting ? `, ${personalGreeting.replace('Liebe/r ', '')}` : ''}!
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
              className="bg-white rounded-2xl p-6 sm:p-8 border border-cream-dark space-y-6"
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
                    readOnly={isPersonalLink && Boolean(invitedGuest?.email)}
                    className={isPersonalLink && invitedGuest?.email ? 'bg-cream cursor-default' : ''}
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

      <footer className="py-8 text-center text-sm text-warm-gray border-t border-cream-dark">
        <p className="font-serif text-lg text-charcoal mb-1">
          {wedding.partner1_name} & {wedding.partner2_name}
        </p>
        <p>Mit Liebe erstellt mit UnsereHochzeit</p>
      </footer>
    </div>
  )
}
