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
      </div>
    </footer>
  )
}
