import { createClient } from '@supabase/supabase-js'
import type { Wedding, Rsvp, CreateWeddingInput, RsvpInput } from '../types/wedding'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export function generateSlug(partner1: string, partner2: string): string {
  const normalize = (name: string) =>
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

  const base = `${normalize(partner1)}-und-${normalize(partner2)}`
  const suffix = Math.random().toString(36).slice(2, 6)
  return `${base}-${suffix}`
}

export async function createWedding(input: CreateWeddingInput): Promise<Wedding> {
  if (!supabase) throw new Error('Supabase ist nicht konfiguriert')

  const slug = generateSlug(input.partner1_name, input.partner2_name)

  const { data, error } = await supabase
    .from('weddings')
    .insert({
      slug,
      partner1_name: input.partner1_name,
      partner2_name: input.partner2_name,
      wedding_date: input.wedding_date,
      ceremony_location: input.ceremony_location || null,
      ceremony_address: input.ceremony_address || null,
      reception_location: input.reception_location || null,
      reception_address: input.reception_address || null,
      story: input.story || null,
      dress_code: input.dress_code || null,
      email: input.email,
    })
    .select()
    .single()

  if (error) throw error
  return data as Wedding
}

export async function getWeddingBySlug(slug: string): Promise<Wedding | null> {
  if (!supabase) return null

  const { data, error } = await supabase
    .from('weddings')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) return null
  return data as Wedding
}

export async function getWeddingByToken(token: string): Promise<Wedding | null> {
  if (!supabase) return null

  const { data, error } = await supabase
    .from('weddings')
    .select('*')
    .eq('dashboard_token', token)
    .single()

  if (error) return null
  return data as Wedding
}

export async function updateWedding(id: string, updates: Partial<Wedding>): Promise<Wedding> {
  if (!supabase) throw new Error('Supabase ist nicht konfiguriert')

  const { data, error } = await supabase
    .from('weddings')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Wedding
}

export async function getRsvps(weddingId: string): Promise<Rsvp[]> {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('rsvps')
    .select('*')
    .eq('wedding_id', weddingId)
    .order('created_at', { ascending: false })

  if (error) return []
  return data as Rsvp[]
}

export async function submitRsvp(weddingId: string, input: RsvpInput): Promise<Rsvp> {
  if (!supabase) throw new Error('Supabase ist nicht konfiguriert')

  const { data, error } = await supabase
    .from('rsvps')
    .insert({
      wedding_id: weddingId,
      guest_name: input.guest_name,
      email: input.email || null,
      status: input.status,
      guest_count: input.guest_count,
      dietary_notes: input.dietary_notes || null,
      message: input.message || null,
    })
    .select()
    .single()

  if (error) throw error
  return data as Rsvp
}
