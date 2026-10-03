import { addDaysToKey, monthGrid, zonedDateKey } from '../../domain/dates.ts'
import { dayCounts } from '../../domain/stats.ts'
import type { Completion } from '../../domain/types.ts'
import { useMemo, useState } from 'react'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function CompletionCalendar({
  completions,
  timeZone,
}: {
  completions: Completion[]
  timeZone: string
}) {
  const today = zonedDateKey(new Date(), timeZone)
  const initial = new Date(`${today}T12:00:00`)
  const [cursor, setCursor] = useState({ year: initial.getFullYear(), month: initial.getMonth() })
  const counts = useMemo(() => dayCounts(completions, timeZone), [completions, timeZone])
  const weeks = monthGrid(cursor.year, cursor.month, timeZone)
  const label = new Intl.DateTimeFormat(undefined, {
    month: 'long',
    year: 'numeric',
  }).format(new Date(cursor.year, cursor.month, 1))

  function shift(delta: number) {
    setCursor((current) => {
      const next = new Date(current.year, current.month + delta, 1)
      return { year: next.getFullYear(), month: next.getMonth() }
    })
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-display text-2xl">Calendar</h3>
        <div className="flex items-center gap-2">
          <button type="button" className="rounded-full px-3 py-1 text-sm" onClick={() => shift(-1)}>
            Previous
          </button>
          <p className="min-w-36 text-center text-sm font-semibold">{label}</p>
          <button type="button" className="rounded-full px-3 py-1 text-sm" onClick={() => shift(1)}>
            Next
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center text-xs text-[var(--muted)]">
        {WEEKDAYS.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-2">
        {weeks.flat().map((key) => {
          const inMonth = Number(key.slice(5, 7)) - 1 === cursor.month
          const count = counts.get(key) ?? 0
          const isToday = key === today
          return (
            <div
              key={key}
              title={`${key}: ${count} stone${count === 1 ? '' : 's'}`}
              className={`min-h-14 rounded-2xl border p-2 text-left ${
                inMonth
                  ? 'border-[var(--line)] bg-[var(--surface-strong)]'
                  : 'border-transparent text-[var(--muted)] opacity-50'
              } ${isToday ? 'ring-2 ring-[var(--clay)]' : ''}`}
            >
              <div className="text-xs">{Number(key.slice(8))}</div>
              {count > 0 ? (
                <div className="mt-1 text-xs font-semibold text-[var(--clay-deep)]">
                  {count}
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
      <p className="sr-only">
        {addDaysToKey(today, 0)} is today. Days with stones show a count.
      </p>
    </section>
  )
}
