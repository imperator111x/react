import type { SeatingTable, SeatingTableWithGuests } from '../types/wedding'
import { DEMO_GUEST } from './demo-guest'

export const DEMO_TABLES: SeatingTable[] = [
  {
    id: 'demo-table-1',
    wedding_id: 'demo',
    name: 'Tisch 1',
    sort_order: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-table-2',
    wedding_id: 'demo',
    name: 'Tisch 2',
    sort_order: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-table-3',
    wedding_id: 'demo',
    name: 'Tisch 3',
    sort_order: 2,
    created_at: new Date().toISOString(),
  },
]

export function getDemoSeatingPlan(): SeatingTableWithGuests[] {
  const guests = [
    {
      id: 'demo-g1',
      name: 'Anna Weber',
      salutation: 'frau' as const,
      table_id: 'demo-table-1',
      member_names: ['Tom Weber'],
      guest_count: 2,
    },
    {
      id: 'demo-g2',
      name: 'Müller',
      salutation: 'familie' as const,
      table_id: 'demo-table-1',
      member_names: ['Lisa Müller', 'Paul Müller', 'Emma Müller'],
      guest_count: 3,
    },
    {
      id: DEMO_GUEST.id,
      name: DEMO_GUEST.name,
      salutation: DEMO_GUEST.salutation,
      table_id: DEMO_GUEST.table_id!,
      member_names: DEMO_GUEST.member_names,
      guest_count: DEMO_GUEST.guest_count,
    },
    {
      id: 'demo-g4',
      name: 'Max Bauer',
      salutation: 'herr' as const,
      table_id: 'demo-table-3',
      member_names: [],
      guest_count: 1,
    },
  ]

  return DEMO_TABLES.map((table) => ({
    ...table,
    guests: guests.filter((guest) => guest.table_id === table.id),
  }))
}
