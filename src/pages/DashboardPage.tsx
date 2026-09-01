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
} from 'lucide-react'
import Button from '../components/Button'
import { getWeddingByToken, getRsvps } from '../lib/supabase'
import type { Wedding, Rsvp } from '../types/wedding'

export default function DashboardPage() {
  const { token } = useParams<{ token: string }>()
  const [wedding, setWedding] = useState<Wedding | null>(null)
  const [rsvps, setRsvps] = useState<Rsvp[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function load() {
      if (!token) return
      const w = await getWeddingByToken(token)
      setWedding(w)
      if (w) {
        const r = await getRsvps(w.id)
        setRsvps(r)
      }
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
  const totalGuests = accepted.reduce((sum, r) => sum + r.guest_count, 0)

  const inviteUrl = `${window.location.origin}${import.meta.env.BASE_URL}e/${wedding.slug}`

  const copyLink = async () => {
    await navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Zusagen', value: accepted.length, icon: CheckCircle, color: 'text-sage' },
            { label: 'Absagen', value: declined.length, icon: XCircle, color: 'text-red-400' },
            { label: 'Gäste gesamt', value: totalGuests, icon: Users, color: 'text-gold' },
            { label: 'Ausstehend', value: rsvps.filter((r) => r.status === 'pending').length, icon: Clock, color: 'text-warm-gray' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl p-5 border border-cream-dark">
              <Icon className={`w-5 h-5 ${color} mb-2`} />
              <div className="font-serif text-3xl font-semibold text-charcoal">{value}</div>
              <div className="text-sm text-warm-gray">{label}</div>
            </div>
          ))}
        </div>

        {/* Share link */}
        <div className="bg-white rounded-2xl p-6 border border-cream-dark mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Share2 className="w-5 h-5 text-gold" />
            <h2 className="font-semibold text-charcoal">Einladungslink teilen</h2>
          </div>
          <div className="flex gap-2">
            <input
              readOnly
              value={inviteUrl}
              className="flex-1 px-4 py-2.5 rounded-xl bg-cream border border-cream-dark text-sm truncate"
            />
            <Button variant="outline" size="sm" onClick={copyLink}>
              <Copy className="w-4 h-4" />
              {copied ? 'Kopiert!' : 'Kopieren'}
            </Button>
            <a href={inviteUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </a>
          </div>
        </div>

        {/* Guest list */}
        <div className="bg-white rounded-2xl border border-cream-dark overflow-hidden">
          <div className="p-6 border-b border-cream-dark">
            <h2 className="font-serif text-xl font-semibold text-charcoal">
              Gästeliste ({rsvps.length})
            </h2>
          </div>

          {rsvps.length === 0 ? (
            <div className="p-12 text-center text-warm-gray">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>Noch keine Antworten. Teilt euren Einladungslink mit euren Gästen!</p>
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
                    {rsvp.email && (
                      <p className="text-sm text-warm-gray">{rsvp.email}</p>
                    )}
                    {rsvp.status === 'accepted' && rsvp.guest_count > 1 && (
                      <p className="text-sm text-warm-gray">
                        {rsvp.guest_count} Personen
                      </p>
                    )}
                    {rsvp.dietary_notes && (
                      <p className="text-sm text-warm-gray mt-1">
                        Ernährung: {rsvp.dietary_notes}
                      </p>
                    )}
                    {rsvp.message && (
                      <p className="text-sm text-warm-gray mt-1 italic">"{rsvp.message}"</p>
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
