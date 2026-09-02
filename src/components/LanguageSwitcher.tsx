import { Languages } from 'lucide-react'
import { useLocale } from '../context/LocaleContext'
import type { Locale } from '../i18n'

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLocale()

  const options: { value: Locale; label: string }[] = [
    { value: 'de', label: 'DE' },
    { value: 'en', label: 'EN' },
    { value: 'tr', label: 'TR' },
  ]

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-1 rounded-full bg-white/95 backdrop-blur-sm border border-cream-dark shadow-md p-1">
      <Languages className="w-4 h-4 text-gold ml-2 hidden sm:block" aria-hidden />
      {options.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => setLocale(value)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            locale === value
              ? 'bg-gold text-white'
              : 'text-warm-gray hover:text-charcoal hover:bg-cream'
          }`}
          aria-pressed={locale === value}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
