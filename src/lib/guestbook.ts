import type { CreateGuestbookInput, GuestbookEntry } from '../types/wedding'
import { supabase } from './supabase'

export async function getGuestbookEntries(
  weddingId: string,
  visibleOnly = false
): Promise<GuestbookEntry[]> {
  if (!supabase) return []

  let query = supabase
    .from('guestbook_entries')
    .select('*')
    .eq('wedding_id', weddingId)
    .order('created_at', { ascending: false })

  if (visibleOnly) {
    query = query.eq('is_visible', true)
  }

  const { data, error } = await query
  if (error) return []
  return data as GuestbookEntry[]
}

export async function createGuestbookEntry(
  weddingId: string,
  input: CreateGuestbookInput
): Promise<GuestbookEntry> {
  if (!supabase) throw new Error('Supabase ist nicht konfiguriert')

  const { data, error } = await supabase
    .from('guestbook_entries')
    .insert({
      wedding_id: weddingId,
      guest_id: input.guest_id || null,
      guest_name: input.guest_name.trim(),
      message: input.message.trim(),
      is_visible: true,
    })
    .select()
    .single()

  if (error) throw error
  return data as GuestbookEntry
}

export async function setGuestbookEntryVisible(id: string, isVisible: boolean): Promise<void> {
  if (!supabase) throw new Error('Supabase ist nicht konfiguriert')

  const { error } = await supabase
    .from('guestbook_entries')
    .update({ is_visible: isVisible })
    .eq('id', id)

  if (error) throw error
}

export async function deleteGuestbookEntry(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase ist nicht konfiguriert')

  const { error } = await supabase.from('guestbook_entries').delete().eq('id', id)
  if (error) throw error
}
