import { describe, expect, test } from 'vitest'
import { isActiveSync, syncStatusLabel } from '@/utils/syncStatus'

describe('syncStatus', () => {
  test.each([
    ['queued', true],
    ['running', true],
    ['completed', false],
    ['failed', false],
    ['other', false],
  ])('%s active state', (status, expected) => {
    expect(isActiveSync(status)).toBe(expected)
  })

  test.each([
    ['queued', 'En cola'],
    ['running', 'Sincronizando…'],
    ['completed', 'Completada'],
    ['failed', 'Falló'],
    ['other', 'Estado desconocido'],
  ])('%s label', (status, expected) => {
    expect(syncStatusLabel(status)).toBe(expected)
  })
})
