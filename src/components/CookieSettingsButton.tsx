import { Cookie } from 'lucide-react'
import { useOptionalCookieConsent } from '../context/CookieConsentContext'

export default function CookieSettingsButton() {
  const consent = useOptionalCookieConsent()
  if (!consent?.hasDecision) return null

  return (
    <button
      type="button"
      onClick={consent.openSettings}
      className="fixed bottom-4 left-4 z-[400] p-2.5 rounded-full bg-white/95 border border-cream-dark shadow-md text-warm-gray hover:text-gold hover:border-gold/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
      aria-label="Cookie-Einstellungen öffnen"
      title="Cookie-Einstellungen"
    >
      <Cookie className="w-5 h-5" aria-hidden />
    </button>
  )
}
