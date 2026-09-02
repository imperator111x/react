import { useState } from 'react'
import {
  CalendarClock,
  ChevronDown,
  ChevronUp,
  Loader2,
  Plus,
  Trash2,
} from 'lucide-react'
import Button from './Button'
import Input from './Input'
import {
  createItineraryItem,
  deleteItineraryItem,
  reorderItineraryItems,
  updateItineraryItem,
} from '../lib/itinerary'
import { ITINERARY_ICON_OPTIONS, ItineraryIcon } from '../lib/itinerary-icons'
import type { CreateItineraryInput, ItineraryItem, ItineraryIconName } from '../types/wedding'

interface ItineraryManagerProps {
  weddingId: string
  items: ItineraryItem[]
  onUpdate: () => void
}

const emptyForm: CreateItineraryInput = {
  time_label: '',
  title: '',
  icon: 'heart',
}

export default function ItineraryManager({ weddingId, items, onUpdate }: ItineraryManagerProps) {
  const [form, setForm] = useState<CreateItineraryInput>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [movingId, setMovingId] = useState<string | null>(null)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.time_label.trim() || !form.title.trim()) {
      setError('Bitte Uhrzeit und Bezeichnung angeben.')
      return
    }

    setSaving(true)
    setError('')
    try {
      await createItineraryItem(weddingId, form)
      setForm(emptyForm)
      onUpdate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Speichern fehlgeschlagen.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (item: ItineraryItem) => {
    if (!confirm('Programmpunkt wirklich löschen?')) return
    setDeletingId(item.id)
    try {
      await deleteItineraryItem(item.id)
      onUpdate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Löschen fehlgeschlagen.')
    } finally {
      setDeletingId(null)
    }
  }

  const handleMove = async (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= items.length) return

    const reordered = [...items]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(target, 0, moved)

    setMovingId(moved.id)
    try {
      await reorderItineraryItems(reordered)
      onUpdate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sortieren fehlgeschlagen.')
    } finally {
      setMovingId(null)
    }
  }

  const handleInlineChange = async (
    item: ItineraryItem,
    field: keyof CreateItineraryInput,
    value: string
  ) => {
    try {
      await updateItineraryItem(item.id, { [field]: value })
      onUpdate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Aktualisieren fehlgeschlagen.')
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-cream-dark overflow-hidden mb-8">
      <div className="p-6 border-b border-cream-dark">
        <div className="flex items-center gap-2 mb-4">
          <CalendarClock className="w-5 h-5 text-sage" />
          <h2 className="font-serif text-xl font-semibold text-charcoal">
            Ablaufplan ({items.length})
          </h2>
        </div>
        <p className="text-sm text-warm-gray mb-4">
          Plant den Tagesablauf für eure Gäste – Trauung, Sektempfang, Dinner und mehr.
        </p>

        <form onSubmit={handleAdd} className="space-y-3">
          <div className="grid sm:grid-cols-3 gap-3">
            <Input
              label="Uhrzeit"
              placeholder="14:00"
              value={form.time_label}
              onChange={(e) => setForm({ ...form, time_label: e.target.value })}
            />
            <Input
              label="Bezeichnung"
              placeholder="Trauung"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <div className="space-y-1.5">
              <label htmlFor="itinerary-icon" className="block text-sm font-medium text-charcoal">
                Symbol
              </label>
              <div className="flex gap-2">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-cream border border-cream-dark flex items-center justify-center text-sage">
                  <ItineraryIcon name={form.icon} className="w-5 h-5" />
                </div>
                <select
                  id="itinerary-icon"
                  value={form.icon}
                  onChange={(e) =>
                    setForm({ ...form, icon: e.target.value as ItineraryIconName })
                  }
                  className="flex-1 px-3 py-3 rounded-xl border border-cream-dark bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold"
                >
                  {ITINERARY_ICON_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <Button type="submit" variant="outline" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Wird gespeichert...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Programmpunkt hinzufügen
              </>
            )}
          </Button>
        </form>

        {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
      </div>

      {items.length === 0 ? (
        <div className="p-12 text-center text-warm-gray">
          <CalendarClock className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>Noch kein Ablauf. Fügt eure ersten Programmpunkte hinzu!</p>
        </div>
      ) : (
        <ul className="divide-y divide-cream-dark">
          {items.map((item, index) => (
            <li key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="w-10 h-10 shrink-0 rounded-full bg-cream border border-cream-dark flex items-center justify-center text-sage">
                <ItineraryIcon name={item.icon} className="w-5 h-5" />
              </div>

              <div className="flex-1 grid sm:grid-cols-3 gap-2 min-w-0">
                <input
                  defaultValue={item.time_label}
                  onBlur={(e) => {
                    if (e.target.value.trim() !== item.time_label) {
                      handleInlineChange(item, 'time_label', e.target.value)
                    }
                  }}
                  className="px-3 py-2 rounded-lg border border-cream-dark bg-cream/50 text-sm"
                  aria-label="Uhrzeit"
                />
                <input
                  defaultValue={item.title}
                  onBlur={(e) => {
                    if (e.target.value.trim() !== item.title) {
                      handleInlineChange(item, 'title', e.target.value)
                    }
                  }}
                  className="px-3 py-2 rounded-lg border border-cream-dark bg-cream/50 text-sm sm:col-span-1"
                  aria-label="Bezeichnung"
                />
                <select
                  defaultValue={item.icon}
                  onChange={(e) =>
                    handleInlineChange(item, 'icon', e.target.value)
                  }
                  className="px-3 py-2 rounded-lg border border-cream-dark bg-cream/50 text-sm"
                  aria-label="Symbol"
                >
                  {ITINERARY_ICON_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleMove(index, -1)}
                  disabled={index === 0 || movingId === item.id}
                  className="p-2 rounded-lg text-warm-gray hover:bg-cream disabled:opacity-30"
                  aria-label="Nach oben"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(index, 1)}
                  disabled={index === items.length - 1 || movingId === item.id}
                  className="p-2 rounded-lg text-warm-gray hover:bg-cream disabled:opacity-30"
                  aria-label="Nach unten"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item)}
                  disabled={deletingId === item.id}
                  className="p-2 rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-50"
                  aria-label="Löschen"
                >
                  {deletingId === item.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
