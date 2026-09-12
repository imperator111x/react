import { Languages } from 'lucide-react'
import { useLocale } from '../context/LocaleContext'
import type { Locale } from '../i18n'

const OPTIONS: { value: Locale; flag: string; label: string }[] = [
  { value: 'de', flag: '🇩🇪', label: 'Deutsch' },
  { value: 'en', flag: '🇬🇧', label: 'English' },
  { value: 'tr', flag: '🇹🇷', label: 'Türkçe' },
  { value: 'bs', flag: '🇧🇦', label: 'Bosanski' },
]

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLocale()

  return (
    <div
      className="fixed top-4 right-4 z-50 flex items-center gap-1 rounded-full bg-white/95 backdrop-blur-sm border border-cream-dark shadow-md p-1 language-switcher-print-hide"
      role="group"
      aria-label="Sprache wählen"
    >
      <Languages className="w-4 h-4 text-gold ml-2 hidden sm:block" aria-hidden />
      {OPTIONS.map(({ value, flag, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => setLocale(value)}
          title={label}
          aria-label={label}
          className={`min-w-9 h-9 px-2 rounded-full text-lg leading-none transition-colors ${
            locale === value
              ? 'bg-gold/20 ring-2 ring-gold/50'
              : 'hover:bg-cream'
          }`}
          aria-pressed={locale === value}
        >
          <span aria-hidden>{flag}</span>
        </button>
      ))}
    </div>
  )
}
