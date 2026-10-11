import { flushPromises } from '@vue/test-utils'
import { effectScope, nextTick, ref } from 'vue'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { getMatches } from '@/api/recall'
import { useMatches } from '@/composables/useMatches'

import { createControlledPromise } from '../helpers/controlledPromise'

vi.mock('@/api/recall', () => ({
  getMatches: vi.fn(),
}))

let scope

// useMatches creates watchers. An effectScope groups them so afterEach can call
// scope.stop() and remove them; otherwise they would keep reacting to refs of old tests.
function setupComposable(account = ref(''), queue = ref(''), page = ref(1)) {
  scope = effectScope()

  const result = scope.run(() => useMatches(account, queue, page))

  return { ...result, account, queue, page }
}

describe('useMatches', () => {
  beforeEach(() => {
    getMatches.mockReset()
  })

  afterEach(() => {
    scope?.stop()
    scope = undefined
  })

  describe('requests', () => {
    test('requests the first page without filters when created', async () => {
      getMatches.mockResolvedValue({ data: [] })

      setupComposable()
      await flushPromises()

      expect(getMatches).toHaveBeenCalledTimes(1)
      expect(getMatches).toHaveBeenCalledWith({ account: undefined, queue: undefined, page: 1 })
    })

    test('requests with the given account, queue and page when created', async () => {
      getMatches.mockResolvedValue({ data: [] })

      setupComposable(ref('la1'), ref('420'), ref(2))
      await flushPromises()

      expect(getMatches).toHaveBeenCalledTimes(1)
      expect(getMatches).toHaveBeenCalledWith({ account: 'la1', queue: '420', page: 2 })
    })

    test('requests again with the new page when the page changes', async () => {
      getMatches.mockResolvedValue({ data: [] })
      const { page } = setupComposable()
      await flushPromises()

      page.value = 2
      await nextTick()
      await flushPromises()

      expect(getMatches).toHaveBeenCalledTimes(2)
      expect(getMatches).toHaveBeenLastCalledWith({ account: undefined, queue: undefined, page: 2 })
    })
  })

  describe('filter changes', () => {
    test('requests once with the new account when the account changes on page 1', async () => {
      getMatches.mockResolvedValue({ data: [] })
      const { account } = setupComposable()
      await flushPromises()

      account.value = 'la2'
      await nextTick()
      await flushPromises()

      expect(getMatches).toHaveBeenCalledTimes(2)
      expect(getMatches).toHaveBeenLastCalledWith({ account: 'la2', queue: undefined, page: 1 })
    })

    test('requests once with the new queue when the queue changes on page 1', async () => {
      getMatches.mockResolvedValue({ data: [] })
      const { queue } = setupComposable()
      await flushPromises()

      queue.value = '450'
      await nextTick()
      await flushPromises()

      expect(getMatches).toHaveBeenCalledTimes(2)
      expect(getMatches).toHaveBeenLastCalledWith({ account: undefined, queue: '450', page: 1 })
    })

    test('goes back to page 1 and requests only once when the account changes on page 3', async () => {
      getMatches.mockResolvedValue({ data: [] })
      const { account, page } = setupComposable(ref(''), ref(''), ref(3))
      await flushPromises()

      account.value = 'la2'
      await nextTick()
      await flushPromises()

      expect(page.value).toBe(1)
      expect(getMatches).toHaveBeenCalledTimes(2)
      expect(getMatches).toHaveBeenLastCalledWith({ account: 'la2', queue: undefined, page: 1 })
    })

    test('goes back to page 1 and requests only once when the queue changes on page 3', async () => {
      getMatches.mockResolvedValue({ data: [] })
      const { queue, page } = setupComposable(ref(''), ref(''), ref(3))
      await flushPromises()

      queue.value = '440'
      await nextTick()
      await flushPromises()

      expect(page.value).toBe(1)
      expect(getMatches).toHaveBeenCalledTimes(2)
      expect(getMatches).toHaveBeenLastCalledWith({ account: undefined, queue: '440', page: 1 })
    })
  })

  describe('exposed state', () => {
    test('exposes an empty list and default meta while there is no response', () => {
      getMatches.mockReturnValue(createControlledPromise().promise)

      const { matches, meta, links } = setupComposable()

      expect(matches.value).toEqual([])
      expect(meta.value).toEqual({ current_page: 1, last_page: 1, total: 0 })
      expect(links.value).toEqual({})
    })

    test('exposes matches, meta and links from a successful response', async () => {
      const response = {
        data: [{ id: 10, champion: 'Ahri' }],
        links: { next: 'http://api.test/matches?page=2' },
        meta: { current_page: 1, last_page: 2, total: 15 },
      }
      getMatches.mockResolvedValue(response)

      const { matches, meta, links } = setupComposable()
      await flushPromises()

      expect(matches.value).toEqual([{ id: 10, champion: 'Ahri' }])
      expect(meta.value).toEqual({ current_page: 1, last_page: 2, total: 15 })
      expect(links.value).toEqual({ next: 'http://api.test/matches?page=2' })
    })

    test('is loading while the request is pending and stops when it answers', async () => {
      const request = createControlledPromise()
      getMatches.mockReturnValue(request.promise)

      const { isLoading } = setupComposable()

      expect(isLoading.value).toBe(true)

      request.resolve({ data: [] })
      await flushPromises()

      expect(isLoading.value).toBe(false)
    })

    test('exposes a friendly error and keeps an empty list when the request fails', async () => {
      getMatches.mockRejectedValue(new Error('Server unavailable'))

      const { error, matches } = setupComposable()
      await flushPromises()

      expect(error.value.message).toBe('No se pudo cargar el historial.')
      expect(matches.value).toEqual([])
    })

    test('requests again with the current values when loadMatches is called', async () => {
      getMatches.mockResolvedValue({ data: [] })
      const { loadMatches } = setupComposable(ref('la1'), ref('420'), ref(2))
      await flushPromises()

      await loadMatches()

      expect(getMatches).toHaveBeenCalledTimes(2)
      expect(getMatches).toHaveBeenLastCalledWith({ account: 'la1', queue: '420', page: 2 })
    })
  })
})
