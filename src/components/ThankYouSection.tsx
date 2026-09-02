import { Link } from 'react-router-dom'
import { Camera, Heart } from 'lucide-react'
import { useLocale } from '../context/LocaleContext'
import GuestPhotoGallerySection from './GuestPhotoGallerySection'
import CreatedWithCredit from './CreatedWithCredit'
import LegalFooterLinks from './LegalFooterLinks'
import type { GuestPhoto, Wedding } from '../types/wedding'

interface ThankYouSectionProps {
  wedding: Wedding
  guestPhotos: GuestPhoto[]
  slug: string
}

export default function ThankYouSection({ wedding, guestPhotos, slug }: ThankYouSectionProps) {
  const { t } = useLocale()
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  const photosPath = `${base}/e/${slug}/fotos`

  return (
    <main id="main-content">
      <section className="py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blush/30 via-cream to-cream" aria-hidden />
        <div className="relative max-w-2xl mx-auto px-4 text-center">
          <Heart className="w-10 h-10 text-gold mx-auto mb-6" aria-hidden />
          <p className="text-gold uppercase tracking-[0.35em] text-xs font-medium mb-4">
            {wedding.partner1_name} & {wedding.partner2_name}
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-charcoal mb-6">
            {t('thankYou.title')}
          </h1>
          <p className="text-xl text-charcoal font-light mb-4">{t('thankYou.subtitle')}</p>
          <p className="text-warm-gray leading-relaxed max-w-lg mx-auto mb-10">{t('thankYou.message')}</p>
          <Link
            to={photosPath}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold text-white font-medium hover:bg-gold-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
          >
            <Camera className="w-5 h-5" aria-hidden />
            {t('thankYou.uploadPhotos')}
          </Link>
        </div>
      </section>

      <GuestPhotoGallerySection photos={guestPhotos} showPendingNote />

      <footer className="py-10 text-center text-warm-gray text-sm border-t border-cream-dark">
        <CreatedWithCredit className="text-xs opacity-60" />
        <LegalFooterLinks
          variant="light"
          className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs"
          impressumLabel={t('footer.impressum')}
          privacyLabel={t('footer.privacy')}
          websiteLabel={t('footer.website')}
        />
      </footer>
    </main>
  )
}
