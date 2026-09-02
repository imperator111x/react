import { Link } from 'react-router-dom'
import { Heart, Home } from 'lucide-react'
import Button from './Button'

interface NotFoundStateProps {
  title?: string
  description?: string
  homeLabel?: string
}

export default function NotFoundState({
  title = 'Seite nicht gefunden',
  description = 'Diese Seite existiert leider nicht – vielleicht ist der Link veraltet oder falsch geschrieben.',
  homeLabel = 'Zur Startseite',
}: NotFoundStateProps) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-gold tracking-[0.35em] uppercase text-xs font-medium mb-4">404</p>
      <Heart className="w-12 h-12 text-gold/30 mb-6" aria-hidden />
      <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-charcoal mb-3">{title}</h1>
      <p className="text-warm-gray max-w-md leading-relaxed mb-8">{description}</p>
      <Link to="/">
        <Button>
          <Home className="w-4 h-4" aria-hidden />
          {homeLabel}
        </Button>
      </Link>
    </div>
  )
}
