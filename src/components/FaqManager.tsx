import { useState } from 'react'
import { ChevronDown, ChevronUp, HelpCircle, Loader2, Plus, Trash2 } from 'lucide-react'
import Button from './Button'
import Input from './Input'
import Textarea from './Textarea'
import { createFaqItem, createFaqItems, deleteFaqItem, reorderFaqItems, updateFaqItem, DEFAULT_FAQ_TEMPLATES } from '../lib/faq'
import type { CreateFaqInput, FaqItem } from '../types/wedding'

interface FaqManagerProps {
  weddingId: string
  items: FaqItem[]
  onUpdate: () => void
}

const emptyForm: CreateFaqInput = {
  question: '',
  answer: '',
}

export default function FaqManager({ weddingId, items, onUpdate }: FaqManagerProps) {
  const [form, setForm] = useState<CreateFaqInput>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [movingId, setMovingId] = useState<string | null>(null)
  const [loadingTemplates, setLoadingTemplates] = useState(false)

  const handleLoadTemplates = async () => {
    if (items.length > 0 && !confirm('Beispielfragen zusätzlich hinzufügen?')) {
      return
    }
    setLoadingTemplates(true)
    setError('')
    try {
      await createFaqItems(weddingId, DEFAULT_FAQ_TEMPLATES)
      onUpdate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Beispielfragen konnten nicht geladen werden.')
    } finally {
      setLoadingTemplates(false)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.question.trim() || !form.answer.trim()) {
      setError('Bitte Frage und Antwort angeben.')
      return
    }

    setSaving(true)
    setError('')
    try {
      await createFaqItem(weddingId, form)
      setForm(emptyForm)
      onUpdate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Speichern fehlgeschlagen.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (item: FaqItem) => {
    if (!confirm('Frage wirklich löschen?')) return
    setDeletingId(item.id)
    try {
      await deleteFaqItem(item.id)
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
      await reorderFaqItems(reordered)
      onUpdate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sortieren fehlgeschlagen.')
    } finally {
      setMovingId(null)
    }
  }

  const handleInlineChange = async (
    item: FaqItem,
    field: keyof CreateFaqInput,
    value: string
  ) => {
    try {
      await updateFaqItem(item.id, { [field]: value })
      onUpdate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Aktualisieren fehlgeschlagen.')
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-cream-dark overflow-hidden mb-8">
      <div className="p-6 border-b border-cream-dark">
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="w-5 h-5 text-gold" />
          <h2 className="font-serif text-xl font-semibold text-charcoal">FAQ ({items.length})</h2>
        </div>
        <p className="text-sm text-warm-gray mb-4">
          Beantwortet häufige Gästefragen – erscheint am Ende der Einladungsseite.
        </p>

        <form onSubmit={handleAdd} className="space-y-3">
          <Input
            label="Frage"
            placeholder="z.B. Bis wann sollen wir zusagen?"
            value={form.question}
            onChange={(e) => setForm({ ...form, question: e.target.value })}
          />
          <Textarea
            label="Antwort"
            placeholder="Eure Antwort für die Gäste..."
            value={form.answer}
            onChange={(e) => setForm({ ...form, answer: e.target.value })}
            rows={3}
          />

          <div className="flex flex-wrap gap-2">
            <Button type="submit" variant="outline" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Wird gespeichert...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Frage hinzufügen
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              disabled={loadingTemplates}
              onClick={handleLoadTemplates}
            >
              {loadingTemplates ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Wird geladen...
                </>
              ) : (
                'Beispielfragen übernehmen'
              )}
            </Button>
          </div>
        </form>

        {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
      </div>

      {items.length === 0 ? (
        <div className="p-12 text-center text-warm-gray">
          <HelpCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>Noch keine FAQ-Einträge. Fügt eure ersten Fragen hinzu!</p>
        </div>
      ) : (
        <ul className="divide-y divide-cream-dark">
          {items.map((item, index) => (
            <li key={item.id} className="p-4 sm:p-5 space-y-3">
              <div className="flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-gold shrink-0 mt-2" />
                <div className="flex-1 space-y-2 min-w-0">
                  <input
                    defaultValue={item.question}
                    onBlur={(e) => {
                      if (e.target.value.trim() !== item.question) {
                        handleInlineChange(item, 'question', e.target.value)
                      }
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-cream-dark bg-cream/50 text-sm font-medium"
                    aria-label="Frage"
                  />
                  <textarea
                    defaultValue={item.answer}
                    rows={3}
                    onBlur={(e) => {
                      if (e.target.value.trim() !== item.answer) {
                        handleInlineChange(item, 'answer', e.target.value)
                      }
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-cream-dark bg-cream/50 text-sm resize-y min-h-[80px]"
                    aria-label="Antwort"
                  />
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
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
