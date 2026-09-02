import type { GuestWithRsvp } from '../types/wedding'

export type GuestStatusFilter = 'all' | 'open' | 'accepted' | 'declined'
export type GuestSortOption = 'name' | 'status' | 'newest'

export function filterAndSortGuests(
  guests: GuestWithRsvp[],
  search: string,
  statusFilter: GuestStatusFilter,
  sort: GuestSortOption
): GuestWithRsvp[] {
  const query = search.trim().toLowerCase()

  let result = guests.filter((guest) => {
    if (statusFilter === 'open' && guest.rsvp) return false
    if (statusFilter === 'accepted' && guest.rsvp?.status !== 'accepted') return false
    if (statusFilter === 'declined' && guest.rsvp?.status !== 'declined') return false

    if (!query) return true

    const haystack = [guest.name, guest.email ?? '', guest.rsvp?.guest_name ?? '']
      .join(' ')
      .toLowerCase()

    return haystack.includes(query)
  })

  result = [...result].sort((a, b) => {
    if (sort === 'newest') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }

    if (sort === 'status') {
      const rank = (g: GuestWithRsvp) => {
        if (!g.rsvp) return 0
        if (g.rsvp.status === 'accepted') return 1
        if (g.rsvp.status === 'declined') return 2
        return 3
      }
      const diff = rank(a) - rank(b)
      if (diff !== 0) return diff
    }

    return a.name.localeCompare(b.name, 'de')
  })

  return result
}
