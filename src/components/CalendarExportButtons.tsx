import { CalendarPlus } from 'lucide-react'
import Button from './Button'
import { useLocale } from '../context/LocaleContext'
import { downloadCalendarEvent } from '../lib/calendar'
import type { Wedding } from '../types/wedding'

interface CalendarExportButtonsProps {
  wedding: Wedding
  className?: string
  compact?: boolean
}

export default function CalendarExportButtons({
  wedding,
  className = '',
  compact = false,
}: CalendarExportButtonsProps) {
  const { t } = useLocale()
  const hasCeremony = Boolean(wedding.ceremony_date ?? wedding.wedding_date)
  const hasReception = Boolean(wedding.reception_date)
  const hasBoth = hasCeremony && hasReception

  if (!hasCeremony && !hasReception) return null

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {hasCeremony && (
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={() => downloadCalendarEvent(wedding, 'ceremony')}
        >
          <CalendarPlus className="w-4 h-4" />
          {compact ? t('hero.ceremony') : t('details.calendarCeremony')}
        </Button>
      )}
      {hasReception && (
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={() => downloadCalendarEvent(wedding, 'reception')}
        >
          <CalendarPlus className="w-4 h-4" />
          {compact ? t('hero.reception') : t('details.calendarReception')}
        </Button>
      )}
      {hasBoth && (
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => downloadCalendarEvent(wedding, 'all')}
        >
          <CalendarPlus className="w-4 h-4" />
          {t('details.calendarBoth')}
        </Button>
      )}
    </div>
  )
}
