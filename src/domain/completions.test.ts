import { describe, expect, it } from 'vitest'
import { addCompletion } from './completions.ts'
import { appendCompletion, mergeStates, removeLastCompletion } from './merge.ts'
import { createMission } from './missions.ts'
import { emptyState } from './state.ts'

describe('completions', () => {
  it('allows many completions in the same period', () => {
    const now = new Date('2026-01-03T08:00:00.000Z')
    let state = emptyState(now)
    state = appendCompletion(state, addCompletion('mission-1', now))
    state = appendCompletion(state, addCompletion('mission-1', now))
    state = appendCompletion(state, addCompletion('mission-1', now))
    expect(state.completions).toHaveLength(3)
  })

  it('removes only the most recent stone', () => {
    const first = addCompletion('mission-1', new Date('2026-01-03T08:00:00.000Z'))
    const second = addCompletion('mission-1', new Date('2026-01-03T09:00:00.000Z'))
    let state = emptyState()
    state = appendCompletion(state, first)
    state = appendCompletion(state, second)
    state = removeLastCompletion(state, 'mission-1', new Date('2026-01-03T10:00:00.000Z'))

    expect(state.completions.map((item) => item.id)).toEqual([first.id])
    expect(state.tombstones.map((item) => item.id)).toEqual([second.id])
  })

  it('does nothing when a mission has no stones', () => {
    const state = emptyState()
    expect(removeLastCompletion(state, 'mission-1')).toBe(state)
  })

  it('does not resurrect a removed stone during merge', () => {
    const mission = createMission({
      name: 'Walk',
      description: '',
      cadence: 'daily',
      color: 'moss',
    })
    const base = { ...emptyState(), missions: [mission], revision: 1 }
    const stone = addCompletion(mission.id, new Date('2026-01-03T08:00:00.000Z'))
    const kept = appendCompletion(base, stone)
    const removed = removeLastCompletion(kept, mission.id, new Date('2026-01-03T09:00:00.000Z'))

    expect(mergeStates(kept, removed).completions).toHaveLength(0)
  })

  it('does not store the same completion id twice', () => {
    const completion = addCompletion('mission-1', new Date('2026-01-03T08:00:00.000Z'))
    let state = emptyState()
    state = appendCompletion(state, completion)
    state = appendCompletion(state, completion)
    expect(state.completions).toHaveLength(1)
  })
})
