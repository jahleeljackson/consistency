import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import { emptyState } from '../domain/state.ts'
import { safeParseAppState } from '../domain/schema.ts'
import type { AppState } from '../domain/types.ts'

interface CairnDB extends DBSchema {
  kv: {
    key: string
    value: unknown
  }
}

const DB_NAME = 'cairn'
const DB_VERSION = 1
const STORE = 'kv'
const STATE_KEY = 'state'

let dbPromise: Promise<IDBPDatabase<CairnDB>> | null = null

function openCairnDb(): Promise<IDBPDatabase<CairnDB>> {
  dbPromise ??= openDB<CairnDB>(DB_NAME, DB_VERSION, {
    upgrade(database) {
      if (!database.objectStoreNames.contains(STORE)) {
        database.createObjectStore(STORE)
      }
    },
  })
  return dbPromise
}

export async function loadLocalState(): Promise<AppState> {
  try {
    const db = await openCairnDb()
    const stored = await db.get(STORE, STATE_KEY)
    if (!stored) return emptyState()
    return safeParseAppState(stored)
  } catch {
    return emptyState()
  }
}

export async function saveLocalState(state: AppState): Promise<void> {
  const db = await openCairnDb()
  await db.put(STORE, state, STATE_KEY)
}

export async function clearLocalState(): Promise<void> {
  const db = await openCairnDb()
  await db.delete(STORE, STATE_KEY)
}

export async function resetLocalDatabase(): Promise<void> {
  if (dbPromise) {
    const db = await dbPromise
    db.close()
    dbPromise = null
  }
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
    request.onblocked = () => resolve()
  })
}
