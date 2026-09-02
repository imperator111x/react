import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Camera, Heart, Loader2 } from 'lucide-react'
import { getGuestPhotoUrl, subscribeGuestPhotos } from '../lib/guest-photos'
import { getWeddingBySlug } from '../lib/supabase'
import { DEMO_WEDDING } from '../lib/demo'
import { LocaleProvider, useLocale } from '../context/LocaleContext'
import NotFoundState from '../components/NotFoundState'
import type { GuestPhoto, Wedding } from '../types/wedding'

export default function LivePhotoWallPage() {
  const { slug } = useParams<{ slug: string }>()
  return (
    <LocaleProvider slug={slug ?? 'demo'}>
      <LivePhotoWallContent />
    </LocaleProvider>
  )
}

function LivePhotoWallContent() {
  const { slug } = useParams<{ slug: string }>()
  const { t } = useLocale()
  const [wedding, setWedding] = useState<Wedding | null>(null)
  const [photos, setPhotos] = useState<GuestPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [highlightId, setHighlightId] = useState<string | null>(null)
  const [heroIndex, setHeroIndex] = useState(0)
  const knownIdsRef = useRef<Set<string>>(new Set())

  const isDemo = slug === 'demo'

  useEffect(() => {
    async function load() {
      if (isDemo) {
        setWedding(DEMO_WEDDING)
        setLoading(false)
        return
      }
      const data = await getWeddingBySlug(slug!)
      setWedding(data)
      setLoading(false)
    }
    void load()
  }, [slug, isDemo])

  useEffect(() => {
    if (!wedding || isDemo) return

    return subscribeGuestPhotos(wedding.id, (next) => {
      const prevIds = knownIdsRef.current
      const incoming = next.filter((p) => !prevIds.has(p.id))
      knownIdsRef.current = new Set(next.map((p) => p.id))

      if (incoming.length > 0 && prevIds.size > 0) {
        setHighlightId(incoming[0].id)
        setHeroIndex(0)
        window.setTimeout(() => setHighlightId(null), 4000)
      }

      setPhotos(next)
    })
  }, [wedding, isDemo])

  const sortedPhotos = useMemo(
    () => [...photos].sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [photos]
  )

  const heroPhotos = sortedPhotos.slice(0, 8)
  const heroPhoto = heroPhotos[heroIndex % Math.max(heroPhotos.length, 1)]

  useEffect(() => {
    if (heroPhotos.length <= 1) return
    const timer = window.setInterval(() => {
      setHeroIndex((i) => (i + 1) % heroPhotos.length)
    }, 7000)
    return () => window.clearInterval(timer)
  }, [heroPhotos.length])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') {
        void document.documentElement.requestFullscreen?.()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (loading) {
    return (
      <div className="live-wall live-wall--loading">
        <Loader2 className="w-10 h-10 text-gold animate-spin" aria-label={t('common.loading')} />
      </div>
    )
  }

  if (!wedding) {
    return (
      <NotFoundState
        title={t('common.notFound')}
        description={t('common.notFoundDesc')}
        homeLabel={t('common.backHome')}
      />
    )
  }

  return (
    <div className="live-wall">
      <header className="live-wall__header">
        <div className="live-wall__brand">
          <Heart className="w-5 h-5 text-gold fill-gold/30" aria-hidden />
          <span>
            {wedding.partner1_name} <span className="text-gold">&</span> {wedding.partner2_name}
          </span>
        </div>
        <div className="live-wall__meta">
          <span className="live-wall__live" aria-live="polite">
            <span className="live-wall__live-dot" aria-hidden />
            {t('liveWall.live')}
          </span>
          <span className="live-wall__count">
            <Camera className="w-4 h-4" aria-hidden />
            {sortedPhotos.length}
          </span>
        </div>
      </header>

      {isDemo && (
        <p className="live-wall__demo-hint">{t('liveWall.demoHint')}</p>
      )}

      {sortedPhotos.length === 0 ? (
        <div className="live-wall__empty">
          <Camera className="w-16 h-16 text-gold/40 mb-6" aria-hidden />
          <h1 className="font-serif text-3xl sm:text-4xl text-cream mb-3">{t('liveWall.title')}</h1>
          <p className="text-cream/60 max-w-md text-center leading-relaxed">{t('liveWall.empty')}</p>
        </div>
      ) : (
        <div className="live-wall__layout">
          <div className="live-wall__hero" aria-live="polite">
            {heroPhoto && (
              <figure
                key={heroPhoto.id}
                className={`live-wall__hero-frame ${
                  highlightId === heroPhoto.id ? 'live-wall__hero-frame--new' : ''
                }`}
              >
                <img
                  src={getGuestPhotoUrl(heroPhoto.storage_path)}
                  alt={heroPhoto.caption || heroPhoto.guest_name}
                />
                <figcaption>
                  <span className="live-wall__caption-name">{heroPhoto.guest_name}</span>
                  {heroPhoto.caption && (
                    <span className="live-wall__caption-text">{heroPhoto.caption}</span>
                  )}
                </figcaption>
              </figure>
            )}
          </div>

          <div className="live-wall__grid" aria-label={t('liveWall.title')}>
            {sortedPhotos.map((photo) => (
              <figure
                key={photo.id}
                className={`live-wall__tile ${highlightId === photo.id ? 'live-wall__tile--new' : ''}`}
              >
                <img
                  src={getGuestPhotoUrl(photo.storage_path)}
                  alt={photo.caption || photo.guest_name}
                  loading="lazy"
                />
                <figcaption>{photo.guest_name}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      )}

      <p className="live-wall__hint">{t('liveWall.fullscreenHint')}</p>
    </div>
  )
}
