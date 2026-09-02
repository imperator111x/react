import { useLocale } from '../context/LocaleContext'

export default function SkipLink() {
  const { t } = useLocale()

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[300] focus:px-4 focus:py-2 focus:rounded-full focus:bg-charcoal focus:text-white focus:outline-none focus:ring-2 focus:ring-gold"
    >
      {t('common.skipToContent')}
    </a>
  )
}
