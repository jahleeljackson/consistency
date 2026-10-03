import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="space-y-3">
      <h1 className="font-display text-4xl">This path is empty</h1>
      <p className="text-[var(--muted)]">
        <Link to="/">Return to your missions</Link>
      </p>
    </div>
  )
}
