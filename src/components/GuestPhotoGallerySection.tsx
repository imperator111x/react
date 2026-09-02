import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useLocale } from '../context/LocaleContext'
import { getGuestPhotoUrl } from '../lib/guest-photos'
import type { GuestPhoto } from '../types/wedding'

interface GuestPhotoGallerySectionProps {
  photos: GuestPhoto[]
  showPendingNote?: boolean
}

export default function GuestPhotoGallerySection({
  photos,
  showPendingNote = false,
}: GuestPhotoGallerySectionProps) {
  const { t } = useLocale()
  const [lightbox, setLightbox] = useState<GuestPhoto | null>(null)

  useEffect(() => {
    if (!lightbox) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox])

  if (photos.length === 0) {
    if (!showPendingNote) return null
    return (
      <section className="py-12 px-4 text-center">
        <p className="text-warm-gray">{t('guestPhotos.emptyPublic')}</p>
      </section>
    )
  }

  return (
    <>
      <section className="py-16 relative" aria-labelledby="guest-photos-heading">
        <div className="max-w-4xl mx-auto px-4">
          <div className="invitation-ornament mb-8">
            <h2 id="guest-photos-heading" className="font-serif text-3xl sm:text-4xl font-semibold text-charcoal text-center">
              {t('guestPhotos.title')}
            </h2>
          </div>
          {showPendingNote && (
            <p className="text-center text-warm-gray text-sm mb-8">{t('guestPhotos.pendingNote')}</p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {photos.map((photo) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setLightbox(photo)}
                className="group relative overflow-hidden rounded-2xl bg-cream aspect-square focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
              >
                <img
                  src={getGuestPhotoUrl(photo.storage_path)}
                  alt={photo.caption || photo.guest_name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      {lightbox && (
        <div
          className="fixed inset-0 z-[200] bg-charcoal/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.caption || t('guestPhotos.title')}
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            aria-label={t('common.close')}
          >
            <X className="w-6 h-6" />
          </button>
          <figure onClick={(e) => e.stopPropagation()}>
            <img
              src={getGuestPhotoUrl(lightbox.storage_path)}
              alt={lightbox.caption || lightbox.guest_name}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
            {(lightbox.caption || lightbox.guest_name) && (
              <figcaption className="text-center text-white/80 mt-3 text-sm">
                {lightbox.caption ? `${lightbox.caption} · ${lightbox.guest_name}` : lightbox.guest_name}
              </figcaption>
            )}
          </figure>
        </div>
      )}
    </>
  )
}
