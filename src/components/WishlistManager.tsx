import { useState } from 'react'
import { Gift, Loader2, Plus, Trash2 } from 'lucide-react'
import Button from './Button'
import Input from './Input'
import Textarea from './Textarea'
import { createWishlistItem, deleteWishlistItem } from '../lib/wishlist'
import type { CreateWishlistInput, WishlistItem } from '../types/wedding'

interface WishlistManagerProps {
  weddingId: string
  items: WishlistItem[]
  onUpdate: () => void
}

const emptyForm: CreateWishlistInput = {
  title: '',
  url: '',
  description: '',
}

export default function WishlistManager({ weddingId, items, onUpdate }: WishlistManagerProps) {
  const [form, setForm] = useState<CreateWishlistInput>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) {
      setError('Bitte einen Titel angeben.')
      return
    }

    setSaving(true)
    setError('')
    try {
      await createWishlistItem(weddingId, form)
      setForm(emptyForm)
      onUpdate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Speichern fehlgeschlagen.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (item: WishlistItem) => {
    if (!confirm(`„${item.title}" wirklich löschen?`)) return
    try {
      await deleteWishlistItem(item.id)
      onUpdate()
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-cream-dark overflow-hidden mb-8">
      <div className="p-6 border-b border-cream-dark">
        <div className="flex items-center gap-2 mb-2">
          <Gift className="w-5 h-5 text-sage" />
          <h2 className="font-serif text-xl font-semibold text-charcoal">Wunschliste ({items.length})</h2>
        </div>
        <p className="text-sm text-warm-gray">
          Tragt Geschenkideen oder Links ein – Gäste sehen sie auf der Einladung.
        </p>
      </div>

      <form onSubmit={handleAdd} className="p-6 border-b border-cream-dark bg-cream/30 space-y-3">
        <Input
          label="Titel *"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="z.B. Reisekasse, Geschirrset …"
        />
        <Input
          label="Link (optional)"
          type="url"
          value={form.url ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
          placeholder="https://…"
        />
        <Textarea
          label="Beschreibung (optional)"
          value={form.description ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          rows={2}
          placeholder="Kurzer Hinweis für eure Gäste"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Eintrag hinzufügen
        </Button>
      </form>

      {items.length === 0 ? (
        <div className="p-10 text-center text-warm-gray text-sm">Noch keine Einträge.</div>
      ) : (
        <ul className="divide-y divide-cream-dark">
          {items.map((item) => (
            <li key={item.id} className="p-4 sm:p-6 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-charcoal">{item.title}</p>
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gold hover:underline truncate block"
                  >
                    {item.url}
                  </a>
                )}
                {item.description && <p className="text-sm text-warm-gray mt-1">{item.description}</p>}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-400 hover:text-red-600 shrink-0"
                onClick={() => handleDelete(item)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
