import { format } from 'date-fns'
import QRCode from 'qrcode'
import { getDateFnsLocale, translate, type Locale } from '../i18n'
import { getInvitationText } from './invitation-text'
import { resolveCoverImageUrl } from './cover-url'
import { getWeddingTheme } from './themes'
import {
  formatBannerDate,
  formatEventDate,
  formatEventTime,
  getCeremonyDate,
} from './wedding-dates'
import type { Wedding } from '../types/wedding'

const BOTANICAL_CORNER_SVG = `<svg viewBox="0 0 80 80" aria-hidden="true" fill="none" width="56" height="56">
  <path d="M8 62 C18 48 28 38 42 34 C32 28 22 18 14 8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
  <ellipse cx="46" cy="30" rx="10" ry="4" fill="currentColor" opacity="0.35" transform="rotate(-25 46 30)"/>
  <ellipse cx="34" cy="42" rx="8" ry="3.5" fill="currentColor" opacity="0.25" transform="rotate(10 34 42)"/>
  <ellipse cx="22" cy="24" rx="7" ry="3" fill="currentColor" opacity="0.2" transform="rotate(-40 22 24)"/>
</svg>`

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function toAbsoluteUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  const path = url.startsWith('/') ? url : `/${url}`
  return `${window.location.origin}${base}${path}`
}

function renderLocationBlock(location?: string | null, address?: string | null): string {
  const parts: string[] = []
  if (location) parts.push(`<p class="event-location">${escapeHtml(location)}</p>`)
  if (address) parts.push(`<p class="event-address">${escapeHtml(address)}</p>`)
  return parts.join('')
}

function renderEventCard(
  label: string,
  dateIso: string,
  location: string | null | undefined,
  address: string | null | undefined,
  locale: Locale
): string {
  return `<article class="event-card">
    <p class="event-label">${escapeHtml(label)}</p>
    <p class="event-date">${escapeHtml(formatEventDate(dateIso, locale))}</p>
    <p class="event-time">${escapeHtml(formatEventTime(dateIso, locale))}</p>
    ${renderLocationBlock(location, address)}
  </article>`
}

