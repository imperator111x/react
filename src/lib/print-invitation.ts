import { format } from 'date-fns'
import { getDateFnsLocale, translate, type Locale } from '../i18n'
import { getWeddingTheme } from './themes'
import {
  formatEventDate,
  formatEventTime,
  getCeremonyDate,
} from './wedding-dates'
import type { Wedding } from '../types/wedding'

export function printInvitation(wedding: Wedding, locale: Locale = 'de'): void {
  const theme = getWeddingTheme(wedding.theme_id)
  const dfLocale = getDateFnsLocale(locale)
  const ceremonyIso = wedding.ceremony_date ?? wedding.wedding_date
  const receptionIso = wedding.reception_date

  const ceremonyBlock = ceremonyIso
    ? `<p><strong>${translate(locale, 'hero.ceremony')}</strong><br/>
       ${formatEventDate(ceremonyIso, locale)}<br/>
       ${formatEventTime(ceremonyIso, locale)}<br/>
       ${[wedding.ceremony_location, wedding.ceremony_address].filter(Boolean).join(' · ')}</p>`
    : ''

  const receptionBlock = receptionIso
    ? `<p><strong>${translate(locale, 'hero.reception')}</strong><br/>
       ${formatEventDate(receptionIso, locale)}<br/>
       ${formatEventTime(receptionIso, locale)}<br/>
       ${[wedding.reception_location, wedding.reception_address].filter(Boolean).join(' · ')}</p>`
    : ''

  const dressBlock = wedding.dress_code
    ? `<p><strong>${translate(locale, 'details.dresscode')}</strong><br/>${wedding.dress_code}</p>`
    : ''

  const storyBlock = wedding.story
    ? `<section><h2>${translate(locale, 'story.title')}</h2><p>${wedding.story}</p></section>`
    : ''

  const dateLabel = ceremonyIso
    ? format(new Date(ceremonyIso), locale === 'en' ? 'MMMM d, yyyy' : 'd. MMMM yyyy', {
        locale: dfLocale,
      })
    : format(getCeremonyDate(wedding) ?? new Date(wedding.wedding_date), 'd. MMMM yyyy', {
        locale: dfLocale,
      })

  const html = `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8" />
  <title>${wedding.partner1_name} & ${wedding.partner2_name}</title>
  <style>
    @page { margin: 18mm; }
    body {
      font-family: Georgia, 'Times New Roman', serif;
      color: #2c2c2c;
      max-width: 680px;
      margin: 0 auto;
      padding: 24px;
      line-height: 1.6;
    }
    .ornament {
      text-align: center;
      color: ${theme.gold};
      letter-spacing: 0.35em;
      text-transform: uppercase;
      font-size: 11px;
      margin-bottom: 12px;
    }
    h1 {
      text-align: center;
      font-size: 36px;
      font-weight: normal;
      margin: 0 0 8px;
    }
    .date {
      text-align: center;
      color: ${theme.goldDark};
      font-size: 18px;
      margin-bottom: 32px;
    }
    h2 {
      font-size: 20px;
      color: ${theme.goldDark};
      border-bottom: 1px solid ${theme.blush};
      padding-bottom: 6px;
      margin-top: 28px;
    }
    p { margin: 12px 0; color: #4a4540; }
    .footer {
      margin-top: 40px;
      text-align: center;
      font-size: 12px;
      color: #8a847c;
    }
  </style>
</head>
<body>
  <p class="ornament">${translate(locale, 'hero.saveTheDate')}</p>
  <h1>${wedding.partner1_name} <span style="color:${theme.gold};font-style:italic">&</span> ${wedding.partner2_name}</h1>
  <p class="date">${dateLabel}</p>
  <section>
    <h2>${translate(locale, 'details.title')}</h2>
    ${ceremonyBlock}
    ${receptionBlock}
    ${dressBlock}
  </section>
  ${storyBlock}
  <p class="footer">${translate(locale, 'common.createdWith')}</p>
</body>
</html>`

  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(html)
  win.document.close()
  win.focus()
  win.print()
}
