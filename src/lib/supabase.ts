import { createClient } from '@supabase/supabase-js'
import { datetimeLocalToIso } from './wedding-dates'
import type {
  Wedding,
  Guest,
  GuestWithRsvp,
  Rsvp,
  CreateWeddingInput,
  CreateGuestInput,
  RsvpInput,
} from '../types/wedding'

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

  const ceremonyIso = datetimeLocalToIso(input.ceremony_date)
  const receptionIso = input.reception_date ? datetimeLocalToIso(input.reception_date) : null

  const { data, error } = await supabase
    .from('weddings')
    .insert({
      slug,
      partner1_name: input.partner1_name,
      partner2_name: input.partner2_name,
      wedding_date: ceremonyIso,
      ceremony_date: ceremonyIso,
      reception_date: receptionIso,
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

export async function getGuests(weddingId: string): Promise<GuestWithRsvp[]> {
  if (!supabase) return []

  const { data: guests, error } = await supabase
    .from('guests')
    .select('*')
    .eq('wedding_id', weddingId)
    .order('created_at', { ascending: true })

  if (error || !guests) return []

  const guestList = guests as Guest[]
  const rsvpIds = guestList.map((g) => g.rsvp_id).filter(Boolean) as string[]

  if (rsvpIds.length === 0) {
    return guestList.map((g) => ({ ...g, rsvp: null }))
  }

  const { data: rsvps } = await supabase.from('rsvps').select('*').in('id', rsvpIds)
  const rsvpMap = new Map((rsvps as Rsvp[] | null)?.map((r) => [r.id, r]) ?? [])

  return guestList.map((g) => ({
    ...g,
    rsvp: g.rsvp_id ? rsvpMap.get(g.rsvp_id) ?? null : null,
  }))
}

export async function getGuestByInviteToken(
  weddingId: string,
  inviteToken: string
): Promise<Guest | null> {
  if (!supabase) return null

  const { data, error } = await supabase
    .from('guests')
    .select('*')
    .eq('wedding_id', weddingId)
    .eq('invite_token', inviteToken)
    .single()

  if (error) return null
  return data as Guest
}

export async function createGuest(weddingId: string, input: CreateGuestInput): Promise<Guest> {
  if (!supabase) throw new Error('Supabase ist nicht konfiguriert')

  const { data, error } = await supabase
    .from('guests')
    .insert({
      wedding_id: weddingId,
      name: input.name,
      salutation: input.salutation,
      email: input.email || null,
      guest_count: input.guest_count ?? 1,
    })
    .select()
    .single()

  if (error) throw error
  return data as Guest
}

export async function deleteGuest(guestId: string): Promise<void> {
  if (!supabase) throw new Error('Supabase ist nicht konfiguriert')

  const { error } = await supabase.from('guests').delete().eq('id', guestId)
  if (error) throw error
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

  let rsvp: Rsvp

  if (input.guest_id) {
    const { data: existingGuest } = await supabase
      .from('guests')
      .select('rsvp_id')
      .eq('id', input.guest_id)
      .single()

    if (existingGuest?.rsvp_id) {
      const { data, error } = await supabase
        .from('rsvps')
        .update({
          guest_name: input.guest_name,
          email: input.email || null,
          status: input.status,
          guest_count: input.guest_count,
          dietary_notes: input.dietary_notes || null,
          message: input.message || null,
        })
        .eq('id', existingGuest.rsvp_id)
        .select()
        .single()

      if (error) throw error
      rsvp = data as Rsvp
    } else {
      const { data, error } = await supabase
        .from('rsvps')
        .insert({
          wedding_id: weddingId,
          guest_id: input.guest_id,
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
      rsvp = data as Rsvp

      await supabase
        .from('guests')
        .update({ rsvp_id: rsvp.id })
        .eq('id', input.guest_id)
    }
  } else {
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
    rsvp = data as Rsvp
  }

  return rsvp
}
