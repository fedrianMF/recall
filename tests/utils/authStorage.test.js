import { afterEach, describe, expect, test, vi } from 'vitest'
import { clearSession, readSession, saveSession } from '@/utils/authStorage'

afterEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('authStorage', () => {
  test('ignores and clears an expired session', () => {
    localStorage.setItem(
      'recall.session',
      JSON.stringify({ token: 'fake-token', expiresAt: '2000-01-01T00:00:00.000Z' }),
    )
    expect(readSession()).toBe(null)
    expect(localStorage.getItem('recall.session')).toBe(null)
  })

  test('saves and reads a valid session', () => {
    saveSession({ token: 'fake-token', expiresAt: '2099-01-01T00:00:00.000Z' })
    expect(readSession()).toEqual({ token: 'fake-token', expiresAt: '2099-01-01T00:00:00.000Z' })
    clearSession()
    expect(readSession()).toBe(null)
  })

  test('does not throw when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(() =>
      saveSession({ token: 'fake-token', expiresAt: '2099-01-01T00:00:00.000Z' }),
    ).not.toThrow()
    expect(readSession()).toBe(null)
    expect(() => clearSession()).not.toThrow()
  })
})
