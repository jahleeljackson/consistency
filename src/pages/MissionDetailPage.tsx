import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '../components/Button.tsx'
import { ConfirmDialog } from '../components/ConfirmDialog.tsx'
import { formatDisplayDate, formatDisplayTime, formatRelativeTime, getBrowserTimeZone } from '../domain/dates.ts'
import { completionsForMission, getMissionStats } from '../domain/stats.ts'
import { CairnView } from '../features/cairn/CairnView.tsx'
import { CompletionCalendar } from '../features/history/CompletionCalendar.tsx'
import { MilestoneTimeline } from '../features/history/MilestoneTimeline.tsx'
import { useCairn } from '../store/CairnProvider.tsx'

export function MissionDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state, addStone, removeStone, setMissionStatus, removeMission } = useCairn()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const mission = state.missions.find((item) => item.id === id)
  const timeZone = getBrowserTimeZone()

  if (!mission) {
    return (
      <p>
        This mission is no longer here.{' '}
        <Link to="/" className="font-semibold">
          Back to missions
        </Link>
      </p>
    )
  }

  const stones = completionsForMission(state.completions, mission.id)
  const stats = getMissionStats(mission, state.completions)

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--muted)]">
            <Link to="/">All missions</Link>
          </p>
          <h1 className="font-display mt-2 text-4xl sm:text-5xl">{mission.name}</h1>
          {mission.description ? (
            <p className="mt-3 max-w-2xl text-[var(--muted)]">{mission.description}</p>
          ) : null}
          <p className="mt-2 text-sm text-[var(--muted)]">
            {mission.cadence === 'daily' ? 'Daily rhythm' : 'Weekly rhythm'}
            {mission.preferredTime ? ` · ${formatDisplayTime(mission.preferredTime)}` : ''}
            {mission.status !== 'active' ? ` · ${mission.status}` : ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            disabled={stats.total === 0}
            onClick={() => void removeStone(mission.id)}
          >
            Remove a stone
          </Button>
          <Button onClick={() => void addStone(mission.id)}>Add a stone</Button>
        </div>
      </div>

      <div className="rounded-[2.5rem] border border-[var(--line)] bg-[var(--surface)] px-3 py-5 sm:px-6 sm:py-6">
        <CairnView
          completions={stones}
          color={mission.color}
          reducedMotion={state.settings.reducedMotion}
        />
      </div>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total stones" value={String(stats.total)} />
        <Stat label="Started" value={formatDisplayDate(stats.createdAt, timeZone)} />
        <Stat
          label="Last added"
          value={stats.lastAddedAt ? formatRelativeTime(stats.lastAddedAt) : 'Not yet'}
        />
        <Stat label="Longest run" value={`${stats.longestConsecutiveDays} day${stats.longestConsecutiveDays === 1 ? '' : 's'}`} />
        <Stat label="This week" value={String(stats.stonesThisWeek)} />
        <Stat label="This month" value={String(stats.stonesThisMonth)} />
      </dl>

      <CompletionCalendar completions={stones} timeZone={timeZone} />
      <MilestoneTimeline total={stats.total} />

      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" onClick={() => navigate(`/missions/${mission.id}/edit`)}>
          Edit
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            void setMissionStatus(mission.id, mission.status === 'paused' ? 'active' : 'paused')
          }
        >
          {mission.status === 'paused' ? 'Resume' : 'Pause'}
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            void setMissionStatus(
              mission.id,
              mission.status === 'archived' ? 'active' : 'archived',
            )
          }
        >
          {mission.status === 'archived' ? 'Restore' : 'Archive'}
        </Button>
        <Button variant="danger" onClick={() => setConfirmDelete(true)}>
          Delete
        </Button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this mission?"
        description="The cairn and its stones will be removed from this site. This cannot be undone."
        confirmLabel="Delete mission"
        danger
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          setConfirmDelete(false)
          void removeMission(mission.id).then(() => navigate('/'))
        }}
      />
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] px-4 py-4">
      <dt className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">{label}</dt>
      <dd className="font-display mt-1 text-2xl">{value}</dd>
    </div>
  )
}
