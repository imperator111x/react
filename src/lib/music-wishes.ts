import type { CreateMusicWishInput, MusicWish } from '../types/wedding'
import { supabase } from './supabase'

export async function getMusicWishes(weddingId: string): Promise<MusicWish[]> {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('music_wishes')
    .select('*')
    .eq('wedding_id', weddingId)
    .order('created_at', { ascending: false })

  if (error) return []
  return data as MusicWish[]
}

export async function createMusicWish(
  weddingId: string,
  input: CreateMusicWishInput
): Promise<MusicWish> {
  if (!supabase) throw new Error('Supabase ist nicht konfiguriert')

  const { data, error } = await supabase
    .from('music_wishes')
    .insert({
      wedding_id: weddingId,
      guest_id: input.guest_id || null,
      guest_name: input.guest_name.trim(),
      song_title: input.song_title.trim(),
      artist: input.artist?.trim() || null,
    })
    .select()
    .single()

  if (error) throw error
  return data as MusicWish
}

export async function deleteMusicWish(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase ist nicht konfiguriert')

  const { error } = await supabase.from('music_wishes').delete().eq('id', id)
  if (error) throw error
}
