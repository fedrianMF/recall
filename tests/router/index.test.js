import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import router from '@/router'

// The router imports the views, and the views import the API layer, which reads
// VITE_API_URL when loaded. CI has no `.env`, so we replace that layer with an
// empty one: these tests only care about routes, never about API calls.
// vi.mock is hoisted: Vitest moves it above the imports, so the real file never loads.
vi.mock('@/api/recall', () => ({
  getMe: vi.fn().mockResolvedValue({
    data: { id: 1, name: 'Test User', email: 'user@example.test', email_verified: true },
  }),
  setUnauthorizedHandler: vi.fn(),
}))

// This uses the real router from `src/router/index.js` (not a copy of its routes),
// so the test breaks if someone changes or deletes the real wildcard route.
// The router keeps its state between tests, so each test starts from the summary.
describe('router', () => {
  beforeEach(async () => {
    localStorage.setItem(
      'recall.session',
      JSON.stringify({ token: 'fake-token', expiresAt: '2099-01-01T00:00:00.000Z' }),
    )
    await router.replace('/')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('unknown addresses', () => {
    // `test.each` runs the same test once per row of the table.
    test.each(['/no-existe', '/no-existe/ruta', '/matches/a/b/c', '/champions/x'])(
      'sends %s to the not-found page',
      async (path) => {
        await router.push(path)

        expect(router.currentRoute.value.name).toBe('not-found')
        expect(router.currentRoute.value.path).toBe('/404')
      },
    )

    test('redirects without a Vue Router warning', async () => {
      // Vue Router reports problems with `console.warn`; we listen to it without printing.
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      await router.push('/no-existe/ruta')

      expect(router.currentRoute.value.name).toBe('not-found')
      expect(warn).not.toHaveBeenCalled()
    })
  })

  describe('valid addresses', () => {
    test.each([
      ['/', 'summary'],
      ['/champions', 'champions'],
      ['/matches', 'matches'],
      ['/matches/abc123', 'match-detail'],
      ['/404', 'not-found'],
    ])('keeps %s on its own page', async (path, name) => {
      await router.push(path)

      expect(router.currentRoute.value.name).toBe(name)
    })

    test('sends the old /new-home address to the summary', async () => {
      await router.push('/new-home')

      expect(router.currentRoute.value.name).toBe('summary')
      expect(router.currentRoute.value.path).toBe('/')
    })
  })
})
