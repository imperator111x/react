import { useState } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'
import type { FaqItem } from '../types/wedding'

interface FaqSectionProps {
  items: FaqItem[]
}

export default function FaqSection({ items }: FaqSectionProps) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null)

  if (items.length === 0) return null

  return (
    <section id="faq" className="py-20 sm:py-24 bg-white relative border-t border-cream-dark">
      <div className="max-w-2xl mx-auto px-4">
        <div className="invitation-ornament mb-10">
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-charcoal">FAQ</h2>
        </div>
        <p className="text-center text-warm-gray mb-10 font-light">
          Häufige Fragen – falls etwas offen bleibt, meldet euch gerne bei uns.
        </p>

        <div className="space-y-3">
          {items.map((item) => {
            const isOpen = openId === item.id
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-cream-dark overflow-hidden shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  className="w-full flex items-start gap-3 p-5 sm:p-6 text-left hover:bg-cream/30 transition-colors"
                  aria-expanded={isOpen}
                >
                  <HelpCircle className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                  <span className="flex-1 font-serif text-lg text-charcoal pr-2">{item.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-warm-gray shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 sm:px-6 pb-5 sm:pb-6 ml-8 sm:ml-9 text-warm-gray leading-relaxed font-light border-t border-cream-dark/60 pt-4">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
