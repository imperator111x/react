import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useLocale } from '../context/LocaleContext'
import { getGalleryImageUrl } from '../lib/gallery'
import type { GalleryImage } from '../types/wedding'

interface GallerySectionProps {
  images: GalleryImage[]
}

export default function GallerySection({ images }: GallerySectionProps) {
  const { t } = useLocale()
  const [lightbox, setLightbox] = useState<GalleryImage | null>(null)

  useEffect(() => {
    if (!lightbox) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox])

  if (images.length === 0) return null

  return (
    <>
      <section className="py-20 relative" aria-labelledby="gallery-heading">
        <div className="max-w-4xl mx-auto px-4">
          <div className="invitation-ornament mb-10">
            <h2 id="gallery-heading" className="font-serif text-3xl sm:text-4xl font-semibold text-charcoal text-center">
              {t('gallery.title')}
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => setLightbox(image)}
                className={`group relative overflow-hidden rounded-2xl bg-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 ${
                  index === 0 && images.length >= 3 ? 'md:col-span-2 md:row-span-2 aspect-square' : 'aspect-square'
                }`}
              >
                <img
                  src={getGalleryImageUrl(image.storage_path)}
                  alt={image.caption || t('gallery.title')}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/10 transition-colors" aria-hidden />
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
          aria-label={lightbox.caption || t('gallery.title')}
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            aria-label={t('common.close')}
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={getGalleryImageUrl(lightbox.storage_path)}
            alt={lightbox.caption || t('gallery.title')}
            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
