import { useState } from 'react'
import { format } from 'date-fns'
import { Loader2, Music } from 'lucide-react'
import Button from './Button'
import Input from './Input'
import { useLocale } from '../context/LocaleContext'
import { getDateFnsLocale } from '../i18n'
import { createMusicWish } from '../lib/music-wishes'
import type { Guest, MusicWish } from '../types/wedding'

interface MusicWishSectionProps {
  weddingId: string
  wishes: MusicWish[]
  invitedGuest?: Guest | null
  isDemo?: boolean
  onUpdate?: () => void
}

export default function MusicWishSection({
  weddingId,
  wishes,
  invitedGuest,
  isDemo = false,
  onUpdate,
}: MusicWishSectionProps) {
  const { t, locale } = useLocale()
  const [guestName, setGuestName] = useState(invitedGuest?.name ?? '')
  const [songTitle, setSongTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!guestName.trim() || !songTitle.trim()) {
      setError(t('music.fillRequired'))
      return
    }

    if (isDemo) {
      setSubmitted(true)
      setSongTitle('')
      setArtist('')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      await createMusicWish(weddingId, {
        guest_name: guestName.trim(),
        song_title: songTitle.trim(),
        artist: artist.trim() || undefined,
        guest_id: invitedGuest?.id,
      })
      setSongTitle('')
      setArtist('')
      setSubmitted(true)
      onUpdate?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('music.submitError'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="py-20 bg-cream/50">
      <div className="max-w-2xl mx-auto px-4">
        <div className="invitation-ornament mb-10 text-center">
          <Music className="w-7 h-7 text-gold mx-auto mb-4" />
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-charcoal">{t('music.title')}</h2>
          <p className="text-warm-gray mt-3">{t('music.subtitle')}</p>
        </div>

        {wishes.length > 0 && (
          <ul className="space-y-3 mb-10">
            {wishes.map((wish) => (
              <li
                key={wish.id}
                className="p-4 rounded-2xl bg-white border border-cream-dark flex flex-col sm:flex-row sm:items-center gap-2"
              >
                <div className="flex-1">
                  <p className="font-medium text-charcoal">{wish.song_title}</p>
                  {wish.artist && <p className="text-sm text-warm-gray">{wish.artist}</p>}
                  <p className="text-xs text-warm-gray mt-1">
                    {wish.guest_name} ·{' '}
                    {format(new Date(wish.created_at), 'd. MMM yyyy', { locale: getDateFnsLocale(locale) })}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-white border border-cream-dark space-y-4">
          <Input
            label={t('music.yourName')}
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder={t('rsvp.namePlaceholder')}
          />
          <Input
            label={t('music.songTitle')}
            value={songTitle}
            onChange={(e) => setSongTitle(e.target.value)}
            placeholder={t('music.songPlaceholder')}
            required
          />
          <Input
            label={t('music.artist')}
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder={t('music.artistPlaceholder')}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          {submitted && <p className="text-sm text-sage">{t('music.thanks')}</p>}
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('music.sending')}
              </>
            ) : (
              t('music.submit')
            )}
          </Button>
        </form>
      </div>
    </section>
  )
}
