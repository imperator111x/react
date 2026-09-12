import type {
  CreateSeatingTableInput,
  Guest,
  Rsvp,
  RsvpStatus,
  SeatingTable,
  SeatingTableWithGuests,
} from '../types/wedding'
import { getSeatingSeats, type SeatingSeat } from './guests'
import { supabase } from './supabase'

/** Maximal legbare Tische pro Hochzeit */
export const MAX_SEATING_TABLES = 30

const NUMBERED_TABLE_PATTERN = /^(tisch|table|masa|sto)(?:\s*(\d+))?$/i

export type PublicTableNameOptions = {
  fallbackIndex?: number
  /** Übersetztes Wort für „Tisch“, z. B. Table / Masa / Sto */
  tableLabel?: string
}

/**
 * Öffentliche Anzeige: nur „Tisch 1“, ohne „– Freunde“ o. Ä.
 * Standardnamen (Tisch/Table/Masa/Sto, optional mit Zahl) werden lokalisiert.
 * Freie Namen bleiben unverändert.
 */
export function getPublicTableName(
  name: string,
  fallbackIndexOrOptions?: number | PublicTableNameOptions
): string {
  const options: PublicTableNameOptions =
    typeof fallbackIndexOrOptions === 'number'
      ? { fallbackIndex: fallbackIndexOrOptions }
      : (fallbackIndexOrOptions ?? {})
  const tableLabel = options.tableLabel?.trim() || 'Tisch'

  const trimmed = name.trim()
  const withoutSuffix = trimmed.split(/\s+[–-]\s+/)[0]?.trim() ?? trimmed

  if (withoutSuffix) {
    const numbered = withoutSuffix.match(NUMBERED_TABLE_PATTERN)
    if (numbered) {
      return numbered[2] ? `${tableLabel} ${numbered[2]}` : tableLabel
    }
    return withoutSuffix
  }

  return options.fallbackIndex != null
    ? `${tableLabel} ${options.fallbackIndex + 1}`
    : trimmed
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
    .select('id, name, salutation, table_id, member_names, member_table_ids, guest_count, rsvp_id')
    .eq('wedding_id', weddingId)
    .order('name', { ascending: true })

  const guestList = (guests ?? []) as Pick<
    Guest,
    | 'id'
    | 'name'
    | 'salutation'
    | 'table_id'
    | 'member_names'
    | 'member_table_ids'
    | 'guest_count'
    | 'rsvp_id'
  >[]

  const rsvpIds = guestList.map((g) => g.rsvp_id).filter(Boolean) as string[]
  let rsvpById = new Map<string, { member_names: string[]; status: RsvpStatus }>()
  if (rsvpIds.length > 0) {
    const { data: rsvps } = await supabase
      .from('rsvps')
      .select('id, member_names, status')
      .in('id', rsvpIds)
    for (const r of rsvps ?? []) {
      rsvpById.set(r.id, {
        member_names: (r.member_names as string[] | null) ?? [],
        status: r.status as RsvpStatus,
      })
    }
  }

  const enriched = guestList.map((g) => ({
    ...g,
    member_names: g.member_names ?? [],
    member_table_ids: g.member_table_ids ?? [],
    rsvp: g.rsvp_id ? rsvpById.get(g.rsvp_id) ?? null : null,
  }))

  return tables.map((table) => {
    const guestsAtTable = enriched
      .map((g) => {
        const seatsHere = getSeatingSeats(g).filter((s) => s.tableId === table.id)
        if (seatsHere.length === 0) return null
        return {
          ...g,
          seat_names: seatsHere.map((s) => s.name),
        }
      })
      .filter(Boolean) as SeatingTableWithGuests['guests']

    return { ...table, guests: guestsAtTable }
  })
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

  const { data: withMembers } = await supabase
    .from('guests')
    .select('id, member_table_ids')
    .contains('member_table_ids', [id])

  for (const guest of withMembers ?? []) {
    const next = ((guest.member_table_ids as string[] | null) ?? []).map((tid) =>
      tid === id ? '' : tid
    )
    await supabase.from('guests').update({ member_table_ids: next }).eq('id', guest.id)
  }

  const { error } = await supabase.from('seating_tables').delete().eq('id', id)
  if (error) throw error
}

