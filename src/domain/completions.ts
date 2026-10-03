import { createId } from './ids.ts'
import type { Completion } from './types.ts'

export function addCompletion(missionId: string, now = new Date()): Completion {
  return {
    id: createId(),
    missionId,
    completedAt: now.toISOString(),
  }
}

export function latestCompletion(
  completions: Completion[],
  missionId: string,
): Completion | undefined {
  return completions
    .filter((completion) => completion.missionId === missionId)
    .sort((a, b) => a.completedAt.localeCompare(b.completedAt) || a.id.localeCompare(b.id))
    .at(-1)
}
