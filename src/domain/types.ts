export type Cadence = 'daily' | 'weekly'
export type MissionKind = 'cairn' | 'momentum'
export type MissionStatus = 'active' | 'paused' | 'archived'
export type ColorId = 'clay' | 'sand' | 'moss' | 'slate' | 'terracotta'
export type ThemePreference = 'light' | 'evening'

export interface Mission {
  id: string
  name: string
  description: string
  kind: MissionKind
  cadence: Cadence
  preferredTime?: string
  color: ColorId
  status: MissionStatus
  createdAt: string
  updatedAt: string
  /** Last fully elapsed period key already evaluated for momentum decay. */
  momentumCheckedThrough?: string
}

export interface Completion {
  id: string
  missionId: string
  completedAt: string
}

export interface Tombstone {
  id: string
  deletedAt: string
}

export interface AppSettings {
  theme: ThemePreference
  reducedMotion: boolean
  updatedAt: string
}

export interface AppState {
  missions: Mission[]
  completions: Completion[]
  tombstones: Tombstone[]
  settings: AppSettings
  revision: number
}

export interface MissionDraft {
  name: string
  description: string
  kind?: MissionKind
  cadence: Cadence
  preferredTime?: string
  color: ColorId
}

export interface MissionStats {
  total: number
  createdAt: string
  lastAddedAt: string | null
  stonesThisWeek: number
  stonesThisMonth: number
  longestConsecutiveDays: number
  currentStreak: number
  longestStreak: number
  nextMilestone: number
  previousMilestone: number
  milestoneProgress: number
}
