/** Offizielle WhatsApp-Share-URL (funktioniert auf Mobile & Desktop). */
export function getWhatsAppShareUrl(text: string): string {
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`
}

export function openWhatsAppShare(text: string): void {
  const url = getWhatsAppShareUrl(text)
  // <a>-Klick statt window.open – wird von Popup-Blockern nicht unterdrückt
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.target = '_blank'
  anchor.rel = 'noopener noreferrer'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
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
