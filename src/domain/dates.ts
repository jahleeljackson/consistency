export function getBrowserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

export function zonedDateKey(isoOrDate: string | Date, timeZone: string): string {
  const date = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

function zonedParts(date: Date, timeZone: string): { year: number; month: number; day: number; weekday: string } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  }).formatToParts(date)

  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? ''

  return {
    year: Number(value('year')),
    month: Number(value('month')),
    day: Number(value('day')),
    weekday: value('weekday'),
  }
}

function keyFromParts(year: number, month: number, day: number): string {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function utcDays(key: string): number {
  const [year, month, day] = key.split('-').map(Number)
  return Date.UTC(year, month - 1, day) / 86_400_000
}

export function addDaysToKey(key: string, days: number): string {
  const [year, month, day] = key.split('-').map(Number)
  const next = new Date(Date.UTC(year, month - 1, day + days))
  return keyFromParts(next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate())
}

export function startOfWeekKey(now: Date, timeZone: string): string {
  const today = zonedDateKey(now, timeZone)
  const weekday = zonedParts(now, timeZone).weekday
  const offset: Record<string, number> = {
    Mon: 0,
    Tue: 1,
    Wed: 2,
    Thu: 3,
    Fri: 4,
    Sat: 5,
    Sun: 6,
  }
  return addDaysToKey(today, -(offset[weekday] ?? 0))
}

export function startOfMonthKey(now: Date, timeZone: string): string {
  const { year, month } = zonedParts(now, timeZone)
  return keyFromParts(year, month, 1)
}

export function daysBetweenKeys(a: string, b: string): number {
  return utcDays(b) - utcDays(a)
}

export function formatDisplayDate(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat(undefined, {
    timeZone,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(iso))
}

export function formatDisplayTime(hhmm: string): string {
  const [hours, minutes] = hhmm.split(':').map(Number)
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export function formatRelativeTime(iso: string, now = new Date()): string {
  const diffMs = now.getTime() - new Date(iso).getTime()
  const minute = 60_000
  const hour = 60 * minute
  const day = 24 * hour

  if (diffMs < minute) return 'just now'
  if (diffMs < hour) {
    const minutes = Math.floor(diffMs / minute)
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  }
  if (diffMs < day) {
    const hours = Math.floor(diffMs / hour)
    return `${hours} hour${hours === 1 ? '' : 's'} ago`
  }
  if (diffMs < 7 * day) {
    const days = Math.floor(diffMs / day)
    return `${days} day${days === 1 ? '' : 's'} ago`
  }

  return formatDisplayDate(iso, getBrowserTimeZone())
}

export function monthGrid(year: number, monthIndex: number, _timeZone?: string): string[][] {
  const first = new Date(Date.UTC(year, monthIndex, 1, 12))
  const firstKey = zonedDateKey(first, 'UTC')
  const start = startOfWeekKey(first, 'UTC')
  const weeks: string[][] = []
  let cursor = start

  while (weeks.length < 6) {
    const week: string[] = []
    for (let i = 0; i < 7; i += 1) {
      week.push(cursor)
      cursor = addDaysToKey(cursor, 1)
    }
    weeks.push(week)
    const last = week[6]
    const lastMonth = Number(last.slice(5, 7)) - 1
    if (lastMonth !== monthIndex && last > firstKey && weeks.length >= 4) {
      break
    }
  }

  return weeks
}
