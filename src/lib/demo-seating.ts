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
    { id: 'demo-g1', name: 'Anna Weber', salutation: 'frau' as const, table_id: 'demo-table-1' },
    { id: 'demo-g2', name: 'Tom Weber', salutation: 'herr' as const, table_id: 'demo-table-1' },
    {
      id: DEMO_GUEST.id,
      name: DEMO_GUEST.name,
      salutation: DEMO_GUEST.salutation,
      table_id: DEMO_GUEST.table_id!,
    },
    { id: 'demo-g4', name: 'Lisa Müller', salutation: 'frau' as const, table_id: 'demo-table-3' },
    { id: 'demo-g5', name: 'Max Bauer', salutation: 'herr' as const, table_id: 'demo-table-3' },
  ]

  return DEMO_TABLES.map((table) => ({
    ...table,
    guests: guests.filter((guest) => guest.table_id === table.id),
  }))
}
