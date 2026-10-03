import { parseAppState } from '../domain/schema.ts'
import type { AppState } from '../domain/types.ts'

const STATE_URL = '/api/state'

async function fetchState(url: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), 2500)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    window.clearTimeout(timer)
  }
}

export async function fetchRemoteState(): Promise<AppState | null> {
  const response = await fetchState(STATE_URL, {
    headers: { Accept: 'application/json' },
  })

  if (response.status === 404) return null
  if (!response.ok) {
    throw new Error('Could not reach the shared cairn.')
  }

  const payload: unknown = await response.json()
  if (!payload) return null
  return parseAppState(payload)
}

export async function pushRemoteState(state: AppState): Promise<void> {
  const response = await fetchState(STATE_URL, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(state),
  })

  if (response.status === 404) return
  if (!response.ok) {
    throw new Error('Could not save the shared cairn.')
  }
}
