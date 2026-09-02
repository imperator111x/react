import { de as deLocale, enUS as enLocale, tr as trLocale } from 'date-fns/locale'
import { de } from './locales/de'
import { en } from './locales/en'
import { tr } from './locales/tr'

export type Locale = 'de' | 'en' | 'tr'

type StringDict = { [key: string]: string | StringDict }

export type TranslationDict = StringDict

const dictionaries: Record<Locale, StringDict> = { de, en, tr }

export function translate(
  locale: Locale,
  key: string,
  params?: Record<string, string | number>
): string {
  const dict = dictionaries[locale] ?? de
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

export { de, en, tr }

export function getDictionary(locale: Locale): TranslationDict {
  return dictionaries[locale] ?? de
}

export function getDateFnsLocale(locale: Locale) {
  switch (locale) {
    case 'en':
      return enLocale
    case 'tr':
      return trLocale
    default:
      return deLocale
  }
}

export function getStoredLocale(slug: string): Locale {
  try {
    const stored = localStorage.getItem(`locale-${slug}`)
    if (stored === 'en' || stored === 'de' || stored === 'tr') return stored
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
