import type { CreateSeatingTableInput, Guest, SeatingTable, SeatingTableWithGuests } from '../types/wedding'
import { supabase } from './supabase'

/** Maximal legbare Tische pro Hochzeit */
export const MAX_SEATING_TABLES = 30

/** Öffentliche Anzeige: nur „Tisch 1“, ohne „– Freunde“ o. Ä. */
export function getPublicTableName(name: string, fallbackIndex?: number): string {
  const trimmed = name.trim()
  const withoutSuffix = trimmed.split(/\s+[–-]\s+/)[0]?.trim() ?? trimmed
  if (withoutSuffix) return withoutSuffix
  return fallbackIndex != null ? `Tisch ${fallbackIndex + 1}` : trimmed
}

export async function getSeatingTables(weddingId: string): Promise<SeatingTable[]> {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('seating_tables')
    .select('*')
    .eq('wedding_id', weddingId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) return []
  return data as SeatingTable[]
}

export async function getSeatingPlan(weddingId: string): Promise<SeatingTableWithGuests[]> {
  const tables = await getSeatingTables(weddingId)
  if (!supabase) return tables.map((table) => ({ ...table, guests: [] }))

  const { data: guests } = await supabase
    .from('guests')
    .select('id, name, salutation, table_id')
    .eq('wedding_id', weddingId)
    .order('name', { ascending: true })

  const guestList = (guests ?? []) as Pick<Guest, 'id' | 'name' | 'salutation' | 'table_id'>[]

  return tables.map((table) => ({
    ...table,
    guests: guestList.filter((g) => g.table_id === table.id),
  }))
}

export async function createSeatingTable(
  weddingId: string,
  input: CreateSeatingTableInput
): Promise<SeatingTable> {
  if (!supabase) throw new Error('Supabase ist nicht konfiguriert')

  const existingTables = await getSeatingTables(weddingId)
  if (existingTables.length >= MAX_SEATING_TABLES) {
    throw new Error(`Maximal ${MAX_SEATING_TABLES} Tische möglich.`)
  }

  const { data: existing } = await supabase
    .from('seating_tables')
    .select('sort_order')
    .eq('wedding_id', weddingId)
    .order('sort_order', { ascending: false })
    .limit(1)

  const nextOrder = existing?.[0]?.sort_order != null ? existing[0].sort_order + 1 : 0

  const { data, error } = await supabase
    .from('seating_tables')
    .insert({
      wedding_id: weddingId,
      name: input.name.trim(),
      sort_order: nextOrder,
    })
    .select()
    .single()

  if (error) throw error
  return data as SeatingTable
}

export async function deleteSeatingTable(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase ist nicht konfiguriert')

  await supabase.from('guests').update({ table_id: null }).eq('table_id', id)
  const { error } = await supabase.from('seating_tables').delete().eq('id', id)
  if (error) throw error
}

export async function assignGuestToTable(
  guestId: string,
  tableId: string | null
): Promise<void> {
  if (!supabase) throw new Error('Supabase ist nicht konfiguriert')

  const { error } = await supabase
    .from('guests')
    .update({ table_id: tableId })
    .eq('id', guestId)

  if (error) throw error
}

export function getGuestTable(
  tables: SeatingTable[],
  guest: Pick<Guest, 'table_id'> | null | undefined
): SeatingTable | null {
  if (!guest?.table_id) return null
  return tables.find((t) => t.id === guest.table_id) ?? null
}

export type SeatingPlanGuest = Pick<Guest, 'id' | 'name' | 'salutation' | 'table_id'>

export type GuestLookupResult =
  | { status: 'found'; guest: SeatingPlanGuest }
  | { status: 'not_found' }
  | { status: 'ambiguous'; count: number }
  | { status: 'no_table'; guest: SeatingPlanGuest }

function normalizeGuestName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/\s+/g, ' ')
}

function uniquePlanGuests(plan: SeatingTableWithGuests[]): SeatingPlanGuest[] {
  const byId = new Map<string, SeatingPlanGuest>()
  for (const table of plan) {
    for (const guest of table.guests) {
      byId.set(guest.id, guest)
    }
  }
  return [...byId.values()]
}

/** Gast anhand des Namens im Tischplan finden (für öffentliche Namenssuche). */
export function lookupGuestInPlan(
  plan: SeatingTableWithGuests[],
  query: string
): GuestLookupResult {
  const normalizedQuery = normalizeGuestName(query)
  if (!normalizedQuery) return { status: 'not_found' }

  const guests = uniquePlanGuests(plan)
  const exact = guests.filter((g) => normalizeGuestName(g.name) === normalizedQuery)
  if (exact.length === 1) {
    return exact[0].table_id
      ? { status: 'found', guest: exact[0] }
      : { status: 'no_table', guest: exact[0] }
  }
  if (exact.length > 1) return { status: 'ambiguous', count: exact.length }

  const startsWith = guests.filter((g) => normalizeGuestName(g.name).startsWith(normalizedQuery))
  if (startsWith.length === 1) {
    return startsWith[0].table_id
      ? { status: 'found', guest: startsWith[0] }
      : { status: 'no_table', guest: startsWith[0] }
  }
  if (startsWith.length > 1) return { status: 'ambiguous', count: startsWith.length }

  const contains = guests.filter((g) => normalizeGuestName(g.name).includes(normalizedQuery))
  if (contains.length === 1) {
    return contains[0].table_id
      ? { status: 'found', guest: contains[0] }
      : { status: 'no_table', guest: contains[0] }
  }
  if (contains.length > 1) return { status: 'ambiguous', count: contains.length }

  return { status: 'not_found' }
}
