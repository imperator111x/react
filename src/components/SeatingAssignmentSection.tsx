import { LayoutGrid } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLocale } from '../context/LocaleContext'
import { getGuestTable, getPublicTableName } from '../lib/seating'
import type { Guest, SeatingTable } from '../types/wedding'

interface SeatingAssignmentSectionProps {
  slug: string
  guestToken?: string
  tables: SeatingTable[]
  guest: Guest | null
}

export default function SeatingAssignmentSection({
  slug,
  guestToken,
  tables,
  guest,
}: SeatingAssignmentSectionProps) {
  const { t } = useLocale()

  if (tables.length === 0) return null

  const guestTable = getGuestTable(tables, guest)
  const planPath = guestToken ? `/e/${slug}/tischplan/g/${guestToken}` : `/e/${slug}/tischplan`

  return (
    <section className="py-16 bg-cream/50">
      <div className="max-w-lg mx-auto px-4 text-center">
        <LayoutGrid className="w-7 h-7 text-gold mx-auto mb-4" />
        <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-charcoal mb-4">
          {t('seating.title')}
        </h2>

        {guestTable ? (
          <div className="p-6 rounded-2xl bg-white border-2 border-gold/30 shadow-sm mb-4">
            <p className="text-sm uppercase tracking-wider text-gold mb-1">
              {guest?.salutation === 'familie' ? t('seating.yourTable') : t('seating.yourTableSingular')}
            </p>
            <p className="font-serif text-2xl font-semibold text-charcoal">
              {getPublicTableName(guestTable.name)}
            </p>
          </div>
        ) : guest ? (
          <p className="text-warm-gray mb-4">{t('seating.noTable')}</p>
        ) : null}

        <Link
          to={planPath}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-gold/10 text-gold border border-gold/20 hover:bg-gold/15 transition-colors text-sm font-medium"
        >
          {t('seating.viewFullPlan')}
        </Link>
      </div>
    </section>
  )
}
