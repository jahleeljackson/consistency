import { createId } from './ids.ts'
import type { Mission, MissionDraft, MissionStatus } from './types.ts'

export function createMission(draft: MissionDraft, now = new Date()): Mission {
  const timestamp = now.toISOString()
  return {
    id: createId(),
    name: draft.name.trim(),
    description: draft.description.trim(),
    cadence: draft.cadence,
    preferredTime: draft.preferredTime || undefined,
    color: draft.color,
    status: 'active',
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}

export function updateMission(
  mission: Mission,
  draft: Partial<MissionDraft> & { status?: MissionStatus },
  now = new Date(),
): Mission {
  return {
    ...mission,
    name: draft.name?.trim() ?? mission.name,
    description: draft.description?.trim() ?? mission.description,
    cadence: draft.cadence ?? mission.cadence,
    preferredTime:
      draft.preferredTime === undefined
        ? mission.preferredTime
        : draft.preferredTime || undefined,
    color: draft.color ?? mission.color,
    status: draft.status ?? mission.status,
    updatedAt: now.toISOString(),
  }
}
