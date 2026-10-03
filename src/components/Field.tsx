import type { ReactNode } from 'react'

export function Field({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: string
  hint?: string
  htmlFor?: string
  children: ReactNode
}) {
  return (
    <div className="block">
      {htmlFor ? (
        <label htmlFor={htmlFor} className="mb-2 block text-sm font-semibold">
          {label}
        </label>
      ) : (
        <p className="mb-2 text-sm font-semibold">{label}</p>
      )}
      {children}
      {hint ? <p className="mt-1.5 text-xs text-[var(--muted)]">{hint}</p> : null}
    </div>
  )
}

export const fieldControlClass =
  'w-full rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-[var(--ink)] placeholder:text-[var(--muted)]'