function buildPrintStyles(theme: ReturnType<typeof getWeddingTheme>): string {
  return `
    @page {
      size: A4 portrait;
      margin: 14mm;
    }

    * {
      box-sizing: border-box;
    }

    html, body {
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Cormorant Garamond', Georgia, 'Times New Roman', serif;
      color: #2c2c2c;
      background: #f3efe8;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .print-root {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px 16px;
    }

    .invitation-card {
      position: relative;
      width: 100%;
      max-width: 580px;
      background: linear-gradient(180deg, #fffcf8 0%, #faf6f0 100%);
      border: 1px solid ${theme.gold};
      box-shadow: inset 0 0 0 4px #fffcf8, inset 0 0 0 5px ${theme.blush};
      padding: 36px 32px 32px;
    }

    .corner {
      position: absolute;
      color: ${theme.gold};
      opacity: 0.55;
      pointer-events: none;
    }

    .corner--tl { top: 10px; left: 10px; }
    .corner--tr { top: 10px; right: 10px; transform: scaleX(-1); }
    .corner--bl { bottom: 10px; left: 10px; transform: scaleY(-1); }
    .corner--br { bottom: 10px; right: 10px; transform: scale(-1); }

    .cover-wrap {
      position: relative;
      margin: -36px -32px 28px;
      height: 180px;
      overflow: hidden;
      border-bottom: 1px solid ${theme.blush};
    }

    .cover-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .cover-wrap::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      height: 180px;
      background: linear-gradient(180deg, transparent 40%, rgba(255, 252, 248, 0.92) 100%);
      pointer-events: none;
    }

    .eyebrow {
      text-align: center;
      color: ${theme.goldDark};
      letter-spacing: 0.42em;
      text-transform: uppercase;
      font-size: 10px;
      font-weight: 600;
      margin: 0 0 18px;
    }

    .headline {
      text-align: center;
      font-size: 22px;
      font-weight: 500;
      letter-spacing: 0.04em;
      margin: 0 0 6px;
      color: #3d3a36;
    }

    .headline em {
      font-style: italic;
      color: ${theme.gold};
    }

    .names {
      text-align: center;
      font-size: 42px;
      font-weight: 600;
      line-height: 1.15;
      margin: 0 0 8px;
      letter-spacing: 0.02em;
    }

    .names .amp {
      display: inline-block;
      margin: 0 0.12em;
      color: ${theme.gold};
      font-style: italic;
      font-weight: 500;
      font-size: 0.78em;
    }

    .date-banner {
      text-align: center;
      margin: 22px auto 26px;
      max-width: 360px;
    }

    .date-banner__meta {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      font-size: 11px;
      letter-spacing: 0.28em;
      text-transform: uppercase;
      color: ${theme.goldDark};
      margin-bottom: 10px;
    }

    .date-banner__rule {
      flex: 1;
      max-width: 64px;
      height: 1px;
      background: ${theme.blush};
    }

    .date-banner__rule--short {
      max-width: 28px;
    }

    .date-banner__date {
      display: block;
      font-size: 28px;
      font-weight: 600;
      letter-spacing: 0.08em;
      color: #2c2c2c;
    }

    .invitation-line {
      text-align: center;
      font-size: 17px;
      line-height: 1.65;
      color: #5c5650;
      margin: 0 auto 28px;
      max-width: 420px;
      font-style: italic;
    }

    .events {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }

    .events--single {
      grid-template-columns: 1fr;
      max-width: 280px;
      margin-left: auto;
      margin-right: auto;
    }

    .event-card {
      text-align: center;
      padding: 18px 14px 16px;
      border: 1px solid ${theme.blush};
      background: rgba(255, 255, 255, 0.55);
      border-radius: 2px;
    }

    .event-label {
      margin: 0 0 10px;
      font-size: 10px;
      letter-spacing: 0.32em;
      text-transform: uppercase;
      color: ${theme.goldDark};
    }

    .event-date {
      margin: 0 0 8px;
      font-size: 18px;
      font-weight: 600;
      line-height: 1.35;
      color: #2c2c2c;
    }

    .event-time {
      margin: 0;
      display: inline-block;
      padding: 4px 14px;
      border: 1px solid ${theme.gold}44;
      background: ${theme.gold}14;
      color: ${theme.goldDark};
      font-size: 14px;
      letter-spacing: 0.06em;
    }

    .event-location {
      margin: 12px 0 0;
      font-size: 15px;
      color: #4a4540;
    }

    .event-address {
      margin: 4px 0 0;
      font-size: 13px;
      color: #7a746c;
    }

    .dresscode {
      text-align: center;
      margin: 0 auto 24px;
      padding: 14px 18px;
      border-top: 1px solid ${theme.blush};
      border-bottom: 1px solid ${theme.blush};
      max-width: 360px;
    }

    .dresscode-label {
      margin: 0 0 6px;
      font-size: 10px;
      letter-spacing: 0.32em;
      text-transform: uppercase;
      color: ${theme.goldDark};
    }

    .dresscode-text {
      margin: 0;
      font-size: 16px;
      color: #4a4540;
    }

    .story {
      text-align: center;
      margin: 0 auto 26px;
      max-width: 420px;
      padding-top: 4px;
    }

    .story-title {
      margin: 0 0 10px;
      font-size: 11px;
      letter-spacing: 0.28em;
      text-transform: uppercase;
      color: ${theme.goldDark};
    }

    .story-text {
      margin: 0;
      font-size: 16px;
      line-height: 1.7;
      color: #5c5650;
      font-style: italic;
    }

    .rsvp {
      text-align: center;
      margin: 0 auto 22px;
      padding: 18px 20px;
      background: ${theme.gold}10;
      border: 1px dashed ${theme.gold}66;
      max-width: 440px;
    }

    .rsvp-inner {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
    }

    .rsvp-qr {
      width: 120px;
      height: 120px;
      padding: 6px;
      background: white;
      border: 1px solid ${theme.blush};
      border-radius: 4px;
    }

    .rsvp-text {
      flex: 1;
      min-width: 0;
    }

    .rsvp-label {
      margin: 0 0 8px;
      font-size: 15px;
      color: #4a4540;
    }

    .rsvp-url {
      margin: 0 0 8px;
      font-size: 12px;
      letter-spacing: 0.02em;
      color: ${theme.goldDark};
      word-break: break-all;
    }

    .rsvp-qr-hint {
      margin: 0;
      font-size: 12px;
      color: #7a746c;
      font-style: italic;
    }

    .footer {
      text-align: center;
      font-size: 11px;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: #9a948c;
      margin: 8px 0 0;
      padding-top: 16px;
      border-top: 1px solid ${theme.blush};
    }

    @media print {
      body {
        background: white;
      }

      .print-root {
        padding: 0;
        min-height: auto;
      }

      .invitation-card {
        box-shadow: none;
        max-width: none;
      }
    }
  `
}

