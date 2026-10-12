import { describe, expect, test } from 'vitest'

import rankHistoryMock from '@/api/mocks/rankHistory'
import { getRankChart, getRankHistoryLabel } from '@/utils/rankChart'

function measurement(takenAt, tier, rank, leaguePoints) {
  return {
    taken_at: takenAt,
    tier,
    rank,
    league_points: leaguePoints,
    wins: 10,
    losses: 10,
  }
}

function buildHistory() {
  return [
    measurement('2026-01-01T00:00:00Z', 'SILVER', 'II', 50),
    measurement('2026-01-11T00:00:00Z', 'GOLD', 'IV', 50),
  ]
}

describe('getRankChart', () => {
  test('places the first and last points with default options', () => {
    const history = buildHistory()

    const chart = getRankChart(history)

    expect(chart.points[0]).toMatchObject({ x: 10, y: 160, ladderPoints: 1050 })
    expect(chart.points[1]).toMatchObject({ x: 390, y: 40, ladderPoints: 1250 })
  })

  test('builds the path from the rounded coordinates', () => {
    const history = buildHistory()
    const expected = 'M10 160 L390 40'

    const chart = getRankChart(history)

    expect(chart.path).toBe(expected)
  })

  test('computes delta and days between the extreme measurements', () => {
    const history = buildHistory()

    const chart = getRankChart(history)

    expect(chart.delta).toBe(200)
    expect(chart.days).toBe(10)
  })

  test('maps the axis ticks to y coordinates', () => {
    const history = buildHistory()
    const expected = [
      { points: 1000, y: 190, label: 'Silver II' },
      { points: 1100, y: 130, label: 'Silver I' },
      { points: 1200, y: 70, label: 'Gold IV' },
      { points: 1300, y: 10, label: 'Gold III' },
    ]

    const chart = getRankChart(history)

    expect(chart.ticks).toEqual(expected)
  })

  test('returns the first and last valid measurements', () => {
    const history = buildHistory()

    const chart = getRankChart(history)

    expect(chart.first).toEqual(history[0])
    expect(chart.last).toEqual(history[1])
  })

  test('draws higher ladder points above lower ones', () => {
    const history = buildHistory()

    const chart = getRankChart(history)

    expect(chart.points[1].y).toBeLessThan(chart.points[0].y)
  })

  test('places a point at the middle of the time interval in the center', () => {
    const history = [
      measurement('2026-01-01T00:00:00Z', 'SILVER', 'II', 50),
      measurement('2026-01-06T00:00:00Z', 'SILVER', 'I', 10),
      measurement('2026-01-11T00:00:00Z', 'GOLD', 'IV', 50),
    ]

    const chart = getRankChart(history)

    expect(chart.points[1].x).toBe(200)
  })

  test('spaces points by time and not by index', () => {
    const history = [
      measurement('2026-01-01T00:00:00Z', 'SILVER', 'II', 50),
      measurement('2026-01-02T00:00:00Z', 'SILVER', 'II', 60),
      measurement('2026-01-11T00:00:00Z', 'GOLD', 'IV', 50),
    ]

    const chart = getRankChart(history)

    expect(chart.points[1].x).toBe(48)
  })

  test('produces the same chart for an unordered history', () => {
    const ordered = buildHistory()
    const unordered = [ordered[1], ordered[0]]
    const expected = getRankChart(ordered)

    const result = getRankChart(unordered)

    expect(result).toEqual(expected)
  })

  test('discards a measurement with an unknown tier', () => {
    const history = [
      measurement('2026-01-01T00:00:00Z', 'SILVER', 'II', 50),
      measurement('2026-01-05T00:00:00Z', 'UNKNOWN', 'I', 10),
      measurement('2026-01-11T00:00:00Z', 'GOLD', 'IV', 50),
    ]

    const chart = getRankChart(history)

    expect(chart.points).toHaveLength(2)
    expect(chart.path).toBe('M10 160 L390 40')
  })

  test('discards a measurement with an invalid date', () => {
    const history = [...buildHistory(), measurement('not-a-date', 'GOLD', 'I', 10)]

    const chart = getRankChart(history)

    expect(chart.points).toHaveLength(2)
  })

  test('returns null with a single valid measurement', () => {
    const history = [
      measurement('2026-01-01T00:00:00Z', 'SILVER', 'II', 50),
      measurement('2026-01-11T00:00:00Z', 'UNKNOWN', 'IV', 50),
    ]

    const chart = getRankChart(history)

    expect(chart).toBeNull()
  })

  test('returns null when all measurements share the same date', () => {
    const history = [
      measurement('2026-01-01T00:00:00Z', 'SILVER', 'II', 50),
      measurement('2026-01-01T00:00:00Z', 'GOLD', 'IV', 50),
    ]

    const chart = getRankChart(history)

    expect(chart).toBeNull()
  })

  test.each([[[]], [null], [undefined]])('returns null when the history is %j', (history) => {
    const chart = getRankChart(history)

    expect(chart).toBeNull()
  })

  test('uses custom width, height and padding', () => {
    const history = buildHistory()
    const options = {
      width: 200,
      height: 100,
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
    }

    const chart = getRankChart(history, options)

    expect(chart.points[0].x).toBe(0)
    expect(chart.points[1].x).toBe(200)
  })

  test('keeps a flat series finite using the minimum margin of 50', () => {
    const history = [
      measurement('2026-01-01T00:00:00Z', 'SILVER', 'II', 50),
      measurement('2026-01-11T00:00:00Z', 'SILVER', 'II', 50),
    ]

    const chart = getRankChart(history)

    expect(chart.points[0].y).toBe(100)
    expect(chart.points[1].y).toBe(100)
    expect(chart.delta).toBe(0)
    expect(chart.path).not.toContain('NaN')
  })

  test('does not mutate the original history', () => {
    const history = [buildHistory()[1], buildHistory()[0]]
    const snapshot = structuredClone(history)

    getRankChart(history)

    expect(history).toEqual(snapshot)
  })

  test('draws the sample rank history', () => {
    const chart = getRankChart(rankHistoryMock.data)

    expect(chart).not.toBeNull()
    expect(chart.points).toHaveLength(12)
    expect(chart.first.tier).toBe('SILVER')
    expect(chart.last.tier).toBe('GOLD')
    expect(chart.delta).toBeGreaterThan(0)
    chart.points.forEach((point, index) => {
      expect(point.y).toBeGreaterThanOrEqual(0)
      expect(point.y).toBeLessThanOrEqual(200)
      if (index > 0) {
        expect(point.x).toBeGreaterThan(chart.points[index - 1].x)
      }
    })
  })
})

