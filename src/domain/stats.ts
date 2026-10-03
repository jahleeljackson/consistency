import { daysBetweenKeys, startOfMonthKey, startOfWeekKey, zonedDateKey } from './dates.ts'
import { milestoneProgress } from './milestones.ts'
import type { Completion, Mission, MissionStats } from './types.ts'

export function completionsForMission(
  completions: Completion[],
  missionId: string,
): Completion[] {
  return completions
    .filter((completion) => completion.missionId === missionId)
    .sort((a, b) => a.completedAt.localeCompare(b.completedAt))
}

export function longestConsecutiveDays(dateKeys: string[]): number {
  const unique = [...new Set(dateKeys)].sort()
  if (unique.length === 0) return 0

  let best = 1
  let run = 1

  for (let i = 1; i < unique.length; i += 1) {
    if (daysBetweenKeys(unique[i - 1], unique[i]) === 1) {
      run += 1
      best = Math.max(best, run)
    } else {
      run = 1
    }
  }

  return best
}

export function countOnOrAfter(completions: Completion[], startKey: string, timeZone: string): number {
  return completions.filter((completion) => zonedDateKey(completion.completedAt, timeZone) >= startKey)
    .length
}

export function getMissionStats(
  mission: Mission,
  completions: Completion[],
  now = new Date(),
  timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone,
): MissionStats {
  const stones = completionsForMission(completions, mission.id)
  const dateKeys = stones.map((stone) => zonedDateKey(stone.completedAt, timeZone))
  const marks = milestoneProgress(stones.length)

  return {
    total: stones.length,
    createdAt: mission.createdAt,
    lastAddedAt: stones.at(-1)?.completedAt ?? null,
    stonesThisWeek: countOnOrAfter(stones, startOfWeekKey(now, timeZone), timeZone),
    stonesThisMonth: countOnOrAfter(stones, startOfMonthKey(now, timeZone), timeZone),
    longestConsecutiveDays: longestConsecutiveDays(dateKeys),
    nextMilestone: marks.next,
    previousMilestone: marks.previous,
    milestoneProgress: marks.progress,
  }
}

export function dayCounts(
  completions: Completion[],
  timeZone: string,
): Map<string, number> {
  const counts = new Map<string, number>()
  for (const completion of completions) {
    const key = zonedDateKey(completion.completedAt, timeZone)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return counts
}
