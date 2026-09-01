import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-cream/90 backdrop-blur-md border-b border-cream-dark">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <Heart className="w-5 h-5 text-gold fill-gold/20 group-hover:fill-gold/40 transition-colors" />
          <span className="font-serif text-xl font-semibold text-charcoal">UnsereHochzeit</span>
        </Link>
        <div className="flex items-center gap-3 sm:gap-6">
          <Link
            to="/#features"
            className="hidden sm:inline text-sm text-warm-gray hover:text-charcoal transition-colors"
          >
            Funktionen
          </Link>
          <Link
            to="/erstellen"
            className="text-sm font-medium bg-gold hover:bg-gold-dark text-white px-4 py-2 rounded-full transition-colors"
          >
            Kostenlos starten
          </Link>
        </div>
      </nav>
    </header>
  )
}
