import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { getGuestInviteUrl } from './guests'
import type { GuestWithRsvp, Wedding } from '../types/wedding'

function getSalutationLabel(salutation: GuestWithRsvp['salutation']): string {
  switch (salutation) {
    case 'herr':
      return 'Herr'
    case 'frau':
      return 'Frau'
    case 'familie':
      return 'Familie'
  }
}

function getStatusLabel(guest: GuestWithRsvp): string {
  if (!guest.rsvp) return 'Offen'
  if (guest.rsvp.status === 'accepted') return 'Zusage'
  if (guest.rsvp.status === 'declined') return 'Absage'
  return 'Ausstehend'
}

function escapeCsv(value: string): string {
  if (value.includes('"') || value.includes(',') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function exportGuestsToCsv(wedding: Wedding, guests: GuestWithRsvp[]): void {
  const headers = [
    'Name',
    'Anrede',
    'E-Mail',
    'Status',
    'Personen (eingeladen)',
    'Personen (RSVP)',
    'Allergien',
    'Nachricht',
    'Persönlicher Link',
  ]

  const rows = guests.map((guest) => [
    guest.name,
    getSalutationLabel(guest.salutation),
    guest.email ?? '',
    getStatusLabel(guest),
    String(guest.guest_count),
    guest.rsvp ? String(guest.rsvp.guest_count) : '',
    guest.rsvp?.dietary_notes ?? '',
    guest.rsvp?.message ?? '',
    getGuestInviteUrl(wedding.slug, guest.invite_token),
  ])

  const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(';')).join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `gaesteliste-${wedding.slug}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export function printGuestsAsPdf(wedding: Wedding, guests: GuestWithRsvp[]): void {
  const rows = guests
    .map(
      (guest) => `
    <tr>
      <td>${getSalutationLabel(guest.salutation)} ${guest.name}</td>
      <td>${getStatusLabel(guest)}</td>
      <td>${guest.rsvp?.guest_count ?? guest.guest_count}</td>
      <td>${guest.rsvp?.dietary_notes ?? '–'}</td>
      <td>${guest.email ?? '–'}</td>
    </tr>`
    )
    .join('')

  const html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <title>Gästeliste ${wedding.partner1_name} & ${wedding.partner2_name}</title>
  <style>
    body { font-family: Georgia, serif; color: #2c2c2c; padding: 32px; }
    h1 { font-size: 24px; margin-bottom: 8px; }
    p { color: #6b6560; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td { border: 1px solid #e8e0d5; padding: 10px 12px; text-align: left; }
    th { background: #faf7f2; }
  </style>
</head>
<body>
  <h1>Gästeliste – ${wedding.partner1_name} & ${wedding.partner2_name}</h1>
  <p>Erstellt am ${format(new Date(), 'd. MMMM yyyy, HH:mm', { locale: de })} Uhr</p>
  <table>
    <thead>
      <tr>
        <th>Gast</th>
        <th>Status</th>
        <th>Personen</th>
        <th>Allergien</th>
        <th>E-Mail</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`

  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(html)
  win.document.close()
  win.focus()
  win.print()
}

export function getReminderMessage(
  wedding: Wedding,
  guest: GuestWithRsvp,
  personalUrl: string
): string {
  const greeting =
    guest.salutation === 'herr'
      ? `Lieber ${guest.name.split(/\s+/)[0]}`
      : guest.salutation === 'frau'
        ? `Liebe ${guest.name.split(/\s+/)[0]}`
        : `Liebe Familie ${guest.name}`

  return `${greeting},

wir laden euch herzlich zu unserer Hochzeit ein (${wedding.partner1_name} & ${wedding.partner2_name}). Könntet ihr uns bitte eure Zu- oder Absage geben?

👉 ${personalUrl}

Herzliche Grüße
${wedding.partner1_name} & ${wedding.partner2_name}`
}
