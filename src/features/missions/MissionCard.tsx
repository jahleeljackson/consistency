import { Link } from 'react-router-dom'
import { formatDisplayTime, formatRelativeTime } from '../../domain/dates.ts'
import { getMissionStats } from '../../domain/stats.ts'
import { completionsForMission } from '../../domain/stats.ts'
import type { Completion, Mission } from '../../domain/types.ts'
import { Button } from '../../components/Button.tsx'
import { CairnView } from '../cairn/CairnView.tsx'

export function MissionCard({
  mission,
  completions,
  reducedMotion,
  onAddStone,
  onRemoveStone,
}: {
  mission: Mission
  completions: Completion[]
  reducedMotion: boolean
  onAddStone: () => Promise<void>
  onRemoveStone: () => Promise<void>
}) {
  const stones = completionsForMission(completions, mission.id)
  const stats = getMissionStats(mission, completions)
  const remaining = stats.nextMilestone - stats.total

  return (
    <article className="flex flex-col rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]">
      <Link to={`/missions/${mission.id}`} className="block no-underline text-inherit">
        <CairnView
          completions={stones}
          color={mission.color}
          size="mini"
          reducedMotion={reducedMotion}
        />
        <h2 className="font-display mt-2 text-2xl">{mission.name}</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {stats.total} {stats.total === 1 ? 'stone' : 'stones'}
          {stats.lastAddedAt ? ` · last added ${formatRelativeTime(stats.lastAddedAt)}` : ''}
        </p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {mission.cadence === 'daily' ? 'Daily rhythm' : 'Weekly rhythm'}
          {mission.preferredTime ? ` · ${formatDisplayTime(mission.preferredTime)}` : ''}
        </p>
      </Link>
      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-xs text-[var(--muted)]">
          <span>
            {`${remaining} to ${stats.nextMilestone}`}
          </span>
          <span>{Math.round(stats.milestoneProgress * 100)}%</span>
        </div>
        <div
          className="h-1.5 overflow-hidden rounded-full bg-[var(--bg-accent)]"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(stats.milestoneProgress * 100)}
        >
          <div
            className="h-full rounded-full bg-[var(--clay)]"
            style={{ width: `${Math.round(stats.milestoneProgress * 100)}%` }}
          />
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <Button variant="secondary" disabled={stats.total === 0} onClick={() => void onRemoveStone()}>
          Remove a stone
        </Button>
        <Button onClick={() => void onAddStone()}>Add a stone</Button>
      </div>
    </article>
  )
}
