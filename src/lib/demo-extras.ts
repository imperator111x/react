import type { MusicWish, WishlistItem } from '../types/wedding'

export const DEMO_MUSIC_WISHES: MusicWish[] = [
  {
    id: 'demo-music-1',
    wedding_id: 'demo',
    guest_id: null,
    guest_name: 'Anna Weber',
    song_title: 'Dancing Queen',
    artist: 'ABBA',
    created_at: new Date().toISOString(),
  },
]

export const DEMO_WISHLIST: WishlistItem[] = [
  {
    id: 'demo-wish-1',
    wedding_id: 'demo',
    title: 'Reisekasse',
    url: null,
    description: 'Für unsere Flitterwochen freuen wir uns über einen Beitrag.',
    sort_order: 0,
    created_at: new Date().toISOString(),
  },
]
