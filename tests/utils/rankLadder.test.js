import { describe, expect, test } from 'vitest'

import { getLadderPoints, getLadderTicks } from '@/utils/rankLadder'

describe('getLadderPoints', () => {
  test.each([
    ['SILVER', 'I', 42, 1142],
    ['GOLD', 'IV', 0, 1200],
    ['GOLD', 'III', 42, 1342],
    ['IRON', 'IV', 0, 0],
    ['DIAMOND', 'I', 100, 2800],
  ])('converts %s %s with %i LP to %i', (tier, division, leaguePoints, expected) => {
    const result = getLadderPoints(tier, division, leaguePoints)

    expect(result).toBe(expected)
  })

  test.each([
    ['MASTER', 'I', 150, 2950],
    ['CHALLENGER', 'I', 600, 3400],
  ])('ignores the division in apex tier %s', (tier, division, leaguePoints, expected) => {
    const result = getLadderPoints(tier, division, leaguePoints)

    expect(result).toBe(expected)
  })

  test('ignores letter case', () => {
    const expected = 1210

    const result = getLadderPoints('gold', 'iv', 10)

    expect(result).toBe(expected)
  })

  test.each([['UNKNOWN'], [null], [undefined]])('returns null for tier %s', (tier) => {
    const result = getLadderPoints(tier, 'I', 10)

    expect(result).toBeNull()
  })

  test.each([['V'], [null], [undefined]])(
    'returns null for division %s in a non apex tier',
    (division) => {
      const result = getLadderPoints('GOLD', division, 10)

      expect(result).toBeNull()
    },
  )

  test('accepts a missing division in an apex tier', () => {
    const expected = 2900

    const result = getLadderPoints('MASTER', null, 100)

    expect(result).toBe(expected)
  })

  test.each([['42'], [NaN], [null], [Infinity]])('returns null when LP is %s', (leaguePoints) => {
    const result = getLadderPoints('GOLD', 'IV', leaguePoints)

    expect(result).toBeNull()
  })
})

describe('getLadderTicks', () => {
  test('returns a tick at every multiple of 100 with its boundary label', () => {
    const expected = [
      { points: 1000, label: 'Silver II' },
      { points: 1100, label: 'Silver I' },
      { points: 1200, label: 'Gold IV' },
      { points: 1300, label: 'Gold III' },
    ]

    const result = getLadderTicks(1000, 1300)

    expect(result).toEqual(expected)
  })

  test('only includes multiples of 100 inside the range', () => {
    const expected = [{ points: 1100, label: 'Silver I' }]

    const result = getLadderTicks(1010, 1190)

    expect(result).toEqual(expected)
  })

  test('returns an empty array when no multiple of 100 fits', () => {
    const result = getLadderTicks(1010, 1090)

    expect(result).toEqual([])
  })

  test('labels the apex boundary as Master and higher ones with LP', () => {
    const expected = [
      { points: 2800, label: 'Master' },
      { points: 2900, label: 'Master 100 LP' },
      { points: 3000, label: 'Master 200 LP' },
    ]

    const result = getLadderTicks(2800, 3000)

    expect(result).toEqual(expected)
  })

  test('uses a larger step when there are more ticks than maxTicks', () => {
    const maxTicks = 5

    const result = getLadderTicks(0, 1000, maxTicks)

    expect(result.length).toBeGreaterThan(0)
    expect(result.length).toBeLessThanOrEqual(maxTicks)
    result.forEach((tick) => {
      expect(tick.points % 100).toBe(0)
      expect(tick.points).toBeGreaterThanOrEqual(0)
      expect(tick.points).toBeLessThanOrEqual(1000)
    })
  })

  test('respects a custom maxTicks', () => {
    const maxTicks = 2

    const result = getLadderTicks(0, 1000, maxTicks)

    expect(result.length).toBeLessThanOrEqual(maxTicks)
  })

  test('returns ticks sorted from lowest to highest', () => {
    const result = getLadderTicks(1000, 1300).map((tick) => tick.points)

    expect(result).toEqual([1000, 1100, 1200, 1300])
  })
})

describe('getLadderTicks edge cases', () => {
  test('allows at most 5 ticks by default', () => {
    const ticks = getLadderTicks(0, 1000)

    expect(ticks.length).toBeLessThanOrEqual(5)
    expect(ticks.length).toBeGreaterThan(0)
  })

  test.each([
    [Infinity, 1000],
    [0, Infinity],
    [NaN, 1000],
    [0, NaN],
  ])('returns an empty array for the non finite range %s to %s', (min, max) => {
    const result = getLadderTicks(min, max)

    expect(result).toEqual([])
  })

  test('never returns ticks below the bottom of the ladder', () => {
    const expected = [
      { points: 0, label: 'Iron IV' },
      { points: 100, label: 'Iron III' },
    ]

    const result = getLadderTicks(-50, 150)

    expect(result).toEqual(expected)
  })
})

describe('getLadderPoints league bases', () => {
  test.each([
    ['IRON', 0],
    ['BRONZE', 400],
    ['SILVER', 800],
    ['GOLD', 1200],
    ['PLATINUM', 1600],
    ['EMERALD', 2000],
    ['DIAMOND', 2400],
  ])('starts %s IV with 0 LP at %i points', (tier, expected) => {
    const result = getLadderPoints(tier, 'IV', 0)

    expect(result).toBe(expected)
  })

  test.each([
    ['IV', 0],
    ['III', 100],
    ['II', 200],
    ['I', 300],
  ])('adds the offset of division %s to the league base', (division, offset) => {
    const result = getLadderPoints('EMERALD', division, 0)

    expect(result).toBe(2000 + offset)
  })
})

describe('getLadderTicks step growth', () => {
  test('doubles the step until at most 5 ticks fit', () => {
    const expected = [
      { points: 0, label: 'Iron IV' },
      { points: 400, label: 'Bronze IV' },
      { points: 800, label: 'Silver IV' },
    ]

    const result = getLadderTicks(0, 1000)

    expect(result).toEqual(expected)
  })
})
