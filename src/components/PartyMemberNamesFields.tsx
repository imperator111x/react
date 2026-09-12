import Input from './Input'

interface PartyMemberNamesFieldsProps {
  labels: string[]
  values: string[]
  onChange: (values: string[]) => void
  title?: string
  hint?: string
}

export default function PartyMemberNamesFields({
  labels,
  values,
  onChange,
  title = 'Namen der Personen',
  hint,
}: PartyMemberNamesFieldsProps) {
  if (labels.length === 0) return null

  return (
    <div className="space-y-3 rounded-xl border border-cream-dark bg-cream/40 p-4">
      <div>
        <p className="text-sm font-medium text-charcoal">{title}</p>
        {hint && <p className="text-xs text-warm-gray mt-1">{hint}</p>}
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {labels.map((label, index) => (
          <Input
            key={`${label}-${index}`}
            label={label}
            value={values[index] ?? ''}
            onChange={(e) => {
              const next = [...values]
              next[index] = e.target.value
              onChange(next)
            }}
            placeholder="Vor- und Nachname"
          />
        ))}
      </div>
    </div>
  )
}
