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

const BOTANICAL_CORNER_SVG = `<svg viewBox="0 0 80 80" aria-hidden="true" fill="none" width="40" height="40">
  <path d="M8 62 C18 48 28 38 42 34 C32 28 22 18 14 8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
  <ellipse cx="46" cy="30" rx="10" ry="4" fill="currentColor" opacity="0.35" transform="rotate(-25 46 30)"/>
  <ellipse cx="34" cy="42" rx="8" ry="3.5" fill="currentColor" opacity="0.25" transform="rotate(10 34 42)"/>
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
  return `${window.location.origin}${url.startsWith('/') ? url : `/${url}`}`
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

async function loadImageAsDataUrl(url: string): Promise<string | null> {
  try {
    const response = await fetch(toAbsoluteUrl(url), { credentials: 'same-origin' })
    if (!response.ok) return null
    return await blobToDataUrl(await response.blob())
  } catch {
    return null
  }
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
      margin: 8mm;
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
      background: white;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .print-root {
      width: 100%;
      height: 281mm;
      display: flex;
      align-items: stretch;
      justify-content: center;
      padding: 0;
    }

    .invitation-card {
      position: relative;
      width: 100%;
      height: 100%;
      max-height: 281mm;
      overflow: hidden;
      background: linear-gradient(180deg, #fffcf8 0%, #faf6f0 100%);
      border: 1px solid ${theme.gold};
      box-shadow: inset 0 0 0 3px #fffcf8, inset 0 0 0 4px ${theme.blush};
      padding: 10mm 12mm 8mm;
      display: flex;
      flex-direction: column;
    }

    .corner {
      position: absolute;
      color: ${theme.gold};
      opacity: 0.45;
      pointer-events: none;
    }

    .corner--tl { top: 6px; left: 6px; }
    .corner--tr { top: 6px; right: 6px; transform: scaleX(-1); }
    .corner--bl { bottom: 6px; left: 6px; transform: scaleY(-1); }
    .corner--br { bottom: 6px; right: 6px; transform: scale(-1); }

    .cover-wrap {
      position: relative;
      flex-shrink: 0;
      margin: -10mm -12mm 10px;
      height: 72px;
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
      inset: 0;
      background: linear-gradient(180deg, transparent 35%, rgba(255, 252, 248, 0.88) 100%);
      pointer-events: none;
    }

    .card-body {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    .eyebrow {
      text-align: center;
      color: ${theme.goldDark};
      letter-spacing: 0.38em;
      text-transform: uppercase;
      font-size: 8px;
      font-weight: 600;
      margin: 0 0 6px;
    }

    .headline {
      text-align: center;
      font-size: 16px;
      font-weight: 500;
      letter-spacing: 0.03em;
      margin: 0 0 4px;
      color: #3d3a36;
    }

    .headline em {
      font-style: italic;
      color: ${theme.gold};
    }

    .names {
      text-align: center;
      font-size: 30px;
      font-weight: 600;
      line-height: 1.1;
      margin: 0 0 4px;
      letter-spacing: 0.02em;
    }

    .names .amp {
      display: inline-block;
      margin: 0 0.1em;
      color: ${theme.gold};
      font-style: italic;
      font-weight: 500;
      font-size: 0.75em;
    }

    .date-banner {
      text-align: center;
      margin: 8px auto 10px;
    }

    .date-banner__meta {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 9px;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: ${theme.goldDark};
      margin-bottom: 4px;
    }

    .date-banner__rule {
      flex: 1;
      max-width: 48px;
      height: 1px;
      background: ${theme.blush};
    }

    .date-banner__rule--short {
      max-width: 20px;
    }

    .date-banner__date {
      display: block;
      font-size: 20px;
      font-weight: 600;
      letter-spacing: 0.06em;
      color: #2c2c2c;
    }

    .invitation-line {
      text-align: center;
      font-size: 13px;
      line-height: 1.45;
      color: #5c5650;
      margin: 0 auto 10px;
      max-width: 100%;
      font-style: italic;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .events {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 10px;
    }

    .events--single {
      grid-template-columns: 1fr;
      max-width: 240px;
      margin-left: auto;
      margin-right: auto;
    }

    .event-card {
      text-align: center;
      padding: 8px 6px;
      border: 1px solid ${theme.blush};
      background: rgba(255, 255, 255, 0.55);
    }

    .event-label {
      margin: 0 0 4px;
      font-size: 8px;
      letter-spacing: 0.28em;
      text-transform: uppercase;
      color: ${theme.goldDark};
    }

    .event-date {
      margin: 0 0 4px;
      font-size: 13px;
      font-weight: 600;
      line-height: 1.25;
      color: #2c2c2c;
    }

    .event-time {
      margin: 0;
      display: inline-block;
      padding: 2px 8px;
      border: 1px solid ${theme.gold}44;
      background: ${theme.gold}14;
      color: ${theme.goldDark};
      font-size: 11px;
    }

    .event-location {
      margin: 6px 0 0;
      font-size: 12px;
      color: #4a4540;
      line-height: 1.3;
    }

    .event-address {
      margin: 2px 0 0;
      font-size: 10px;
      color: #7a746c;
      line-height: 1.3;
    }

    .dresscode {
      text-align: center;
      margin: 0 auto 8px;
      padding: 6px 10px;
      border-top: 1px solid ${theme.blush};
      border-bottom: 1px solid ${theme.blush};
      max-width: 320px;
    }

    .dresscode-label {
      margin: 0 0 2px;
      font-size: 8px;
      letter-spacing: 0.28em;
      text-transform: uppercase;
      color: ${theme.goldDark};
    }

    .dresscode-text {
      margin: 0;
      font-size: 13px;
      color: #4a4540;
    }

    .story {
      text-align: center;
      margin: 0 auto 8px;
      max-width: 100%;
    }

    .story-title {
      margin: 0 0 4px;
      font-size: 8px;
      letter-spacing: 0.24em;
      text-transform: uppercase;
      color: ${theme.goldDark};
    }

    .story-text {
      margin: 0;
      font-size: 12px;
      line-height: 1.45;
      color: #5c5650;
      font-style: italic;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .rsvp {
      margin-top: auto;
      padding: 8px 10px;
      background: ${theme.gold}10;
      border: 1px dashed ${theme.gold}66;
    }

    .rsvp-inner {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }

    .rsvp-qr {
      width: 68px;
      height: 68px;
      padding: 4px;
      background: white;
      border: 1px solid ${theme.blush};
      flex-shrink: 0;
    }

    .rsvp-text {
      flex: 1;
      min-width: 0;
      text-align: left;
    }

    .rsvp-label {
      margin: 0 0 3px;
      font-size: 12px;
      color: #4a4540;
      line-height: 1.3;
    }

    .rsvp-url {
      margin: 0 0 3px;
      font-size: 9px;
      letter-spacing: 0.01em;
      color: ${theme.goldDark};
      word-break: break-all;
      line-height: 1.3;
    }

    .rsvp-qr-hint {
      margin: 0;
      font-size: 10px;
      color: #7a746c;
      font-style: italic;
      line-height: 1.3;
    }

    .footer {
      text-align: center;
      font-size: 8px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #9a948c;
      margin: 6px 0 0;
      padding-top: 6px;
      border-top: 1px solid ${theme.blush};
      flex-shrink: 0;
    }

    @media print {
      html, body {
        width: 210mm;
        height: 297mm;
        overflow: hidden;
      }

      .print-root {
        height: 281mm;
        page-break-after: avoid;
        page-break-inside: avoid;
      }

      .invitation-card {
        box-shadow: none;
        page-break-inside: avoid;
        break-inside: avoid;
      }
    }
  `
}

