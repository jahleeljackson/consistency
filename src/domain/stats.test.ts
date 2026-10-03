import { describe, expect, it } from 'vitest'
import { emptyState } from './state.ts'
import { addCompletion } from './completions.ts'
import { createMission } from './missions.ts'
import { getMissionStats, longestConsecutiveDays } from './stats.ts'

const TZ = 'UTC'

describe('longestConsecutiveDays', () => {
  it('returns 0 with no dates', () => {
    expect(longestConsecutiveDays([])).toBe(0)
  })

  it('counts consecutive local dates', () => {
    expect(longestConsecutiveDays(['2026-01-01', '2026-01-02', '2026-01-03'])).toBe(3)
  })

  it('keeps the longest run after a gap', () => {
    expect(
      longestConsecutiveDays(['2026-01-01', '2026-01-02', '2026-01-03', '2026-01-10', '2026-01-11']),
    ).toBe(3)
  })

  it('does not reset the record when later dates are isolated', () => {
    expect(longestConsecutiveDays(['2026-01-01', '2026-01-02', '2026-03-01'])).toBe(2)
  })
})

describe('getMissionStats', () => {
  const now = new Date('2026-01-15T12:00:00.000Z')

  it('counts unlimited completions and never drops totals after a gap', () => {
    const mission = createMission(
      {
        name: 'Write',
        description: '',
        cadence: 'daily',
        color: 'clay',
      },
      new Date('2026-01-01T00:00:00.000Z'),
    )

    const early = [
      { ...addCompletion(mission.id, new Date('2026-01-01T09:00:00.000Z')) },
      { ...addCompletion(mission.id, new Date('2026-01-01T10:00:00.000Z')) },
      { ...addCompletion(mission.id, new Date('2026-01-02T09:00:00.000Z')) },
    ]
    const afterGap = [
      ...early,
      { ...addCompletion(mission.id, new Date('2026-01-14T09:00:00.000Z')) },
    ]

    const before = getMissionStats(mission, early, now, TZ)
    const after = getMissionStats(mission, afterGap, now, TZ)

    expect(before.total).toBe(3)
    expect(after.total).toBe(4)
    expect(after.longestConsecutiveDays).toBeGreaterThanOrEqual(before.longestConsecutiveDays)
    expect(after.stonesThisWeek).toBeGreaterThan(0)
    expect(after.stonesThisMonth).toBe(4)
    expect(after.nextMilestone).toBe(7)
  })

  it('allows many completions on the same day', () => {
    const mission = createMission({
      name: 'Walk',
      description: '',
      cadence: 'daily',
      color: 'moss',
    })
    const stones = Array.from({ length: 5 }, () =>
      addCompletion(mission.id, new Date('2026-01-15T15:00:00.000Z')),
    )

    const stats = getMissionStats(mission, stones, now, TZ)
    expect(stats.total).toBe(5)
    expect(stats.longestConsecutiveDays).toBe(1)
  })

  it('returns empty stats without completions', () => {
    const mission = createMission({
      name: 'Read',
      description: '',
      cadence: 'weekly',
      color: 'sand',
    })
    const stats = getMissionStats(mission, emptyState().completions, now, TZ)
    expect(stats.total).toBe(0)
    expect(stats.lastAddedAt).toBeNull()
    expect(stats.longestConsecutiveDays).toBe(0)
    expect(stats.nextMilestone).toBe(1)
  })
})
