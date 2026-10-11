import { describe, expect, test } from 'vitest'

import { formatMetric } from '@/utils/formatMetric'

describe('formatMetric', () => {
  test('returns a number as text', () => {
    const value = 42
    const expected = '42'

    const result = formatMetric(value)

    expect(result).toBe(expected)
  })

  test('appends a suffix to the value', () => {
    const value = 5
    const suffix = '%'
    const expected = '5%'

    const result = formatMetric(value, suffix)

    expect(result).toBe(expected)
  })

  test('returns zero instead of a dash', () => {
    const value = 0
    const expected = '0'

    const result = formatMetric(value)

    expect(result).toBe(expected)
  })

  test('returns a dash when the value is null', () => {
    const value = null
    const expected = '—'

    const result = formatMetric(value)

    expect(result).toBe(expected)
  })

  test('returns a dash when the value is undefined', () => {
    const value = undefined
    const expected = '—'

    const result = formatMetric(value)

    expect(result).toBe(expected)
  })

  test('returns a dash when the value is NaN', () => {
    const value = Number.NaN
    const expected = '—'

    const result = formatMetric(value)

    expect(result).toBe(expected)
  })
})
