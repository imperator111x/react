import type { CreateWishlistInput, WishlistItem } from '../types/wedding'
import { supabase } from './supabase'

export async function getWishlistItems(weddingId: string): Promise<WishlistItem[]> {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('wishlist_items')
    .select('*')
    .eq('wedding_id', weddingId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) return []
  return data as WishlistItem[]
}

export async function createWishlistItem(
  weddingId: string,
  input: CreateWishlistInput
): Promise<WishlistItem> {
  if (!supabase) throw new Error('Supabase ist nicht konfiguriert')

  const { data: existing } = await supabase
    .from('wishlist_items')
    .select('sort_order')
    .eq('wedding_id', weddingId)
    .order('sort_order', { ascending: false })
    .limit(1)

  const nextOrder = existing?.[0]?.sort_order != null ? existing[0].sort_order + 1 : 0

  const { data, error } = await supabase
    .from('wishlist_items')
    .insert({
      wedding_id: weddingId,
      title: input.title.trim(),
      url: input.url?.trim() || null,
      description: input.description?.trim() || null,
      sort_order: nextOrder,
    })
    .select()
    .single()

  if (error) throw error
  return data as WishlistItem
}

export async function updateWishlistItem(
  id: string,
  input: Partial<CreateWishlistInput>
): Promise<void> {
  if (!supabase) throw new Error('Supabase ist nicht konfiguriert')

  const payload: Record<string, string | null> = {}
  if (input.title !== undefined) payload.title = input.title.trim()
  if (input.url !== undefined) payload.url = input.url.trim() || null
  if (input.description !== undefined) payload.description = input.description.trim() || null

  const { error } = await supabase.from('wishlist_items').update(payload).eq('id', id)
  if (error) throw error
}

export async function deleteWishlistItem(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase ist nicht konfiguriert')

  const { error } = await supabase.from('wishlist_items').delete().eq('id', id)
  if (error) throw error
}
