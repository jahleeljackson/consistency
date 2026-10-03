import { describe, expect, it } from 'vitest'
import { daysBetweenKeys, startOfMonthKey, startOfWeekKey, zonedDateKey } from './dates.ts'

describe('dates', () => {
  it('formats a zoned date key', () => {
    expect(zonedDateKey('2026-01-15T12:00:00.000Z', 'UTC')).toBe('2026-01-15')
  })

  it('starts the week on Monday', () => {
    expect(startOfWeekKey(new Date('2026-01-15T12:00:00.000Z'), 'UTC')).toBe('2026-01-12')
  })

  it('starts the month on the first', () => {
    expect(startOfMonthKey(new Date('2026-01-15T12:00:00.000Z'), 'UTC')).toBe('2026-01-01')
  })

  it('measures day gaps without resetting the calendar', () => {
    expect(daysBetweenKeys('2026-01-01', '2026-01-10')).toBe(9)
  })
})
