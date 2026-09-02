import type { CreateGuestPhotoInput, GuestPhoto } from '../types/wedding'
import { ALLOWED_IMAGE_TYPES, GALLERY_BUCKET, MAX_GALLERY_FILE_SIZE } from './gallery'
import { supabase } from './supabase'

export function getGuestPhotoUrl(storagePath: string): string {
  if (!supabase) return ''
  const { data } = supabase.storage.from(GALLERY_BUCKET).getPublicUrl(storagePath)
  return data.publicUrl
}

export function getGuestPhotosPageUrl(slug: string, guestToken?: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  const path = guestToken
    ? `${base}/e/${slug}/fotos/g/${guestToken}`
    : `${base}/e/${slug}/fotos`
  return `${window.location.origin}${path}`
}

export async function getGuestPhotos(
  weddingId: string,
  approvedOnly = false
): Promise<GuestPhoto[]> {
  if (!supabase) return []

  let query = supabase
    .from('guest_photos')
    .select('*')
    .eq('wedding_id', weddingId)
    .order('created_at', { ascending: false })

  if (approvedOnly) {
    query = query.eq('is_approved', true)
  }

  const { data, error } = await query
  if (error) return []
  return data as GuestPhoto[]
}

export async function uploadGuestPhoto(
  weddingId: string,
  file: File,
  input: CreateGuestPhotoInput
): Promise<GuestPhoto> {
  if (!supabase) throw new Error('Supabase ist nicht konfiguriert')

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Nur JPG, PNG, WebP oder GIF erlaubt.')
  }
  if (file.size > MAX_GALLERY_FILE_SIZE) {
    throw new Error('Bild darf maximal 5 MB groß sein.')
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const storagePath = `${weddingId}/guest/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(GALLERY_BUCKET)
    .upload(storagePath, file, { cacheControl: '3600', upsert: false })

  if (uploadError) throw new Error(uploadError.message)

  const { data, error } = await supabase
    .from('guest_photos')
    .insert({
      wedding_id: weddingId,
      guest_id: input.guest_id ?? null,
      guest_name: input.guest_name.trim(),
      storage_path: storagePath,
      caption: input.caption?.trim() || null,
      is_approved: false,
    })
    .select()
    .single()

  if (error) {
    await supabase.storage.from(GALLERY_BUCKET).remove([storagePath])
    throw error
  }

  return data as GuestPhoto
}

export async function setGuestPhotoApproved(photo: GuestPhoto, approved: boolean): Promise<void> {
  if (!supabase) throw new Error('Supabase ist nicht konfiguriert')
  const { error } = await supabase
    .from('guest_photos')
    .update({ is_approved: approved })
    .eq('id', photo.id)
  if (error) throw error
}

export async function deleteGuestPhoto(photo: GuestPhoto): Promise<void> {
  if (!supabase) throw new Error('Supabase ist nicht konfiguriert')
  await supabase.storage.from(GALLERY_BUCKET).remove([photo.storage_path])
  const { error } = await supabase.from('guest_photos').delete().eq('id', photo.id)
  if (error) throw error
}
