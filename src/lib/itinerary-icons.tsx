import {
  Church,
  Wine,
  UtensilsCrossed,
  Cake,
  Music,
  Heart,
  Camera,
  Gem,
  MapPin,
  Sun,
  Moon,
  Gift,
  Flower2,
  Sparkles,
  Users,
  type LucideIcon,
} from 'lucide-react'
import type { ItineraryIconName } from '../types/wedding'

export const ITINERARY_ICON_OPTIONS: { value: ItineraryIconName; label: string }[] = [
  { value: 'church', label: 'Trauung' },
  { value: 'champagne', label: 'Sektempfang' },
  { value: 'dinner', label: 'Essen' },
  { value: 'cake', label: 'Torte' },
  { value: 'music', label: 'Party / Tanz' },
  { value: 'heart', label: 'Herz' },
  { value: 'camera', label: 'Fotos' },
  { value: 'ring', label: 'Ringe' },
  { value: 'location', label: 'Ort' },
  { value: 'sun', label: 'Tag / Outdoor' },
  { value: 'moon', label: 'Abend' },
  { value: 'gift', label: 'Geschenk' },
  { value: 'flower', label: 'Blumen' },
  { value: 'sparkles', label: 'Feier' },
  { value: 'guests', label: 'Gäste' },
]

const ICON_MAP: Record<ItineraryIconName, LucideIcon> = {
  church: Church,
  champagne: Wine,
  dinner: UtensilsCrossed,
  cake: Cake,
  music: Music,
  heart: Heart,
  camera: Camera,
  ring: Gem,
  location: MapPin,
  sun: Sun,
  moon: Moon,
  gift: Gift,
  flower: Flower2,
  sparkles: Sparkles,
  guests: Users,
}

interface ItineraryIconProps {
  name: ItineraryIconName
  className?: string
}

export function ItineraryIcon({ name, className = 'w-6 h-6' }: ItineraryIconProps) {
  const Icon = ICON_MAP[name] ?? Heart
  return <Icon className={className} strokeWidth={1.5} />
}
