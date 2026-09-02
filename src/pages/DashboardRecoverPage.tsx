import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, KeyRound, Loader2, Mail } from 'lucide-react'
import Button from '../components/Button'
import Input from '../components/Input'
import { getWeddingsByEmail } from '../lib/supabase'
import type { WeddingRecoveryInfo } from '../types/wedding'

function getDashboardUrl(token: string): string {
  return `${window.location.origin}${import.meta.env.BASE_URL}dashboard/${token}`
}

export default function DashboardRecoverPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<WeddingRecoveryInfo[] | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setResults(null)

    if (!email.trim()) {
      setError('Bitte eure E-Mail-Adresse eingeben.')
      return
    }

    setLoading(true)
    try {
      const weddings = await getWeddingsByEmail(email)
      setResults(weddings)
      if (weddings.length === 0) {
        setError('Keine Hochzeit mit dieser E-Mail gefunden.')
      }
    } catch {
      setError('Abfrage fehlgeschlagen. Bitte später erneut versuchen.')
    } finally {
      setLoading(false)
    }
  }

  const copyLink = async (token: string) => {
    await navigator.clipboard.writeText(getDashboardUrl(token))
    setCopied(token)
    setTimeout(() => setCopied(null), 2000)
  }

  const sendViaMailto = (wedding: WeddingRecoveryInfo) => {
    const url = getDashboardUrl(wedding.dashboard_token)
    const subject = encodeURIComponent('UnsereHochzeit – Dashboard-Link')
    const body = encodeURIComponent(
      `Hier ist euer Dashboard-Link für ${wedding.partner1_name} & ${wedding.partner2_name}:\n\n${url}\n\nBitte sicher aufbewahren!`
    )
    window.location.href = `mailto:${email.trim()}?subject=${subject}&body=${body}`
  }

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-10">
          <KeyRound className="w-10 h-10 text-gold mx-auto mb-4" />
          <h1 className="font-serif text-3xl font-semibold text-charcoal mb-2">Dashboard wiederherstellen</h1>
          <p className="text-warm-gray">
            Gebt die E-Mail-Adresse ein, die ihr bei der Erstellung angegeben habt. Ihr erhaltet euren
            Dashboard-Link zurück.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-cream-dark p-6 space-y-4 mb-8">
          <Input
            label="E-Mail-Adresse"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@beispiel.de"
            required
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Wird gesucht…
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                Link anzeigen
              </>
            )}
          </Button>
        </form>

        {results && results.length > 0 && (
          <div className="space-y-4">
            {results.map((wedding) => (
              <div key={wedding.id} className="bg-white rounded-2xl border border-gold/30 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="w-5 h-5 text-gold" />
                  <h2 className="font-serif text-xl font-semibold text-charcoal">
                    {wedding.partner1_name} & {wedding.partner2_name}
                  </h2>
                </div>
                <input
                  readOnly
                  value={getDashboardUrl(wedding.dashboard_token)}
                  className="w-full px-3 py-2 rounded-xl bg-cream border border-cream-dark text-xs sm:text-sm truncate mb-3"
                />
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => copyLink(wedding.dashboard_token)}>
                    {copied === wedding.dashboard_token ? 'Kopiert!' : 'Link kopieren'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => sendViaMailto(wedding)}>
                    <Mail className="w-4 h-4" />
                    Per E-Mail senden
                  </Button>
                  <a href={getDashboardUrl(wedding.dashboard_token)}>
                    <Button variant="ghost" size="sm">
                      Zum Dashboard
                    </Button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-center text-sm text-warm-gray mt-10">
          <Link to="/" className="text-gold hover:underline">
            ← Zur Startseite
          </Link>
        </p>
      </div>
    </div>
  )
}
