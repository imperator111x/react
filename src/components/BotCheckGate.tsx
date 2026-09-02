import { useMemo, useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import Button from './Button'
import Input from './Input'
import {
  createBotChallenge,
  markBotCheckVerified,
  verifyBotChallenge,
  type BotChallenge,
} from '../lib/bot-check'

interface BotCheckGateProps {
  onVerified: () => void
}

export default function BotCheckGate({ onVerified }: BotCheckGateProps) {
  const challenge = useMemo(() => createBotChallenge(), [])
  const [answer, setAnswer] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    window.setTimeout(() => {
      if (!verifyBotChallenge(challenge, answer, honeypot)) {
        setError('Bitte löst die Rechenaufgabe korrekt.')
        setSubmitting(false)
        return
      }

      markBotCheckVerified()
      onVerified()
    }, 400)
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-cream-dark text-center">
        <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-5">
          <ShieldCheck className="w-7 h-7 text-gold" aria-hidden />
        </div>
        <h2 className="font-serif text-2xl font-semibold text-charcoal mb-2">Kurze Bot-Prüfung</h2>
        <p className="text-warm-gray text-sm mb-6 leading-relaxed">
          Damit automatische Anmeldungen ausbleiben, bestätigt bitte kurz, dass ihr echte Personen seid.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <ChallengeField challenge={challenge} answer={answer} onAnswerChange={setAnswer} />

          <label className="bot-check-honeypot" aria-hidden="true">
            Website
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </label>

          {error && (
            <p className="text-red-600 text-sm text-center" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? 'Wird geprüft…' : 'Weiter zur Erstellung'}
          </Button>
        </form>
      </div>
    </div>
  )
}

function ChallengeField({
  challenge,
  answer,
  onAnswerChange,
}: {
  challenge: BotChallenge
  answer: string
  onAnswerChange: (value: string) => void
}) {
  return (
    <Input
      label={`Was ist ${challenge.a} + ${challenge.b}?`}
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={answer}
      onChange={(e) => onAnswerChange(e.target.value)}
      placeholder="Ergebnis eingeben"
      required
      autoComplete="off"
    />
  )
}
