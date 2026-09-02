import { Link } from 'react-router-dom'
import { legalConfig } from '../lib/legal-config'

type LegalFooterVariant = 'dark' | 'light'

interface LegalFooterLinksProps {
  variant?: LegalFooterVariant
  className?: string
  impressumLabel?: string
  privacyLabel?: string
  websiteLabel?: string
}

const linkStyles: Record<LegalFooterVariant, string> = {
  dark: 'text-cream/70 hover:text-gold transition-colors',
  light: 'text-warm-gray hover:text-gold transition-colors',
}

export default function LegalFooterLinks({
  variant = 'dark',
  className = 'flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm',
  impressumLabel = 'Impressum',
  privacyLabel = 'Datenschutz',
  websiteLabel = legalConfig.siteName,
}: LegalFooterLinksProps) {
  const linkClass = linkStyles[variant]

  return (
    <nav className={className} aria-label="Rechtliches">
      <Link to="/" className={linkClass}>
        {websiteLabel}
      </Link>
      <Link to="/impressum" className={linkClass}>
        {impressumLabel}
      </Link>
      <Link to="/datenschutz" className={linkClass}>
        {privacyLabel}
      </Link>
    </nav>
  )
}
