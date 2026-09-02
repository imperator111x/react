import type { SeatingTable } from '../types/wedding'

export const DEMO_TABLES: SeatingTable[] = [
  {
    id: 'demo-table-1',
    wedding_id: 'demo',
    name: 'Tisch 1 – Familie',
    sort_order: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-table-2',
    wedding_id: 'demo',
    name: 'Tisch 2 – Freunde',
    sort_order: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-table-3',
    wedding_id: 'demo',
    name: 'Tisch 3 – Arbeitskollegen',
    sort_order: 2,
    created_at: new Date().toISOString(),
  },
]
