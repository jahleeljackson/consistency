import { describe, expect, it } from 'vitest'
import { createMission } from './missions.ts'
import { parseExportPayload, parseMissionDraft, toExportPayload } from './schema.ts'
import { emptyState } from './state.ts'

describe('parseMissionDraft', () => {
  it('accepts a valid mission', () => {
    const draft = parseMissionDraft({
      name: '  Morning walk  ',
      description: 'Around the block',
      cadence: 'daily',
      preferredTime: '07:30',
      color: 'moss',
    })
    expect(draft.name).toBe('Morning walk')
    expect(draft.preferredTime).toBe('07:30')
  })

  it('allows a missing preferred time', () => {
    const draft = parseMissionDraft({
      name: 'Read',
      description: '',
      cadence: 'weekly',
      preferredTime: '',
      color: 'sand',
    })
    expect(draft.preferredTime).toBeUndefined()
  })

  it('rejects an empty name', () => {
    expect(() =>
      parseMissionDraft({
        name: '   ',
        description: '',
        cadence: 'weekly',
        color: 'clay',
      }),
    ).toThrow()
  })
})

describe('export and import', () => {
  it('round-trips app state', () => {
    const state = emptyState()
    const mission = createMission({
      name: 'Journal',
      description: '',
      cadence: 'daily',
      color: 'sand',
    })
    const populated = { ...state, missions: [mission], revision: 1 }
    const payload = toExportPayload(populated, new Date('2026-01-01T00:00:00.000Z'))
    const imported = parseExportPayload(JSON.parse(JSON.stringify(payload)))
    expect(imported.missions[0].name).toBe('Journal')
    expect(imported.revision).toBe(1)
  })
})
