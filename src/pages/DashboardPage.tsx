import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import {
  Users,
  Loader2,
  Share2,
  Copy,
  ExternalLink,
  UserPlus,
  Trash2,
  Link2,
  CalendarClock,
  Pencil,
  Save,
  X,
} from 'lucide-react'
import Button from '../components/Button'
import Input from '../components/Input'
import { getGuestInviteUrl } from '../lib/guests'
import { filterAndSortGuests, type GuestSortOption, type GuestStatusFilter } from '../lib/guest-filter'
import { getGeneralInviteShareMessage, getPersonalInviteShareMessage } from '../lib/share'
import { getDeletionDate, formatEventDate, formatEventTime } from '../lib/wedding-dates'
import { createGuest, deleteGuest, getGuests, getRsvps, getWeddingByToken, updateGuest } from '../lib/supabase'
import { getGalleryImages } from '../lib/gallery'
import { getGuestPhotos } from '../lib/guest-photos'
import { getItineraryItems } from '../lib/itinerary'
import { getFaqItems } from '../lib/faq'
import { getGuestbookEntries } from '../lib/guestbook'
import { getMusicWishes } from '../lib/music-wishes'
import { getWishlistItems } from '../lib/wishlist'
import { getSeatingPlan, getSeatingTables } from '../lib/seating'
import { getGuestRsvpMax } from '../lib/dashboard-stats'
import DashboardStatsPanel from '../components/DashboardStatsPanel'
import GalleryManager from '../components/GalleryManager'
import GuestbookManager from '../components/GuestbookManager'
import SeatingManager from '../components/SeatingManager'
import ItineraryManager from '../components/ItineraryManager'
import FaqManager from '../components/FaqManager'
import WeddingEditor from '../components/WeddingEditor'
import CoverImageUpload from '../components/CoverImageUpload'
import InviteQrCode from '../components/InviteQrCode'
import PendingGuestsPanel from '../components/PendingGuestsPanel'
import GuestExportBar from '../components/GuestExportBar'
import MusicWishManager from '../components/MusicWishManager'
import WishlistManager from '../components/WishlistManager'
import GuestPhotoManager from '../components/GuestPhotoManager'
import WhatsAppShareButton from '../components/WhatsAppShareButton'
import type { FaqItem, GalleryImage, GuestPhoto, GuestbookEntry, GuestWithRsvp, ItineraryItem, MusicWish, Rsvp, Salutation, SeatingTable, SeatingTableWithGuests, Wedding, WishlistItem } from '../types/wedding'
import { SALUTATION_OPTIONS } from '../types/wedding'

