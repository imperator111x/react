import { Link } from 'react-router-dom'
import { useLocale } from '../context/LocaleContext'
import { legalConfig } from '../lib/legal-config'

interface CreatedWithCreditProps {
  className?: string
}

export default function CreatedWithCredit({ className = 'text-xs mt-2 opacity-60' }: CreatedWithCreditProps) {
  const { t } = useLocale()

  return (
    <p className={className}>
      {t('footer.createdWithBefore')}
      <Link to="/" className="text-gold hover:underline">
        {legalConfig.siteName}
      </Link>
      {t('footer.createdWithAfter')}
    </p>
  )
}
