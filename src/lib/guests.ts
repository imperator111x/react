import { translate, type Locale } from '../i18n'
import type { Guest, Rsvp, Salutation } from '../types/wedding'

export function getFirstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || fullName
}

export function getPersonalGreeting(
  name: string,
  salutation: Salutation,
  locale: Locale = 'de'
): string {
  const trimmed = name.trim()
  const first = getFirstName(trimmed)

  switch (salutation) {
    case 'herr':
      return translate(locale, 'greeting.dearMale', { name: first })
    case 'frau':
      return translate(locale, 'greeting.dearFemale', { name: first })
    case 'familie':
      return translate(locale, 'greeting.dearFamily', { name: trimmed })
  }
}

export function getGuestInviteUrl(slug: string, inviteToken: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  return `${window.location.origin}${base}/e/${slug}/g/${inviteToken}`
}

export function getRsvpPersonLimit(
  guest: { max_guest_count?: number | null; guest_count: number } | null | undefined
): number {
  if (!guest) return 5
  return guest.max_guest_count ?? guest.guest_count ?? 1
}

export function getRsvpPersonOptions(
  guest: { max_guest_count?: number | null; guest_count: number } | null | undefined
): number[] {
  const max = getRsvpPersonLimit(guest)
  return Array.from({ length: max }, (_, i) => i + 1)
}

export function sanitizeMemberNames(names: string[] | null | undefined): string[] {
  if (!names?.length) return []
  return names.map((n) => n.trim()).filter(Boolean)
}

export function resizeMemberNames(names: string[] | null | undefined, slotCount: number): string[] {
  const next = [...(names ?? [])].slice(0, slotCount)
  while (next.length < slotCount) next.push('')
  return next
}

/** member_table_ids auf die Länge von member_names bringen (fehlend = erben). */
export function resizeMemberTableIds(
  tableIds: string[] | null | undefined,
  slotCount: number
): (string | null)[] {
  const next: (string | null)[] = [...(tableIds ?? [])]
    .slice(0, slotCount)
    .map((id) => (id === undefined ? null : id))
  while (next.length < slotCount) next.push(null)
  return next
}

export type SeatingSeat = {
  guestId: string
  name: string
  /** null = Hauptgast (Herr/Frau) bzw. Familien-Fallback; Zahl = Index in member_names */
  memberIndex: number | null
  /** null = kein Tisch */
  tableId: string | null
}

type SeatingGuestInput = Pick<
  Guest,
  'id' | 'name' | 'salutation' | 'table_id' | 'member_names' | 'member_table_ids'
> & {
  rsvp?: Pick<Rsvp, 'member_names' | 'status'> | null
}

function resolveMemberNames(
  guest: Pick<Guest, 'member_names'> & {
    rsvp?: Pick<Rsvp, 'member_names' | 'status'> | null
  }
): string[] {
  const fromRsvp =
    guest.rsvp?.status === 'accepted' ? sanitizeMemberNames(guest.rsvp.member_names) : []
  const fromGuest = sanitizeMemberNames(guest.member_names)
  return fromRsvp.length > 0 ? fromRsvp : fromGuest
}

/**
 * Einzelne Sitzplätze einer Einladung.
 * member_table_ids[i]: Tisch-ID | '' (kein Tisch) | fehlend/null (erbt table_id).
 */
