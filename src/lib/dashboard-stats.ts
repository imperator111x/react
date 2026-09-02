import type { Guest, GuestWithRsvp, Rsvp, Wedding } from '../types/wedding'
import { getCountdownDate } from './wedding-dates'

export interface DashboardStats {
  invitedGuests: number
  invitedPersons: number
  acceptedPersons: number
  declinedGuests: number
  openGuests: number
  daysUntilWedding: number
  responseRate: number
}

export function getGuestRsvpMax(guest: Guest): number {
  return guest.max_guest_count ?? guest.guest_count ?? 1
}

export function computeDashboardStats(
  wedding: Wedding,
  guests: GuestWithRsvp[],
  rsvps: Rsvp[]
): DashboardStats {
  const invitedGuests = guests.length
  const invitedPersons = guests.reduce((sum, g) => sum + getGuestRsvpMax(g), 0)
  const accepted = rsvps.filter((r) => r.status === 'accepted')
  const acceptedPersons = accepted.reduce((sum, r) => sum + r.guest_count, 0)
  const declinedGuests = rsvps.filter((r) => r.status === 'declined').length
  const openGuests = guests.filter((g) => !g.rsvp).length

  const target = new Date(getCountdownDate(wedding))
  const daysUntilWedding = Math.max(
    0,
    Math.ceil((target.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  )

  const responded = rsvps.length
  const responseRate = invitedGuests > 0 ? Math.round((responded / invitedGuests) * 100) : 0

  return {
    invitedGuests,
    invitedPersons,
    acceptedPersons,
    declinedGuests,
    openGuests,
    daysUntilWedding,
    responseRate,
  }
}
