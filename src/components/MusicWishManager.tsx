import { Music, Trash2 } from 'lucide-react'
import Button from './Button'
import { deleteMusicWish } from '../lib/music-wishes'
import type { MusicWish } from '../types/wedding'

interface MusicWishManagerProps {
  wishes: MusicWish[]
  onUpdate: () => void
}

export default function MusicWishManager({ wishes, onUpdate }: MusicWishManagerProps) {
  const handleDelete = async (wish: MusicWish) => {
    if (!confirm(`Musikwunsch „${wish.song_title}" wirklich löschen?`)) return
    try {
      await deleteMusicWish(wish.id)
      onUpdate()
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-cream-dark overflow-hidden mb-8">
      <div className="p-6 border-b border-cream-dark">
        <div className="flex items-center gap-2 mb-2">
          <Music className="w-5 h-5 text-sage" />
          <h2 className="font-serif text-xl font-semibold text-charcoal">
            Musikwünsche ({wishes.length})
          </h2>
        </div>
        <p className="text-sm text-warm-gray">
          Gäste können auf der Einladung Songwünsche einreichen – hier seht ihr alle Vorschläge.
        </p>
      </div>

      {wishes.length === 0 ? (
        <div className="p-10 text-center text-warm-gray text-sm">Noch keine Musikwünsche eingegangen.</div>
      ) : (
        <ul className="divide-y divide-cream-dark">
          {wishes.map((wish) => (
            <li key={wish.id} className="p-4 sm:p-6 flex items-start gap-3">
              <div className="flex-1">
                <p className="font-medium text-charcoal">{wish.song_title}</p>
                {wish.artist && <p className="text-sm text-warm-gray">{wish.artist}</p>}
                <p className="text-xs text-warm-gray mt-1">von {wish.guest_name}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-400 hover:text-red-600 shrink-0"
                onClick={() => handleDelete(wish)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
