import { Link } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState.tsx'
import { LoadingScreen } from '../components/LoadingScreen.tsx'
import { MissionCard } from '../features/missions/MissionCard.tsx'
import { useCairn } from '../store/CairnProvider.tsx'

export function DashboardPage() {
  const { state, loadStatus, addStone, removeStone } = useCairn()

  if (loadStatus === 'loading') return <LoadingScreen />

  const active = state.missions.filter((mission) => mission.status === 'active')
  const paused = state.missions.filter((mission) => mission.status === 'paused')

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">Cairn</p>
        <h1 className="font-display mt-2 max-w-xl text-4xl leading-tight sm:text-5xl">
          Small stones. A lasting cairn.
        </h1>
        <p className="mt-3 max-w-lg text-[var(--muted)]">
          Every completion stays. Gaps do not take stones away.
        </p>
      </section>

      {active.length === 0 ? (
        <EmptyState
          title="Begin with one mission"
          action={
            <Link
              to="/missions/new"
              className="inline-flex items-center justify-center rounded-full bg-[var(--clay)] px-5 py-2.5 text-sm font-semibold text-[var(--surface-strong)] no-underline"
            >
              Create a mission
            </Link>
          }
        >
          Name something you want to return to. Each time you show up, a stone is added and kept.
        </EmptyState>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {active.map((mission) => (
            <MissionCard
              key={mission.id}
              mission={mission}
              completions={state.completions}
              reducedMotion={state.settings.reducedMotion}
              onAddStone={() => addStone(mission.id)}
              onRemoveStone={() => removeStone(mission.id)}
            />
          ))}
        </div>
      )}

      {active.length > 0 ? (
        <div>
          <Link to="/missions/new" className="text-sm font-semibold text-[var(--clay-deep)]">
            Start another mission
          </Link>
        </div>
      ) : null}

      {paused.length > 0 ? (
        <section className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5">
          <h2 className="font-display text-2xl">Set aside for now</h2>
          <ul className="mt-3 space-y-2">
            {paused.map((mission) => (
              <li key={mission.id}>
                <Link to={`/missions/${mission.id}`} className="text-[var(--ink)]">
                  {mission.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
