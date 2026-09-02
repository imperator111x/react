export function getMapsQuery(address?: string | null, location?: string | null): string | null {
  const query = [location, address].filter(Boolean).join(', ').trim()
  return query || null
}

export function getGoogleMapsUrl(address?: string | null, location?: string | null): string | null {
  const query = getMapsQuery(address, location)
  if (!query) return null
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`
}