describe('getRankHistoryLabel', () => {
  test('describes a rising history', () => {
    const history = buildHistory()
    const expected =
      'Evolución del rango: de Silver II 50 LP a Gold IV 50 LP en 10 días. Subió 200 LP.'

    const result = getRankHistoryLabel(history)

    expect(result).toBe(expected)
  })

  test('describes a falling history', () => {
    const history = [
      measurement('2026-01-01T00:00:00Z', 'GOLD', 'IV', 50),
      measurement('2026-01-11T00:00:00Z', 'SILVER', 'II', 50),
    ]
    const expected =
      'Evolución del rango: de Gold IV 50 LP a Silver II 50 LP en 10 días. Bajó 200 LP.'

    const result = getRankHistoryLabel(history)

    expect(result).toBe(expected)
  })

  test('uses the singular for a single day', () => {
    const history = [
      measurement('2026-01-01T00:00:00Z', 'SILVER', 'II', 50),
      measurement('2026-01-02T00:00:00Z', 'SILVER', 'II', 60),
    ]
    const expected =
      'Evolución del rango: de Silver II 50 LP a Silver II 60 LP en 1 día. Subió 10 LP.'

    const result = getRankHistoryLabel(history)

    expect(result).toBe(expected)
  })

  test('says there are no changes when delta is zero', () => {
    const history = [
      measurement('2026-01-01T00:00:00Z', 'SILVER', 'II', 50),
      measurement('2026-01-11T00:00:00Z', 'SILVER', 'II', 50),
    ]
    const expected =
      'Evolución del rango: de Silver II 50 LP a Silver II 50 LP en 10 días. Sin cambios.'

    const result = getRankHistoryLabel(history)

    expect(result).toBe(expected)
  })

  test('omits the division for apex tiers', () => {
    const history = [
      measurement('2026-01-01T00:00:00Z', 'MASTER', 'I', 100),
      measurement('2026-01-11T00:00:00Z', 'MASTER', 'I', 150),
    ]
    const expected =
      'Evolución del rango: de Master 100 LP a Master 150 LP en 10 días. Subió 50 LP.'

    const result = getRankHistoryLabel(history)

    expect(result).toBe(expected)
  })

  test('ignores invalid measurements and sorts by date', () => {
    const ordered = buildHistory()
    const history = [
      ordered[1],
      measurement('2026-01-05T00:00:00Z', 'UNKNOWN', 'I', 10),
      ordered[0],
    ]
    const expected =
      'Evolución del rango: de Silver II 50 LP a Gold IV 50 LP en 10 días. Subió 200 LP.'

    const result = getRankHistoryLabel(history)

    expect(result).toBe(expected)
  })

  test.each([[[]], [null], [undefined]])('reports insufficient data for %j', (history) => {
    const expected = 'Evolución del rango: sin datos suficientes'

    const result = getRankHistoryLabel(history)

    expect(result).toBe(expected)
  })

  test('reports insufficient data with a single valid measurement', () => {
    const history = [measurement('2026-01-01T00:00:00Z', 'SILVER', 'II', 50)]
    const expected = 'Evolución del rango: sin datos suficientes'

    const result = getRankHistoryLabel(history)

    expect(result).toBe(expected)
  })
})

describe('getRankChart rounding', () => {
  test('rounds coordinates to 2 decimals and writes them without extra zeros', () => {
    const history = [
      { taken_at: '2026-01-01T00:00:00Z', tier: 'SILVER', rank: 'II', league_points: 50 },
      { taken_at: '2026-01-11T00:00:00Z', tier: 'SILVER', rank: 'II', league_points: 80 },
      { taken_at: '2026-01-31T00:00:00Z', tier: 'GOLD', rank: 'IV', league_points: 50 },
    ]

    const chart = getRankChart(history)

    expect(chart.points[1].x).toBe(136.67)
    expect(chart.points[1].y).toBe(142)
    expect(chart.path).toBe('M10 160 L136.67 142 L390 40')
  })
})
