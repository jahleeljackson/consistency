import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { addCompletion } from '../domain/completions.ts'
import {
  appendCompletion,
  deleteMissionFromState,
  mergeStates,
  removeLastCompletion,
  replaceSettings,
  upsertMission,
} from '../domain/merge.ts'
import { createMission, updateMission } from '../domain/missions.ts'
import { parseExportPayload, parseMissionDraft, toExportPayload } from '../domain/schema.ts'
import { emptyState } from '../domain/state.ts'
import type { AppSettings, AppState, MissionDraft, MissionStatus } from '../domain/types.ts'
import { loadLocalState, saveLocalState } from '../storage/local.ts'
import { fetchRemoteState, pushRemoteState } from '../storage/remote.ts'

export type SyncStatus = 'idle' | 'syncing' | 'offline' | 'error'
export type LoadStatus = 'loading' | 'ready' | 'error'

interface CairnContextValue {
  state: AppState
  loadStatus: LoadStatus
  syncStatus: SyncStatus
  errorMessage: string | null
  createNewMission: (draft: MissionDraft) => Promise<string>
  saveMission: (missionId: string, draft: MissionDraft) => Promise<void>
  setMissionStatus: (missionId: string, status: MissionStatus) => Promise<void>
  removeMission: (missionId: string) => Promise<void>
  addStone: (missionId: string) => Promise<void>
  removeStone: (missionId: string) => Promise<void>
  saveSettings: (settings: Partial<Pick<AppSettings, 'theme' | 'reducedMotion'>>) => Promise<void>
  exportJson: () => string
  importJson: (raw: string, mode: 'merge' | 'replace') => Promise<void>
  resetAll: () => Promise<void>
  retrySync: () => Promise<void>
}

const CairnContext = createContext<CairnContextValue | null>(null)

export function CairnProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(emptyState)
  const [loadStatus, setLoadStatus] = useState<LoadStatus>('loading')
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const stateRef = useRef(state)
  stateRef.current = state

  const persistLatest = useCallback(async (next: AppState) => {
    stateRef.current = next
    setState(next)
    await saveLocalState(next)
  }, [])

  const flushRemote = useCallback(async () => {
    setSyncStatus('syncing')
    try {
      const remote = await fetchRemoteState()
      const merged = remote ? mergeStates(stateRef.current, remote) : stateRef.current
      const latest = mergeStates(stateRef.current, merged)
      await persistLatest(latest)
      try {
        await pushRemoteState(latest)
        setSyncStatus('idle')
      } catch {
        setSyncStatus('offline')
      }
    } catch {
      setSyncStatus('offline')
    }
  }, [persistLatest])

  const commit = useCallback(
    async (updater: (current: AppState) => AppState) => {
      const next = updater(stateRef.current)
      await persistLatest(next)
      void flushRemote()
    },
    [flushRemote, persistLatest],
  )

  const boot = useCallback(async () => {
    setLoadStatus('loading')
    try {
      const local = await loadLocalState()
      await persistLatest(local)
      setLoadStatus('ready')
      void flushRemote()
    } catch {
      setLoadStatus('error')
      setErrorMessage('Something went wrong loading your cairns.')
    }
  }, [flushRemote, persistLatest])

  const didBoot = useRef(false)
  useEffect(() => {
    if (didBoot.current) return
    didBoot.current = true
    void boot()
  }, [boot])

  useEffect(() => {
    document.documentElement.dataset.theme = state.settings.theme
    document.documentElement.dataset.reducedMotion = state.settings.reducedMotion ? 'true' : 'false'
  }, [state.settings.theme, state.settings.reducedMotion])

  const value = useMemo<CairnContextValue>(
    () => ({
      state,
      loadStatus,
      syncStatus,
      errorMessage,
      createNewMission: async (draft) => {
        const parsed = parseMissionDraft(draft)
        const mission = createMission(parsed)
        await commit((current) => upsertMission(current, mission))
        return mission.id
      },
      saveMission: async (missionId, draft) => {
        const parsed = parseMissionDraft(draft)
        await commit((current) => {
          const mission = current.missions.find((item) => item.id === missionId)
          if (!mission) return current
          return upsertMission(current, updateMission(mission, parsed))
        })
      },
      setMissionStatus: async (missionId, status) => {
        await commit((current) => {
          const mission = current.missions.find((item) => item.id === missionId)
          if (!mission) return current
          return upsertMission(current, updateMission(mission, { status }))
        })
      },
      removeMission: async (missionId) => {
        await commit((current) => deleteMissionFromState(current, missionId))
      },
      addStone: async (missionId) => {
        await commit((current) => {
          if (!current.missions.some((mission) => mission.id === missionId)) return current
          return appendCompletion(current, addCompletion(missionId))
        })
      },
      removeStone: async (missionId) => {
        await commit((current) => removeLastCompletion(current, missionId))
      },
      saveSettings: async (settings) => {
        await commit((current) =>
          replaceSettings(current, {
            ...current.settings,
            ...settings,
            updatedAt: new Date().toISOString(),
          }),
        )
      },
      exportJson: () => JSON.stringify(toExportPayload(state), null, 2),
      importJson: async (raw, mode) => {
        const imported = parseExportPayload(JSON.parse(raw))
        await commit((current) => {
          if (mode === 'replace') {
            return { ...imported, revision: Math.max(current.revision, imported.revision) + 1 }
          }
          const merged = mergeStates(current, imported)
          return { ...merged, revision: Math.max(current.revision, imported.revision) + 1 }
        })
      },
      resetAll: async () => {
        await commit((current) => ({ ...emptyState(), revision: current.revision + 1 }))
      },
      retrySync: boot,
    }),
    [boot, commit, errorMessage, loadStatus, state, syncStatus],
  )

  return <CairnContext.Provider value={value}>{children}</CairnContext.Provider>
}

export function useCairn(): CairnContextValue {
  const value = useContext(CairnContext)
  if (!value) {
    throw new Error('useCairn must be used within CairnProvider')
  }
  return value
}
