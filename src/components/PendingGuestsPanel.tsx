import { Bell, Copy, Link2 } from 'lucide-react'
import Button from './Button'
import WhatsAppShareButton from './WhatsAppShareButton'
import { getGuestInviteUrl } from '../lib/guests'
import { getReminderMessage } from '../lib/guest-export'
import type { GuestWithRsvp, Wedding } from '../types/wedding'

interface PendingGuestsPanelProps {
  wedding: Wedding
  guests: GuestWithRsvp[]
  copied: string | null
  onCopy: (text: string, key: string) => void
}

export default function PendingGuestsPanel({
  wedding,
  guests,
  copied,
  onCopy,
}: PendingGuestsPanelProps) {
  const pending = guests.filter((g) => !g.rsvp)

  if (pending.length === 0) return null

  return (
    <div className="bg-amber-50/80 rounded-2xl border border-amber-200 overflow-hidden mb-8">
      <div className="p-6 border-b border-amber-200/80">
        <div className="flex items-center gap-2 mb-2">
          <Bell className="w-5 h-5 text-amber-700" />
          <h2 className="font-serif text-xl font-semibold text-charcoal">
            Noch offen ({pending.length})
          </h2>
        </div>
        <p className="text-sm text-warm-gray">
          Diese Gäste haben noch nicht geantwortet. Kopiert den persönlichen Link oder eine Erinnerungsnachricht.
        </p>
      </div>

      <ul className="divide-y divide-amber-200/60">
        {pending.map((guest) => {
          const personalUrl = getGuestInviteUrl(wedding.slug, guest.invite_token)
          const reminder = getReminderMessage(wedding, guest, personalUrl)
          const linkKey = `reminder-link-${guest.id}`
          const msgKey = `reminder-msg-${guest.id}`

          return (
            <li key={guest.id} className="p-4 sm:p-5 space-y-3">
              <div className="font-medium text-charcoal">
                {guest.salutation === 'herr'
                  ? 'Herr'
                  : guest.salutation === 'frau'
                    ? 'Frau'
                    : 'Familie'}{' '}
                {guest.name}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => onCopy(personalUrl, linkKey)}>
                  <Link2 className="w-4 h-4" />
                  {copied === linkKey ? 'Link kopiert!' : 'Link kopieren'}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onCopy(reminder, msgKey)}>
                  <Copy className="w-4 h-4" />
                  {copied === msgKey ? 'Nachricht kopiert!' : 'Erinnerung kopieren'}
                </Button>
                <WhatsAppShareButton message={reminder} label="WhatsApp" variant="ghost" />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
