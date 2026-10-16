import { latestCompletion } from './completions.ts'
import {
  periodKey,
  periodKeysAfterThrough,
  periodsAreAdjacent,
  previousPeriodKey,
} from './periods.ts'
import type { AppState, Cadence, Completion, Mission } from './types.ts'

export function completedPeriodKeys(
  completions: Completion[],
  missionId: string,
  cadence: Cadence,
  timeZone: string,
): string[] {
  const keys = completions
    .filter((completion) => completion.missionId === missionId)
    .map((completion) => periodKey(completion.completedAt, cadence, timeZone))
  return [...new Set(keys)].sort()
}

export function streakStats(
  completions: Completion[],
  mission: Mission,
  now = new Date(),
  timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone,
): { currentStreak: number; longestStreak: number } {
  const cadence = mission.cadence
  const keys = completedPeriodKeys(completions, mission.id, cadence, timeZone)
  if (keys.length === 0) return { currentStreak: 0, longestStreak: 0 }

  let longest = 1
  let run = 1
  for (let i = 1; i < keys.length; i += 1) {
    if (periodsAreAdjacent(keys[i - 1], keys[i], cadence)) {
      run += 1
      longest = Math.max(longest, run)
    } else {
      run = 1
    }
  }

  const currentPeriod = periodKey(now, cadence, timeZone)
  const lastClosed = previousPeriodKey(currentPeriod, cadence)
  const tip = keys.includes(currentPeriod)
    ? currentPeriod
    : keys.includes(lastClosed)
      ? lastClosed
      : null

  if (!tip) return { currentStreak: 0, longestStreak: longest }

  let current = 1
  let cursor = tip
  while (true) {
    const prior = previousPeriodKey(cursor, cadence)
    if (!keys.includes(prior)) break
    current += 1
    cursor = prior
  }

  return { currentStreak: current, longestStreak: Math.max(longest, current) }
}

function removeOneStone(state: AppState, missionId: string, now: Date): AppState {
  const latest = latestCompletion(state.completions, missionId)
  if (!latest) return state
  return {
    ...state,
    completions: state.completions.filter((completion) => completion.id !== latest.id),
    tombstones: [
      ...state.tombstones.filter((tombstone) => tombstone.id !== latest.id),
      { id: latest.id, deletedAt: now.toISOString() },
    ],
  }
}

export function applyMomentumDecay(
  state: AppState,
  now = new Date(),
  timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone,
): AppState {
  let next = state
  let changed = false

  for (const mission of state.missions) {
    if (mission.kind !== 'momentum' || mission.status !== 'active') continue

    const currentPeriod = periodKey(now, mission.cadence, timeZone)
    const lastClosed = previousPeriodKey(currentPeriod, mission.cadence)
    const createdPeriod = periodKey(mission.createdAt, mission.cadence, timeZone)
    const checkedThrough = mission.momentumCheckedThrough ?? previousPeriodKey(createdPeriod, mission.cadence)

    if (lastClosed <= checkedThrough) continue

    const elapsed = periodKeysAfterThrough(checkedThrough, lastClosed, mission.cadence)
    const done = new Set(
      completedPeriodKeys(next.completions, mission.id, mission.cadence, timeZone),
    )
    const misses = elapsed.filter((key) => !done.has(key))

    let working = next
    for (const _miss of misses) {
      const after = removeOneStone(working, mission.id, now)
      if (after !== working) {
        working = after
        changed = true
      }
    }

    const updatedMission: Mission = {
      ...mission,
      momentumCheckedThrough: lastClosed,
      updatedAt: now.toISOString(),
    }
    working = {
      ...working,
      missions: working.missions.map((item) => (item.id === mission.id ? updatedMission : item)),
    }
    next = working
    changed = true
  }

  if (!changed) return state
  return { ...next, revision: state.revision + 1 }
}
