import { describe, expect, test } from 'vitest'

import { getWinrateRing } from '@/utils/winrateRing'

describe('getWinrateRing', () => {
  test('uses the default radius and gap to calculate a 52.4% winrate ring', () => {
    const winrate = 52.4
    const expectedCircumference = 628.3185307179587
    const expectedWinLength = 326.2389
    const expectedWinOffset = 1.5
    const expectedLossLength = 296.0796
    const expectedLossOffset = 330.7389

    const result = getWinrateRing(winrate)

    expect(result.circumference).toBeCloseTo(expectedCircumference, 3)
    expect(result.win.length).toBeCloseTo(expectedWinLength, 3)
    expect(result.win.offset).toBeCloseTo(expectedWinOffset, 3)
    expect(result.loss.length).toBeCloseTo(expectedLossLength, 3)
    expect(result.loss.offset).toBeCloseTo(expectedLossOffset, 3)
  })

  test.each([
    {
      winrate: 50,
      expectedWinLength: 311.1593,
      expectedLossLength: 311.1593,
      expectedLossOffset: 315.6593,
    },
    {
      winrate: 75,
      expectedWinLength: 468.2389,
      expectedLossLength: 154.0796,
      expectedLossOffset: 472.7389,
    },
  ])('calculates the expected arcs for a $winrate% winrate', (testCase) => {
    const { winrate, expectedWinLength, expectedLossLength, expectedLossOffset } = testCase
    const expectedWinOffset = 1.5

    const result = getWinrateRing(winrate)

    expect(result.win.length).toBeCloseTo(expectedWinLength, 3)
    expect(result.win.offset).toBeCloseTo(expectedWinOffset, 3)
    expect(result.loss.length).toBeCloseTo(expectedLossLength, 3)
    expect(result.loss.offset).toBeCloseTo(expectedLossOffset, 3)
  })

  test.each([25, 50, 75])(
    'keeps both arcs and both gaps equal to the circumference at %s%%',
    (winrate) => {
      const gap = 3
      const options = { gap }

      const result = getWinrateRing(winrate, options)
      const combinedLength = result.win.length + result.loss.length + 2 * gap

      expect(combinedLength).toBeCloseTo(result.circumference, 3)
    },
  )

  test('respects a custom gap between arcs', () => {
    const winrate = 50
    const options = { gap: 5 }
    const expectedArcLength = 309.1593
    const expectedWinOffset = 2.5
    const expectedLossOffset = 316.6593

    const result = getWinrateRing(winrate, options)

    expect(result.win.length).toBeCloseTo(expectedArcLength, 3)
    expect(result.win.offset).toBeCloseTo(expectedWinOffset, 3)
    expect(result.loss.length).toBeCloseTo(expectedArcLength, 3)
    expect(result.loss.offset).toBeCloseTo(expectedLossOffset, 3)
  })

  test('returns only a full loss arc at 0% winrate', () => {
    const winrate = 0
    const expectedLength = 0
    const expectedOffset = 0

    const result = getWinrateRing(winrate)

    expect(result.win.length).toBe(expectedLength)
    expect(result.win.offset).toBe(expectedOffset)
    expect(result.loss.length).toBeCloseTo(result.circumference, 3)
    expect(result.loss.offset).toBe(expectedOffset)
  })

  test('returns only a full win arc at 100% winrate', () => {
    const winrate = 100
    const expectedLength = 0
    const expectedOffset = 0

    const result = getWinrateRing(winrate)

    expect(result.win.length).toBeCloseTo(result.circumference, 3)
    expect(result.win.offset).toBe(expectedOffset)
    expect(result.loss.length).toBe(expectedLength)
  })

  test('clamps a winrate below 0% to 0%', () => {
    const winrate = -5
    const expectedLength = 0
    const expectedOffset = 0

    const result = getWinrateRing(winrate)

    expect(result.win.length).toBe(expectedLength)
    expect(result.win.offset).toBe(expectedOffset)
    expect(result.loss.length).toBeCloseTo(result.circumference, 3)
    expect(result.loss.offset).toBe(expectedOffset)
  })

  test('clamps a winrate above 100% to 100%', () => {
    const winrate = 120
    const expectedLength = 0
    const expectedOffset = 0

    const result = getWinrateRing(winrate)

    expect(result.win.length).toBeCloseTo(result.circumference, 3)
    expect(result.win.offset).toBe(expectedOffset)
    expect(result.loss.length).toBe(expectedLength)
  })

  test('never returns a negative length for an arc smaller than the gap', () => {
    const winrate = 0.1
    const options = { radius: 100, gap: 3 }
    const expectedWinLength = 0

    const result = getWinrateRing(winrate, options)

    expect(result.win.length).toBe(expectedWinLength)
  })

  test('never returns a negative loss length when its arc is smaller than the gap', () => {
    const winrate = 99.9
    const options = { radius: 100, gap: 3 }
    const expectedLossLength = 0

    const result = getWinrateRing(winrate, options)

    expect(result.loss.length).toBe(expectedLossLength)
  })

  test.each([null, undefined, Number.NaN, '52.4'])(
    'returns null when winrate is invalid: %s',
    (winrate) => {
      const expected = null

      const result = getWinrateRing(winrate)

      expect(result).toBe(expected)
    },
  )

  test('respects a custom radius', () => {
    const winrate = 50
    const options = { radius: 50 }
    const expectedCircumference = 314.159

    const result = getWinrateRing(winrate, options)

    expect(result.circumference).toBeCloseTo(expectedCircumference, 3)
  })
})
