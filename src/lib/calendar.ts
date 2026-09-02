import type { Wedding } from '../types/wedding'

function escapeIcs(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

function formatIcsUtc(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}

function buildLocation(location?: string | null, address?: string | null): string {
  return [location, address].filter(Boolean).join(', ')
}

interface CalendarEvent {
  uid: string
  title: string
  start: Date
  end: Date
  location: string
  description: string
}

function buildIcs(events: CalendarEvent[]): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//UnsereHochzeit//DE',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ]

  for (const event of events) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${event.uid}`,
      `DTSTAMP:${formatIcsUtc(new Date())}`,
      `DTSTART:${formatIcsUtc(event.start)}`,
      `DTEND:${formatIcsUtc(event.end)}`,
      `SUMMARY:${escapeIcs(event.title)}`,
      `DESCRIPTION:${escapeIcs(event.description)}`,
      ...(event.location ? [`LOCATION:${escapeIcs(event.location)}`] : []),
      'END:VEVENT'
    )
  }

  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}

function downloadIcs(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000)
}

export function getWeddingCalendarEvents(wedding: Wedding): CalendarEvent[] {
  const events: CalendarEvent[] = []
  const couple = `${wedding.partner1_name} & ${wedding.partner2_name}`

  const ceremonyIso = wedding.ceremony_date ?? wedding.wedding_date
  if (ceremonyIso) {
    const start = new Date(ceremonyIso)
    events.push({
      uid: `${wedding.slug}-ceremony@unserehochzeit`,
      title: `Hochzeit – Trauung (${couple})`,
      start,
      end: addHours(start, 2),
      location: buildLocation(wedding.ceremony_location, wedding.ceremony_address),
      description: `Trauung von ${couple}`,
    })
  }

  if (wedding.reception_date) {
    const start = new Date(wedding.reception_date)
    events.push({
      uid: `${wedding.slug}-reception@unserehochzeit`,
      title: `Hochzeit – Feier (${couple})`,
      start,
      end: addHours(start, 5),
      location: buildLocation(wedding.reception_location, wedding.reception_address),
      description: `Hochzeitsfeier von ${couple}`,
    })
  }

  return events
}

export function downloadCalendarEvent(
  wedding: Wedding,
  type: 'ceremony' | 'reception' | 'all'
): void {
  const events = getWeddingCalendarEvents(wedding)
  const filtered =
    type === 'all'
      ? events
      : events.filter((e) => e.uid.includes(type === 'ceremony' ? 'ceremony' : 'reception'))

  if (filtered.length === 0) return

  const suffix = type === 'all' ? 'hochzeit' : type === 'ceremony' ? 'trauung' : 'feier'
  downloadIcs(`${wedding.slug}-${suffix}.ics`, buildIcs(filtered))
}
