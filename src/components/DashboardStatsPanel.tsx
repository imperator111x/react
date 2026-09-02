import { BarChart3, CalendarDays, Users } from 'lucide-react'
import { computeDashboardStats } from '../lib/dashboard-stats'
import type { GuestWithRsvp, Rsvp, Wedding } from '../types/wedding'

interface DashboardStatsPanelProps {
  wedding: Wedding
  guests: GuestWithRsvp[]
  rsvps: Rsvp[]
}

export default function DashboardStatsPanel({ wedding, guests, rsvps }: DashboardStatsPanelProps) {
  const stats = computeDashboardStats(wedding, guests, rsvps)
  const totalResponses = stats.acceptedPersons > 0 || stats.declinedGuests > 0 || stats.openGuests > 0
    ? guests.length
    : 0
  const acceptedGuests = rsvps.filter((r) => r.status === 'accepted').length
  const declinedGuests = stats.declinedGuests
  const openGuests = stats.openGuests

  const barTotal = Math.max(acceptedGuests + declinedGuests + openGuests, 1)

  return (
    <div className="bg-white rounded-2xl border border-cream-dark p-6 mb-8">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5 text-gold" />
        <h2 className="font-serif text-xl font-semibold text-charcoal">Statistik</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl bg-cream/60 p-4 border border-cream-dark">
          <CalendarDays className="w-5 h-5 text-gold mb-2" />
          <div className="font-serif text-2xl font-semibold text-charcoal">{stats.daysUntilWedding}</div>
          <div className="text-sm text-warm-gray">Tage bis zur Hochzeit</div>
        </div>
        <div className="rounded-xl bg-cream/60 p-4 border border-cream-dark">
          <Users className="w-5 h-5 text-sage mb-2" />
          <div className="font-serif text-2xl font-semibold text-charcoal">{stats.acceptedPersons}</div>
          <div className="text-sm text-warm-gray">Bestätigte Personen</div>
        </div>
        <div className="rounded-xl bg-cream/60 p-4 border border-cream-dark">
          <Users className="w-5 h-5 text-gold mb-2" />
          <div className="font-serif text-2xl font-semibold text-charcoal">{stats.invitedPersons}</div>
          <div className="text-sm text-warm-gray">Eingeladene Personen (max.)</div>
        </div>
        <div className="rounded-xl bg-cream/60 p-4 border border-cream-dark">
          <BarChart3 className="w-5 h-5 text-warm-gray mb-2" />
          <div className="font-serif text-2xl font-semibold text-charcoal">{stats.responseRate}%</div>
          <div className="text-sm text-warm-gray">Antwortquote</div>
        </div>
      </div>

      {totalResponses > 0 && (
        <div>
          <p className="text-sm font-medium text-charcoal mb-3">Antworten nach Status</p>
          <div className="flex h-4 rounded-full overflow-hidden bg-cream-dark mb-3">
            {acceptedGuests > 0 && (
              <div
                className="bg-sage transition-all"
                style={{ width: `${(acceptedGuests / barTotal) * 100}%` }}
                title={`Zusagen: ${acceptedGuests}`}
              />
            )}
            {declinedGuests > 0 && (
              <div
                className="bg-red-300 transition-all"
                style={{ width: `${(declinedGuests / barTotal) * 100}%` }}
                title={`Absagen: ${declinedGuests}`}
              />
            )}
            {openGuests > 0 && (
              <div
                className="bg-warm-gray/40 transition-all"
                style={{ width: `${(openGuests / barTotal) * 100}%` }}
                title={`Offen: ${openGuests}`}
              />
            )}
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-warm-gray">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-sage" />
              Zusagen ({acceptedGuests})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-300" />
              Absagen ({declinedGuests})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-warm-gray/40" />
              Offen ({openGuests})
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
