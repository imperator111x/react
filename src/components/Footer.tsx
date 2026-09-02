import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useCookieConsent } from '../context/CookieConsentContext'
import LegalFooterLinks from './LegalFooterLinks'

export default function Footer() {
  const { openSettings } = useCookieConsent()

  return (
    <footer className="bg-charcoal text-cream/80 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2 group">
            <Heart className="w-4 h-4 text-gold fill-gold/30" />
            <span className="font-serif text-lg text-cream group-hover:text-gold transition-colors">
              UnsereHochzeit
            </span>
          </Link>
          <p className="text-sm text-cream/60 text-center">
            Kostenlose digitale Hochzeitseinladungen – mit Liebe gemacht.
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-cream/10 flex flex-col items-center gap-4">
          <LegalFooterLinks variant="dark" />
          <button
            type="button"
            onClick={openSettings}
            className="text-sm text-cream/70 hover:text-gold transition-colors"
          >
            Cookie-Einstellungen
          </button>
        </div>
      </div>
    </footer>
  )
}
