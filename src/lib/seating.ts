import type { CreateSeatingTableInput, Guest, SeatingTable, SeatingTableWithGuests } from '../types/wedding'
import { supabase } from './supabase'

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
  guest: Guest | null | undefined
): SeatingTable | null {
  if (!guest?.table_id) return null
  return tables.find((t) => t.id === guest.table_id) ?? null
}
