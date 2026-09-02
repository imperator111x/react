import { Navigation } from 'lucide-react'
import { useLocale } from '../context/LocaleContext'
import { getGoogleMapsUrl, getOpenStreetMapUrl } from '../lib/maps'

interface LocationMapsLinksProps {
  address?: string | null
  location?: string | null
  className?: string
}

export default function LocationMapsLinks({
  address,
  location,
  className = 'mt-4 flex flex-wrap gap-2',
}: LocationMapsLinksProps) {
  const { t } = useLocale()
  const googleUrl = getGoogleMapsUrl(address, location)
  const osmUrl = getOpenStreetMapUrl(address, location)

  if (!googleUrl && !osmUrl) return null

  return (
    <div className={className}>
      {googleUrl && (
        <a
          href={googleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gold/10 text-gold border border-gold/20 hover:bg-gold/15 transition-colors"
        >
          <Navigation className="w-3.5 h-3.5" />
          {t('hero.routePlan')}
        </a>
      )}
      {osmUrl && (
        <a
          href={osmUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-cream text-warm-gray border border-cream-dark hover:bg-cream-dark/50 transition-colors"
        >
          {t('hero.openStreetMap')}
        </a>
      )}
    </div>
  )
}
