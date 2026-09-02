import { useEffect, useState } from 'react'
import { Loader2, Pencil, Save } from 'lucide-react'
import Button from './Button'
import Input from './Input'
import Textarea from './Textarea'
import ThemePicker from './ThemePicker'
import CoverImageUpload from './CoverImageUpload'
import { updateWedding } from '../lib/supabase'
import { toDatetimeLocalValue } from '../lib/wedding-dates'
import type { UpdateWeddingInput, Wedding } from '../types/wedding'

interface WeddingEditorProps {
  wedding: Wedding
  onUpdate: () => void
}

function weddingToForm(wedding: Wedding): UpdateWeddingInput & { ceremony_date: string; reception_date: string } {
  return {
    ceremony_date: toDatetimeLocalValue(wedding.ceremony_date ?? wedding.wedding_date),
    reception_date: wedding.reception_date ? toDatetimeLocalValue(wedding.reception_date) : '',
    ceremony_location: wedding.ceremony_location ?? '',
    ceremony_address: wedding.ceremony_address ?? '',
    reception_location: wedding.reception_location ?? '',
    reception_address: wedding.reception_address ?? '',
    story: wedding.story ?? '',
    dress_code: wedding.dress_code ?? '',
    invitation_text: wedding.invitation_text ?? '',
    travel_info: wedding.travel_info ?? '',
    theme_id: wedding.theme_id ?? 'gold',
  }
}

export default function WeddingEditor({ wedding, onUpdate }: WeddingEditorProps) {
  const [form, setForm] = useState(() => weddingToForm(wedding))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    setForm(weddingToForm(wedding))
  }, [wedding])

  const update = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setSuccess(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.ceremony_date) {
      setError('Bitte ein Datum für die Trauung angeben.')
      return
    }

    setSaving(true)
    setError('')
    try {
      await updateWedding(wedding.id, form)
      setSuccess(true)
      onUpdate()
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Speichern fehlgeschlagen.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-cream-dark overflow-hidden mb-8">
      <div className="p-6 border-b border-cream-dark">
        <div className="flex items-center gap-2 mb-2">
          <Pencil className="w-5 h-5 text-sage" />
          <h2 className="font-serif text-xl font-semibold text-charcoal">Hochzeit bearbeiten</h2>
        </div>
        <p className="text-sm text-warm-gray">
          Passt Termine, Orte, Geschichte und Dresscode an – Änderungen erscheinen sofort auf der Einladung.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <CoverImageUpload wedding={wedding} onUpdate={onUpdate} />

        <div>
          <h3 className="font-serif text-lg font-semibold text-charcoal mb-3">Trauung</h3>
          <div className="space-y-3">
            <Input
              label="Datum & Uhrzeit Trauung *"
              type="datetime-local"
              value={form.ceremony_date}
              onChange={(e) => update('ceremony_date', e.target.value)}
              required
            />
            <Input
              label="Ort der Trauung"
              value={form.ceremony_location}
              onChange={(e) => update('ceremony_location', e.target.value)}
            />
            <Input
              label="Adresse Trauung"
              value={form.ceremony_address}
              onChange={(e) => update('ceremony_address', e.target.value)}
            />
          </div>
        </div>

        <div>
          <h3 className="font-serif text-lg font-semibold text-charcoal mb-3">Feier</h3>
          <div className="space-y-3">
            <Input
              label="Datum & Uhrzeit Feier"
              type="datetime-local"
              value={form.reception_date}
              onChange={(e) => update('reception_date', e.target.value)}
            />
            <Input
              label="Ort der Feier"
              value={form.reception_location}
              onChange={(e) => update('reception_location', e.target.value)}
            />
            <Input
              label="Adresse Feier"
              value={form.reception_address}
              onChange={(e) => update('reception_address', e.target.value)}
            />
          </div>
        </div>

        <Textarea
          label="Anreise & Unterkunft"
          value={form.travel_info ?? ''}
          onChange={(e) => update('travel_info', e.target.value)}
          rows={5}
          placeholder="Hotel-Tipps, Parkplätze, Shuttle … (Absätze mit Leerzeile trennen)"
        />

        <ThemePicker
          value={form.theme_id ?? 'gold'}
          onChange={(id) => update('theme_id', id)}
        />

        <Textarea
          label="Einladungstext (unter der Anrede)"
          value={form.invitation_text ?? ''}
          onChange={(e) => update('invitation_text', e.target.value)}
          rows={3}
          placeholder="z.B. wir laden dich herzlich zu unserer Hochzeit ein …"
        />

        <Textarea
          label="Eure Geschichte"
          value={form.story}
          onChange={(e) => update('story', e.target.value)}
          rows={4}
        />

        <Input
          label="Dresscode"
          value={form.dress_code}
          onChange={(e) => update('dress_code', e.target.value)}
        />

        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-sage">Änderungen gespeichert!</p>}

        <Button type="submit" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Wird gespeichert...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Änderungen speichern
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