/** Ganze Einladung an einen Tisch setzen (Begleitungen erben wieder den Haupttisch). */
export async function assignGuestToTable(
  guestId: string,
  tableId: string | null
): Promise<void> {
  if (!supabase) throw new Error('Supabase ist nicht konfiguriert')

  const { error } = await supabase
    .from('guests')
    .update({ table_id: tableId, member_table_ids: [] })
    .eq('id', guestId)

  if (error) throw error
}

/** Einzelne Person (Hauptgast oder +1/Familienmitglied) an einen Tisch setzen. */
export async function assignSeatToTable(
  guestId: string,
  memberIndex: number | null,
  tableId: string | null
): Promise<void> {
  if (!supabase) throw new Error('Supabase ist nicht konfiguriert')

  if (memberIndex == null) {
    const { error } = await supabase.from('guests').update({ table_id: tableId }).eq('id', guestId)
    if (error) throw error
    return
  }

  const { data: guest, error: loadError } = await supabase
    .from('guests')
    .select('member_names, member_table_ids')
    .eq('id', guestId)
    .single()

  if (loadError) throw loadError

  const memberNames = (guest?.member_names as string[] | null) ?? []
  const slotCount = Math.max(memberNames.length, memberIndex + 1)
  const next = [...((guest?.member_table_ids as (string | null)[] | null) ?? [])]
  while (next.length < slotCount) next.push(null)
  // '' = explizit kein Tisch; sonst Tisch-ID (nicht erben)
  next[memberIndex] = tableId ?? ''

  const { error } = await supabase
    .from('guests')
    .update({ member_table_ids: next })
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

export type SeatingPlanGuest = Pick<
  Guest,
  'id' | 'name' | 'salutation' | 'table_id' | 'member_names' | 'member_table_ids'
> & {
  rsvp?: Pick<Rsvp, 'member_names' | 'status'> | null
  seat_names?: string[]
}

export type GuestLookupResult =
  | { status: 'found'; guest: SeatingPlanGuest; tableId: string; seatName: string }
  | { status: 'not_found' }
  | { status: 'ambiguous'; count: number }
  | { status: 'no_table'; guest: SeatingPlanGuest; seatName: string }

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

/** Gast anhand des Namens (inkl. Familien-/Begleitungsnamen) im Tischplan finden. */
export function lookupGuestInPlan(
  plan: SeatingTableWithGuests[],
  query: string
): GuestLookupResult {
  const normalizedQuery = normalizeGuestName(query)
  if (!normalizedQuery) return { status: 'not_found' }

  const guests = uniquePlanGuests(plan)
  type Hit = { guest: SeatingPlanGuest; seat: SeatingSeat }
  const hitsFor = (match: (seatName: string) => boolean): Hit[] => {
    const hits: Hit[] = []
    for (const guest of guests) {
      for (const seat of getSeatingSeats(guest)) {
        if (match(normalizeGuestName(seat.name)) || match(normalizeGuestName(guest.name))) {
          // Prefer exact seat name matches; guest.name match only for primary-ish
          if (match(normalizeGuestName(seat.name))) {
            hits.push({ guest, seat })
          }
        }
      }
    }
    // dedupe by guestId+memberIndex
    const seen = new Set<string>()
    return hits.filter((h) => {
      const key = `${h.guest.id}:${h.seat.memberIndex}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  const pick = (hits: Hit[]): GuestLookupResult | null => {
    if (hits.length === 1) {
      const { guest, seat } = hits[0]
      return seat.tableId
        ? { status: 'found', guest, tableId: seat.tableId, seatName: seat.name }
        : { status: 'no_table', guest, seatName: seat.name }
    }
    if (hits.length > 1) return { status: 'ambiguous', count: hits.length }
    return null
  }

  for (const matcher of [
    (n: string) => n === normalizedQuery,
    (n: string) => n.startsWith(normalizedQuery),
    (n: string) => n.includes(normalizedQuery),
  ]) {
    const result = pick(hitsFor(matcher))
    if (result) return result
  }

  return { status: 'not_found' }
}
