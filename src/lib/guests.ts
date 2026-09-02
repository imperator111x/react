import type { Salutation } from '../types/wedding'

export function getFirstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || fullName
}

export function getPersonalGreeting(name: string, salutation: Salutation): string {
  const trimmed = name.trim()

  switch (salutation) {
    case 'herr':
      return `Lieber ${getFirstName(trimmed)}`
    case 'frau':
      return `Liebe ${getFirstName(trimmed)}`
    case 'familie':
      return `Liebe Familie ${trimmed}`
  }
}

export function getGuestInviteUrl(slug: string, inviteToken: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  return `${window.location.origin}${base}/e/${slug}/g/${inviteToken}`
}

export function getRsvpPersonLimit(guest: { max_guest_count?: number | null; guest_count: number } | null | undefined): number {
  if (!guest) return 5
  return guest.max_guest_count ?? guest.guest_count ?? 1
}

export function getRsvpPersonOptions(guest: { max_guest_count?: number | null; guest_count: number } | null | undefined): number[] {
  const max = getRsvpPersonLimit(guest)
  return Array.from({ length: max }, (_, i) => i + 1)
}
