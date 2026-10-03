import { getSwatch } from '../../domain/colors.ts'
import type { ColorId, Completion } from '../../domain/types.ts'

export const CELL_X = 18
export const CELL_Y = 13.5
export const SLOPE = 0.78
export const INDIVIDUAL_LIMIT = 500
export const SURFACE_STONES = 220

export interface LaidStone {
  id: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  fill: string
  highlight: string
  newest: boolean
}

export interface ViewBox {
  x: number
  y: number
  width: number
  height: number
}

export interface CairnLayout {
  stones: LaidStone[]
  massPath: string | null
  massFill: string
  viewBox: ViewBox
  ground: { x: number; width: number }
  dropFrom: number
}

interface Placed {
  id: string
  column: number
  row: number
  x: number
  y: number
  width: number
  height: number
  rotation: number
  fill: string
  highlight: string
}

function hashString(value: string): number {
  let hash = 2166136261
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function nextColumn(heights: Map<number, number>): number {
  const columns = [...heights.keys()]
  const minC = columns.length === 0 ? 0 : Math.min(...columns) - 1
  const maxC = columns.length === 0 ? 0 : Math.max(...columns) + 1
  let best = 0
  let bestScore = Number.POSITIVE_INFINITY

  for (let column = minC; column <= maxC; column += 1) {
    const height = heights.get(column) ?? 0
    const score = height + SLOPE * Math.abs(column)
    const closer = Math.abs(column) < Math.abs(best)
    if (score < bestScore || (score === bestScore && closer)) {
      best = column
      bestScore = score
    }
  }

  return best
}

export function placeAll(completions: Completion[], color: ColorId): Placed[] {
  const swatch = getSwatch(color)
  const heights = new Map<number, number>()

  return completions.map((completion) => {
    const column = nextColumn(heights)
    const row = heights.get(column) ?? 0
    heights.set(column, row + 1)

    const hash = hashString(completion.id)
    const width = 15 + (hash % 6)
    const height = 11 + ((hash >> 4) % 5)
    const x = column * CELL_X + (row % 2 === 1 ? CELL_X * 0.5 : 0) + ((hash >> 8) % 3) - 1
    const y = -(row * CELL_Y + height / 2)

    return {
      id: completion.id,
      column,
      row,
      x,
      y,
      width,
      height,
      rotation: ((hash >> 16) % 13) - 6,
      fill: hash % 3 === 0 ? swatch.deep : swatch.hex,
      highlight: `${swatch.hex}cc`,
    }
  })
}

function buildMassPath(placed: Placed[]): string | null {
  if (placed.length === 0) return null

  const tops = new Map<number, number>()
  for (const stone of placed) {
    const current = tops.get(stone.column)
    if (current == null || stone.y - stone.height / 2 < current) {
      tops.set(stone.column, stone.y - stone.height / 2)
    }
  }

  const columns = [...tops.keys()].sort((a, b) => a - b)
  if (columns.length === 0) return null

  const left = columns[0] * CELL_X - CELL_X
  const right = columns[columns.length - 1] * CELL_X + CELL_X * 1.5
  const points = columns.map((column) => {
    const x = column * CELL_X + CELL_X * 0.25
    return `${x},${tops.get(column)}`
  })

  return `M ${left},6 L ${points.join(' L ')} L ${right},6 Z`
}

function viewBoxFor(placed: Placed[]): ViewBox {
  const minWidth = 200
  const minHeight = 168
  const padX = 28
  const padTop = 36
  const padBottom = 18

  if (placed.length === 0) {
    return { x: -minWidth / 2, y: -minHeight + padBottom, width: minWidth, height: minHeight }
  }

  let minX = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY

  for (const stone of placed) {
    minX = Math.min(minX, stone.x - stone.width / 2)
    maxX = Math.max(maxX, stone.x + stone.width / 2)
    minY = Math.min(minY, stone.y - stone.height / 2)
  }

  const contentWidth = maxX - minX + padX * 2
  const contentHeight = padBottom - minY + padTop
  const width = Math.max(minWidth, contentWidth)
  const height = Math.max(minHeight, contentHeight)
  const midX = (minX + maxX) / 2

  return {
    x: midX - width / 2,
    y: padBottom - height,
    width,
    height,
  }
}

export function layoutCairn(completions: Completion[], color: ColorId): CairnLayout {
  const placed = placeAll(completions, color)
  const newestId = placed.at(-1)?.id
  const drawAll = placed.length <= INDIVIDUAL_LIMIT
  const visible = drawAll ? placed : placed.slice(-SURFACE_STONES)
  const massSource = drawAll ? [] : placed.slice(0, Math.max(0, placed.length - SURFACE_STONES))
  const swatch = getSwatch(color)
  const box = viewBoxFor(placed)
  const xs = placed.map((stone) => stone.x)
  const groundWidth = placed.length === 0 ? 88 : Math.max(88, Math.max(...xs) - Math.min(...xs) + 48)

  return {
    stones: visible.map((stone) => ({
      id: stone.id,
      x: stone.x,
      y: stone.y,
      width: stone.width,
      height: stone.height,
      rotation: stone.rotation,
      fill: stone.fill,
      highlight: stone.highlight,
      newest: stone.id === newestId,
    })),
    massPath: massSource.length > 0 ? buildMassPath(massSource) : null,
    massFill: swatch.deep,
    viewBox: box,
    ground: { x: -groundWidth / 2, width: groundWidth },
    dropFrom: box.y + 12,
  }
}

export function layoutStones(
  completions: Completion[],
  color: ColorId,
  _size: 'mini' | 'large' = 'large',
): LaidStone[] {
  return layoutCairn(completions, color).stones
}
