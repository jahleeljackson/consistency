import { latestCompletion } from './completions.ts'
import type { AppSettings, AppState, Completion, Mission, Tombstone } from './types.ts'

function mergeByUpdatedAt<T extends { id: string; updatedAt: string }>(
  left: T[],
  right: T[],
): T[] {
  const map = new Map<string, T>()
  for (const item of [...left, ...right]) {
    const existing = map.get(item.id)
    if (!existing || item.updatedAt >= existing.updatedAt) {
      map.set(item.id, item)
    }
  }
  return [...map.values()]
}

function mergeTombstones(left: Tombstone[], right: Tombstone[]): Tombstone[] {
  const map = new Map<string, Tombstone>()
  for (const item of [...left, ...right]) {
    const existing = map.get(item.id)
    if (!existing || item.deletedAt > existing.deletedAt) {
      map.set(item.id, item)
    }
  }
  return [...map.values()]
}

function mergeCompletions(left: Completion[], right: Completion[]): Completion[] {
  const map = new Map<string, Completion>()
  for (const item of [...left, ...right]) {
    map.set(item.id, item)
  }
  return [...map.values()].sort((a, b) => a.completedAt.localeCompare(b.completedAt))
}

function mergeSettings(left: AppSettings, right: AppSettings): AppSettings {
  return left.updatedAt >= right.updatedAt ? left : right
}

export function mergeStates(local: AppState, remote: AppState): AppState {
  const tombstones = mergeTombstones(local.tombstones, remote.tombstones)
  const deleted = new Set(tombstones.map((stone) => stone.id))

  const missions = mergeByUpdatedAt(local.missions, remote.missions).filter(
    (mission) => !deleted.has(mission.id),
  )

  const alive = new Set(missions.map((mission) => mission.id))
  const completions = mergeCompletions(local.completions, remote.completions).filter(
    (completion) => alive.has(completion.missionId) && !deleted.has(completion.id),
  )

  return {
    missions,
    completions,
    tombstones,
    settings: mergeSettings(local.settings, remote.settings),
    revision: Math.max(local.revision, remote.revision),
  }
}

export function deleteMissionFromState(state: AppState, missionId: string, now = new Date()): AppState {
  return {
    ...state,
    missions: state.missions.filter((mission) => mission.id !== missionId),
    completions: state.completions.filter((completion) => completion.missionId !== missionId),
    tombstones: [
      ...state.tombstones.filter((tombstone) => tombstone.id !== missionId),
      { id: missionId, deletedAt: now.toISOString() },
    ],
    revision: state.revision + 1,
  }
}

export function upsertMission(state: AppState, mission: Mission): AppState {
  const exists = state.missions.some((item) => item.id === mission.id)
  return {
    ...state,
    missions: exists
      ? state.missions.map((item) => (item.id === mission.id ? mission : item))
      : [...state.missions, mission],
    revision: state.revision + 1,
  }
}

export function removeLastCompletion(state: AppState, missionId: string, now = new Date()): AppState {
  const latest = latestCompletion(state.completions, missionId)

  if (!latest) return state

  return {
    ...state,
    completions: state.completions.filter((completion) => completion.id !== latest.id),
    tombstones: [
      ...state.tombstones.filter((tombstone) => tombstone.id !== latest.id),
      { id: latest.id, deletedAt: now.toISOString() },
    ],
    revision: state.revision + 1,
  }
}

export function appendCompletion(state: AppState, completion: Completion): AppState {
  if (
    state.completions.some((item) => item.id === completion.id) ||
    state.tombstones.some((tombstone) => tombstone.id === completion.id)
  ) {
    return state
  }
  return {
    ...state,
    completions: [...state.completions, completion],
    revision: state.revision + 1,
  }
}

export function replaceSettings(state: AppState, settings: AppSettings): AppState {
  return {
    ...state,
    settings,
    revision: state.revision + 1,
  }
}
