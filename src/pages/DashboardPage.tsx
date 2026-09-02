import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Share2,
  Copy,
  ExternalLink,
  UserPlus,
  Trash2,
  Link2,
  CalendarClock,
} from 'lucide-react'
import Button from '../components/Button'
import Input from '../components/Input'
import { getGuestInviteUrl, getDeletionDate } from '../lib/guests'
import { createGuest, deleteGuest, getGuests, getRsvps, getWeddingByToken } from '../lib/supabase'
import type { GuestWithRsvp, Rsvp, Salutation, Wedding } from '../types/wedding'
import { SALUTATION_OPTIONS } from '../types/wedding'

export default function DashboardPage() {
  const { token } = useParams<{ token: string }>()
  const [wedding, setWedding] = useState<Wedding | null>(null)
  const [guests, setGuests] = useState<GuestWithRsvp[]>([])
  const [rsvps, setRsvps] = useState<Rsvp[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)
  const [addingGuest, setAddingGuest] = useState(false)
  const [guestForm, setGuestForm] = useState({
    name: '',
    salutation: 'frau' as Salutation,
    email: '',
    guest_count: 1,
  })
  const [guestError, setGuestError] = useState('')

  const loadData = async (dashboardToken: string) => {
    const w = await getWeddingByToken(dashboardToken)
    setWedding(w)
    if (w) {
      const [g, r] = await Promise.all([getGuests(w.id), getRsvps(w.id)])
      setGuests(g)
      setRsvps(r)
    }
  }

  useEffect(() => {
    async function load() {
      if (!token) return
      await loadData(token)
      setLoading(false)
    }
    load()
  }, [token])

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
        <h1 className="font-serif text-3xl font-semibold text-charcoal mb-2">
          Dashboard nicht gefunden
        </h1>
        <p className="text-warm-gray">Der Link ist ungültig oder abgelaufen.</p>
      </div>
    )
  }

  const accepted = rsvps.filter((r) => r.status === 'accepted')
  const declined = rsvps.filter((r) => r.status === 'declined')
  const pendingInvites = guests.filter((g) => !g.rsvp).length
  const deletionDate = getDeletionDate(wedding.wedding_date)

  const inviteUrl = `${window.location.origin}${import.meta.env.BASE_URL}e/${wedding.slug}`

  const copyText = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuestError('')

    if (!guestForm.name.trim()) {
      setGuestError('Bitte einen Namen eingeben.')
      return
    }

    setAddingGuest(true)
    try {
      await createGuest(wedding.id, {
        name: guestForm.name.trim(),
        salutation: guestForm.salutation,
        email: guestForm.email.trim() || undefined,
        guest_count: guestForm.guest_count,
      })
      setGuestForm({ name: '', salutation: 'frau', email: '', guest_count: 1 })
      if (token) await loadData(token)
    } catch (err) {
      setGuestError(err instanceof Error ? err.message : 'Gast konnte nicht hinzugefügt werden.')
    } finally {
      setAddingGuest(false)
    }
  }

  const handleDeleteGuest = async (guestId: string) => {
    if (!confirm('Gast wirklich aus der Liste entfernen?')) return
    await deleteGuest(guestId)
    if (token) await loadData(token)
  }

  const getGuestStatus = (guest: GuestWithRsvp) => {
    if (!guest.rsvp) return { label: 'Offen', className: 'bg-cream-dark text-warm-gray' }
    if (guest.rsvp.status === 'accepted') return { label: 'Zusage', className: 'bg-sage/10 text-sage' }
    if (guest.rsvp.status === 'declined') return { label: 'Absage', className: 'bg-red-50 text-red-500' }
    return { label: 'Ausstehend', className: 'bg-cream-dark text-warm-gray' }
  }

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-charcoal mb-1">
            Dashboard
          </h1>
          <p className="text-warm-gray">
            {wedding.partner1_name} & {wedding.partner2_name} ·{' '}
            {format(new Date(wedding.wedding_date), 'd. MMMM yyyy', { locale: de })}
          </p>
          <p className="text-sm text-warm-gray mt-2 flex items-center gap-1.5">
            <CalendarClock className="w-4 h-4" />
            Seite wird automatisch am{' '}
            {format(deletionDate, 'd. MMMM yyyy', { locale: de })} gelöscht (7 Tage nach der Hochzeit)
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Eingeladen', value: guests.length, icon: Users, color: 'text-gold' },
            { label: 'Zusagen', value: accepted.length, icon: CheckCircle, color: 'text-sage' },
            { label: 'Absagen', value: declined.length, icon: XCircle, color: 'text-red-400' },
            { label: 'Offen', value: pendingInvites, icon: Clock, color: 'text-warm-gray' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl p-5 border border-cream-dark">
              <Icon className={`w-5 h-5 ${color} mb-2`} />
              <div className="font-serif text-3xl font-semibold text-charcoal">{value}</div>
              <div className="text-sm text-warm-gray">{label}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-cream-dark mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Share2 className="w-5 h-5 text-gold" />
            <h2 className="font-semibold text-charcoal">Allgemeiner Einladungslink</h2>
          </div>
          <p className="text-sm text-warm-gray mb-3">
            Für Gäste ohne persönlichen Link. Besser: jeden Gast einzeln anlegen und den persönlichen Link teilen.
          </p>
          <div className="flex gap-2">
            <input
              readOnly
              value={inviteUrl}
              className="flex-1 px-4 py-2.5 rounded-xl bg-cream border border-cream-dark text-sm truncate"
            />
            <Button variant="outline" size="sm" onClick={() => copyText(inviteUrl, 'general')}>
              <Copy className="w-4 h-4" />
              {copied === 'general' ? 'Kopiert!' : 'Kopieren'}
            </Button>
            <a href={inviteUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </a>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-cream-dark overflow-hidden mb-8">
          <div className="p-6 border-b border-cream-dark">
            <div className="flex items-center gap-2 mb-4">
              <UserPlus className="w-5 h-5 text-sage" />
              <h2 className="font-serif text-xl font-semibold text-charcoal">
                Gäste anlegen ({guests.length})
              </h2>
            </div>
            <form onSubmit={handleAddGuest} className="grid sm:grid-cols-6 gap-3 items-end">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">Anrede</label>
                <select
                  value={guestForm.salutation}
                  onChange={(e) =>
                    setGuestForm((f) => ({ ...f, salutation: e.target.value as Salutation }))
                  }
                  className="w-full px-4 py-3 rounded-xl border border-cream-dark bg-white focus:outline-none focus:ring-2 focus:ring-gold/40"
                >
                  {SALUTATION_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <Input
                  label={guestForm.salutation === 'familie' ? 'Familienname' : 'Name'}
                  value={guestForm.name}
                  onChange={(e) => setGuestForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder={
                    guestForm.salutation === 'familie' ? 'z.B. Schmidt' : 'Vor- und Nachname'
                  }
                  required
                />
              </div>
              <Input
                label="E-Mail (optional)"
                type="email"
                value={guestForm.email}
                onChange={(e) => setGuestForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="email@beispiel.de"
              />
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">Personen</label>
                <select
                  value={guestForm.guest_count}
                  onChange={(e) => setGuestForm((f) => ({ ...f, guest_count: Number(e.target.value) }))}
                  className="w-full px-4 py-3 rounded-xl border border-cream-dark bg-white focus:outline-none focus:ring-2 focus:ring-gold/40"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-6">
                {guestError && <p className="text-sm text-red-500 mb-2">{guestError}</p>}
                <Button type="submit" disabled={addingGuest}>
                  {addingGuest ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Wird hinzugefügt...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Gast hinzufügen
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {guests.length === 0 ? (
            <div className="p-12 text-center text-warm-gray">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>Noch keine Gäste angelegt. Fügt eure Gäste hinzu und teilt die persönlichen Links.</p>
            </div>
          ) : (
            <div className="divide-y divide-cream-dark">
              {guests.map((guest) => {
                const status = getGuestStatus(guest)
                const personalUrl = getGuestInviteUrl(wedding.slug, guest.invite_token)
                const copyKey = `guest-${guest.id}`

                return (
                  <div key={guest.id} className="p-4 sm:p-6 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-charcoal">
                            {guest.salutation === 'herr'
                              ? 'Herr'
                              : guest.salutation === 'frau'
                                ? 'Frau'
                                : 'Familie'}{' '}
                            {guest.name}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${status.className}`}>
                            {status.label}
                          </span>
                          {guest.guest_count > 1 && (
                            <span className="text-xs text-warm-gray">{guest.guest_count} Personen</span>
                          )}
                        </div>
                        {guest.email && <p className="text-sm text-warm-gray">{guest.email}</p>}
                        {guest.rsvp?.message && (
                          <p className="text-sm text-warm-gray mt-1 italic">„{guest.rsvp.message}"</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteGuest(guest.id)}
                        className="text-red-400 hover:text-red-600 shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <input
                        readOnly
                        value={personalUrl}
                        className="flex-1 px-3 py-2 rounded-xl bg-cream border border-cream-dark text-xs sm:text-sm truncate"
                      />
                      <Button variant="outline" size="sm" onClick={() => copyText(personalUrl, copyKey)}>
                        <Link2 className="w-4 h-4" />
                        {copied === copyKey ? 'Kopiert!' : 'Link'}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-cream-dark overflow-hidden">
          <div className="p-6 border-b border-cream-dark">
            <h2 className="font-serif text-xl font-semibold text-charcoal">
              Alle Antworten ({rsvps.length})
            </h2>
          </div>

          {rsvps.length === 0 ? (
            <div className="p-12 text-center text-warm-gray">
              <p>Noch keine Antworten eingegangen.</p>
            </div>
          ) : (
            <div className="divide-y divide-cream-dark">
              {rsvps.map((rsvp) => (
                <div key={rsvp.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-charcoal">{rsvp.guest_name}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          rsvp.status === 'accepted'
                            ? 'bg-sage/10 text-sage'
                            : rsvp.status === 'declined'
                              ? 'bg-red-50 text-red-500'
                              : 'bg-cream-dark text-warm-gray'
                        }`}
                      >
                        {rsvp.status === 'accepted'
                          ? 'Zusage'
                          : rsvp.status === 'declined'
                            ? 'Absage'
                            : 'Ausstehend'}
                      </span>
                    </div>
                    {rsvp.email && <p className="text-sm text-warm-gray">{rsvp.email}</p>}
                    {rsvp.status === 'accepted' && rsvp.guest_count > 1 && (
                      <p className="text-sm text-warm-gray">{rsvp.guest_count} Personen</p>
                    )}
                  </div>
                  <div className="text-xs text-warm-gray shrink-0">
                    {format(new Date(rsvp.created_at), 'd. MMM yyyy, HH:mm', { locale: de })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
