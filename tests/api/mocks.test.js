import { describe, expect, test, vi } from 'vitest'

describe('API mock data quality', () => {
  test('provides at least four unique positions including null participation', async () => {
    const { default: positionsMock } = await vi.importActual('@/api/mocks/positions')

    const positions = positionsMock.data.map(({ position }) => position)

    expect(positionsMock.data.length).toBeGreaterThanOrEqual(4)
    expect(new Set(positions).size).toBe(positionsMock.data.length)
    expect(positionsMock.data.some(({ kill_participation }) => kill_participation === null)).toBe(
      true,
    )
  })

  test('keeps position wins and winrates coherent with games played', async () => {
    const { default: positionsMock } = await vi.importActual('@/api/mocks/positions')

    const positionStats = positionsMock.data.map(({ games, wins, winrate }) => ({
      games,
      wins,
      winrate,
      expectedWinrate: (wins / games) * 100,
    }))

    for (const stats of positionStats) {
      expect(stats.wins).toBeLessThanOrEqual(stats.games)
      expect(Math.abs(stats.winrate - stats.expectedWinrate)).toBeLessThanOrEqual(0.1)
    }
  })

  test('provides at least eight valid rank measurements in chronological order', async () => {
    const { default: rankHistoryMock } = await vi.importActual('@/api/mocks/rankHistory')

    const timestamps = rankHistoryMock.data.map(({ taken_at }) => Date.parse(taken_at))

    expect(timestamps.length).toBeGreaterThanOrEqual(8)
    for (const timestamp of timestamps) {
      expect(Number.isNaN(timestamp)).toBe(false)
    }
    for (let index = 1; index < timestamps.length; index += 1) {
      expect(timestamps[index]).toBeGreaterThan(timestamps[index - 1])
    }
  })

  test('includes a consecutive league change', async () => {
    const { default: rankHistoryMock } = await vi.importActual('@/api/mocks/rankHistory')

    const hasLeagueChange = rankHistoryMock.data.some(
      ({ tier }, index, measurements) => index > 0 && tier !== measurements[index - 1].tier,
    )

    expect(hasLeagueChange).toBe(true)
  })

  test('includes a league points drop within the same league', async () => {
    const { default: rankHistoryMock } = await vi.importActual('@/api/mocks/rankHistory')

    const hasPointsDrop = rankHistoryMock.data.some(
      ({ tier, league_points: leaguePoints }, index, measurements) =>
        index > 0 &&
        tier === measurements[index - 1].tier &&
        leaguePoints < measurements[index - 1].league_points,
    )

    expect(hasPointsDrop).toBe(true)
  })

  test('keeps every rank measurement between zero and one hundred league points', async () => {
    const { default: rankHistoryMock } = await vi.importActual('@/api/mocks/rankHistory')

    const leaguePoints = rankHistoryMock.data.map(({ league_points }) => league_points)

    for (const points of leaguePoints) {
      expect(points).toBeGreaterThanOrEqual(0)
      expect(points).toBeLessThanOrEqual(100)
    }
  })
})
