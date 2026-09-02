import { useRef, useState } from 'react'
import { ImageIcon, Loader2, Trash2, Upload } from 'lucide-react'
import Button from './Button'
import { uploadCoverImage, removeCoverImage } from '../lib/cover'
import { resolveCoverImageUrl } from '../lib/cover-url'
import { updateWedding } from '../lib/supabase'
import type { Wedding } from '../types/wedding'

interface CoverImageUploadProps {
  wedding: Wedding
  onUpdate: () => void
}

export default function CoverImageUpload({ wedding, onUpdate }: CoverImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')
    try {
      if (wedding.cover_image_url) {
        await removeCoverImage(wedding.cover_image_url)
      }
      const url = await uploadCoverImage(wedding.id, file)
      await updateWedding(wedding.id, { cover_image_url: url })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      onUpdate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload fehlgeschlagen.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const handleRemove = async () => {
    if (!wedding.cover_image_url || !confirm('Titelbild wirklich entfernen?')) return

    setUploading(true)
    setError('')
    try {
      await removeCoverImage(wedding.cover_image_url)
      await updateWedding(wedding.id, { cover_image_url: null })
      onUpdate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Entfernen fehlgeschlagen.')
    } finally {
      setUploading(false)
    }
  }

  const previewUrl = resolveCoverImageUrl(wedding.cover_image_url)

  return (
    <div>
      <h3 className="font-serif text-lg font-semibold text-charcoal mb-3 flex items-center gap-2">
        <ImageIcon className="w-5 h-5 text-gold" />
        Titelbild
      </h3>
      <p className="text-sm text-warm-gray mb-4">
        Erscheint oben auf der Einladung als großes Foto (max. 5 MB).
      </p>

      {previewUrl && (
        <div className="mb-4 rounded-2xl overflow-hidden border border-cream-dark aspect-[16/9] max-h-48">
          <img
            src={previewUrl}
            alt="Titelbild Vorschau"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleUpload}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          {wedding.cover_image_url ? 'Bild ersetzen' : 'Bild hochladen'}
        </Button>
        {wedding.cover_image_url && (
          <Button type="button" variant="ghost" size="sm" disabled={uploading} onClick={handleRemove}>
            <Trash2 className="w-4 h-4" />
            Entfernen
          </Button>
        )}
      </div>
      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      {success && (
        <p className="text-sm text-sage mt-2">
          Titelbild gespeichert – auf der Einladung sichtbar nach dem Umschlag.
        </p>
      )}
    </div>
  )
}
