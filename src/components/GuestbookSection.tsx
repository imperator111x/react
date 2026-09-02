import { useState } from 'react'
import { format } from 'date-fns'
import { BookHeart, Loader2, MessageSquare } from 'lucide-react'
import Button from './Button'
import Input from './Input'
import Textarea from './Textarea'
import { useLocale } from '../context/LocaleContext'
import { getDateFnsLocale } from '../i18n'
import { createGuestbookEntry } from '../lib/guestbook'
import type { Guest, GuestbookEntry } from '../types/wedding'

interface GuestbookSectionProps {
  weddingId: string
  entries: GuestbookEntry[]
  invitedGuest?: Guest | null
  isDemo?: boolean
  onEntryAdded?: () => void
}

export default function GuestbookSection({
  weddingId,
  entries,
  invitedGuest,
  isDemo = false,
  onEntryAdded,
}: GuestbookSectionProps) {
  const { t, locale } = useLocale()
  const visibleEntries = entries.filter((e) => e.is_visible)
  const [name, setName] = useState(invitedGuest?.name ?? '')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !message.trim()) {
      setError(t('guestbook.fillRequired'))
      return
    }

    if (isDemo) {
      setSubmitted(true)
      return
    }

    setSubmitting(true)
    setError('')
    try {
      await createGuestbookEntry(weddingId, {
        guest_name: name.trim(),
        message: message.trim(),
        guest_id: invitedGuest?.id,
      })
      setMessage('')
      setSubmitted(true)
      onEntryAdded?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('guestbook.submitError'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="py-20 relative">
      <div className="max-w-2xl mx-auto px-4">
        <div className="invitation-ornament mb-10 text-center">
          <BookHeart className="w-7 h-7 text-gold mx-auto mb-4" />
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-charcoal">{t('guestbook.title')}</h2>
          <p className="text-warm-gray mt-3">{t('guestbook.subtitle')}</p>
        </div>

        {visibleEntries.length > 0 && (
          <ul className="space-y-4 mb-10">
            {visibleEntries.map((entry) => (
              <li
                key={entry.id}
                className="p-6 rounded-2xl bg-white border border-cream-dark shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-charcoal">{entry.guest_name}</p>
                    <p className="text-warm-gray mt-2 leading-relaxed italic">„{entry.message}"</p>
                    <p className="text-xs text-warm-gray/70 mt-3">
                      {format(new Date(entry.created_at), 'd. MMMM yyyy', {
                        locale: getDateFnsLocale(locale),
                      })}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {submitted && !message ? (
          <div className="text-center p-6 rounded-2xl bg-sage/10 border border-sage/20">
            <p className="text-sage font-medium">{t('guestbook.thanks')}</p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl p-6 border border-cream-dark space-y-4"
          >
            <Input
              label={t('guestbook.name')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              readOnly={Boolean(invitedGuest)}
              className={invitedGuest ? 'bg-cream cursor-default' : ''}
              required
            />
            <Textarea
              label={t('guestbook.message')}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder={t('guestbook.messagePlaceholder')}
              required
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('guestbook.sending')}
                </>
              ) : (
                t('guestbook.submit')
              )}
            </Button>
          </form>
        )}
      </div>
    </section>
  )
}
