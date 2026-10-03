import type { ReactNode } from 'react'

export function EmptyState({
  title,
  children,
  action,
}: {
  title: string
  children: ReactNode
  action?: ReactNode
}) {
  return (
    <section className="rounded-[2rem] border border-dashed border-[var(--line)] bg-[var(--surface)] px-6 py-14 text-center">
      <h2 className="font-display text-3xl">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-[var(--muted)]">{children}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </section>
  )
}
