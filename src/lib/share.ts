export function getWhatsAppShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}

export function openWhatsAppShare(text: string): void {
  window.open(getWhatsAppShareUrl(text), '_blank', 'noopener,noreferrer')
}

export function getGeneralInviteShareMessage(partner1: string, partner2: string, url: string): string {
  return `Hallo! Wir laden euch herzlich zu unserer Hochzeit ein (${partner1} & ${partner2}). Alle Infos und RSVP hier: ${url}`
}

export function getPersonalInviteShareMessage(
  guestName: string,
  partner1: string,
  partner2: string,
  url: string
): string {
  return `Hallo ${guestName}! Wir laden dich herzlich zu unserer Hochzeit ein (${partner1} & ${partner2}). Dein persönlicher Link: ${url}`
}
