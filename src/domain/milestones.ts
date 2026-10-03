export const EARLY_MILESTONES = [1, 7, 21, 50, 100, 250] as const

function grow(current: number): number {
  const significant = String(current).replace(/0+$/, '')
  if (significant === '1') return current * 2.5
  return current * 2
}

export function milestoneMarks(total: number): number[] {
  const marks: number[] = [...EARLY_MILESTONES]
  while (marks[marks.length - 1] <= total) {
    marks.push(grow(marks[marks.length - 1]))
  }
  return marks
}

export function milestoneProgress(total: number): {
  previous: number
  next: number
  progress: number
} {
  const marks = milestoneMarks(total)
  const next = marks.find((mark) => mark > total) ?? grow(marks[marks.length - 1])
  const previous = [...marks].reverse().find((mark) => mark <= total) ?? 0
  const span = next - previous

  return {
    previous,
    next,
    progress: span === 0 ? 1 : (total - previous) / span,
  }
}

export const MILESTONES = EARLY_MILESTONES
