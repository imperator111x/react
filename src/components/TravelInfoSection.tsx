import { Car, Hotel } from 'lucide-react'
import { useLocale } from '../context/LocaleContext'

interface TravelInfoSectionProps {
  travelInfo: string
}

export default function TravelInfoSection({ travelInfo }: TravelInfoSectionProps) {
  const { t } = useLocale()
  const paragraphs = travelInfo.trim().split(/\n\n+/).filter(Boolean)
  if (paragraphs.length === 0) return null

  return (
    <section className="py-20 bg-white">
      <div className="max-w-2xl mx-auto px-4">
        <div className="invitation-ornament mb-10 text-center">
          <Hotel className="w-7 h-7 text-gold mx-auto mb-4" />
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-charcoal">
            {t('travel.title')}
          </h2>
        </div>

        <div className="space-y-6">
          {paragraphs.map((paragraph, index) => (
            <div
              key={index}
              className="flex gap-5 p-6 rounded-2xl bg-cream border border-cream-dark/80"
            >
              <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                {index === 0 ? (
                  <Hotel className="w-5 h-5 text-gold" />
                ) : (
                  <Car className="w-5 h-5 text-gold" />
                )}
              </div>
              <p className="text-warm-gray leading-relaxed whitespace-pre-line">{paragraph.trim()}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
