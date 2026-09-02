import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  applyConsent,
  getStoredConsent,
  hasConsentDecision,
  saveConsent,
  type CookieConsent,
} from '../lib/cookie-consent'

interface CookieConsentContextValue {
  consent: CookieConsent | null
  hasDecision: boolean
  settingsOpen: boolean
  openSettings: () => void
  closeSettings: () => void
  acceptAll: () => void
  acceptEssentialOnly: () => void
  saveExternalPreference: (external: boolean) => void
}

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null)

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<CookieConsent | null>(() => getStoredConsent())
  const [hasDecision, setHasDecision] = useState(() => hasConsentDecision())
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    if (consent) applyConsent(consent)
  }, [consent])

  const persist = useCallback((external: boolean) => {
    const next = saveConsent(external)
    setConsent(next)
    setHasDecision(true)
    setSettingsOpen(false)
    applyConsent(next)
  }, [])

  const value = useMemo(
    () => ({
      consent,
      hasDecision,
      settingsOpen,
      openSettings: () => setSettingsOpen(true),
      closeSettings: () => setSettingsOpen(false),
      acceptAll: () => persist(true),
      acceptEssentialOnly: () => persist(false),
      saveExternalPreference: (external: boolean) => persist(external),
    }),
    [consent, hasDecision, settingsOpen, persist]
  )

  return <CookieConsentContext.Provider value={value}>{children}</CookieConsentContext.Provider>
}

export function useCookieConsent() {
  const ctx = useContext(CookieConsentContext)
  if (!ctx) throw new Error('useCookieConsent must be used within CookieConsentProvider')
  return ctx
}

export function useOptionalCookieConsent() {
  return useContext(CookieConsentContext)
}
