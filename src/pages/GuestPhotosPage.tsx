import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Camera, CheckCircle, Heart, Loader2, Upload } from 'lucide-react'
import WeddingThemeWrapper from '../components/WeddingThemeWrapper'
import LanguageSwitcher from '../components/LanguageSwitcher'
import SkipLink from '../components/SkipLink'
import CreatedWithCredit from '../components/CreatedWithCredit'
import LegalFooterLinks from '../components/LegalFooterLinks'
import Input from '../components/Input'
import Textarea from '../components/Textarea'
import Button from '../components/Button'
import { LocaleProvider, useLocale } from '../context/LocaleContext'
import { getGuestByInviteToken, getWeddingBySlug } from '../lib/supabase'
import { uploadGuestPhoto } from '../lib/guest-photos'
import { ALLOWED_IMAGE_TYPES, MAX_GALLERY_FILE_SIZE } from '../lib/gallery'
import { DEMO_WEDDING } from '../lib/demo'
import { DEMO_GUEST } from '../lib/demo-guest'
import type { Guest, Wedding } from '../types/wedding'

export default function GuestPhotosPage() {
  const { slug } = useParams<{ slug: string }>()
  return (
    <LocaleProvider slug={slug ?? 'demo'}>
      <GuestPhotosContent />
    </LocaleProvider>
  )
}

function GuestPhotosContent() {
  const { slug, guestToken } = useParams<{ slug: string; guestToken?: string }>()
  const { t } = useLocale()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [wedding, setWedding] = useState<Wedding | null>(null)
  const [guest, setGuest] = useState<Guest | null>(null)
  const [loading, setLoading] = useState(true)
  const [guestName, setGuestName] = useState('')
  const [caption, setCaption] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const isDemo = slug === 'demo'
  const inviteBase = import.meta.env.BASE_URL.replace(/\/$/, '')
  const invitationPath = guestToken
    ? `${inviteBase}/e/${slug}/g/${guestToken}`
    : `${inviteBase}/e/${slug}`

  useEffect(() => {
    async function load() {
      if (isDemo) {
        setWedding(DEMO_WEDDING)
        if (guestToken) {
          setGuest(DEMO_GUEST)
          setGuestName(DEMO_GUEST.name)
        }
        setLoading(false)
        return
      }

      const data = await getWeddingBySlug(slug!)
      setWedding(data)
      if (data && guestToken) {
        const g = await getGuestByInviteToken(data.id, guestToken)
        if (g) {
          setGuest(g)
          setGuestName(g.name)
        }
      }
      setLoading(false)
    }
    load()
  }, [slug, guestToken, isDemo])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files ?? [])
    const valid = list.filter(
      (f) => ALLOWED_IMAGE_TYPES.includes(f.type) && f.size <= MAX_GALLERY_FILE_SIZE
    )
    setSelectedFiles(valid)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!wedding) return

    if (!guestName.trim() || selectedFiles.length === 0) {
      setError(t('guestPhotos.fillRequired'))
      return
    }

    if (isDemo) {
      setDone(true)
      return
    }

    setUploading(true)
    setError('')

    try {
      for (const file of selectedFiles) {
        await uploadGuestPhoto(wedding.id, file, {
          guest_name: guestName.trim(),
          caption: caption.trim() || undefined,
          guest_id: guest?.id,
        })
      }
      setDone(true)
      setSelectedFiles([])
      setCaption('')
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err) {
      setError(err instanceof Error ? err.message : t('guestPhotos.uploadError'))
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold animate-spin" aria-label={t('common.loading')} />
      </div>
    )
  }

  if (!wedding) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <Heart className="w-12 h-12 text-gold/30 mb-4" aria-hidden />
        <h1 className="font-serif text-3xl font-semibold text-charcoal mb-2">{t('common.notFound')}</h1>
        <p className="text-warm-gray">{t('common.notFoundDesc')}</p>
      </div>
    )
  }

  return (
    <WeddingThemeWrapper themeId={wedding.theme_id} className="min-h-screen">
      <SkipLink />
      <LanguageSwitcher />
      <main id="main-content" className="min-h-screen py-12 px-4">
        <div className="max-w-lg mx-auto">
          <Link
            to={invitationPath}
            className="inline-flex items-center gap-2 text-warm-gray hover:text-gold text-sm mb-8 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 rounded"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden />
            {t('guestPhotos.backToInvitation')}
          </Link>

          <div className="text-center mb-10">
            <Camera className="w-10 h-10 text-gold mx-auto mb-4" aria-hidden />
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-charcoal mb-3">
              {t('guestPhotos.pageTitle')}
            </h1>
            <p className="text-warm-gray leading-relaxed">{t('guestPhotos.subtitle')}</p>
            <p className="mt-2 text-sm text-charcoal font-serif italic">
              {wedding.partner1_name} & {wedding.partner2_name}
            </p>
          </div>

          {done ? (
            <div className="bg-white rounded-2xl border border-cream-dark p-8 text-center shadow-sm">
              <CheckCircle className="w-12 h-12 text-sage mx-auto mb-4" aria-hidden />
              <p className="text-charcoal leading-relaxed">{t('guestPhotos.thanks')}</p>
              <Button
                type="button"
                variant="outline"
                className="mt-6"
                onClick={() => setDone(false)}
              >
                {t('guestPhotos.selectPhotos')}
              </Button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl border border-cream-dark p-6 sm:p-8 shadow-sm space-y-5"
            >
              <Input
                label={t('guestPhotos.yourName')}
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder={t('guestPhotos.namePlaceholder')}
                required
                disabled={Boolean(guest)}
              />
              <Textarea
                label={t('guestPhotos.caption')}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder={t('guestPhotos.captionPlaceholder')}
                rows={2}
              />

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  {t('guestPhotos.selectPhotos')}
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ALLOWED_IMAGE_TYPES.join(',')}
                  multiple
                  onChange={handleFileChange}
                  className="block w-full text-sm text-warm-gray file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-gold/10 file:text-charcoal hover:file:bg-gold/20"
                />
                {selectedFiles.length > 0 && (
                  <p className="mt-2 text-sm text-warm-gray">
                    {t('guestPhotos.photosSelected', { count: selectedFiles.length })}
                  </p>
                )}
              </div>

              {error && (
                <p className="text-red-500 text-sm" role="alert">
                  {error}
                </p>
              )}

              <Button type="submit" disabled={uploading} className="w-full">
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" aria-hidden />
                    {t('guestPhotos.uploading')}
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" aria-hidden />
                    {t('guestPhotos.upload')}
                  </>
                )}
              </Button>
            </form>
          )}
        </div>

        <footer className="mt-16 pt-8 border-t border-cream-dark text-center">
          <CreatedWithCredit />
          <LegalFooterLinks
            variant="light"
            className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs"
            impressumLabel={t('footer.impressum')}
            privacyLabel={t('footer.privacy')}
            websiteLabel={t('footer.website')}
          />
        </footer>
      </main>
    </WeddingThemeWrapper>
  )
}
