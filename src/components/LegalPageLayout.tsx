import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

interface LegalPageLayoutProps {
  title: string
  children: ReactNode
}

export default function LegalPageLayout({ title, children }: LegalPageLayoutProps) {
  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <Link
          to="/"
          className="inline-flex text-sm text-warm-gray hover:text-gold transition-colors mb-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 rounded"
        >
          ← Zurück zur Startseite
        </Link>

        <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-charcoal mb-8">{title}</h1>

        <div className="legal-content space-y-6 text-charcoal/90 leading-relaxed">{children}</div>
      </div>
    </div>
  )
}
