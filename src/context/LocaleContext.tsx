import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { getStoredLocale, storeLocale, translate, type Locale } from '../i18n'

interface LocaleContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

interface LocaleProviderProps {
  slug: string
  children: ReactNode
}

export function LocaleProvider({ slug, children }: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(() => getStoredLocale(slug))

  const setLocale = (next: Locale) => {
    setLocaleState(next)
    storeLocale(slug, next)
  }

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: (key: string, params?: Record<string, string | number>) => translate(locale, key, params),
    }),
    [locale]
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider')
  return ctx
}

export function useOptionalLocale() {
  return useContext(LocaleContext)
}
