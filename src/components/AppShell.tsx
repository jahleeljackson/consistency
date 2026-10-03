import { NavLink, Outlet } from 'react-router-dom'
import { useCairn } from '../store/CairnProvider.tsx'

const navClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-3 py-2 text-sm font-semibold ${
    isActive ? 'bg-[var(--surface)] text-[var(--ink)]' : 'text-[var(--muted)] hover:text-[var(--ink)]'
  }`

export function AppShell() {
  const { syncStatus } = useCairn()

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 pb-16 pt-6 sm:px-6">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10 focus:rounded-full focus:bg-[var(--surface)] focus:px-4 focus:py-2"
      >
        Skip to content
      </a>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <NavLink to="/" end className="font-display text-2xl text-[var(--ink)] no-underline">
          Cairn
        </NavLink>
        <nav aria-label="Primary" className="flex items-center gap-1">
          <NavLink to="/" className={navClass} end>
            Missions
          </NavLink>
          <NavLink to="/missions/new" className={navClass}>
            New
          </NavLink>
          <NavLink to="/settings" className={navClass}>
            Settings
          </NavLink>
        </nav>
      </header>
      {syncStatus === 'offline' ? (
        <p className="mt-4 rounded-2xl bg-[var(--bg-accent)] px-4 py-2 text-sm text-[var(--muted)]">
          Saved on this device. The shared store will update when the network is back.
        </p>
      ) : null}
      {syncStatus === 'error' ? (
        <p className="mt-4 rounded-2xl bg-[var(--bg-accent)] px-4 py-2 text-sm text-[var(--muted)]">
          Could not sync just now. Your stones are still saved locally.
        </p>
      ) : null}
      <main id="main" className="mt-8 flex-1">
        <Outlet />
      </main>
    </div>
  )
}
