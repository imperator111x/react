import { useState } from 'react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { BookHeart, Eye, EyeOff, Loader2, Trash2 } from 'lucide-react'
import Button from './Button'
import { deleteGuestbookEntry, setGuestbookEntryVisible } from '../lib/guestbook'
import type { GuestbookEntry } from '../types/wedding'

interface GuestbookManagerProps {
  entries: GuestbookEntry[]
  onUpdate: () => void
}

export default function GuestbookManager({ entries, onUpdate }: GuestbookManagerProps) {
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const handleToggle = async (entry: GuestbookEntry) => {
    setBusyId(entry.id)
    setError('')
    try {
      await setGuestbookEntryVisible(entry.id, !entry.is_visible)
      onUpdate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Aktion fehlgeschlagen.')
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Eintrag wirklich löschen?')) return
    setBusyId(id)
    setError('')
    try {
      await deleteGuestbookEntry(id)
      onUpdate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Löschen fehlgeschlagen.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-cream-dark overflow-hidden mb-8">
      <div className="p-6 border-b border-cream-dark">
        <div className="flex items-center gap-2 mb-2">
          <BookHeart className="w-5 h-5 text-gold" />
          <h2 className="font-serif text-xl font-semibold text-charcoal">
            Gästebuch ({entries.length})
          </h2>
        </div>
        <p className="text-sm text-warm-gray">
          Nachrichten eurer Gäste. Ausgeblendete Einträge sind auf der Einladung nicht sichtbar.
        </p>
      </div>

      {error && <p className="px-6 pt-4 text-sm text-red-500">{error}</p>}

      {entries.length === 0 ? (
        <div className="p-10 text-center text-warm-gray text-sm">
          Noch keine Einträge im Gästebuch.
        </div>
      ) : (
        <ul className="divide-y divide-cream-dark">
          {entries.map((entry) => (
            <li key={entry.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-charcoal">{entry.guest_name}</span>
                  {!entry.is_visible && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-cream-dark text-warm-gray">
                      Ausgeblendet
                    </span>
                  )}
                </div>
                <p className="text-warm-gray mt-2 italic">„{entry.message}"</p>
                <p className="text-xs text-warm-gray mt-2">
                  {format(new Date(entry.created_at), 'd. MMM yyyy, HH:mm', { locale: de })}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={busyId === entry.id}
                  onClick={() => handleToggle(entry)}
                >
                  {busyId === entry.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : entry.is_visible ? (
                    <>
                      <EyeOff className="w-4 h-4" />
                      Ausblenden
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      Anzeigen
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-600"
                  disabled={busyId === entry.id}
                  onClick={() => handleDelete(entry.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
