import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Heart, LayoutGrid, Loader2, Search } from 'lucide-react'
import WeddingThemeWrapper from '../components/WeddingThemeWrapper'
import LanguageSwitcher from '../components/LanguageSwitcher'
import InviteQrCode from '../components/InviteQrCode'
import Input from '../components/Input'
import Button from '../components/Button'
import { LocaleProvider, useLocale } from '../context/LocaleContext'
import { getSeatingPlanUrl } from '../i18n'
import { getGuestByInviteToken, getWeddingBySlug } from '../lib/supabase'
import {
  getGuestTable,
  getPublicTableName,
  getSeatingPlan,
  lookupGuestInPlan,
  type SeatingPlanGuest,
} from '../lib/seating'
import { DEMO_WEDDING } from '../lib/demo'
import { DEMO_GUEST } from '../lib/demo-guest'
import { DEMO_TABLES } from '../lib/demo-seating'
import type { Guest, SeatingTableWithGuests, Wedding } from '../types/wedding'

function SeatingPlanContent() {
  const { slug, guestToken } = useParams<{ slug: string; guestToken?: string }>()
  const { t } = useLocale()
  const [wedding, setWedding] = useState<Wedding | null>(null)
  const [plan, setPlan] = useState<SeatingTableWithGuests[]>([])
  const [tokenGuest, setTokenGuest] = useState<Guest | null>(null)
  const [loading, setLoading] = useState(true)
  const [nameQuery, setNameQuery] = useState('')
  const [searchedGuest, setSearchedGuest] = useState<SeatingPlanGuest | null>(null)
  const [searchError, setSearchError] = useState('')
  const highlightRef = useRef<HTMLDivElement>(null)

  const isDemo = slug === 'demo'

  useEffect(() => {
    async function load() {
      if (isDemo) {
        setWedding(DEMO_WEDDING)
        setTokenGuest(guestToken ? DEMO_GUEST : null)
        setPlan(
          DEMO_TABLES.map((table) => ({
            ...table,
            guests:
              table.id === DEMO_GUEST.table_id
                ? [
                    {
                      id: DEMO_GUEST.id,
                      name: DEMO_GUEST.name,
                      salutation: DEMO_GUEST.salutation,
                      table_id: DEMO_GUEST.table_id,
                    },
                  ]
                : [],
          }))
        )
        if (guestToken) setNameQuery(DEMO_GUEST.name)
        setLoading(false)
        return
      }

      const data = await getWeddingBySlug(slug!)
      setWedding(data)
      if (data) {
        setPlan(await getSeatingPlan(data.id))
        if (guestToken) {
          const g = await getGuestByInviteToken(data.id, guestToken)
          setTokenGuest(g)
          if (g) setNameQuery(g.name)
        }
      }
      setLoading(false)
    }
    load()
  }, [slug, guestToken, isDemo])

  const activeTableId = tokenGuest?.table_id ?? searchedGuest?.table_id

  useEffect(() => {
    if (!loading && activeTableId) {
      requestAnimationFrame(() => {
        highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      })
    }
  }, [loading, activeTableId])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchError('')
    setSearchedGuest(null)

    const result = lookupGuestInPlan(plan, nameQuery)
    if (result.status === 'found') {
      setSearchedGuest(result.guest)
      return
    }
    if (result.status === 'no_table') {
      setSearchError(t('seating.noTable'))
      return
    }
    if (result.status === 'ambiguous') {
      setSearchError(t('seating.guestAmbiguous'))
      return
    }
    setSearchError(t('seating.guestNotFound'))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    )
  }

  if (!wedding) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <Heart className="w-12 h-12 text-gold/30 mb-4" />
        <h1 className="font-serif text-3xl font-semibold text-charcoal mb-2">{t('common.notFound')}</h1>
      </div>
    )
  }

  const activeGuest = tokenGuest ?? searchedGuest
  const guestTable = getGuestTable(plan, activeGuest)
  const planUrl = getSeatingPlanUrl(wedding.slug, guestToken)
  const invitePath = guestToken ? `/e/${slug}/g/${guestToken}` : `/e/${slug}`

  return (
    <WeddingThemeWrapper themeId={wedding.theme_id} className="min-h-screen bg-cream">
      <LanguageSwitcher />
      <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16">
        <div className="text-center mb-10">
          <LayoutGrid className="w-8 h-8 text-gold mx-auto mb-4" />
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-charcoal mb-2">
            {t('seating.planTitle', {
              partner1: wedding.partner1_name,
              partner2: wedding.partner2_name,
            })}
          </h1>
          <p className="text-warm-gray">{t('seating.planSubtitle')}</p>
        </div>

        {!guestToken && (
          <form
            onSubmit={handleSearch}
            className="mb-8 p-6 rounded-2xl bg-white border border-cream-dark shadow-sm"
          >
            <h2 className="font-serif text-lg font-semibold text-charcoal mb-4 text-center">
              {t('seating.findYourTable')}
            </h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                label={t('seating.nameSearchLabel')}
                value={nameQuery}
                onChange={(e) => {
                  setNameQuery(e.target.value)
                  setSearchError('')
                }}
                placeholder={t('seating.nameSearchPlaceholder')}
                className="flex-1"
                autoComplete="name"
              />
              <div className="sm:pt-7">
                <Button type="submit" className="w-full sm:w-auto">
                  <Search className="w-4 h-4" />
                  {t('seating.searchButton')}
                </Button>
              </div>
            </div>
            {searchError && <p className="text-sm text-red-500 mt-3 text-center">{searchError}</p>}
          </form>
        )}

        {guestTable && (
          <div className="mb-8 p-6 rounded-2xl bg-gold/10 border-2 border-gold/30 text-center">
            <p className="text-sm uppercase tracking-wider text-gold mb-1">
              {activeGuest?.salutation === 'familie'
                ? t('seating.yourTable')
                : t('seating.yourTableSingular')}
            </p>
            <p className="font-serif text-2xl font-semibold text-charcoal">
              {getPublicTableName(guestTable.name)}
            </p>
            <p className="text-sm text-warm-gray mt-2">{t('seating.highlighted')}</p>
          </div>
        )}

        {plan.length === 0 ? (
          <p className="text-center text-warm-gray">{t('seating.unassigned')}</p>
        ) : (
          <div className="space-y-4 mb-10">
            {plan.map((table, index) => {
              const isHighlighted = guestTable?.id === table.id
              const publicName = getPublicTableName(table.name, index)
              return (
                <div
                  key={table.id}
                  id={`table-${table.id}`}
                  ref={isHighlighted ? highlightRef : undefined}
                  className={`rounded-2xl border p-5 sm:p-6 ${
                    isHighlighted
                      ? 'border-gold bg-gold/5 shadow-md'
                      : 'border-cream-dark bg-white'
                  }`}
                >
                  <h2 className="font-serif text-xl font-semibold text-charcoal">{publicName}</h2>
                  {isHighlighted && activeGuest && (
                    <p className="text-sm text-gold mt-2">{t('seating.highlighted')}</p>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <InviteQrCode
          url={planUrl}
          label={t('seating.title')}
          downloadFilename="tischplan-qr.png"
          hint={t('seating.scanQr')}
        />

        <div className="mt-8 text-center">
          <Link
            to={invitePath}
            className="text-sm text-gold hover:text-gold-dark underline underline-offset-2"
          >
            ← {t('hero.saveTheDate')}
          </Link>
        </div>
      </div>
    </WeddingThemeWrapper>
  )
}

export default function SeatingPlanPage() {
  const { slug } = useParams<{ slug: string }>()
  return (
    <LocaleProvider slug={slug ?? 'demo'}>
      <SeatingPlanContent />
    </LocaleProvider>
  )
}