export default function DashboardPage() {
  const { token } = useParams<{ token: string }>()
  const [wedding, setWedding] = useState<Wedding | null>(null)
  const [guests, setGuests] = useState<GuestWithRsvp[]>([])
  const [rsvps, setRsvps] = useState<Rsvp[]>([])
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
  const [itineraryItems, setItineraryItems] = useState<ItineraryItem[]>([])
  const [faqItems, setFaqItems] = useState<FaqItem[]>([])
  const [guestbookEntries, setGuestbookEntries] = useState<GuestbookEntry[]>([])
  const [seatingTables, setSeatingTables] = useState<SeatingTable[]>([])
  const [seatingPlan, setSeatingPlan] = useState<SeatingTableWithGuests[]>([])
  const [musicWishes, setMusicWishes] = useState<MusicWish[]>([])
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [guestPhotos, setGuestPhotos] = useState<GuestPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)
  const [addingGuest, setAddingGuest] = useState(false)
  const [guestForm, setGuestForm] = useState({
    name: '',
    salutation: 'frau' as Salutation,
    email: '',
    guest_count: 1,
    allow_plus_one: false,
  })
  const [guestError, setGuestError] = useState('')
  const [guestSearch, setGuestSearch] = useState('')
  const [guestStatusFilter, setGuestStatusFilter] = useState<GuestStatusFilter>('all')
  const [guestSort, setGuestSort] = useState<GuestSortOption>('name')
  const [editingGuestId, setEditingGuestId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    salutation: 'frau' as Salutation,
    email: '',
    guest_count: 1,
    allow_plus_one: false,
  })
  const [savingGuest, setSavingGuest] = useState(false)

  const loadData = async (dashboardToken: string) => {
    const w = await getWeddingByToken(dashboardToken)
    setWedding(w)
    if (w) {
      const [g, r, gallery, itinerary, faq, guestbook, tables, plan, music, wishlist, photos] = await Promise.all([
        getGuests(w.id),
        getRsvps(w.id),
        getGalleryImages(w.id),
        getItineraryItems(w.id),
        getFaqItems(w.id),
        getGuestbookEntries(w.id),
        getSeatingTables(w.id),
        getSeatingPlan(w.id),
        getMusicWishes(w.id),
        getWishlistItems(w.id),
        getGuestPhotos(w.id),
      ])
      setGuests(g)
      setRsvps(r)
      setGalleryImages(gallery)
      setItineraryItems(itinerary)
      setFaqItems(faq)
      setGuestbookEntries(guestbook)
      setSeatingTables(tables)
      setSeatingPlan(plan)
      setMusicWishes(music)
      setWishlistItems(wishlist)
      setGuestPhotos(photos)
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
        <p className="text-gold tracking-[0.35em] uppercase text-xs font-medium mb-4">404</p>
        <h1 className="font-serif text-3xl font-semibold text-charcoal mb-2">
          Dashboard nicht gefunden
        </h1>
        <p className="text-warm-gray mb-6">Der Link ist ungültig oder abgelaufen.</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/dashboard/wiederherstellen"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-gold text-white font-medium hover:bg-gold-dark transition-colors"
          >
            Link wiederherstellen
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full border-2 border-gold text-gold font-medium hover:bg-gold hover:text-white transition-colors"
          >
            Zur Startseite
          </Link>
        </div>
      </div>
    )
  }

  const deletionDate = getDeletionDate(wedding)

  const inviteUrl = `${window.location.origin}${import.meta.env.BASE_URL}e/${wedding.slug}`
  const filteredGuests = filterAndSortGuests(guests, guestSearch, guestStatusFilter, guestSort)
  const generalShareMessage = getGeneralInviteShareMessage(
    wedding.partner1_name,
    wedding.partner2_name,
    inviteUrl
  )

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
        max_guest_count: guestForm.allow_plus_one
          ? Math.min(guestForm.guest_count + 1, 5)
          : guestForm.guest_count,
      })
      setGuestForm({ name: '', salutation: 'frau', email: '', guest_count: 1, allow_plus_one: false })
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

  const startEditGuest = (guest: GuestWithRsvp) => {
    setEditingGuestId(guest.id)
    setEditForm({
      name: guest.name,
      salutation: guest.salutation,
      email: guest.email ?? '',
      guest_count: guest.guest_count,
      allow_plus_one: getGuestRsvpMax(guest) > guest.guest_count,
    })
  }

  const cancelEditGuest = () => {
    setEditingGuestId(null)
    setGuestError('')
  }

  const handleSaveGuest = async (guestId: string) => {
    if (!editForm.name.trim()) {
      setGuestError('Bitte einen Namen eingeben.')
      return
    }

    setSavingGuest(true)
    setGuestError('')
    try {
      await updateGuest(guestId, {
        name: editForm.name.trim(),
        salutation: editForm.salutation,
        email: editForm.email.trim() || null,
        guest_count: editForm.guest_count,
        max_guest_count: editForm.allow_plus_one
          ? Math.min(editForm.guest_count + 1, 5)
          : editForm.guest_count,
      })
      setEditingGuestId(null)
      if (token) await loadData(token)
    } catch (err) {
      setGuestError(err instanceof Error ? err.message : 'Speichern fehlgeschlagen.')
    } finally {
      setSavingGuest(false)
    }
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
            {formatEventDate(wedding.ceremony_date ?? wedding.wedding_date)}
            {' · '}
            {formatEventTime(wedding.ceremony_date ?? wedding.wedding_date)}
            {wedding.reception_date && (
              <>
                <br />
                Feier: {formatEventDate(wedding.reception_date)} · {formatEventTime(wedding.reception_date)}
              </>
            )}
          </p>
          <p className="text-sm text-warm-gray mt-2 flex items-center gap-1.5">
            <CalendarClock className="w-4 h-4" />
            Seite wird automatisch am{' '}
            {format(deletionDate, 'd. MMMM yyyy', { locale: de })} gelöscht (7 Tage nach der Hochzeit)
          </p>
        </div>

        <DashboardStatsPanel wedding={wedding} guests={guests} rsvps={rsvps} />

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
            <WhatsAppShareButton message={generalShareMessage} />
            <a href={inviteUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </a>
          </div>
          <InviteQrCode url={inviteUrl} />
        </div>

        <div className="bg-white rounded-2xl border border-cream-dark p-6 mb-8">
          <CoverImageUpload wedding={wedding} onUpdate={() => token && loadData(token)} />
        </div>

        <WeddingEditor wedding={wedding} onUpdate={() => token && loadData(token)} />

        <WishlistManager
          weddingId={wedding.id}
          items={wishlistItems}
          onUpdate={() => token && loadData(token)}
        />

        <MusicWishManager wishes={musicWishes} onUpdate={() => token && loadData(token)} />

        <GuestbookManager entries={guestbookEntries} onUpdate={() => token && loadData(token)} />

        <SeatingManager
          weddingId={wedding.id}
          weddingSlug={wedding.slug}
          tables={seatingTables}
          plan={seatingPlan}
          guests={guests}
          onUpdate={() => token && loadData(token)}
        />

        <PendingGuestsPanel
          wedding={wedding}
          guests={guests}
          copied={copied}
          onCopy={copyText}
        />

        {wedding && (
          <FaqManager
            weddingId={wedding.id}
            items={faqItems}
            onUpdate={() => token && loadData(token)}
          />
        )}

        {wedding && (
          <GalleryManager
            weddingId={wedding.id}
            images={galleryImages}
            onUpdate={() => token && loadData(token)}
          />
        )}

        {wedding && (
          <GuestPhotoManager
            weddingSlug={wedding.slug}
            photos={guestPhotos}
            onUpdate={() => token && loadData(token)}
          />
        )}

        {wedding && (
          <ItineraryManager
            weddingId={wedding.id}
            items={itineraryItems}
            onUpdate={() => token && loadData(token)}
          />
        )}

        <div className="bg-white rounded-2xl border border-cream-dark overflow-hidden mb-8">
          <div className="p-6 border-b border-cream-dark">
            <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-sage" />
                <h2 className="font-serif text-xl font-semibold text-charcoal">
                  Gäste anlegen ({guests.length})
                </h2>
              </div>
              <GuestExportBar wedding={wedding} guests={guests} />
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
                  onChange={(e) =>
                    setGuestForm((f) => ({ ...f, guest_count: Number(e.target.value) }))
                  }
                  className="w-full px-4 py-3 rounded-xl border border-cream-dark bg-white focus:outline-none focus:ring-2 focus:ring-gold/40"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-6 flex items-center gap-2">
                <input
                  id="allow-plus-one"
                  type="checkbox"
                  checked={guestForm.allow_plus_one}
                  onChange={(e) =>
                    setGuestForm((f) => ({ ...f, allow_plus_one: e.target.checked }))
                  }
                  className="rounded border-cream-dark text-gold focus:ring-gold/40"
                />
                <label htmlFor="allow-plus-one" className="text-sm text-charcoal">
                  Begleitung (+1) erlauben
                </label>
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

          {guests.length > 0 && (
            <div className="px-6 py-4 border-b border-cream-dark bg-cream/40 flex flex-col sm:flex-row gap-3">
              <Input
                label="Suchen"
                value={guestSearch}
                onChange={(e) => setGuestSearch(e.target.value)}
                placeholder="Name oder E-Mail …"
                className="flex-1"
              />
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">Status</label>
                <select
                  value={guestStatusFilter}
                  onChange={(e) => setGuestStatusFilter(e.target.value as GuestStatusFilter)}
                  className="w-full px-4 py-3 rounded-xl border border-cream-dark bg-white focus:outline-none focus:ring-2 focus:ring-gold/40"
                >
                  <option value="all">Alle</option>
                  <option value="open">Offen</option>
                  <option value="accepted">Zusage</option>
                  <option value="declined">Absage</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">Sortierung</label>
                <select
                  value={guestSort}
                  onChange={(e) => setGuestSort(e.target.value as GuestSortOption)}
                  className="w-full px-4 py-3 rounded-xl border border-cream-dark bg-white focus:outline-none focus:ring-2 focus:ring-gold/40"
                >
                  <option value="name">Name</option>
                  <option value="status">Status</option>
                  <option value="newest">Neueste zuerst</option>
                </select>
              </div>
            </div>
          )}

          {guests.length === 0 ? (
            <div className="p-12 text-center text-warm-gray">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>Noch keine Gäste angelegt. Fügt eure Gäste hinzu und teilt die persönlichen Links.</p>
            </div>
          ) : filteredGuests.length === 0 ? (
            <div className="p-12 text-center text-warm-gray">
              <p>Keine Gäste passen zu eurer Suche.</p>
            </div>
          ) : (
            <div className="divide-y divide-cream-dark">
              {filteredGuests.map((guest) => {
                const status = getGuestStatus(guest)
                const personalUrl = getGuestInviteUrl(wedding.slug, guest.invite_token)
                const copyKey = `guest-${guest.id}`
                const shareMessage = getPersonalInviteShareMessage(
                  guest.name,
                  wedding.partner1_name,
                  wedding.partner2_name,
                  personalUrl
                )
                const isEditing = editingGuestId === guest.id

                return (
                  <div key={guest.id} className="p-4 sm:p-6 space-y-3">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-charcoal mb-1.5">Anrede</label>
                            <select
                              value={editForm.salutation}
                              onChange={(e) =>
                                setEditForm((f) => ({ ...f, salutation: e.target.value as Salutation }))
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
                          <Input
                            label="Name"
                            value={editForm.name}
                            onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                          />
                          <Input
                            label="E-Mail (optional)"
                            type="email"
                            value={editForm.email}
                            onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                          />
                          <div>
                            <label className="block text-sm font-medium text-charcoal mb-1.5">Personen</label>
                            <select
                              value={editForm.guest_count}
                              onChange={(e) =>
                                setEditForm((f) => ({ ...f, guest_count: Number(e.target.value) }))
                              }
                              className="w-full px-4 py-3 rounded-xl border border-cream-dark bg-white focus:outline-none focus:ring-2 focus:ring-gold/40"
                            >
                              {[1, 2, 3, 4, 5].map((n) => (
                                <option key={n} value={n}>
                                  {n}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <label className="flex items-center gap-2 text-sm text-charcoal">
                          <input
                            type="checkbox"
                            checked={editForm.allow_plus_one}
                            onChange={(e) =>
                              setEditForm((f) => ({ ...f, allow_plus_one: e.target.checked }))
                            }
                            className="rounded border-cream-dark text-gold focus:ring-gold/40"
                          />
                          Begleitung (+1) erlauben
                        </label>
                        <div className="flex gap-2">
                          <Button size="sm" disabled={savingGuest} onClick={() => handleSaveGuest(guest.id)}>
                            {savingGuest ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Save className="w-4 h-4" />
                            )}
                            Speichern
                          </Button>
                          <Button variant="ghost" size="sm" onClick={cancelEditGuest}>
                            <X className="w-4 h-4" />
                            Abbrechen
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
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
                              {getGuestRsvpMax(guest) > guest.guest_count && (
                                <span className="text-xs text-gold">+1 erlaubt</span>
                              )}
                            </div>
                            {guest.email && <p className="text-sm text-warm-gray">{guest.email}</p>}
                            {guest.rsvp?.dietary_notes && (
                              <p className="text-sm text-charcoal mt-1">
                                <span className="font-medium">Allergien/Ernährung:</span>{' '}
                                {guest.rsvp.dietary_notes}
                              </p>
                            )}
                            {guest.rsvp?.message && (
                              <p className="text-sm text-warm-gray mt-1 italic">„{guest.rsvp.message}"</p>
                            )}
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <Button variant="ghost" size="sm" onClick={() => startEditGuest(guest)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteGuest(guest.id)}
                              className="text-red-400 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
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
                          <WhatsAppShareButton message={shareMessage} />
                        </div>
                      </>
                    )}
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
                    {rsvp.dietary_notes && (
                      <p className="text-sm text-charcoal mt-1">
                        <span className="font-medium">Allergien/Ernährung:</span> {rsvp.dietary_notes}
                      </p>
                    )}
                    {rsvp.message && (
                      <p className="text-sm text-warm-gray mt-1 italic">„{rsvp.message}"</p>
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
