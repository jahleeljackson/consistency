import { describe, expect, it } from 'vitest'
import { addCompletion } from '../../domain/completions.ts'
import { INDIVIDUAL_LIMIT, layoutCairn, layoutStones, placeAll } from './layout.ts'

function manyStones(count: number) {
  return Array.from({ length: count }, (_, index) =>
    addCompletion('mission-1', new Date(Date.UTC(2026, 0, 1, index))),
  )
}

describe('cairn mountain layout', () => {
  it('places a stable stone for the same completion id', () => {
    const completion = addCompletion('mission-1', new Date('2026-01-01T00:00:00.000Z'))
    expect(layoutStones([completion], 'clay')).toEqual(layoutStones([completion], 'clay'))
  })

  it('keeps earlier stones in place when a new one is added', () => {
    const first = addCompletion('mission-1', new Date('2026-01-01T00:00:00.000Z'))
    const second = addCompletion('mission-1', new Date('2026-01-01T01:00:00.000Z'))
    const before = placeAll([first], 'moss')[0]
    const after = placeAll([first, second], 'moss')[0]
    expect(after.x).toBe(before.x)
    expect(after.y).toBe(before.y)
  })

  it('never drops stones from the pile as the count grows', () => {
    const completions = manyStones(80)
    const placed = placeAll(completions, 'moss')
    expect(placed).toHaveLength(80)
    expect(placed.some((stone) => stone.id === completions[0].id)).toBe(true)
    expect(placed.some((stone) => stone.id === completions[79].id)).toBe(true)
  })

  it('keeps every stone inside a viewBox that grows with the mountain', () => {
    const small = layoutCairn(manyStones(8), 'clay')
    const large = layoutCairn(manyStones(80), 'clay')
    const placed = placeAll(manyStones(80), 'clay')

    for (const stone of placed) {
      expect(stone.x - stone.width / 2).toBeGreaterThanOrEqual(large.viewBox.x)
      expect(stone.x + stone.width / 2).toBeLessThanOrEqual(large.viewBox.x + large.viewBox.width)
      expect(stone.y - stone.height / 2).toBeGreaterThanOrEqual(large.viewBox.y)
    }

    expect(large.viewBox.width * large.viewBox.height).toBeGreaterThan(
      small.viewBox.width * small.viewBox.height,
    )
  })

  it('builds a wider base than peak', () => {
    const placed = placeAll(manyStones(36), 'sand')
    const maxRow = Math.max(...placed.map((stone) => stone.row))
    const baseWidth = new Set(placed.filter((stone) => stone.row === 0).map((stone) => stone.column)).size
    const peakWidth = new Set(placed.filter((stone) => stone.row === maxRow).map((stone) => stone.column)).size
    expect(baseWidth).toBeGreaterThan(peakWidth)
  })

  it('uses a mountain mass instead of clipping when the pile is huge', () => {
    const laid = layoutCairn(manyStones(INDIVIDUAL_LIMIT + 40), 'slate')
    expect(laid.massPath).toBeTruthy()
    expect(laid.stones.length).toBeLessThan(INDIVIDUAL_LIMIT + 40)
    expect(placeAll(manyStones(INDIVIDUAL_LIMIT + 40), 'slate')).toHaveLength(INDIVIDUAL_LIMIT + 40)
  })
})
