import type { CreateItineraryInput, ItineraryItem } from '../types/wedding'
import { supabase } from './supabase'

export async function getItineraryItems(weddingId: string): Promise<ItineraryItem[]> {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('itinerary_items')
    .select('*')
    .eq('wedding_id', weddingId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) return []
  return data as ItineraryItem[]
}

export async function createItineraryItem(
  weddingId: string,
  input: CreateItineraryInput
): Promise<ItineraryItem> {
  if (!supabase) throw new Error('Supabase ist nicht konfiguriert')

  const { data: existing } = await supabase
    .from('itinerary_items')
    .select('sort_order')
    .eq('wedding_id', weddingId)
    .order('sort_order', { ascending: false })
    .limit(1)

  const nextOrder = existing?.[0]?.sort_order != null ? existing[0].sort_order + 1 : 0

  const { data, error } = await supabase
    .from('itinerary_items')
    .insert({
      wedding_id: weddingId,
      time_label: input.time_label.trim(),
      title: input.title.trim(),
      icon: input.icon,
      sort_order: nextOrder,
    })
    .select()
    .single()

  if (error) throw error
  return data as ItineraryItem
}

export async function updateItineraryItem(
  id: string,
  input: Partial<CreateItineraryInput>
): Promise<void> {
  if (!supabase) throw new Error('Supabase ist nicht konfiguriert')

  const payload: Record<string, string> = {}
  if (input.time_label != null) payload.time_label = input.time_label.trim()
  if (input.title != null) payload.title = input.title.trim()
  if (input.icon != null) payload.icon = input.icon

  const { error } = await supabase.from('itinerary_items').update(payload).eq('id', id)
  if (error) throw error
}

export async function deleteItineraryItem(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase ist nicht konfiguriert')

  const { error } = await supabase.from('itinerary_items').delete().eq('id', id)
  if (error) throw error
}

export async function reorderItineraryItems(items: ItineraryItem[]): Promise<void> {
  if (!supabase) throw new Error('Supabase ist nicht konfiguriert')

  const client = supabase
  await Promise.all(
    items.map((item, index) =>
      client.from('itinerary_items').update({ sort_order: index }).eq('id', item.id)
    )
  )
}

export function formatItineraryTime(timeLabel: string): string {
  const trimmed = timeLabel.trim()
  if (/uhr/i.test(trimmed)) return trimmed
  return `${trimmed} Uhr`
}
