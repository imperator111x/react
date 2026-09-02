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

const BOTANICAL_CORNER_SVG = `<svg viewBox="0 0 80 80" aria-hidden="true" fill="none" width="48" height="48">
  <path d="M8 62 C18 48 28 38 42 34 C32 28 22 18 14 8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
  <ellipse cx="46" cy="30" rx="10" ry="4" fill="currentColor" opacity="0.35" transform="rotate(-25 46 30)"/>
  <ellipse cx="34" cy="42" rx="8" ry="3.5" fill="currentColor" opacity="0.25" transform="rotate(10 34 42)"/>
  <ellipse cx="22" cy="24" rx="7" ry="3" fill="currentColor" opacity="0.2" transform="rotate(-40 22 24)"/>
</svg>`

function ornamentDivider(theme: ReturnType<typeof getWeddingTheme>): string {
  return `<div class="ornament" aria-hidden="true">
    <span class="ornament__line" style="background:${theme.blush}"></span>
    <span class="ornament__diamond" style="color:${theme.gold}">✦</span>
    <span class="ornament__line" style="background:${theme.blush}"></span>
  </div>`
}

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
  locale: Locale,
  theme: ReturnType<typeof getWeddingTheme>
): string {
  return `<article class="event-card" style="border-top-color:${theme.gold}">
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
      margin: 10mm;
    }

    * {
      box-sizing: border-box;
    }

    html, body {
      margin: 0;
      padding: 0;
      height: auto;
    }

    body {
      font-family: 'Cormorant Garamond', Georgia, 'Times New Roman', serif;
      color: #2c2c2c;
      background: #faf7f2;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .print-root {
      width: 100%;
      padding: 0;
    }

    .invitation-card {
      position: relative;
      width: 100%;
      max-width: 178mm;
      margin: 0 auto;
      background: linear-gradient(165deg, #fffdfa 0%, #faf6f0 48%, #f5efe6 100%);
      border: 1px solid ${theme.gold};
      outline: 3px solid #fffdfa;
      outline-offset: -7px;
      box-shadow: inset 0 0 0 1px ${theme.blush};
      padding: 0 0 14px;
      page-break-inside: avoid;
      break-inside: avoid-page;
    }

    .corner {
      position: absolute;
      color: ${theme.gold};
      opacity: 0.5;
      pointer-events: none;
      z-index: 2;
    }

    .corner--tl { top: 8px; left: 8px; }
    .corner--tr { top: 8px; right: 8px; transform: scaleX(-1); }
    .corner--bl { bottom: 8px; left: 8px; transform: scaleY(-1); }
    .corner--br { bottom: 8px; right: 8px; transform: scale(-1); }

    .cover-wrap {
      position: relative;
      height: 96px;
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
      background: linear-gradient(180deg, rgba(255,253,250,0.05) 0%, rgba(255,253,250,0.55) 55%, #fffdfa 100%);
      pointer-events: none;
    }

    .card-inner {
      padding: 16px 22px 0;
    }

    .ornament {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin: 12px auto;
      max-width: 220px;
    }

    .ornament__line {
      flex: 1;
      height: 1px;
    }

    .ornament__diamond {
      font-size: 10px;
      line-height: 1;
      opacity: 0.85;
    }

    .eyebrow {
      text-align: center;
      color: ${theme.goldDark};
      letter-spacing: 0.45em;
      text-transform: uppercase;
      font-size: 9px;
      font-weight: 600;
      margin: 0 0 8px;
    }

    .headline {
      text-align: center;
      font-size: 19px;
      font-weight: 500;
      letter-spacing: 0.02em;
      margin: 0 0 6px;
      color: #3d3a36;
    }

    .headline em {
      font-style: italic;
      color: ${theme.gold};
    }

    .names {
      text-align: center;
      font-size: 38px;
      font-weight: 600;
      line-height: 1.08;
      margin: 0 0 10px;
      letter-spacing: 0.03em;
    }

    .names .amp {
      display: inline-block;
      margin: 0 0.08em;
      color: ${theme.gold};
      font-style: italic;
      font-weight: 500;
      font-size: 0.72em;
    }

    .date-banner {
      text-align: center;
      margin: 0 auto 14px;
    }

    .date-banner__meta {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      font-size: 9px;
      letter-spacing: 0.24em;
      text-transform: uppercase;
      color: ${theme.goldDark};
      margin-bottom: 6px;
    }

    .date-banner__rule {
      flex: 1;
      max-width: 56px;
      height: 1px;
      background: ${theme.blush};
    }

    .date-banner__rule--short {
      max-width: 24px;
    }

    .date-banner__date {
      display: block;
      font-size: 24px;
      font-weight: 600;
      letter-spacing: 0.1em;
      color: #2c2c2c;
    }

    .invitation-line {
      text-align: center;
      font-size: 15px;
      line-height: 1.55;
      color: #5c5650;
      margin: 0 auto 14px;
      max-width: 92%;
      font-style: italic;
      padding: 0 8px;
    }

    .events {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 14px;
    }

    .events--single {
      grid-template-columns: 1fr;
      max-width: 260px;
      margin-left: auto;
      margin-right: auto;
    }

    .event-card {
      text-align: center;
      padding: 12px 10px 11px;
      border: 1px solid ${theme.blush};
      border-top: 2px solid ${theme.gold};
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.72);
      box-shadow: 0 1px 0 rgba(255,255,255,0.8) inset;
    }

    .event-label {
      margin: 0 0 6px;
      font-size: 8px;
      letter-spacing: 0.34em;
      text-transform: uppercase;
      color: ${theme.goldDark};
    }

    .event-date {
      margin: 0 0 6px;
      font-size: 14px;
      font-weight: 600;
      line-height: 1.3;
      color: #2c2c2c;
    }

    .event-time {
      margin: 0;
      display: inline-block;
      padding: 3px 12px;
      border-radius: 999px;
      border: 1px solid ${theme.gold}55;
      background: ${theme.gold}18;
      color: ${theme.goldDark};
      font-size: 12px;
      letter-spacing: 0.04em;
    }

    .event-location {
      margin: 10px 0 0;
      font-size: 13px;
      color: #4a4540;
      line-height: 1.35;
    }

    .event-address {
      margin: 3px 0 0;
      font-size: 11px;
      color: #7a746c;
      line-height: 1.35;
    }

    .meta-row {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 10px 24px;
      margin-bottom: 14px;
    }

    .meta-chip {
      text-align: center;
      flex: 1 1 140px;
      max-width: 240px;
      padding: 8px 12px;
      border-top: 1px solid ${theme.blush};
      border-bottom: 1px solid ${theme.blush};
    }

    .meta-chip__label {
      margin: 0 0 4px;
      font-size: 8px;
      letter-spacing: 0.32em;
      text-transform: uppercase;
      color: ${theme.goldDark};
    }

    .meta-chip__text {
      margin: 0;
      font-size: 14px;
      line-height: 1.4;
      color: #4a4540;
      font-style: italic;
    }

    .story {
      text-align: center;
      margin: 0 auto 14px;
      max-width: 92%;
    }

    .story-title {
      margin: 0 0 6px;
      font-size: 8px;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: ${theme.goldDark};
    }

    .story-text {
      margin: 0;
      font-size: 13px;
      line-height: 1.5;
      color: #5c5650;
      font-style: italic;
    }

    .rsvp {
      margin: 0 22px;
      padding: 12px 14px;
      background: linear-gradient(135deg, ${theme.gold}12 0%, rgba(255,255,255,0.65) 100%);
      border: 1px solid ${theme.gold}44;
      border-radius: 8px;
    }

    .rsvp-inner {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: 14px;
    }

    .rsvp-qr {
      width: 72px;
      height: 72px;
      padding: 4px;
      background: white;
      border: 1px solid ${theme.blush};
      border-radius: 4px;
      flex-shrink: 0;
    }

    .rsvp-text {
      flex: 1;
      min-width: 0;
      text-align: left;
    }

    .rsvp-label {
      margin: 0 0 4px;
      font-size: 13px;
      font-weight: 600;
      color: #3d3a36;
      line-height: 1.3;
    }

    .rsvp-url {
      margin: 0 0 4px;
      font-size: 9px;
      color: ${theme.goldDark};
      word-break: break-all;
      line-height: 1.35;
    }

    .rsvp-qr-hint {
      margin: 0;
      font-size: 11px;
      color: #7a746c;
      font-style: italic;
      line-height: 1.35;
    }

    .footer {
      text-align: center;
      font-size: 8px;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: #9a948c;
      margin: 12px 0 0;
      padding-top: 10px;
    }

    @media print {
      html, body {
        height: auto !important;
        overflow: visible !important;
        background: white;
      }

      .print-root {
        height: auto !important;
        page-break-after: avoid !important;
      }

      .invitation-card {
        box-shadow: none;
        max-width: none;
        page-break-inside: avoid !important;
        break-inside: avoid-page !important;
      }

      .rsvp, .event-card, .cover-wrap {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
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
      setTimeout(triggerPrint, 100)
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
    ).then(() => setTimeout(triggerPrint, 250))
  }

  if (win.document.readyState === 'complete') {
    waitForImages()
  } else {
    win.addEventListener('load', waitForImages)
  }
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
      width: 200,
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
        locale,
        theme
      )
    : ''

  const receptionBlock = receptionIso
    ? renderEventCard(
        translate(locale, 'hero.reception'),
        receptionIso,
        wedding.reception_location,
        wedding.reception_address,
        locale,
        theme
      )
    : ''

  const eventCount = [ceremonyBlock, receptionBlock].filter(Boolean).length
  const eventsClass = eventCount <= 1 ? 'events events--single' : 'events'

  const metaParts: string[] = []
  if (wedding.dress_code) {
    metaParts.push(`<div class="meta-chip">
      <p class="meta-chip__label">${escapeHtml(translate(locale, 'details.dresscode'))}</p>
      <p class="meta-chip__text">${escapeHtml(wedding.dress_code)}</p>
    </div>`)
  }
  const metaRow = metaParts.length
    ? `<div class="meta-row">${metaParts.join('')}</div>`
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

      <div class="card-inner">
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

        ${ornamentDivider(theme)}

        <p class="invitation-line">${escapeHtml(invitationLine)}</p>

        <div class="${eventsClass}">
          ${ceremonyBlock}
          ${receptionBlock}
        </div>

        ${metaRow}
        ${storyBlock}

        ${ornamentDivider(theme)}

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
