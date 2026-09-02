import { Palette } from 'lucide-react'
import { WEDDING_THEMES, type WeddingThemeId } from '../lib/themes'

interface ThemePickerProps {
  value: string
  onChange: (themeId: WeddingThemeId) => void
}

export default function ThemePicker({ value, onChange }: ThemePickerProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-charcoal mb-3 flex items-center gap-2">
        <Palette className="w-4 h-4 text-gold" />
        Farbschema der Einladung
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {WEDDING_THEMES.map((theme) => {
          const selected = (value || 'gold') === theme.id
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => onChange(theme.id)}
              className={`rounded-xl border-2 p-3 text-left transition-all ${
                selected
                  ? 'border-gold bg-gold/5 ring-2 ring-gold/30'
                  : 'border-cream-dark hover:border-gold/40'
              }`}
            >
              <div className="flex gap-1.5 mb-2">
                <span
                  className="w-6 h-6 rounded-full border border-white/50 shadow-sm"
                  style={{ backgroundColor: theme.gold }}
                />
                <span
                  className="w-6 h-6 rounded-full border border-white/50 shadow-sm"
                  style={{ backgroundColor: theme.blush }}
                />
                <span
                  className="w-6 h-6 rounded-full border border-white/50 shadow-sm"
                  style={{ backgroundColor: theme.sage }}
                />
              </div>
              <span className="text-sm font-medium text-charcoal">{theme.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
