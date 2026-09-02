import { useState } from 'react'
import { Check, Eye, EyeOff, Loader2, Trash2 } from 'lucide-react'
import InviteQrCode from './InviteQrCode'
import Button from './Button'
import {
  deleteGuestPhoto,
  getGuestPhotoUrl,
  getGuestPhotosPageUrl,
  setGuestPhotoApproved,
} from '../lib/guest-photos'
import type { GuestPhoto } from '../types/wedding'

interface GuestPhotoManagerProps {
  weddingSlug: string
  photos: GuestPhoto[]
  onUpdate: () => void
}

export default function GuestPhotoManager({
  weddingSlug,
  photos,
  onUpdate,
}: GuestPhotoManagerProps) {
  const [busyId, setBusyId] = useState<string | null>(null)
  const photosUrl = getGuestPhotosPageUrl(weddingSlug)

  const handleToggleApproved = async (photo: GuestPhoto) => {
    setBusyId(photo.id)
    try {
      await setGuestPhotoApproved(photo, !photo.is_approved)
      onUpdate()
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (photo: GuestPhoto) => {
    if (!confirm('Foto wirklich löschen?')) return
    setBusyId(photo.id)
    try {
      await deleteGuestPhoto(photo)
      onUpdate()
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-cream-dark p-6 mb-8">
      <h2 className="font-serif text-xl font-semibold text-charcoal mb-2">Gäste-Fotos</h2>
      <p className="text-sm text-warm-gray mb-4">
        Gäste laden über die Foto-Seite Bilder hoch. Freigegebene Fotos erscheinen auf der Dankeskarte.
      </p>

      <InviteQrCode
        url={photosUrl}
        label="Foto-Upload Link"
        downloadFilename={`fotos-${weddingSlug}`}
        hint="QR-Code auf dem Tisch oder der Dankeskarte – Gäste scannen und laden Fotos hoch."
      />

      {photos.length === 0 ? (
        <p className="text-sm text-warm-gray mt-6">Noch keine Gäste-Fotos hochgeladen.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {photos.map((photo) => (
            <article
              key={photo.id}
              className={`rounded-xl border overflow-hidden ${
                photo.is_approved ? 'border-sage/40' : 'border-cream-dark'
              }`}
            >
              <div className="aspect-square bg-cream">
                <img
                  src={getGuestPhotoUrl(photo.storage_path)}
                  alt={photo.caption || photo.guest_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3 space-y-2">
                <p className="text-sm font-medium text-charcoal truncate">{photo.guest_name}</p>
                {photo.caption && (
                  <p className="text-xs text-warm-gray truncate">{photo.caption}</p>
                )}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    disabled={busyId === photo.id}
                    onClick={() => handleToggleApproved(photo)}
                  >
                    {busyId === photo.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : photo.is_approved ? (
                      <>
                        <EyeOff className="w-4 h-4 mr-1" />
                        Verbergen
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Freigeben
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={busyId === photo.id}
                    onClick={() => handleDelete(photo)}
                    aria-label="Löschen"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
                <p className="text-[0.65rem] uppercase tracking-wide text-warm-gray flex items-center gap-1">
                  {photo.is_approved ? (
                    <>
                      <Eye className="w-3 h-3 text-sage" /> Sichtbar
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3 h-3" /> Ausstehend
                    </>
                  )}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
