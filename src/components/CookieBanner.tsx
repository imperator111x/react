import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Cookie, X } from 'lucide-react'
import Button from './Button'
import { useCookieConsent } from '../context/CookieConsentContext'

export default function CookieBanner() {
  const {
    hasDecision,
    settingsOpen,
    openSettings,
    closeSettings,
    acceptAll,
    acceptEssentialOnly,
    saveExternalPreference,
    consent,
  } = useCookieConsent()

  const [externalEnabled, setExternalEnabled] = useState(consent?.external ?? false)

  useEffect(() => {
    if (settingsOpen) {
      setExternalEnabled(consent?.external ?? false)
    }
  }, [settingsOpen, consent?.external])

  const visible = !hasDecision || settingsOpen
  if (!visible) return null

  const showDetails = settingsOpen

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[500] p-4 sm:p-6 pointer-events-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-desc"
    >
      <div className="max-w-3xl mx-auto pointer-events-auto bg-white border border-cream-dark shadow-2xl rounded-2xl p-5 sm:p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
            <Cookie className="w-5 h-5 text-gold" aria-hidden />
          </div>
          <div className="flex-1 min-w-0">
            <h2 id="cookie-banner-title" className="font-serif text-xl font-semibold text-charcoal pr-8">
              {showDetails ? 'Cookie-Einstellungen' : 'Datenschutz & Cookies'}
            </h2>
            <p id="cookie-banner-desc" className="text-sm text-warm-gray mt-2 leading-relaxed">
              {showDetails
                ? 'Wählt, welche Kategorien wir verwenden dürfen. Notwendige Speicherung ist für den Betrieb der Website erforderlich.'
                : 'Wir verwenden technisch notwendige Speicher (z. B. Sprache, Umschlag-Status). Externe Schriftarten (Google Fonts) laden wir nur mit eurer Einwilligung.'}{' '}
              <Link to="/datenschutz" className="text-gold hover:underline">
                Mehr in der Datenschutzerklärung
              </Link>
            </p>
          </div>
          {showDetails && (
            <button
              type="button"
              onClick={closeSettings}
              className="p-1.5 rounded-full text-warm-gray hover:text-charcoal hover:bg-cream transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
              aria-label="Einstellungen schließen"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {showDetails && (
          <div className="space-y-4 mb-5 border-t border-cream-dark pt-4">
            <ConsentRow
              title="Notwendig"
              description="Sprache, Umschlag-Status, Bot-Prüfung, Cookie-Einstellungen – für die Grundfunktionen."
              checked
              disabled
            />
            <ConsentRow
              title="Externe Schriftarten"
              description="Google Fonts (Cormorant Garamond & Inter). Dabei kann die IP-Adresse an Google übermittelt werden."
              checked={externalEnabled}
              onChange={setExternalEnabled}
            />
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
          {showDetails ? (
            <>
              <Button type="button" variant="outline" onClick={acceptEssentialOnly}>
                Nur notwendige
              </Button>
              <Button type="button" onClick={() => saveExternalPreference(externalEnabled)}>
                Auswahl speichern
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={openSettings}>
                Einstellungen
              </Button>
              <Button type="button" variant="outline" onClick={acceptEssentialOnly}>
                Nur notwendige
              </Button>
              <Button type="button" onClick={acceptAll}>
                Alle akzeptieren
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function ConsentRow({
  title,
  description,
  checked,
  disabled,
  onChange,
}: {
  title: string
  description: string
  checked: boolean
  disabled?: boolean
  onChange?: (value: boolean) => void
}) {
  return (
    <label className={`flex gap-3 items-start ${disabled ? 'opacity-80' : 'cursor-pointer'}`}>
      <input
        type="checkbox"
        className="mt-1 accent-[var(--color-gold)]"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <span>
        <span className="block text-sm font-medium text-charcoal">{title}</span>
        <span className="block text-xs text-warm-gray mt-0.5 leading-relaxed">{description}</span>
      </span>
    </label>
  )
}
