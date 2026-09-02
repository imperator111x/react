export type CookieCategory = 'essential' | 'external'

export interface CookieConsent {
  version: 1
  essential: true
  external: boolean
  updatedAt: string
}

const STORAGE_KEY = 'cookie-consent'
const CONSENT_VERSION = 1 as const

export function getStoredConsent(): CookieConsent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CookieConsent
    if (parsed.version !== CONSENT_VERSION || parsed.essential !== true) return null
    return parsed
  } catch {
    return null
  }
}

export function saveConsent(external: boolean): CookieConsent {
  const consent: CookieConsent = {
    version: CONSENT_VERSION,
    essential: true,
    external,
    updatedAt: new Date().toISOString(),
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent))
  } catch {
    /* ignore */
  }
  return consent
}

export function hasConsentDecision(): boolean {
  return getStoredConsent() !== null
}

export function isExternalAllowed(consent: CookieConsent | null = getStoredConsent()): boolean {
  return consent?.external === true
}

const GOOGLE_FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap'

export function loadExternalResources(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById('google-fonts-stylesheet')) return

  if (!document.getElementById('google-fonts-preconnect-google')) {
    const preconnect1 = document.createElement('link')
    preconnect1.id = 'google-fonts-preconnect-google'
    preconnect1.rel = 'preconnect'
    preconnect1.href = 'https://fonts.googleapis.com'
    document.head.appendChild(preconnect1)
  }

  if (!document.getElementById('google-fonts-preconnect-gstatic')) {
    const preconnect2 = document.createElement('link')
    preconnect2.id = 'google-fonts-preconnect-gstatic'
    preconnect2.rel = 'preconnect'
    preconnect2.href = 'https://fonts.gstatic.com'
    preconnect2.crossOrigin = 'anonymous'
    document.head.appendChild(preconnect2)
  }

  const link = document.createElement('link')
  link.id = 'google-fonts-stylesheet'
  link.rel = 'stylesheet'
  link.href = GOOGLE_FONTS_HREF
  document.head.appendChild(link)
}

export function unloadExternalResources(): void {
  document.getElementById('google-fonts-stylesheet')?.remove()
  document.getElementById('google-fonts-preconnect-google')?.remove()
  document.getElementById('google-fonts-preconnect-gstatic')?.remove()
}

export function applyConsent(consent: CookieConsent): void {
  if (consent.external) {
    loadExternalResources()
  } else {
    unloadExternalResources()
  }
}
