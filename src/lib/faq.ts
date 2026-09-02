import type { CreateFaqInput, FaqItem } from '../types/wedding'
import { supabase } from './supabase'

export { DEFAULT_FAQ_TEMPLATES } from './default-faq'

export async function getFaqItems(weddingId: string): Promise<FaqItem[]> {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('faq_items')
    .select('*')
    .eq('wedding_id', weddingId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) return []
  return data as FaqItem[]
}

export async function createFaqItems(
  weddingId: string,
  inputs: CreateFaqInput[]
): Promise<void> {
  for (const input of inputs) {
    await createFaqItem(weddingId, input)
  }
}

export async function createFaqItem(weddingId: string, input: CreateFaqInput): Promise<FaqItem> {
  if (!supabase) throw new Error('Supabase ist nicht konfiguriert')

  const { data: existing } = await supabase
    .from('faq_items')
    .select('sort_order')
    .eq('wedding_id', weddingId)
    .order('sort_order', { ascending: false })
    .limit(1)

  const nextOrder = existing?.[0]?.sort_order != null ? existing[0].sort_order + 1 : 0

  const { data, error } = await supabase
    .from('faq_items')
    .insert({
      wedding_id: weddingId,
      question: input.question.trim(),
      answer: input.answer.trim(),
      sort_order: nextOrder,
    })
    .select()
    .single()

  if (error) throw error
  return data as FaqItem
}

export async function updateFaqItem(id: string, input: Partial<CreateFaqInput>): Promise<void> {
  if (!supabase) throw new Error('Supabase ist nicht konfiguriert')

  const payload: Record<string, string> = {}
  if (input.question != null) payload.question = input.question.trim()
  if (input.answer != null) payload.answer = input.answer.trim()

  const { error } = await supabase.from('faq_items').update(payload).eq('id', id)
  if (error) throw error
}

export async function deleteFaqItem(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase ist nicht konfiguriert')

  const { error } = await supabase.from('faq_items').delete().eq('id', id)
  if (error) throw error
}

export async function reorderFaqItems(items: FaqItem[]): Promise<void> {
  if (!supabase) throw new Error('Supabase ist nicht konfiguriert')

  const client = supabase
  await Promise.all(
    items.map((item, index) =>
      client.from('faq_items').update({ sort_order: index }).eq('id', item.id)
    )
  )
}
