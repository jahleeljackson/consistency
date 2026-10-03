import { describe, expect, it } from 'vitest'
import { milestoneMarks, milestoneProgress } from './milestones.ts'

describe('milestoneProgress', () => {
  it('points at the first stone', () => {
    expect(milestoneProgress(0)).toMatchObject({ next: 1, previous: 0, progress: 0 })
  })

  it('moves toward 7 after the first stone', () => {
    expect(milestoneProgress(1)).toMatchObject({ next: 7, previous: 1 })
  })

  it('opens a larger target after 250', () => {
    expect(milestoneProgress(250)).toMatchObject({ next: 500, previous: 250 })
    expect(milestoneProgress(250).progress).toBe(0)
  })

  it('keeps raising the target as the pile grows', () => {
    expect(milestoneProgress(500)).toMatchObject({ next: 1000, previous: 500 })
    expect(milestoneProgress(1000)).toMatchObject({ next: 2500, previous: 1000 })
    expect(milestoneProgress(2500)).toMatchObject({ next: 5000, previous: 2500 })
    expect(milestoneProgress(10_000)).toMatchObject({ next: 25_000, previous: 10_000 })
  })
})

describe('milestoneMarks', () => {
  it('includes the next unreached mark', () => {
    expect(milestoneMarks(80)).toEqual([1, 7, 21, 50, 100, 250])
    expect(milestoneMarks(250)).toContain(500)
    expect(milestoneMarks(1200)).toEqual([1, 7, 21, 50, 100, 250, 500, 1000, 2500])
  })
})
