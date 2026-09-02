import { ALLOWED_IMAGE_TYPES, GALLERY_BUCKET, MAX_GALLERY_FILE_SIZE } from './gallery'
import { supabase } from './supabase'

export function getCoverImageUrl(storagePath: string): string {
  if (!supabase) return ''
  const { data } = supabase.storage.from(GALLERY_BUCKET).getPublicUrl(storagePath)
  return data.publicUrl
}

function storagePathFromCoverUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${GALLERY_BUCKET}/`
  const idx = url.indexOf(marker)
  if (idx === -1) return null
  return decodeURIComponent(url.slice(idx + marker.length))
}

export async function uploadCoverImage(weddingId: string, file: File): Promise<string> {
  if (!supabase) throw new Error('Supabase ist nicht konfiguriert')

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Nur JPG, PNG, WebP oder GIF erlaubt.')
  }
  if (file.size > MAX_GALLERY_FILE_SIZE) {
    throw new Error('Bild darf maximal 5 MB groß sein.')
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const storagePath = `${weddingId}/cover.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(GALLERY_BUCKET)
    .upload(storagePath, file, { cacheControl: '3600', upsert: true })

  if (uploadError) throw new Error(uploadError.message)

  return getCoverImageUrl(storagePath)
}

export async function removeCoverImage(coverUrl: string | null): Promise<void> {
  if (!supabase || !coverUrl) return

  const storagePath = storagePathFromCoverUrl(coverUrl)
  if (storagePath) {
    await supabase.storage.from(GALLERY_BUCKET).remove([storagePath])
  }
}
