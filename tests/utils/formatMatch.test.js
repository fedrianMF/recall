import { describe, expect, test } from 'vitest'

import { formatDuration, formatRelativeTime, formatShortDate } from '@/utils/formatMatch'

describe('formatDuration', () => {
  test('returns a dash when the duration is null', () => {
    const durationSeconds = null
    const expected = '—'

    const result = formatDuration(durationSeconds)

    expect(result).toBe(expected)
  })

  test('formats zero seconds', () => {
    const durationSeconds = 0
    const expected = '0:00'

    const result = formatDuration(durationSeconds)

    expect(result).toBe(expected)
  })

  test('formats a duration shorter than one minute', () => {
    const durationSeconds = 59
    const expected = '0:59'

    const result = formatDuration(durationSeconds)

    expect(result).toBe(expected)
  })

  test('formats exactly one minute', () => {
    const durationSeconds = 60
    const expected = '1:00'

    const result = formatDuration(durationSeconds)

    expect(result).toBe(expected)
  })

  test('pads single-digit seconds with a leading zero', () => {
    const durationSeconds = 61
    const expected = '1:01'

    const result = formatDuration(durationSeconds)

    expect(result).toBe(expected)
  })

  test('keeps accumulating minutes beyond one hour', () => {
    const durationSeconds = 3661
    const expected = '61:01'

    const result = formatDuration(durationSeconds)

    expect(result).toBe(expected)
  })
})

describe('formatRelativeTime', () => {
  test('returns a dash for an invalid date', () => {
    const dateString = 'not-a-date'
    const now = new Date('2026-01-15T12:00:00.000Z')
    const expected = '—'

    const result = formatRelativeTime(dateString, now)

    expect(result).toBe(expected)
  })

  test('returns now when both dates are equal', () => {
    const dateString = '2026-01-15T12:00:00.000Z'
    const now = new Date('2026-01-15T12:00:00.000Z')
    const expected = 'ahora'

    const result = formatRelativeTime(dateString, now)

    expect(result).toBe(expected)
  })

  test('formats past seconds in Spanish', () => {
    const dateString = '2026-01-15T11:59:30.000Z'
    const now = new Date('2026-01-15T12:00:00.000Z')
    const expected = 'hace 30 segundos'

    const result = formatRelativeTime(dateString, now)

    expect(result).toBe(expected)
  })

  test('formats future minutes in Spanish', () => {
    const dateString = '2026-01-15T12:05:00.000Z'
    const now = new Date('2026-01-15T12:00:00.000Z')
    const expected = 'dentro de 5 minutos'

    const result = formatRelativeTime(dateString, now)

    expect(result).toBe(expected)
  })

  test('formats past hours in Spanish', () => {
    const dateString = '2026-01-15T10:00:00.000Z'
    const now = new Date('2026-01-15T12:00:00.000Z')
    const expected = 'hace 2 horas'

    const result = formatRelativeTime(dateString, now)

    expect(result).toBe(expected)
  })

  test('formats future days in Spanish', () => {
    const dateString = '2026-01-18T12:00:00.000Z'
    const now = new Date('2026-01-15T12:00:00.000Z')
    const expected = 'dentro de 3 días'

    const result = formatRelativeTime(dateString, now)

    expect(result).toBe(expected)
  })
})

describe('formatShortDate', () => {
  test.each([
    ['2026-01-01T00:00:00Z', '1 ene'],
    ['2026-01-11T00:00:00Z', '11 ene'],
    ['2026-03-05T12:00:00Z', '5 mar'],
    ['2026-12-25T12:00:00Z', '25 dic'],
  ])('formats %s as "%s" (day and short Spanish month)', (dateString, expected) => {
    const result = formatShortDate(dateString)

    expect(result).toBe(expected)
  })

  test('uses the UTC day, not the local one, near midnight', () => {
    const dateString = '2026-01-01T00:00:00Z'
    const expected = '1 ene'

    const result = formatShortDate(dateString)

    expect(result).toBe(expected)
  })

  test.each([
    ['an invalid string', 'not-a-date'],
    ['null', null],
    ['undefined', undefined],
  ])('returns a dash for %s', (_label, dateString) => {
    const expected = '—'

    const result = formatShortDate(dateString)

    expect(result).toBe(expected)
  })
})
