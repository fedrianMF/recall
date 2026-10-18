import { afterEach, describe, expect, test, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'

vi.mock('@/api/recall', () => ({
  getMe: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  setUnauthorizedHandler: vi.fn(),
}))

import { getMe, login, logout, setUnauthorizedHandler } from '@/api/recall'
import { useSession } from '@/composables/useSession'
import router from '@/router'
import { error, isRunning, latest } from '@/composables/syncState'
import { useAccounts } from '@/composables/useAccounts'

afterEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

let unauthorizedHandler

describe('useSession', () => {
  test('signs in, saves the token and loads the user', async () => {
    login.mockResolvedValue({
      data: { token: 'fake-token', expires_at: '2099-01-01T00:00:00.000Z' },
    })
    getMe.mockResolvedValue({
      data: { id: 1, name: 'Test User', email: 'user@example.test', email_verified: false },
    })

    const session = useSession()
    await session.signIn({ email: 'user@example.test', password: 'not-a-real-password' })
    unauthorizedHandler = setUnauthorizedHandler.mock.calls[0][0]

    expect(session.user.value.name).toBe('Test User')
    expect(localStorage.getItem('recall.session')).toContain('fake-token')
  })

  test('redirects a forced 401 to login with the current route', async () => {
    getMe.mockResolvedValue({
      data: { id: 1, name: 'Test User', email: 'user@example.test', email_verified: true },
    })
    const session = useSession()
    await session.signIn({ email: 'user@example.test', password: 'not-a-real-password' })
    await router.push('/matches')

    unauthorizedHandler()
    await flushPromises()

    expect(router.currentRoute.value.name).toBe('login')
    expect(router.currentRoute.value.query.redirect).toBe('/matches')
  })

  test('always clears local state when sign out fails', async () => {
    logout.mockRejectedValue(new Error('offline'))
    latest.value = { id: 1, status: 'running' }
    isRunning.value = true
    error.value = new Error('old error')
    const accounts = useAccounts()
    accounts.add({ id: 1, platform: 'la1' })
    const session = useSession()
    await session.signOut()
    expect(session.user.value).toBe(null)
    expect(localStorage.getItem('recall.session')).toBe(null)
    expect(latest.value).toBe(null)
    expect(isRunning.value).toBe(false)
    expect(error.value).toBe(null)
    expect(accounts.accounts.value).toEqual([])
  })
})
