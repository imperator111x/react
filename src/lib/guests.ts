import type { Locale } from '../i18n'
import type { Salutation } from '../types/wedding'

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

  if (locale === 'en') {
    switch (salutation) {
      case 'herr':
        return `Dear ${first}`
      case 'frau':
        return `Dear ${first}`
      case 'familie':
        return `Dear ${trimmed} family`
    }
  }

  switch (salutation) {
    case 'herr':
      return `Lieber ${first}`
    case 'frau':
      return `Liebe ${first}`
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
