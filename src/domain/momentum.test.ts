import { describe, expect, it } from 'vitest'
import { addCompletion } from './completions.ts'
import { appendCompletion } from './merge.ts'
import { applyMomentumDecay, streakStats } from './momentum.ts'
import { createMission } from './missions.ts'
import { emptyState } from './state.ts'
import type { AppState } from './types.ts'

const TZ = 'UTC'

describe('streakStats', () => {
  it('counts current and longest daily streaks', () => {
    const mission = createMission(
      {
        name: 'Train',
        description: '',
        kind: 'momentum',
        cadence: 'daily',
        color: 'clay',
      },
      new Date('2026-01-01T00:00:00.000Z'),
    )
    const completions = [
      addCompletion(mission.id, new Date('2026-01-10T09:00:00.000Z')),
      addCompletion(mission.id, new Date('2026-01-11T09:00:00.000Z')),
      addCompletion(mission.id, new Date('2026-01-12T09:00:00.000Z')),
      addCompletion(mission.id, new Date('2026-01-14T09:00:00.000Z')),
      addCompletion(mission.id, new Date('2026-01-15T09:00:00.000Z')),
    ]
    const stats = streakStats(completions, mission, new Date('2026-01-15T18:00:00.000Z'), TZ)
    expect(stats.currentStreak).toBe(2)
    expect(stats.longestStreak).toBe(3)
  })

  it('keeps current streak through an unfinished period', () => {
    const mission = createMission(
      {
        name: 'Train',
        description: '',
        kind: 'momentum',
        cadence: 'daily',
        color: 'moss',
      },
      new Date('2026-01-01T00:00:00.000Z'),
    )
    const completions = [
      addCompletion(mission.id, new Date('2026-01-13T09:00:00.000Z')),
      addCompletion(mission.id, new Date('2026-01-14T09:00:00.000Z')),
    ]
    const stats = streakStats(completions, mission, new Date('2026-01-15T08:00:00.000Z'), TZ)
    expect(stats.currentStreak).toBe(2)
  })

  it('counts weekly streaks by week', () => {
    const mission = createMission(
      {
        name: 'Deep work',
        description: '',
        kind: 'momentum',
        cadence: 'weekly',
        color: 'sand',
      },
      new Date('2026-01-01T00:00:00.000Z'),
    )
    const completions = [
      addCompletion(mission.id, new Date('2026-01-05T09:00:00.000Z')), // week of Jan 5
      addCompletion(mission.id, new Date('2026-01-12T09:00:00.000Z')), // week of Jan 12
    ]
    const stats = streakStats(completions, mission, new Date('2026-01-15T12:00:00.000Z'), TZ)
    expect(stats.currentStreak).toBe(2)
    expect(stats.longestStreak).toBe(2)
  })
})

describe('applyMomentumDecay', () => {
  it('removes one stone per missed daily period', () => {
    const mission = {
      ...createMission(
        {
          name: 'Momentum walk',
          description: '',
          kind: 'momentum',
          cadence: 'daily',
          color: 'clay',
        },
        new Date('2026-01-10T12:00:00.000Z'),
      ),
      // Pin the decay cursor so the test is timezone-stable.
      momentumCheckedThrough: '2026-01-09',
    }
    let state: AppState = {
      ...emptyState(new Date('2026-01-10T12:00:00.000Z')),
      missions: [mission],
      revision: 1,
    }
    state = appendCompletion(state, addCompletion(mission.id, new Date('2026-01-10T09:00:00.000Z')))
    state = appendCompletion(state, addCompletion(mission.id, new Date('2026-01-10T10:00:00.000Z')))
    state = appendCompletion(state, addCompletion(mission.id, new Date('2026-01-10T11:00:00.000Z')))

    const after = applyMomentumDecay(state, new Date('2026-01-13T12:00:00.000Z'), TZ)
    // Missed Jan 11 and Jan 12 (fully elapsed); today Jan 13 not yet missed
    expect(after.completions.filter((c) => c.missionId === mission.id)).toHaveLength(1)
    expect(after.missions[0].momentumCheckedThrough).toBe('2026-01-12')
  })

  it('does not remove stones from cairn missions', () => {
    const mission = createMission(
      {
        name: 'Steady',
        description: '',
        kind: 'cairn',
        cadence: 'daily',
        color: 'slate',
      },
      new Date('2026-01-10T00:00:00.000Z'),
    )
    let state = {
      ...emptyState(),
      missions: [mission],
      revision: 1,
    }
    state = appendCompletion(state, addCompletion(mission.id, new Date('2026-01-10T09:00:00.000Z')))
    const after = applyMomentumDecay(state, new Date('2026-01-20T12:00:00.000Z'), TZ)
    expect(after.completions).toHaveLength(1)
  })

  it('does not double-apply decay for the same periods', () => {
    const mission = createMission(
      {
        name: 'Momentum',
        description: '',
        kind: 'momentum',
        cadence: 'daily',
        color: 'terracotta',
      },
      new Date('2026-01-10T00:00:00.000Z'),
    )
    let state = {
      ...emptyState(),
      missions: [mission],
      revision: 1,
    }
    state = appendCompletion(state, addCompletion(mission.id, new Date('2026-01-10T09:00:00.000Z')))
    state = appendCompletion(state, addCompletion(mission.id, new Date('2026-01-10T10:00:00.000Z')))
    state = applyMomentumDecay(state, new Date('2026-01-12T12:00:00.000Z'), TZ)
    const once = state.completions.length
    state = applyMomentumDecay(state, new Date('2026-01-12T18:00:00.000Z'), TZ)
    expect(state.completions).toHaveLength(once)
  })

  it('skips paused momentum missions', () => {
    const mission = createMission(
      {
        name: 'Paused momentum',
        description: '',
        kind: 'momentum',
        cadence: 'daily',
        color: 'moss',
      },
      new Date('2026-01-10T00:00:00.000Z'),
    )
    let state: AppState = {
      ...emptyState(),
      missions: [{ ...mission, status: 'paused' }],
      revision: 1,
    }
    state = appendCompletion(state, addCompletion(mission.id, new Date('2026-01-10T09:00:00.000Z')))
    const after = applyMomentumDecay(state, new Date('2026-01-20T12:00:00.000Z'), TZ)
    expect(after.completions).toHaveLength(1)
  })
})
