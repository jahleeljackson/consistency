import { useState, type FormEvent } from 'react'
import { parseMissionDraft } from '../../domain/schema.ts'
import type { Mission, MissionDraft, MissionKind } from '../../domain/types.ts'
import { Button } from '../../components/Button.tsx'
import { Field, fieldControlClass } from '../../components/Field.tsx'
import { ColorSwatches } from './ColorSwatches.tsx'

const emptyDraft: MissionDraft = {
  name: '',
  description: '',
  kind: 'cairn',
  cadence: 'daily',
  preferredTime: '',
  color: 'clay',
}

const KIND_COPY: Record<MissionKind, { title: string; hint: string }> = {
  cairn: {
    title: 'Cairn',
    hint: 'Stones only accumulate. Missed days never take stones away.',
  },
  momentum: {
    title: 'Momentum',
    hint: 'Miss a full day or week and a stone is removed. Tracks your current and longest streak.',
  },
}

export function MissionForm({
  mission,
  submitLabel,
  onSubmit,
}: {
  mission?: Mission
  submitLabel: string
  onSubmit: (draft: MissionDraft) => Promise<void>
}) {
  const [draft, setDraft] = useState<MissionDraft>(
    mission
      ? {
          name: mission.name,
          description: mission.description,
          kind: mission.kind ?? 'cairn',
          cadence: mission.cadence,
          preferredTime: mission.preferredTime ?? '',
          color: mission.color,
        }
      : emptyDraft,
  )
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const kind = draft.kind ?? 'cairn'

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    try {
      const parsed = parseMissionDraft(draft)
      setPending(true)
      await onSubmit(parsed)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Please check the form.')
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Field label="Mission name" htmlFor="mission-name">
        <input
          id="mission-name"
          className={fieldControlClass}
          value={draft.name}
          onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
          maxLength={80}
          required
          autoComplete="off"
        />
      </Field>
      <Field label="Purpose" hint="Optional. A sentence about why this matters." htmlFor="mission-purpose">
        <textarea
          id="mission-purpose"
          className={`${fieldControlClass} min-h-28 resize-y`}
          value={draft.description}
          onChange={(event) =>
            setDraft((current) => ({ ...current, description: event.target.value }))
          }
          maxLength={500}
        />
      </Field>
      <Field label="Mission type" hint={KIND_COPY[kind].hint}>
        <div className="grid grid-cols-2 gap-3">
          {(['cairn', 'momentum'] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setDraft((current) => ({ ...current, kind: value }))}
              className={`rounded-2xl border px-4 py-3 text-left ${
                kind === value
                  ? 'border-[var(--ink)] bg-[var(--surface-strong)]'
                  : 'border-[var(--line)] bg-[var(--surface)]'
              }`}
            >
              <span className="block font-semibold">{KIND_COPY[value].title}</span>
              <span className="mt-1 block text-xs text-[var(--muted)]">
                {value === 'cairn' ? 'Keep every stone' : 'Streaks & decay'}
              </span>
            </button>
          ))}
        </div>
      </Field>
      <Field
        label={kind === 'momentum' ? 'Required rhythm' : 'Suggested rhythm'}
        hint={
          kind === 'momentum'
            ? 'If this full period passes with no stone, one stone is removed.'
            : 'A preference only. You can add a stone whenever you like.'
        }
      >
        <div className="grid grid-cols-2 gap-3">
          {(['daily', 'weekly'] as const).map((cadence) => (
            <button
              key={cadence}
              type="button"
              onClick={() => setDraft((current) => ({ ...current, cadence }))}
              className={`rounded-2xl border px-4 py-3 capitalize ${
                draft.cadence === cadence
                  ? 'border-[var(--ink)] bg-[var(--surface-strong)]'
                  : 'border-[var(--line)] bg-[var(--surface)]'
              }`}
            >
              {cadence}
            </button>
          ))}
        </div>
      </Field>
      <Field
        label="Preferred time"
        hint="Shown as a reminder to yourself. No notifications are sent."
        htmlFor="mission-time"
      >
        <input
          id="mission-time"
          type="time"
          className={fieldControlClass}
          value={draft.preferredTime ?? ''}
          onChange={(event) =>
            setDraft((current) => ({ ...current, preferredTime: event.target.value }))
          }
        />
      </Field>
      <Field label="Stone color">
        <ColorSwatches
          value={draft.color}
          onChange={(color) => setDraft((current) => ({ ...current, color }))}
        />
      </Field>
      {error ? <p className="text-sm text-[#9b3d2d]">{error}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? 'Saving…' : submitLabel}
      </Button>
    </form>
  )
}
