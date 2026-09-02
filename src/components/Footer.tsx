import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-charcoal text-cream/80 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-gold fill-gold/30" />
            <span className="font-serif text-lg text-cream">UnsereHochzeit</span>
          </div>
          <p className="text-sm text-cream/60 text-center">
            Kostenlose digitale Hochzeitseinladungen – mit Liebe gemacht.
          </p>
        </div>

        <nav
          className="mt-8 pt-6 border-t border-cream/10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm"
          aria-label="Rechtliches"
        >
          <Link to="/impressum" className="text-cream/70 hover:text-gold transition-colors">
            Impressum
          </Link>
          <Link to="/datenschutz" className="text-cream/70 hover:text-gold transition-colors">
            Datenschutz
          </Link>
        </nav>
      </div>
    </footer>
  )
}
