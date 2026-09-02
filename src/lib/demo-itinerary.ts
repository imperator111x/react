import type { ItineraryItem } from '../types/wedding'

export const DEMO_ITINERARY: ItineraryItem[] = [
  {
    id: 'demo-1',
    wedding_id: 'demo',
    time_label: '14:00',
    title: 'Trauung',
    icon: 'church',
    sort_order: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    wedding_id: 'demo',
    time_label: '16:00',
    title: 'Sektempfang',
    icon: 'champagne',
    sort_order: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-3',
    wedding_id: 'demo',
    time_label: '18:00',
    title: 'Abendessen',
    icon: 'dinner',
    sort_order: 2,
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-4',
    wedding_id: 'demo',
    time_label: '19:30',
    title: 'Anschnitt der Hochzeitstorte',
    icon: 'cake',
    sort_order: 3,
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-5',
    wedding_id: 'demo',
    time_label: '20:00',
    title: 'Party & Tanz',
    icon: 'music',
    sort_order: 4,
    created_at: new Date().toISOString(),
  },
]
