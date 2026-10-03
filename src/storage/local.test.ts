import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { addCompletion } from '../domain/completions.ts'
import { createMission } from '../domain/missions.ts'
import { emptyState } from '../domain/state.ts'
import { clearLocalState, loadLocalState, resetLocalDatabase, saveLocalState } from './local.ts'

describe('IndexedDB persistence', () => {
  beforeEach(async () => {
    await resetLocalDatabase()
  })

  it('round-trips missions and completions', async () => {
    const mission = createMission({
      name: 'Stretch',
      description: 'Five minutes',
      cadence: 'daily',
      color: 'slate',
    })
    const state = {
      ...emptyState(),
      missions: [mission],
      completions: [addCompletion(mission.id, new Date('2026-01-02T08:00:00.000Z'))],
      revision: 2,
    }

    await saveLocalState(state)
    const loaded = await loadLocalState()

    expect(loaded.missions[0].name).toBe('Stretch')
    expect(loaded.completions).toHaveLength(1)
    expect(loaded.revision).toBe(2)
  })

  it('returns an empty state when nothing is stored', async () => {
    await clearLocalState()
    const loaded = await loadLocalState()
    expect(loaded.missions).toEqual([])
    expect(loaded.completions).toEqual([])
  })
})
