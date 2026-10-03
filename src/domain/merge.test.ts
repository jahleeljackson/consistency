import { describe, expect, it } from 'vitest'
import { addCompletion } from './completions.ts'
import { deleteMissionFromState, mergeStates } from './merge.ts'
import { createMission } from './missions.ts'
import { emptyState } from './state.ts'
import type { AppState } from './types.ts'

function withMission(name: string): AppState {
  const state = emptyState(new Date('2026-01-01T00:00:00.000Z'))
  const mission = createMission(
    { name, description: '', cadence: 'daily', color: 'clay' },
    new Date('2026-01-01T00:00:00.000Z'),
  )
  return {
    ...state,
    missions: [mission],
    revision: 1,
  }
}

describe('mergeStates', () => {
  it('keeps stones added on two devices', () => {
    const base = withMission('Practice')
    const mission = base.missions[0]
    const left = {
      ...base,
      completions: [addCompletion(mission.id, new Date('2026-01-02T10:00:00.000Z'))],
      revision: 2,
    }
    const right = {
      ...base,
      completions: [addCompletion(mission.id, new Date('2026-01-02T11:00:00.000Z'))],
      revision: 2,
    }

    const merged = mergeStates(left, right)
    expect(merged.completions).toHaveLength(2)
    expect(new Set(merged.completions.map((item) => item.id)).size).toBe(2)
  })

  it('lets the later mission edit win', () => {
    const left = withMission('Draft')
    const right = {
      ...left,
      missions: [
        {
          ...left.missions[0],
          name: 'Finished name',
          updatedAt: '2026-01-03T00:00:00.000Z',
        },
      ],
      revision: 3,
    }

    expect(mergeStates(left, right).missions[0].name).toBe('Finished name')
  })

  it('does not resurrect a deleted mission from a stale device', () => {
    const left = withMission('Old')
    const deleted = deleteMissionFromState(left, left.missions[0].id, new Date('2026-01-04T00:00:00.000Z'))
    const stale = {
      ...left,
      completions: [addCompletion(left.missions[0].id, new Date('2026-01-03T00:00:00.000Z'))],
    }

    const merged = mergeStates(stale, deleted)
    expect(merged.missions).toHaveLength(0)
    expect(merged.completions).toHaveLength(0)
    expect(merged.tombstones).toHaveLength(1)
  })

  it('keeps a mission that only exists on one device', () => {
    const left = withMission('Alpha')
    const right = withMission('Beta')
    const merged = mergeStates(left, right)
    expect(merged.missions.map((mission) => mission.name).sort()).toEqual(['Alpha', 'Beta'])
  })
})
