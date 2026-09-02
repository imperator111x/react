import type { FaqItem } from '../types/wedding'

export const DEMO_FAQ: FaqItem[] = [
  {
    id: 'demo-faq-1',
    wedding_id: 'demo',
    question: 'Bis wann sollen wir zusagen?',
    answer:
      'Bitte gebt uns bis spätestens sechs Wochen vor der Hochzeit Bescheid, ob ihr kommen könnt – das hilft uns bei der Planung sehr.',
    sort_order: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-faq-2',
    wedding_id: 'demo',
    question: 'Können wir Kinder mitbringen?',
    answer:
      'Kinder sind herzlich willkommen! Bitte teilt uns bei der Zusage mit, wie viele Personen ihr mitbringt.',
    sort_order: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-faq-3',
    wedding_id: 'demo',
    question: 'Gibt es Parkplätze vor Ort?',
    answer:
      'Ja, am Standesamt und an der Feierlocation stehen ausreichend Parkplätze zur Verfügung. Alternativ könnt ihr auch mit öffentlichen Verkehrsmitteln anreisen.',
    sort_order: 2,
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-faq-4',
    wedding_id: 'demo',
    question: 'Was schenken wir euch?',
    answer:
      'Das größte Geschenk ist, dass ihr mit uns feiert! Wer uns trotzdem etwas mitgeben möchte, findet Hinweise in der Einladung oder könnt uns gerne persönlich ansprechen.',
    sort_order: 3,
    created_at: new Date().toISOString(),
  },
]
