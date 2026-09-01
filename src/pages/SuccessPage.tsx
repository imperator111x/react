import { useLocation, Link, useParams } from 'react-router-dom'
import { CheckCircle, Copy, ExternalLink, LayoutDashboard, Share2 } from 'lucide-react'
import { useState } from 'react'
import Button from '../components/Button'
import type { Wedding } from '../types/wedding'

export default function SuccessPage() {
  const { slug } = useParams<{ slug: string }>()
  const location = useLocation()
  const state = location.state as { dashboardToken?: string; wedding?: Wedding } | null
  const [copied, setCopied] = useState<'invite' | 'dashboard' | null>(null)

  const inviteUrl = `${window.location.origin}${import.meta.env.BASE_URL}e/${slug}`
  const dashboardUrl = state?.dashboardToken
    ? `${window.location.origin}${import.meta.env.BASE_URL}dashboard/${state.dashboardToken}`
    : null

  const copyToClipboard = async (text: string, type: 'invite' | 'dashboard') => {
    await navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const wedding = state?.wedding

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 sm:py-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-sage/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-sage" />
        </div>

        <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-charcoal mb-3">
          Herzlichen Glückwunsch!
        </h1>
        {wedding && (
          <p className="text-warm-gray text-lg mb-2">
            Die Einladung für{' '}
            <strong>
              {wedding.partner1_name} & {wedding.partner2_name}
            </strong>{' '}
            ist bereit.
          </p>
        )}
        <p className="text-warm-gray mb-10">
          Teilt den Einladungslink mit euren Gästen und verwaltet Zusagen im Dashboard.
        </p>

        <div className="space-y-4 text-left">
          <div className="bg-white rounded-2xl p-6 border border-cream-dark">
            <div className="flex items-center gap-2 mb-3">
              <Share2 className="w-5 h-5 text-gold" />
              <h2 className="font-semibold text-charcoal">Einladungslink für Gäste</h2>
            </div>
            <div className="flex gap-2">
              <input
                readOnly
                value={inviteUrl}
                className="flex-1 px-4 py-2.5 rounded-xl bg-cream border border-cream-dark text-sm text-charcoal truncate"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(inviteUrl, 'invite')}
              >
                <Copy className="w-4 h-4" />
                {copied === 'invite' ? 'Kopiert!' : 'Kopieren'}
              </Button>
            </div>
            <Link to={`/e/${slug}`} className="inline-flex items-center gap-1 text-sm text-gold hover:text-gold-dark mt-3">
              <ExternalLink className="w-4 h-4" />
              Einladung ansehen
            </Link>
          </div>

          {dashboardUrl && (
            <div className="bg-white rounded-2xl p-6 border border-cream-dark">
              <div className="flex items-center gap-2 mb-3">
                <LayoutDashboard className="w-5 h-5 text-sage" />
                <h2 className="font-semibold text-charcoal">Dashboard-Link (geheim halten!)</h2>
              </div>
              <p className="text-sm text-warm-gray mb-3">
                Mit diesem Link könnt ihr alle Zusagen einsehen. Speichert ihn sicher ab!
              </p>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={dashboardUrl}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-cream border border-cream-dark text-sm text-charcoal truncate"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(dashboardUrl, 'dashboard')}
                >
                  <Copy className="w-4 h-4" />
                  {copied === 'dashboard' ? 'Kopiert!' : 'Kopieren'}
                </Button>
              </div>
              <Link
                to={`/dashboard/${state?.dashboardToken}`}
                className="inline-flex items-center gap-1 text-sm text-sage hover:text-sage-dark mt-3"
              >
                <LayoutDashboard className="w-4 h-4" />
                Zum Dashboard
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
