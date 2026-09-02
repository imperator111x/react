import { Download, FileText } from 'lucide-react'
import Button from './Button'
import { exportGuestsToCsv, printGuestsAsPdf } from '../lib/guest-export'
import type { GuestWithRsvp, Wedding } from '../types/wedding'

interface GuestExportBarProps {
  wedding: Wedding
  guests: GuestWithRsvp[]
}

export default function GuestExportBar({ wedding, guests }: GuestExportBarProps) {
  if (guests.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => exportGuestsToCsv(wedding, guests)}
      >
        <Download className="w-4 h-4" />
        CSV exportieren
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => printGuestsAsPdf(wedding, guests)}
      >
        <FileText className="w-4 h-4" />
        Als PDF drucken
      </Button>
    </div>
  )
}
