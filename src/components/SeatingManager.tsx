import { useState } from 'react'
import { LayoutGrid, Loader2, Plus, Trash2, Users } from 'lucide-react'
import Button from './Button'
import Input from './Input'
import InviteQrCode from './InviteQrCode'
import { getGuestPartyLabel, getSeatingSeats } from '../lib/guests'
import {
  assignGuestToTable,
  assignSeatToTable,
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
  const [busyKey, setBusyKey] = useState<string | null>(null)
  const [error, setError] = useState('')

  const seatingUrl = getSeatingPlanUrl(weddingSlug)
  const allSeats = guests.flatMap((g) => getSeatingSeats(g))
  const unassignedSeats = allSeats.filter((s) => !s.tableId)

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

  const handleAssignSeat = async (
    guestId: string,
    memberIndex: number | null,
    tableId: string
  ) => {
    const key = `${guestId}:${memberIndex ?? 'primary'}`
    setBusyKey(key)
    setError('')
    try {
      await assignSeatToTable(guestId, memberIndex, tableId || null)
      onUpdate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Zuweisung fehlgeschlagen.')
    } finally {
      setBusyKey(null)
    }
  }

  const handleAssignParty = async (guestId: string, tableId: string) => {
    const key = `${guestId}:party`
    setBusyKey(key)
    setError('')
    try {
      await assignGuestToTable(guestId, tableId || null)
      onUpdate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Zuweisung fehlgeschlagen.')
    } finally {
      setBusyKey(null)
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

  const renderTableSelect = (
    value: string,
    disabled: boolean,
    ariaLabel: string,
    onChange: (tableId: string) => void
  ) => (
    <select
      value={value}
      disabled={disabled}
      aria-label={ariaLabel}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 rounded-xl border border-cream-dark bg-white text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-gold/40"
    >
      <option value="">— Kein Tisch —</option>
      {tables.map((option) => (
        <option key={option.id} value={option.id}>
          {option.name}
        </option>
      ))}
    </select>
  )

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
          Legt Tische an und setzt Personen einzeln um – auch +1 und Familienmitglieder an andere
          Tische. Maximal {MAX_SEATING_TABLES} Tische.
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
        </div>
      )}

      {tables.length === 0 ? (
        <div className="p-10 text-center text-warm-gray text-sm">Noch keine Tische angelegt.</div>
      ) : (
        <div className="divide-y divide-cream-dark">
          {plan.map((table) => {
            const seats = table.guests.flatMap((g) =>
              getSeatingSeats(g).filter((s) => s.tableId === table.id)
            )
            return (
              <div key={table.id} className="p-4 sm:p-6">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-charcoal">{table.name}</h3>
                    <p className="text-sm text-warm-gray">{seats.length} Personen</p>
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
                {seats.length > 0 ? (
                  <ul className="space-y-2 text-sm text-charcoal">
                    {seats.map((seat) => {
                      const key = `${seat.guestId}:${seat.memberIndex ?? 'primary'}`
                      return (
                        <li
                          key={key}
                          className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 rounded-xl border border-cream-dark/60 bg-cream/20 px-3 py-2.5"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Users className="w-3.5 h-3.5 text-warm-gray shrink-0" />
                            <span className="truncate">{seat.name}</span>
                          </div>
                          <label className="flex items-center gap-2 shrink-0 text-xs text-warm-gray">
                            <span className="whitespace-nowrap">Tisch</span>
                            {renderTableSelect(
                              seat.tableId ?? '',
                              busyKey === key,
                              `${seat.name} an anderen Tisch setzen`,
                              (nextTableId) =>
                                handleAssignSeat(seat.guestId, seat.memberIndex, nextTableId)
                            )}
                          </label>
                        </li>
                      )
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-warm-gray italic">Noch keine Gäste zugewiesen</p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {guests.length > 0 && tables.length > 0 && (
        <div className="p-6 bg-cream/20">
          <h3 className="font-medium text-charcoal mb-1">Personen zuweisen & umsetzen</h3>
          <p className="text-xs text-warm-gray mb-4">
            Jede Person (auch +1) kann einen eigenen Tisch bekommen. „Ganze Gruppe“ setzt alle auf
            denselben Tisch.
          </p>
          <ul className="space-y-4">
            {[...guests]
              .sort((a, b) => a.name.localeCompare(b.name, 'de'))
              .map((guest) => {
                const seats = getSeatingSeats(guest)
                const partyKey = `${guest.id}:party`
                return (
                  <li
                    key={guest.id}
                    className="rounded-xl border border-cream-dark/70 bg-white px-3 py-3 space-y-2"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="text-sm font-medium text-charcoal flex-1">
                        {getGuestPartyLabel(guest)}
                      </span>
                      {seats.length > 1 && (
                        <label className="flex items-center gap-2 text-xs text-warm-gray">
                          <span className="whitespace-nowrap">Ganze Gruppe</span>
                          {renderTableSelect(
                            guest.table_id ?? '',
                            busyKey === partyKey,
                            `${getGuestPartyLabel(guest)} gemeinsam zuweisen`,
                            (nextTableId) => handleAssignParty(guest.id, nextTableId)
                          )}
                        </label>
                      )}
                    </div>
                    <ul className="space-y-2">
                      {seats.map((seat) => {
                        const key = `${seat.guestId}:${seat.memberIndex ?? 'primary'}`
                        const current = tables.find((t) => t.id === seat.tableId)
                        return (
                          <li
                            key={key}
                            className="flex flex-col sm:flex-row sm:items-center gap-2 pl-1"
                          >
                            <span className="text-sm text-charcoal flex-1">
                              {seat.name}
                              <span className="block text-xs text-warm-gray mt-0.5">
                                {current
                                  ? `Aktuell: ${current.name}`
                                  : 'Noch keinem Tisch zugewiesen'}
                              </span>
                            </span>
                            {renderTableSelect(
                              seat.tableId ?? '',
                              busyKey === key,
                              `${seat.name} Tisch zuweisen`,
                              (nextTableId) =>
                                handleAssignSeat(seat.guestId, seat.memberIndex, nextTableId)
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  </li>
                )
              })}
          </ul>
          {unassignedSeats.length > 0 && (
            <p className="text-xs text-warm-gray mt-4">
              {unassignedSeats.length} Personen ohne Tischzuweisung
            </p>
          )}
        </div>
      )}
    </div>
  )
}
