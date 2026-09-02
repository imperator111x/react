import { useRef, useState } from 'react'
import { ImagePlus, Loader2, Trash2, Images } from 'lucide-react'
import Button from './Button'
import {
  deleteGalleryImage,
  getGalleryImageUrl,
  uploadGalleryImage,
  MAX_GALLERY_FILE_SIZE,
} from '../lib/gallery'
import type { GalleryImage } from '../types/wedding'

interface GalleryManagerProps {
  weddingId: string
  images: GalleryImage[]
  onUpdate: () => void
}

export default function GalleryManager({ weddingId, images, onUpdate }: GalleryManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return
    setError('')
    setUploading(true)

    try {
      for (const file of Array.from(files)) {
        if (file.size > MAX_GALLERY_FILE_SIZE) {
          throw new Error(`„${file.name}" ist größer als 5 MB.`)
        }
        await uploadGalleryImage(weddingId, file)
      }
      onUpdate()
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload fehlgeschlagen.')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (image: GalleryImage) => {
    if (!confirm('Bild wirklich löschen?')) return
    setDeletingId(image.id)
    try {
      await deleteGalleryImage(image)
      onUpdate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Löschen fehlgeschlagen.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-cream-dark overflow-hidden mb-8">
      <div className="p-6 border-b border-cream-dark">
        <div className="flex items-center gap-2 mb-4">
          <Images className="w-5 h-5 text-gold" />
          <h2 className="font-serif text-xl font-semibold text-charcoal">
            Galerie ({images.length})
          </h2>
        </div>
        <p className="text-sm text-warm-gray mb-4">
          Ladet eure schönsten Fotos hoch – sie erscheinen auf der Einladungsseite für eure Gäste.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <Button
          type="button"
          variant="outline"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Wird hochgeladen...
            </>
          ) : (
            <>
              <ImagePlus className="w-4 h-4" />
              Bilder hochladen
            </>
          )}
        </Button>

        {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
        <p className="text-xs text-warm-gray mt-2">JPG, PNG, WebP oder GIF · max. 5 MB pro Bild</p>
      </div>

      {images.length === 0 ? (
        <div className="p-12 text-center text-warm-gray">
          <Images className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>Noch keine Bilder. Ladet Fotos von euch als Paar hoch!</p>
        </div>
      ) : (
        <div className="p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((image) => (
            <div key={image.id} className="group relative aspect-square rounded-xl overflow-hidden bg-cream">
              <img
                src={getGalleryImageUrl(image.storage_path)}
                alt={image.caption || 'Galeriebild'}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/30 transition-colors" />
              <button
                type="button"
                onClick={() => handleDelete(image)}
                disabled={deletingId === image.id}
                className="absolute top-2 right-2 p-2 rounded-full bg-white/90 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white disabled:opacity-50"
                aria-label="Bild löschen"
              >
                {deletingId === image.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