export async function printInvitation(wedding: Wedding, locale: Locale = 'de'): Promise<void> {
  const theme = getWeddingTheme(wedding.theme_id)
  const dfLocale = getDateFnsLocale(locale)
  const ceremonyIso = wedding.ceremony_date ?? wedding.wedding_date
  const receptionIso = wedding.reception_date
  const invitationLine = getInvitationText(wedding.invitation_text, null, locale)

  const base = `${window.location.origin}${import.meta.env.BASE_URL.replace(/\/$/, '')}`
  const invitationUrl = `${base}/e/${wedding.slug}`

  let qrDataUrl = ''
  try {
    qrDataUrl = await QRCode.toDataURL(invitationUrl, {
      width: 240,
      margin: 1,
      color: { dark: theme.goldDark, light: '#ffffff' },
    })
  } catch {
    /* QR optional – Druck funktioniert auch ohne Code */
  }

  const coverUrl = resolveCoverImageUrl(wedding.cover_image_url)
  const coverBlock = coverUrl
    ? `<div class="cover-wrap"><img src="${escapeHtml(toAbsoluteUrl(coverUrl))}" alt="" /></div>`
    : ''

  const ceremonyBlock = ceremonyIso
    ? renderEventCard(
        translate(locale, 'hero.ceremony'),
        ceremonyIso,
        wedding.ceremony_location,
        wedding.ceremony_address,
        locale
      )
    : ''

  const receptionBlock = receptionIso
    ? renderEventCard(
        translate(locale, 'hero.reception'),
        receptionIso,
        wedding.reception_location,
        wedding.reception_address,
        locale
      )
    : ''

  const eventCount = [ceremonyBlock, receptionBlock].filter(Boolean).length
  const eventsClass = eventCount <= 1 ? 'events events--single' : 'events'

  const dressBlock = wedding.dress_code
    ? `<div class="dresscode">
        <p class="dresscode-label">${escapeHtml(translate(locale, 'details.dresscode'))}</p>
        <p class="dresscode-text">${escapeHtml(wedding.dress_code)}</p>
      </div>`
    : ''

  const storyBlock = wedding.story
    ? `<section class="story">
        <p class="story-title">${escapeHtml(translate(locale, 'story.title'))}</p>
        <p class="story-text">${escapeHtml(wedding.story)}</p>
      </section>`
    : ''

  const weekday = ceremonyIso
    ? format(new Date(ceremonyIso), locale === 'en' ? 'EEEE' : 'EEEE', { locale: dfLocale })
    : ''
  const bannerDate = ceremonyIso
    ? formatBannerDate(ceremonyIso, locale)
    : format(getCeremonyDate(wedding) ?? new Date(wedding.wedding_date), 'd. MMMM yyyy', {
        locale: dfLocale,
      })
  const bannerTime = ceremonyIso ? formatEventTime(ceremonyIso, locale) : ''

  const html = `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(wedding.partner1_name)} & ${escapeHtml(wedding.partner2_name)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap" rel="stylesheet" />
  <style>${buildPrintStyles(theme)}</style>
</head>
<body>
  <div class="print-root">
    <article class="invitation-card">
      <div class="corner corner--tl">${BOTANICAL_CORNER_SVG}</div>
      <div class="corner corner--tr">${BOTANICAL_CORNER_SVG}</div>
      <div class="corner corner--bl">${BOTANICAL_CORNER_SVG}</div>
      <div class="corner corner--br">${BOTANICAL_CORNER_SVG}</div>

      ${coverBlock}

      <p class="eyebrow">${escapeHtml(translate(locale, 'hero.saveTheDate'))}</p>

      <p class="headline">
        ${escapeHtml(translate(locale, 'hero.sayYesPrefix'))}
        <em>${escapeHtml(translate(locale, 'hero.sayYesEmphasis'))}</em>
      </p>

      <h1 class="names">
        ${escapeHtml(wedding.partner1_name)}
        <span class="amp">&</span>
        ${escapeHtml(wedding.partner2_name)}
      </h1>

      <div class="date-banner">
        ${
          ceremonyIso
            ? `<div class="date-banner__meta">
                <span class="date-banner__rule"></span>
                <span>${escapeHtml(weekday)}</span>
                <span class="date-banner__rule date-banner__rule--short"></span>
                <span>${escapeHtml(bannerTime)}</span>
                <span class="date-banner__rule"></span>
              </div>`
            : ''
        }
        <span class="date-banner__date">${escapeHtml(bannerDate)}</span>
      </div>

      <p class="invitation-line">${escapeHtml(invitationLine)}</p>

      <div class="${eventsClass}">
        ${ceremonyBlock}
        ${receptionBlock}
      </div>

      ${dressBlock}
      ${storyBlock}

      <div class="rsvp">
        <div class="rsvp-inner">
          ${qrDataUrl ? `<img class="rsvp-qr" src="${qrDataUrl}" alt="${escapeHtml(translate(locale, 'print.qrAlt'))}" />` : ''}
          <div class="rsvp-text">
            <p class="rsvp-label">${escapeHtml(translate(locale, 'print.rsvpHint'))}</p>
            <p class="rsvp-url">${escapeHtml(invitationUrl)}</p>
            ${qrDataUrl ? `<p class="rsvp-qr-hint">${escapeHtml(translate(locale, 'print.qrHint'))}</p>` : ''}
          </div>
        </div>
      </div>

      <p class="footer">${escapeHtml(translate(locale, 'print.footerCredit'))}</p>
    </article>
  </div>
</body>
</html>`

  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(html)
  win.document.close()
  win.focus()
  win.onload = () => {
    win.print()
  }
  setTimeout(() => win.print(), 800)
}
