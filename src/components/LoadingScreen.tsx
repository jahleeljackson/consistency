export function LoadingScreen({ label = 'Gathering your stones…' }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-[var(--muted)]">
      <div
        aria-hidden="true"
        className="h-10 w-10 rounded-full border-2 border-[var(--line)] border-t-[var(--clay)]"
        style={{ animation: 'stone-settle 800ms ease-in-out infinite alternate' }}
      />
      <p>{label}</p>
    </div>
  )
}
