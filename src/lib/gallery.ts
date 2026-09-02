import type { GalleryImage } from '../types/wedding'
import { supabase } from './supabase'

export const GALLERY_BUCKET = 'wedding-gallery'
export const MAX_GALLERY_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export function getGalleryImageUrl(storagePath: string): string {
  if (!supabase) return ''
  const { data } = supabase.storage.from(GALLERY_BUCKET).getPublicUrl(storagePath)
  return data.publicUrl
}

export async function getGalleryImages(weddingId: string): Promise<GalleryImage[]> {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('gallery_images')
    .select('*')
    .eq('wedding_id', weddingId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) return []
  return data as GalleryImage[]
}

export async function uploadGalleryImage(
  weddingId: string,
  file: File,
  caption?: string
): Promise<GalleryImage> {
  if (!supabase) throw new Error('Supabase ist nicht konfiguriert')

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Nur JPG, PNG, WebP oder GIF erlaubt.')
  }
  if (file.size > MAX_GALLERY_FILE_SIZE) {
    throw new Error('Bild darf maximal 5 MB groß sein.')
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const storagePath = `${weddingId}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(GALLERY_BUCKET)
    .upload(storagePath, file, { cacheControl: '3600', upsert: false })

  if (uploadError) throw new Error(uploadError.message)

  const { data: existing } = await supabase
    .from('gallery_images')
    .select('sort_order')
    .eq('wedding_id', weddingId)
    .order('sort_order', { ascending: false })
    .limit(1)

  const nextOrder = existing?.[0]?.sort_order != null ? existing[0].sort_order + 1 : 0

  const { data, error } = await supabase
    .from('gallery_images')
    .insert({
      wedding_id: weddingId,
      storage_path: storagePath,
      caption: caption || null,
      sort_order: nextOrder,
    })
    .select()
    .single()

  if (error) {
    await supabase.storage.from(GALLERY_BUCKET).remove([storagePath])
    throw error
  }

  return data as GalleryImage
}

export async function deleteGalleryImage(image: GalleryImage): Promise<void> {
  if (!supabase) throw new Error('Supabase ist nicht konfiguriert')

  await supabase.storage.from(GALLERY_BUCKET).remove([image.storage_path])
  const { error } = await supabase.from('gallery_images').delete().eq('id', image.id)
  if (error) throw error
}
