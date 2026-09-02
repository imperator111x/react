/** Öffentliche Cover-URL (GitHub Pages Base-Pfad berücksichtigen) */
export function resolveCoverImageUrl(url: string | null | undefined): string | null {
  if (!url) return null
  if (url.startsWith('/') && !url.startsWith('//')) {
    const base = import.meta.env.BASE_URL.replace(/\/$/, '')
    return `${base}${url}`
  }
  return url
}

export const DEMO_COVER_PATH = '/images/demo-cover.jpg'
