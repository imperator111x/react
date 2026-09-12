import { translate, type Locale } from '../i18n'
import type { Guest, GuestWithRsvp, Rsvp, Salutation } from '../types/wedding'

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
  }
): string[] {
  const fromRsvp =
    guest.rsvp?.status === 'accepted' ? sanitizeMemberNames(guest.rsvp.member_names) : []
  const fromGuest = sanitizeMemberNames(guest.member_names)
  const members = fromRsvp.length > 0 ? fromRsvp : fromGuest
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

export function getGuestPartyLabel(guest: GuestWithRsvp | Guest): string {
  const names = getSeatingDisplayNames(guest)
  if (names.length <= 1) return names[0] ?? guest.name
  return `${guest.name} (${names.length} Personen)`
}