export function getSeatingSeats(guest: SeatingGuestInput): SeatingSeat[] {
  const members = resolveMemberNames(guest)
  const memberTables = guest.member_table_ids ?? []
  const primaryTable = guest.table_id ?? null
  const primary = guest.name.trim()

  const resolveMemberTable = (index: number): string | null => {
    if (index < memberTables.length) {
      const raw = memberTables[index]
      if (raw === '') return null
      if (raw != null) return raw
    }
    return primaryTable
  }

  if (guest.salutation === 'familie') {
    if (members.length === 0) {
      return primary
        ? [
            {
              guestId: guest.id,
              name: `Familie ${primary}`,
              memberIndex: null,
              tableId: primaryTable,
            },
          ]
        : []
    }
    return members.map((name, index) => ({
      guestId: guest.id,
      name,
      memberIndex: index,
      tableId: resolveMemberTable(index),
    }))
  }

  const seats: SeatingSeat[] = []
  if (primary) {
    seats.push({
      guestId: guest.id,
      name: primary,
      memberIndex: null,
      tableId: primaryTable,
    })
  }

  const primaryLower = primary.toLowerCase()
  const companionEntries = members
    .map((name, index) => ({ name, index }))
    .filter(({ name }) => name.toLowerCase() !== primaryLower)

  for (const { name, index } of companionEntries) {
    seats.push({
      guestId: guest.id,
      name,
      memberIndex: index,
      tableId: resolveMemberTable(index),
    })
  }

  return seats
}

/** Anzahl Namensfelder für Personen am Tisch (Dashboard). */
export function getCompanionNameSlotCount(options: {
  salutation: Salutation
  guestCount: number
  allowPlusOne?: boolean
}): number {
  const { salutation, guestCount, allowPlusOne = false } = options
  if (salutation === 'familie') {
    return Math.max(0, guestCount)
  }
  const total = allowPlusOne ? Math.min(guestCount + 1, 5) : guestCount
  return Math.max(0, total - 1)
}

/** Anzahl Namensfelder beim RSVP (Familie: alle, sonst Begleitungen). */
export function getRsvpNameSlotCount(salutation: Salutation, guestCount: number): number {
  if (salutation === 'familie') return Math.max(0, guestCount)
  return Math.max(0, guestCount - 1)
}

/** Speicherung: Familie = alle Namen; sonst nur Begleitungen (+1). */
export function buildStoredMemberNames(options: {
  salutation: Salutation
  companionNames: string[]
  guestCount: number
}): string[] {
  const slots = getRsvpNameSlotCount(options.salutation, options.guestCount)
  return sanitizeMemberNames(options.companionNames).slice(0, slots)
}

/** Formularwerte aus gespeicherten member_names (inkl. älterer RSVPs mit Hauptnamen). */
export function extractEditableMemberNames(
  salutation: Salutation,
  primaryName: string,
  stored: string[] | null | undefined,
  guestCount: number
): string[] {
  const names = sanitizeMemberNames(stored)
  const slots = getRsvpNameSlotCount(salutation, guestCount)
  if (salutation === 'familie') {
    return resizeMemberNames(names, slots)
  }
  const primary = primaryName.trim().toLowerCase()
  const withoutPrimary =
    names.length > 0 && primary && names[0].toLowerCase() === primary ? names.slice(1) : names
  return resizeMemberNames(withoutPrimary, slots)
}

/** Namen, die am Tischplan erscheinen sollen. */
export function getSeatingDisplayNames(
  guest: Pick<Guest, 'name' | 'salutation' | 'member_names'> & {
    rsvp?: Pick<Rsvp, 'member_names' | 'status'> | null
    seat_names?: string[]
  }
): string[] {
  if (guest.seat_names && guest.seat_names.length > 0) return guest.seat_names

  const members = resolveMemberNames(guest)
  const primary = guest.name.trim()

  if (guest.salutation === 'familie') {
    if (members.length > 0) return members
    return primary ? [`Familie ${primary}`] : []
  }

  if (members.length === 0) return primary ? [primary] : []

  const primaryLower = primary.toLowerCase()
  const alreadyIncludesPrimary = members.some((name) => name.toLowerCase() === primaryLower)
  if (alreadyIncludesPrimary || !primary) return members
  return [primary, ...members]
}

export function getGuestPartyLabel(
  guest: Pick<Guest, 'name' | 'salutation' | 'member_names'> & {
    rsvp?: Pick<Rsvp, 'member_names' | 'status'> | null
  }
): string {
  const names = getSeatingDisplayNames(guest)
  if (names.length <= 1) return names[0] ?? guest.name
  return `${guest.name} (${names.length} Personen)`
}
