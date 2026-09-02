import type { CreateFaqInput } from '../types/wedding'

export const DEFAULT_FAQ_TEMPLATES: CreateFaqInput[] = [
  {
    question: 'Bis wann sollen wir zusagen?',
    answer:
      'Bitte gebt uns bis spätestens sechs Wochen vor der Hochzeit Bescheid, ob ihr kommen könnt – das hilft uns bei der Planung sehr.',
  },
  {
    question: 'Können wir Kinder mitbringen?',
    answer:
      'Kinder sind herzlich willkommen! Bitte teilt uns bei der Zusage mit, wie viele Personen ihr mitbringt.',
  },
  {
    question: 'Gibt es Parkplätze vor Ort?',
    answer:
      'Ja, vor Ort stehen Parkplätze zur Verfügung. Alternativ könnt ihr auch mit öffentlichen Verkehrsmitteln anreisen.',
  },
  {
    question: 'Was schenken wir euch?',
    answer:
      'Das größte Geschenk ist, dass ihr mit uns feiert! Wer uns trotzdem etwas mitgeben möchte, könnt uns gerne persönlich ansprechen.',
  },
]
