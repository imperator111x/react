import { Printer } from 'lucide-react'
import { useLocale } from '../context/LocaleContext'
import { printInvitation } from '../lib/print-invitation'
import type { Wedding } from '../types/wedding'
import type { Locale } from '../i18n'

interface PrintInvitationButtonProps {
  wedding: Wedding
  locale: Locale
  className?: string
}

export default function PrintInvitationButton({
  wedding,
  locale,
  className = '',
}: PrintInvitationButtonProps) {
  const { t } = useLocale()

  return (
    <button
      type="button"
      onClick={() => printInvitation(wedding, locale)}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border border-gold/30 bg-white/90 text-charcoal hover:bg-gold/10 hover:border-gold/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 ${className}`}
    >
      <Printer className="w-4 h-4 text-gold" aria-hidden />
      {t('hero.printInvitation')}
    </button>
  )
}
