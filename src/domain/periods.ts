import { addDaysToKey, startOfWeekKey, zonedDateKey } from './dates.ts'
import type { Cadence } from './types.ts'

export function periodKey(
  isoOrDate: string | Date,
  cadence: Cadence,
  timeZone: string,
): string {
  const date = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate
  if (cadence === 'daily') return zonedDateKey(date, timeZone)
  return startOfWeekKey(date, timeZone)
}

export function nextPeriodKey(key: string, cadence: Cadence): string {
  return addDaysToKey(key, cadence === 'daily' ? 1 : 7)
}

export function previousPeriodKey(key: string, cadence: Cadence): string {
  return addDaysToKey(key, cadence === 'daily' ? -1 : -7)
}

export function periodsAreAdjacent(a: string, b: string, cadence: Cadence): boolean {
  return nextPeriodKey(a, cadence) === b
}

/** Fully elapsed periods strictly after `afterExclusive` through `throughInclusive`. */
export function periodKeysAfterThrough(
  afterExclusive: string,
  throughInclusive: string,
  cadence: Cadence,
): string[] {
  if (throughInclusive <= afterExclusive) return []
  const keys: string[] = []
  let cursor = nextPeriodKey(afterExclusive, cadence)
  while (cursor <= throughInclusive) {
    keys.push(cursor)
    cursor = nextPeriodKey(cursor, cadence)
  }
  return keys
}

export function periodLabel(cadence: Cadence): string {
  return cadence === 'daily' ? 'day' : 'week'
}

export function periodLabelPlural(cadence: Cadence): string {
  return cadence === 'daily' ? 'days' : 'weeks'
}
