export type RsvpStatus = 'accepted' | 'declined' | 'pending'

export interface Wedding {
  id: string
  slug: string
  partner1_name: string
  partner2_name: string
  wedding_date: string
  ceremony_location: string | null
  ceremony_address: string | null
  reception_location: string | null
  reception_address: string | null
  story: string | null
  dress_code: string | null
  email: string
  dashboard_token: string
  cover_image_url: string | null
  created_at: string
  updated_at: string
}

export interface Rsvp {
  id: string
  wedding_id: string
  guest_name: string
  email: string | null
  status: RsvpStatus
  guest_count: number
  dietary_notes: string | null
  message: string | null
  created_at: string
  updated_at: string
}

export interface CreateWeddingInput {
  partner1_name: string
  partner2_name: string
  wedding_date: string
  ceremony_location?: string
  ceremony_address?: string
  reception_location?: string
  reception_address?: string
  story?: string
  dress_code?: string
  email: string
}

export interface RsvpInput {
  guest_name: string
  email?: string
  status: RsvpStatus
  guest_count: number
  dietary_notes?: string
  message?: string
}
