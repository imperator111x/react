import { ExternalLink, Gift } from 'lucide-react'
import { useLocale } from '../context/LocaleContext'
import type { WishlistItem } from '../types/wedding'

interface WishlistSectionProps {
  items: WishlistItem[]
}

export default function WishlistSection({ items }: WishlistSectionProps) {
  const { t } = useLocale()

  if (items.length === 0) return null

  return (
    <section className="py-20 bg-white">
      <div className="max-w-2xl mx-auto px-4">
        <div className="invitation-ornament mb-10 text-center">
          <Gift className="w-7 h-7 text-gold mx-auto mb-4" />
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-charcoal">{t('wishlist.title')}</h2>
          <p className="text-warm-gray mt-3">{t('wishlist.subtitle')}</p>
        </div>

        <ul className="space-y-4">
          {items.map((item) => (
            <li
              key={item.id}
              className="p-6 rounded-2xl bg-cream border border-cream-dark hover:shadow-sm transition-shadow"
            >
              {item.url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-serif text-xl font-semibold text-gold hover:text-gold-dark inline-flex items-center gap-2"
                >
                  {item.title}
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <p className="font-serif text-xl font-semibold text-charcoal">{item.title}</p>
              )}
              {item.description && (
                <p className="text-warm-gray mt-2 text-sm leading-relaxed">{item.description}</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
