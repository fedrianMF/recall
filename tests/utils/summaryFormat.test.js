import { describe, expect, test } from 'vitest'

import {
  formatPlatform,
  formatQueueType,
  formatTier,
  getProgressPercent,
  getWinrateLabel,
  isApexTier,
} from '@/utils/summaryFormat'

describe('isApexTier', () => {
  test.each(['MASTER', 'GRANDMASTER', 'CHALLENGER', 'master', 'grandmaster', 'challenger'])(
    'returns true for %s',
    (tier) => {
      const result = isApexTier(tier)

      expect(result).toBe(true)
    },
  )

  test.each(['GOLD', '', null, undefined, 123])('returns false for %s', (tier) => {
    const result = isApexTier(tier)

    expect(result).toBe(false)
  })
})

describe('formatPlatform', () => {
  test.each([
    ['la1', 'LAN'],
    ['la2', 'LAS'],
  ])('formats %s as %s', (platform, expected) => {
    const result = formatPlatform(platform)

    expect(result).toBe(expected)
  })

  test('returns an unknown platform unchanged', () => {
    const platform = 'na1'
    const expected = 'na1'

    const result = formatPlatform(platform)

    expect(result).toBe(expected)
  })

  test.each([null, undefined])('returns a dash when platform is %s', (platform) => {
    const expected = '—'

    const result = formatPlatform(platform)

    expect(result).toBe(expected)
  })
})

describe('formatQueueType', () => {
  test.each([
    ['RANKED_SOLO_5x5', 'Solo/Dúo'],
    ['RANKED_FLEX_SR', 'Flexible'],
  ])('formats %s as %s', (queueType, expected) => {
    const result = formatQueueType(queueType)

    expect(result).toBe(expected)
  })

  test('returns an unknown queue type unchanged', () => {
    const queueType = 'RANKED_TFT'
    const expected = 'RANKED_TFT'

    const result = formatQueueType(queueType)

    expect(result).toBe(expected)
  })

  test.each([null, undefined])('returns a dash when queue type is %s', (queueType) => {
    const expected = '—'

    const result = formatQueueType(queueType)

    expect(result).toBe(expected)
  })
})

describe('formatTier', () => {
  test.each([
    ['GOLD', 'II', 'Gold II'],
    ['IRON', 'IV', 'Iron IV'],
  ])('formats %s %s with title case', (tier, division, expected) => {
    const result = formatTier(tier, division)

    expect(result).toBe(expected)
  })

  test.each([
    ['MASTER', 'Master'],
    ['GRANDMASTER', 'Grandmaster'],
    ['CHALLENGER', 'Challenger'],
  ])('omits the division for %s', (tier, expected) => {
    const division = 'I'

    const result = formatTier(tier, division)

    expect(result).toBe(expected)
  })

  test.each([null, undefined, ''])('returns unranked when tier is missing: %s', (tier) => {
    const division = 'II'
    const expected = 'Sin rango'

    const result = formatTier(tier, division)

    expect(result).toBe(expected)
  })

  test('normalizes a lowercase tier', () => {
    const tier = 'gold'
    const division = 'II'
    const expected = 'Gold II'

    const result = formatTier(tier, division)

    expect(result).toBe(expected)
  })

  test('returns only the normalized tier when the division is missing', () => {
    const tier = 'GOLD'
    const division = undefined
    const expected = 'Gold'

    const result = formatTier(tier, division)

    expect(result).toBe(expected)
  })
})

describe('getProgressPercent', () => {
  test('keeps the decimal precision of the progress percentage', () => {
    const value = 55
    const total = 105
    const expected = 52.381

    const result = getProgressPercent(value, total)

    expect(result).toBeCloseTo(expected, 3)
  })

  test.each([
    [45, 100, 45],
    [0, 10, 0],
    [10, 10, 100],
  ])('returns %s of %s as %s%%', (value, total, expected) => {
    const result = getProgressPercent(value, total)

    expect(result).toBe(expected)
  })

  test.each([0, -10, null, Number.NaN])('returns zero when total is invalid: %s', (total) => {
    const value = 5
    const expected = 0

    const result = getProgressPercent(value, total)

    expect(result).toBe(expected)
  })

  test('clamps progress above the total to 100%', () => {
    const value = 15
    const total = 10
    const expected = 100

    const result = getProgressPercent(value, total)

    expect(result).toBe(expected)
  })

  test.each([-1, null, Number.NaN])('returns zero when value is invalid: %s', (value) => {
    const total = 10
    const expected = 0

    const result = getProgressPercent(value, total)

    expect(result).toBe(expected)
  })
})

describe('getWinrateLabel', () => {
  test('formats the accessible winrate label with plural results', () => {
    const summary = { winrate: 52.4, wins: 55, losses: 50 }
    const expected = 'Winrate 52.4%: 55 victorias y 50 derrotas'

    const result = getWinrateLabel(summary)

    expect(result).toBe(expected)
  })

  test('uses singular victory when wins is one', () => {
    const summary = { winrate: 100, wins: 1, losses: 0 }
    const expected = 'Winrate 100%: 1 victoria y 0 derrotas'

    const result = getWinrateLabel(summary)

    expect(result).toBe(expected)
  })

  test('uses singular defeat when losses is one', () => {
    const summary = { winrate: 0, wins: 0, losses: 1 }
    const expected = 'Winrate 0%: 0 victorias y 1 derrota'

    const result = getWinrateLabel(summary)

    expect(result).toBe(expected)
  })

  test.each([null, undefined])('returns a no-data label when winrate is %s', (winrate) => {
    const summary = { winrate, wins: 0, losses: 0 }
    const expected = 'Winrate sin datos'

    const result = getWinrateLabel(summary)

    expect(result).toBe(expected)
  })
})
