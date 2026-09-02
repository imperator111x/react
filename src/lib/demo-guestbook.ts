import type { GuestbookEntry } from '../types/wedding'

export const DEMO_GUESTBOOK: GuestbookEntry[] = [
  {
    id: 'demo-gb-1',
    wedding_id: 'demo',
    guest_id: null,
    guest_name: 'Lisa & Tom',
    message: 'Wir freuen uns schon riesig auf euren großen Tag! 💕',
    is_visible: true,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-gb-2',
    wedding_id: 'demo',
    guest_id: null,
    guest_name: 'Oma Gertrud',
    message: 'Meine Lieben, ich werde da sein und ein Taschentuch bereithalten.',
    is_visible: true,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
]
