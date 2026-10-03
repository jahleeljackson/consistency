import { milestoneMarks } from '../../domain/milestones.ts'

export function MilestoneTimeline({ total }: { total: number }) {
  const marks = milestoneMarks(total)

  return (
    <section>
      <h3 className="font-display text-2xl">Milestones</h3>
      <ol className="mt-4 space-y-3">
        {marks.map((mark) => {
          const reached = total >= mark
          return (
            <li
              key={mark}
              className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${
                reached
                  ? 'border-[var(--clay)]/40 bg-[var(--surface-strong)]'
                  : 'border-[var(--line)] bg-[var(--surface)]'
              }`}
            >
              <span className="font-semibold">
                {mark} {mark === 1 ? 'stone' : 'stones'}
              </span>
              <span className="text-sm text-[var(--muted)]">
                {reached ? 'Reached' : `${mark - total} to go`}
              </span>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
