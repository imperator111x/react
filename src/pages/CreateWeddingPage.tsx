import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Loader2 } from 'lucide-react'
import Button from '../components/Button'
import Input from '../components/Input'
import Textarea from '../components/Textarea'
import BotCheckGate from '../components/BotCheckGate'
import { isBotCheckVerified } from '../lib/bot-check'
import { createWedding, isSupabaseConfigured } from '../lib/supabase'
import type { CreateWeddingInput } from '../types/wedding'

export default function CreateWeddingPage() {
  const navigate = useNavigate()
  const [botVerified, setBotVerified] = useState(isBotCheckVerified)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState<CreateWeddingInput>({
    partner1_name: '',
    partner2_name: '',
    ceremony_date: '',
    reception_date: '',
    ceremony_location: '',
    ceremony_address: '',
    reception_location: '',
    reception_address: '',
    story: '',
    dress_code: '',
    email: '',
  })

  const update = (field: keyof CreateWeddingInput, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.partner1_name || !form.partner2_name || !form.ceremony_date || !form.email) {
      setError('Bitte füllt alle Pflichtfelder aus.')
      return
    }

    if (!isBotCheckVerified()) {
      setError('Bitte bestätigt zuerst die Bot-Prüfung.')
      setBotVerified(false)
      return
    }

    if (!isSupabaseConfigured) {
      setError(
        'Supabase ist noch nicht konfiguriert. Bitte setzt VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY in der .env Datei.'
      )
      return
    }

    setLoading(true)
    try {
      const wedding = await createWedding(form)
      navigate(`/erfolg/${wedding.slug}`, {
        state: { dashboardToken: wedding.dashboard_token, wedding },
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 sm:py-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <Heart className="w-8 h-8 text-gold fill-gold/20 mx-auto mb-4" />
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-charcoal mb-3">
            Eure Hochzeit erstellen
          </h1>
          <p className="text-warm-gray">
            {botVerified
              ? 'Füllt das Formular aus und erhaltet sofort euren persönlichen Einladungslink.'
              : 'Ein kurzer Sicherheitscheck – danach geht es direkt weiter.'}
          </p>
        </div>

        {!botVerified ? (
          <BotCheckGate onVerified={() => setBotVerified(true)} />
        ) : (
          <>
        {!isSupabaseConfigured && (
          <div className="mb-8 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
            <strong>Hinweis:</strong> Supabase ist noch nicht konfiguriert. Kopiert{' '}
            <code className="bg-amber-100 px-1 rounded">.env.example</code> nach{' '}
            <code className="bg-amber-100 px-1 rounded">.env</code> und tragt eure Supabase-Daten ein.
            Schaut in die README für die vollständige Anleitung.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-cream-dark">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Name Partner 1 *"
              value={form.partner1_name}
              onChange={(e) => update('partner1_name', e.target.value)}
              placeholder="Anna"
              required
            />
            <Input
              label="Name Partner 2 *"
              value={form.partner2_name}
              onChange={(e) => update('partner2_name', e.target.value)}
              placeholder="Max"
              required
            />
          </div>

          <Input
            label="E-Mail *"
            type="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            placeholder="anna.max@email.de"
            required
          />

          <hr className="border-cream-dark" />

          <h2 className="font-serif text-xl font-semibold text-charcoal">Trauung</h2>
          <Input
            label="Datum & Uhrzeit Trauung *"
            type="datetime-local"
            value={form.ceremony_date}
            onChange={(e) => update('ceremony_date', e.target.value)}
            required
          />
          <Input
            label="Ort der Trauung"
            value={form.ceremony_location}
            onChange={(e) => update('ceremony_location', e.target.value)}
            placeholder="z.B. Standesamt München"
          />
          <Input
            label="Adresse Trauung"
            value={form.ceremony_address}
            onChange={(e) => update('ceremony_address', e.target.value)}
            placeholder="Marienplatz 1, 80331 München"
          />

          <h2 className="font-serif text-xl font-semibold text-charcoal">Feier</h2>
          <Input
            label="Datum & Uhrzeit Feier"
            type="datetime-local"
            value={form.reception_date}
            onChange={(e) => update('reception_date', e.target.value)}
          />
          <p className="text-xs text-warm-gray -mt-4">
            Optional – kann an einem anderen Tag stattfinden als die Trauung.
          </p>
          <Input
            label="Ort der Feier"
            value={form.reception_location}
            onChange={(e) => update('reception_location', e.target.value)}
            placeholder="z.B. Schloss Belvedere"
          />
          <Input
            label="Adresse Feier"
            value={form.reception_address}
            onChange={(e) => update('reception_address', e.target.value)}
            placeholder="Prinz-Eugen-Straße 27, 1030 Wien"
          />

          <Textarea
            label="Eure Geschichte (optional)"
            value={form.story}
            onChange={(e) => update('story', e.target.value)}
            placeholder="Erzählt euren Gästen, wie ihr euch kennengelernt habt..."
          />

          <Input
            label="Dresscode (optional)"
            value={form.dress_code}
            onChange={(e) => update('dress_code', e.target.value)}
            placeholder="z.B. Festlich, Black Tie"
          />

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Wird erstellt...
              </>
            ) : (
              'Einladung erstellen'
            )}
          </Button>

          <p className="text-xs text-warm-gray text-center">
            Mit dem Erstellen akzeptiert ihr, dass eure Daten in Supabase gespeichert werden.
            100% kostenlos, kein Abo.
          </p>
        </form>
          </>
        )}
      </div>
    </div>
  )
}
