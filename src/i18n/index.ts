export type Locale = 'de' | 'en'

export type TranslationDict = typeof import('./locales/de').de

export function translate(
  locale: Locale,
  key: string,
  params?: Record<string, string | number>
): string {
  const dict = locale === 'en' ? en : de
  const parts = key.split('.')
  let value: unknown = dict
  for (const part of parts) {
    if (value && typeof value === 'object' && part in value) {
      value = (value as Record<string, unknown>)[part]
    } else {
      return key
    }
  }
  if (typeof value !== 'string') return key
  let result = value
  if (params) {
    for (const [paramKey, paramValue] of Object.entries(params)) {
      result = result.replaceAll(`{${paramKey}}`, String(paramValue))
    }
  }
  return result
}

import { de } from './locales/de'
import { en } from './locales/en'

export { de, en }

export function getDateFnsLocale(locale: Locale) {
  return locale === 'en' ? enLocale : deLocale
}

import { de as deLocale, enUS as enLocale } from 'date-fns/locale'

export function getStoredLocale(slug: string): Locale {
  try {
    const stored = localStorage.getItem(`locale-${slug}`)
    if (stored === 'en' || stored === 'de') return stored
  } catch {
    /* ignore */
  }
  return 'de'
}

export function storeLocale(slug: string, locale: Locale): void {
  try {
    localStorage.setItem(`locale-${slug}`, locale)
  } catch {
    /* ignore */
  }
}

export function getSeatingPlanUrl(slug: string, guestToken?: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  const path = guestToken
    ? `${base}/e/${slug}/tischplan/g/${guestToken}`
    : `${base}/e/${slug}/tischplan`
  return `${window.location.origin}${path}`
}
