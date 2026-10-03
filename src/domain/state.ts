import type { AppSettings, AppState } from './types.ts'

export const EXPORT_FORMAT = 'cairn.v1'

export function defaultSettings(now = new Date()): AppSettings {
  return {
    theme: 'light',
    reducedMotion: false,
    updatedAt: now.toISOString(),
  }
}

export function emptyState(now = new Date()): AppState {
  return {
    missions: [],
    completions: [],
    tombstones: [],
    settings: defaultSettings(now),
    revision: 0,
  }
}

export function cloneState(state: AppState): AppState {
  return structuredClone(state)
}
