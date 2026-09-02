import type { Guest } from '../types/wedding'

export const DEMO_GUEST: Guest = {
  id: 'demo-guest',
  wedding_id: 'demo',
  name: 'Maria Schmidt',
  salutation: 'frau',
  email: 'maria@beispiel.de',
  guest_count: 2,
  invite_token: 'demo-gast',
  rsvp_id: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}
