export function getFirstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || fullName
}

export function getPersonalGreeting(name: string): string {
  return `Liebe/r ${getFirstName(name)}`
}

export function getGuestInviteUrl(slug: string, inviteToken: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  return `${window.location.origin}${base}/e/${slug}/g/${inviteToken}`
}

export function getDeletionDate(weddingDate: string): Date {
  const date = new Date(weddingDate)
  date.setDate(date.getDate() + 7)
  return date
}
