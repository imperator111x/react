import { format } from 'date-fns'
import { de, enUS } from 'date-fns/locale'
import type { Locale } from '../i18n'
import type { Wedding } from '../types/wedding'

function getLocale(locale: Locale = 'de') {
  return locale === 'en' ? enUS : de
}

export function getCeremonyDate(wedding: Wedding): Date | null {
  const iso = wedding.ceremony_date ?? wedding.wedding_date
  return iso ? new Date(iso) : null
}

export function getReceptionDate(wedding: Wedding): Date | null {
  if (!wedding.reception_date) return null
  return new Date(wedding.reception_date)
}

export function getCountdownDate(wedding: Wedding): string {
  return wedding.ceremony_date ?? wedding.wedding_date
}

export function getLatestEventDate(wedding: Wedding): Date {
  const dates = [wedding.wedding_date, wedding.ceremony_date, wedding.reception_date]
    .filter(Boolean)
    .map((iso) => new Date(iso!))

  return new Date(Math.max(...dates.map((d) => d.getTime())))
}

export function getDeletionDate(wedding: Wedding): Date {
  const date = getLatestEventDate(wedding)
  date.setDate(date.getDate() + 7)
  return date
}

export function formatEventDate(iso: string, locale: Locale = 'de'): string {
  const pattern = locale === 'en' ? 'EEEE, MMMM d, yyyy' : 'EEEE, d. MMMM yyyy'
  return format(new Date(iso), pattern, { locale: getLocale(locale) })
}

export function formatEventTime(iso: string, locale: Locale = 'de'): string {
  const pattern = locale === 'en' ? 'h:mm a' : "HH:mm 'Uhr'"
  return format(new Date(iso), pattern, { locale: getLocale(locale) })
}

export function toDatetimeLocalValue(iso: string): string {
  const date = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function datetimeLocalToIso(value: string): string {
  return new Date(value).toISOString()
}
