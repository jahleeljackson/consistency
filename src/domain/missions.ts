import { createId } from './ids.ts'
import { getBrowserTimeZone } from './dates.ts'
import { periodKey, previousPeriodKey } from './periods.ts'
import type { Mission, MissionDraft, MissionStatus } from './types.ts'

export function createMission(draft: MissionDraft, now = new Date()): Mission {
  const timestamp = now.toISOString()
  const kind = draft.kind ?? 'cairn'
  const cadence = draft.cadence
  return {
    id: createId(),
    name: draft.name.trim(),
    description: draft.description.trim(),
    kind,
    cadence,
    preferredTime: draft.preferredTime || undefined,
    color: draft.color,
    status: 'active',
    createdAt: timestamp,
    updatedAt: timestamp,
    // Start checking after the current period so new momentum missions are not back-penalized.
    momentumCheckedThrough:
      kind === 'momentum'
        ? previousPeriodKey(periodKey(now, cadence, getBrowserTimeZone()), cadence)
        : undefined,
  }
}

export function updateMission(
  mission: Mission,
  draft: Partial<MissionDraft> & { status?: MissionStatus },
  now = new Date(),
): Mission {
  const nextKind = draft.kind ?? mission.kind
  const nextCadence = draft.cadence ?? mission.cadence
  const switchingToMomentum = nextKind === 'momentum' && mission.kind !== 'momentum'
  const timeZone = getBrowserTimeZone()

  return {
    ...mission,
    name: draft.name?.trim() ?? mission.name,
    description: draft.description?.trim() ?? mission.description,
    kind: nextKind,
    cadence: nextCadence,
    preferredTime:
      draft.preferredTime === undefined
        ? mission.preferredTime
        : draft.preferredTime || undefined,
    color: draft.color ?? mission.color,
    status: draft.status ?? mission.status,
    updatedAt: now.toISOString(),
    momentumCheckedThrough: switchingToMomentum
      ? previousPeriodKey(periodKey(now, nextCadence, timeZone), nextCadence)
      : nextKind === 'cairn'
        ? undefined
        : mission.momentumCheckedThrough,
  }
}