function openPrintWindow(html: string): void {
  const win = window.open('', '_blank')
  if (!win) return

  win.document.write(html)
  win.document.close()

  let printed = false
  const triggerPrint = () => {
    if (printed) return
    printed = true
    win.focus()
    win.print()
  }

  const waitForImages = () => {
    const imgs = Array.from(win.document.images)
    if (imgs.length === 0) {
      triggerPrint()
      return
    }

    Promise.all(
      imgs.map(
        (img) =>
          new Promise<void>((resolve) => {
            if (img.complete && img.naturalWidth > 0) resolve()
            else {
              img.onload = () => resolve()
              img.onerror = () => resolve()
            }
          })
      )
    ).then(() => setTimeout(triggerPrint, 200))
  }

  if (win.document.readyState === 'complete') {
    waitForImages()
  } else {
    win.addEventListener('load', waitForImages)
  }

  setTimeout(triggerPrint, 3000)
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
      width: 180,
      margin: 1,
      color: { dark: theme.goldDark, light: '#ffffff' },
    })
  } catch {
    /* QR optional */
  }

  const coverResolved = resolveCoverImageUrl(wedding.cover_image_url)
  let coverSrc: string | null = null
  if (coverResolved) {
    coverSrc = (await loadImageAsDataUrl(coverResolved)) ?? toAbsoluteUrl(coverResolved)
  }

  const coverBlock = coverSrc
    ? `<div class="cover-wrap"><img src="${coverSrc.replace(/"/g, '&quot;')}" alt="" /></div>`
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
    ? format(new Date(ceremonyIso), 'EEEE', { locale: dfLocale })
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

      <div class="card-body">
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
      </div>

      <p class="footer">${escapeHtml(translate(locale, 'print.footerCredit'))}</p>
    </article>
  </div>
</body>
</html>`

  openPrintWindow(html)
}
