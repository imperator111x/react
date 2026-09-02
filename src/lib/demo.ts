import type { Wedding } from '../types/wedding'

const ceremonyDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
ceremonyDate.setHours(14, 0, 0, 0)

const receptionDate = new Date(ceremonyDate)
receptionDate.setDate(receptionDate.getDate() + 1)
receptionDate.setHours(18, 0, 0, 0)

export const DEMO_WEDDING: Wedding = {
  id: 'demo',
  slug: 'demo',
  partner1_name: 'Anna',
  partner2_name: 'Max',
  wedding_date: ceremonyDate.toISOString(),
  ceremony_date: ceremonyDate.toISOString(),
  reception_date: receptionDate.toISOString(),
  ceremony_location: 'Standesamt München',
  ceremony_address: 'Marienplatz 1, 80331 München',
  reception_location: 'Schloss Belvedere',
  reception_address: 'Prinz-Eugen-Straße 27, 1030 Wien',
  story:
    'Wir haben uns 2019 bei einem gemeinsamen Wanderausflug in den Alpen kennengelernt. Was als zufälliges Treffen auf dem Gipfel begann, wurde zu unserer großen Liebe. Jetzt möchten wir mit euch den schönsten Tag unseres Lebens feiern!',
  dress_code: 'Festlich – gerne in Sommerfarben',
  email: 'demo@unserehochzeit.de',
  dashboard_token: 'demo-token',
  cover_image_url: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}
