import { describe, expect, test } from 'vitest'

import { formatPosition, getPositionLabel, sortPositionsByGames } from '@/utils/positions'

describe('formatPosition', () => {
  test.each([
    ['TOP', 'Superior'],
    ['JUNGLE', 'Jungla'],
    ['MIDDLE', 'Medio'],
    ['BOTTOM', 'Tirador'],
    ['UTILITY', 'Soporte'],
  ])('formats %s as %s', (position, expected) => {
    const result = formatPosition(position)

    expect(result).toBe(expected)
  })

  test('ignores letter case', () => {
    const position = 'jungle'
    const expected = 'Jungla'

    const result = formatPosition(position)

    expect(result).toBe(expected)
  })

  test('returns an unknown position unchanged', () => {
    const position = 'INVALID'
    const expected = 'INVALID'

    const result = formatPosition(position)

    expect(result).toBe(expected)
  })

  test.each([null, undefined, ''])('returns a dash when position is %j', (position) => {
    const expected = '—'

    const result = formatPosition(position)

    expect(result).toBe(expected)
  })
})

describe('sortPositionsByGames', () => {
  test('sorts positions by games from most to least', () => {
    const positions = [
      { position: 'TOP', games: 5 },
      { position: 'MIDDLE', games: 20 },
      { position: 'BOTTOM', games: 10 },
    ]
    const expected = ['MIDDLE', 'BOTTOM', 'TOP']

    const result = sortPositionsByGames(positions).map((item) => item.position)

    expect(result).toEqual(expected)
  })

  test('breaks ties using the canonical position order', () => {
    const positions = [
      { position: 'UTILITY', games: 7 },
      { position: 'MIDDLE', games: 7 },
      { position: 'TOP', games: 7 },
      { position: 'BOTTOM', games: 7 },
      { position: 'JUNGLE', games: 7 },
    ]
    const expected = ['TOP', 'JUNGLE', 'MIDDLE', 'BOTTOM', 'UTILITY']

    const result = sortPositionsByGames(positions).map((item) => item.position)

    expect(result).toEqual(expected)
  })

  test('puts unknown positions last even with more games', () => {
    const positions = [
      { position: 'INVALID', games: 50 },
      { position: 'TOP', games: 1 },
    ]
    const expected = ['TOP', 'INVALID']

    const result = sortPositionsByGames(positions).map((item) => item.position)

    expect(result).toEqual(expected)
  })

  test('puts positions with non numeric games last', () => {
    const positions = [
      { position: 'TOP', games: 'many' },
      { position: 'UTILITY', games: 1 },
    ]
    const expected = ['UTILITY', 'TOP']

    const result = sortPositionsByGames(positions).map((item) => item.position)

    expect(result).toEqual(expected)
  })

  test('returns a new array without mutating the original', () => {
    const positions = [
      { position: 'TOP', games: 1 },
      { position: 'MIDDLE', games: 9 },
    ]
    const snapshot = structuredClone(positions)

    const result = sortPositionsByGames(positions)

    expect(result).not.toBe(positions)
    expect(positions).toEqual(snapshot)
  })

  test.each([null, undefined, {}])('returns an empty array when the input is %j', (positions) => {
    const result = sortPositionsByGames(positions)

    expect(result).toEqual([])
  })
})

describe('getPositionLabel', () => {
  test('describes a position with several games', () => {
    const item = { position: 'TOP', games: 18, winrate: 55.6 }
    const expected = 'Superior: 18 partidas, 55.6% de victorias'

    const result = getPositionLabel(item)

    expect(result).toBe(expected)
  })

  test('uses the singular for a single game', () => {
    const item = { position: 'JUNGLE', games: 1, winrate: 100 }
    const expected = 'Jungla: 1 partida, 100% de victorias'

    const result = getPositionLabel(item)

    expect(result).toBe(expected)
  })

  test.each([null, undefined])('says there is no winrate when it is %s', (winrate) => {
    const item = { position: 'UTILITY', games: 5, winrate }
    const expected = 'Soporte: 5 partidas, sin winrate'

    const result = getPositionLabel(item)

    expect(result).toBe(expected)
  })
})
