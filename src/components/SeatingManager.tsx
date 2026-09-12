import { useState } from 'react'
import { LayoutGrid, Loader2, Plus, Trash2, Users } from 'lucide-react'
import Button from './Button'
import Input from './Input'
import InviteQrCode from './InviteQrCode'
import { getGuestPartyLabel, getSeatingDisplayNames } from '../lib/guests'
import {
  assignGuestToTable,
  createSeatingTable,
  deleteSeatingTable,
  MAX_SEATING_TABLES,
} from '../lib/seating'
import { getSeatingPlanUrl } from '../i18n'
import type { GuestWithRsvp, SeatingTable, SeatingTableWithGuests } from '../types/wedding'

interface SeatingManagerProps {
  weddingId: string
  weddingSlug: string
  tables: SeatingTable[]
  plan: SeatingTableWithGuests[]
  guests: GuestWithRsvp[]
  onUpdate: () => void
}

export default function SeatingManager({
  weddingId,
  weddingSlug,
  tables,
  plan,
  guests,
  onUpdate,
}: SeatingManagerProps) {
  const [tableName, setTableName] = useState('')
  const [saving, setSaving] = useState(false)
  const [busyGuestId, setBusyGuestId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const unassigned = guests.filter((g) => !g.table_id)
  const seatingUrl = getSeatingPlanUrl(weddingSlug)

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tableName.trim()) {
      setError('Bitte einen Tischnamen angeben.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await createSeatingTable(weddingId, { name: tableName.trim() })
      setTableName('')
      onUpdate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tisch konnte nicht erstellt werden.')
    } finally {
      setSaving(false)
    }
  }

  const handleAssign = async (guestId: string, tableId: string) => {
    setBusyGuestId(guestId)
    try {
      await assignGuestToTable(guestId, tableId || null)
      onUpdate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Zuweisung fehlgeschlagen.')
    } finally {
      setBusyGuestId(null)
    }
  }

  const handleDeleteTable = async (table: SeatingTable) => {
    if (!confirm(`Tisch „${table.name}" wirklich löschen? Gäste werden abgemeldet.`)) return
    setSaving(true)
    try {
      await deleteSeatingTable(table.id)
      onUpdate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Löschen fehlgeschlagen.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-cream-dark overflow-hidden mb-8">
      <div className="p-6 border-b border-cream-dark">
        <div className="flex items-center gap-2 mb-2">
          <LayoutGrid className="w-5 h-5 text-sage" />
          <h2 className="font-serif text-xl font-semibold text-charcoal">
            Tischplan ({tables.length}/{MAX_SEATING_TABLES})
          </h2>
        </div>
        <p className="text-sm text-warm-gray">
          Legt Tische an und weist Gäste zu. Maximal {MAX_SEATING_TABLES} Tische. Gäste sehen nur
          ihren Tischnamen (z.&nbsp;B. „Tisch 5“) – ohne Kategorien wie Freunde oder Kollegen.
        </p>
      </div>

      <div className="p-6 border-b border-cream-dark bg-cream/30">
        <form onSubmit={handleAddTable} className="flex flex-col sm:flex-row gap-3">
          <Input
            label="Neuer Tisch"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            placeholder="z.B. Tisch 1"
            className="flex-1"
            disabled={tables.length >= MAX_SEATING_TABLES}
          />
          <div className="sm:pt-7">
            <Button type="submit" disabled={saving || tables.length >= MAX_SEATING_TABLES}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Tisch hinzufügen
            </Button>
          </div>
        </form>
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      </div>

      {tables.length > 0 && (
        <div className="p-6 border-b border-cream-dark">
          <InviteQrCode url={seatingUrl} label="Tischplan" />
          <p className="text-sm text-warm-gray mt-4 break-all">
            Öffentlicher Link für Gäste:{' '}
            <a
              href={seatingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:text-gold-dark underline underline-offset-2"
            >
              {seatingUrl}
            </a>
          </p>
          <p className="text-xs text-warm-gray mt-2">
            Gäste sehen alle Tische und können oben ihren Namen eingeben, um ihren Tisch zu finden.
          </p>
        </div>
      )}

      {tables.length === 0 ? (
        <div className="p-10 text-center text-warm-gray text-sm">
          Noch keine Tische angelegt.
        </div>
      ) : (
        <div className="divide-y divide-cream-dark">
          {plan.map((table) => (
            <div key={table.id} className="p-4 sm:p-6">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-serif text-lg font-semibold text-charcoal">{table.name}</h3>
                  <p className="text-sm text-warm-gray">
                    {table.guests.reduce((sum, g) => sum + getSeatingDisplayNames(g).length, 0)} Personen
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-600 shrink-0"
                  onClick={() => handleDeleteTable(table)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              {table.guests.length > 0 ? (
                <ul className="space-y-3 text-sm text-charcoal">
                  {table.guests.map((g) => {
                    const names = getSeatingDisplayNames(g)
                    return (
                      <li
                        key={g.id}
                        className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 rounded-xl border border-cream-dark/60 bg-cream/20 px-3 py-2.5"
                      >
                        <div className="flex-1 min-w-0 space-y-1">
                          {names.map((displayName, index) => (
                            <div key={`${g.id}-${index}`} className="flex items-center gap-2">
                              <Users className="w-3.5 h-3.5 text-warm-gray shrink-0" />
                              <span>{displayName}</span>
                            </div>
                          ))}
                        </div>
                        <label className="flex items-center gap-2 shrink-0 text-xs text-warm-gray">
                          <span className="whitespace-nowrap">Tisch</span>
                          <select
                            value={table.id}
                            disabled={busyGuestId === g.id}
                            aria-label={`${getGuestPartyLabel(g)} an anderen Tisch setzen`}
                            onChange={(e) => handleAssign(g.id, e.target.value)}
                            className="px-3 py-2 rounded-xl border border-cream-dark bg-white text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-gold/40"
                          >
                            <option value="">— Kein Tisch —</option>
                            {tables.map((option) => (
                              <option key={option.id} value={option.id}>
                                {option.name}
                              </option>
                            ))}
                          </select>
                        </label>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <p className="text-sm text-warm-gray italic">Noch keine Gäste zugewiesen</p>
              )}
            </div>
          ))}
        </div>
      )}

      {guests.length > 0 && tables.length > 0 && (
        <div className="p-6 bg-cream/20">
          <h3 className="font-medium text-charcoal mb-1">Gäste zuweisen & umsetzen</h3>
          <p className="text-xs text-warm-gray mb-4">
            Tisch in der Liste ändern – Gäste können jederzeit an einen anderen Tisch gesetzt werden.
          </p>
          <ul className="space-y-3">
            {[...guests]
              .sort((a, b) => {
                const aUnassigned = a.table_id ? 1 : 0
                const bUnassigned = b.table_id ? 1 : 0
                if (aUnassigned !== bUnassigned) return aUnassigned - bUnassigned
                return a.name.localeCompare(b.name, 'de')
              })
              .map((guest) => {
                const currentTable = tables.find((t) => t.id === guest.table_id)
                return (
                  <li key={guest.id} className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="text-sm text-charcoal flex-1">
                      {getGuestPartyLabel(guest)}
                      {getSeatingDisplayNames(guest).length > 1 && (
                        <span className="block text-xs text-warm-gray mt-0.5">
                          {getSeatingDisplayNames(guest).join(', ')}
                        </span>
                      )}
                      <span className="block text-xs text-warm-gray mt-0.5">
                        {currentTable ? `Aktuell: ${currentTable.name}` : 'Noch keinem Tisch zugewiesen'}
                      </span>
                    </span>
                    <select
                      value={guest.table_id ?? ''}
                      disabled={busyGuestId === guest.id}
                      aria-label={`${getGuestPartyLabel(guest)} Tisch zuweisen`}
                      onChange={(e) => handleAssign(guest.id, e.target.value)}
                      className="px-3 py-2 rounded-xl border border-cream-dark bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
                    >
                      <option value="">— Kein Tisch —</option>
                      {tables.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                  </li>
                )
              })}
          </ul>
          {unassigned.length > 0 && (
            <p className="text-xs text-warm-gray mt-4">
              {unassigned.length} Gäste ohne Tischzuweisung
            </p>
          )}
        </div>
      )}
    </div>
  )
}
