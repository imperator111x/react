export type RsvpStatus = 'accepted' | 'declined' | 'pending'
export type Salutation = 'herr' | 'frau' | 'familie'

export const SALUTATION_OPTIONS: { value: Salutation; label: string }[] = [
  { value: 'herr', label: 'Herr' },
  { value: 'frau', label: 'Frau' },
  { value: 'familie', label: 'Familie' },
]

export interface Wedding {
  id: string
  slug: string
  partner1_name: string
  partner2_name: string
  wedding_date: string
  ceremony_date: string | null
  reception_date: string | null
  ceremony_location: string | null
  ceremony_address: string | null
  reception_location: string | null
  reception_address: string | null
  story: string | null
  dress_code: string | null
  invitation_text: string | null
  travel_info: string | null
  theme_id: string | null
  email: string
  dashboard_token: string
  cover_image_url: string | null
  created_at: string
  updated_at: string
}

export interface Guest {
  id: string
  wedding_id: string
  name: string
  salutation: Salutation
  email: string | null
  guest_count: number
  max_guest_count: number | null
  table_id: string | null
  invite_token: string
  rsvp_id: string | null
  created_at: string
  updated_at: string
}

export interface Rsvp {
  id: string
  wedding_id: string
  guest_id: string | null
  guest_name: string
  email: string | null
  status: RsvpStatus
  guest_count: number
  dietary_notes: string | null
  message: string | null
  created_at: string
  updated_at: string
}

export interface GuestWithRsvp extends Guest {
  rsvp?: Rsvp | null
}

export interface CreateWeddingInput {
  partner1_name: string
  partner2_name: string
  ceremony_date: string
  reception_date?: string
  ceremony_location?: string
  ceremony_address?: string
  reception_location?: string
  reception_address?: string
  story?: string
  dress_code?: string
  email: string
}

export interface UpdateWeddingInput {
  ceremony_date?: string
  reception_date?: string
  ceremony_location?: string
  ceremony_address?: string
  reception_location?: string
  reception_address?: string
  story?: string
  dress_code?: string
  invitation_text?: string
  travel_info?: string
  theme_id?: string
  cover_image_url?: string | null
}

export interface UpdateGuestInput {
  name?: string
  salutation?: Salutation
  email?: string | null
  guest_count?: number
  max_guest_count?: number
}

export interface CreateGuestInput {
  name: string
  salutation: Salutation
  email?: string
  guest_count?: number
  max_guest_count?: number
}

export interface RsvpInput {
  guest_name: string
  email?: string
  status: RsvpStatus
  guest_count: number
  dietary_notes?: string
  message?: string
  guest_id?: string
}

export interface GalleryImage {
  id: string
  wedding_id: string
  storage_path: string
  caption: string | null
  sort_order: number
  created_at: string
}

export type ItineraryIconName =
  | 'church'
  | 'champagne'
  | 'dinner'
  | 'cake'
  | 'music'
  | 'heart'
  | 'camera'
  | 'ring'
  | 'location'
  | 'sun'
  | 'moon'
  | 'gift'
  | 'flower'
  | 'sparkles'
  | 'guests'

export interface ItineraryItem {
  id: string
  wedding_id: string
  time_label: string
  title: string
  icon: ItineraryIconName
  sort_order: number
  created_at: string
}

export interface CreateItineraryInput {
  time_label: string
  title: string
  icon: ItineraryIconName
}

export interface FaqItem {
  id: string
  wedding_id: string
  question: string
  answer: string
  sort_order: number
  created_at: string
}

export interface CreateFaqInput {
  question: string
  answer: string
}

export interface GuestbookEntry {
  id: string
  wedding_id: string
  guest_id: string | null
  guest_name: string
  message: string
  is_visible: boolean
  created_at: string
}

export interface CreateGuestbookInput {
  guest_name: string
  message: string
  guest_id?: string
}

export interface SeatingTable {
  id: string
  wedding_id: string
  name: string
  sort_order: number
  created_at: string
}

export interface SeatingTableWithGuests extends SeatingTable {
  guests: Pick<Guest, 'id' | 'name' | 'salutation' | 'table_id'>[]
}

export interface CreateSeatingTableInput {
  name: string
}

export interface MusicWish {
  id: string
  wedding_id: string
  guest_id: string | null
  guest_name: string
  song_title: string
  artist: string | null
  created_at: string
}

export interface CreateMusicWishInput {
  guest_name: string
  song_title: string
  artist?: string
  guest_id?: string
}

export interface WishlistItem {
  id: string
  wedding_id: string
  title: string
  url: string | null
  description: string | null
  sort_order: number
  created_at: string
}

export interface CreateWishlistInput {
  title: string
  url?: string
  description?: string
}

export interface WeddingRecoveryInfo {
  id: string
  slug: string
  partner1_name: string
  partner2_name: string
  dashboard_token: string
}
