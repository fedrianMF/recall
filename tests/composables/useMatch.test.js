import { flushPromises } from '@vue/test-utils'
import { effectScope, nextTick, ref } from 'vue'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { getMatch } from '@/api/recall'
import { useMatch } from '@/composables/useMatch'

import { createControlledPromise } from '../helpers/controlledPromise'

vi.mock('@/api/recall', () => ({
  getMatch: vi.fn(),
}))

let scope

// useMatch creates a watcher. The scope lets each test stop it explicitly so
// a watcher from an old test cannot react after that test has finished.
function setupComposable(id = ref('LA1_123')) {
  scope = effectScope()

  const result = scope.run(() => useMatch(id))

  return { ...result, id }
}

describe('useMatch', () => {
  beforeEach(() => {
    getMatch.mockReset()
  })

  afterEach(() => {
    scope?.stop()
    scope = undefined
  })

  test('requests the match with the current id when created', async () => {
    getMatch.mockResolvedValue({ data: { id: 'LA1_123' } })

    setupComposable()
    await flushPromises()

    expect(getMatch).toHaveBeenCalledTimes(1)
    expect(getMatch).toHaveBeenCalledWith('LA1_123')
  })

  test('requests the match again when the id changes', async () => {
    getMatch.mockResolvedValue({ data: { id: 'LA1_123' } })
    const { id } = setupComposable()
    await flushPromises()

    id.value = 'LA1_999'
    await nextTick()
    await flushPromises()

    expect(getMatch).toHaveBeenCalledTimes(2)
    expect(getMatch).toHaveBeenLastCalledWith('LA1_999')
  })

  test('exposes the response data and loading state around a pending request', async () => {
    const request = createControlledPromise()
    getMatch.mockReturnValue(request.promise)

    const { match, isLoading } = setupComposable()

    expect(isLoading.value).toBe(true)
    expect(match.value).toBeNull()

    request.resolve({ data: { id: 'LA1_123', champion: 'Ahri' } })
    await flushPromises()

    expect(match.value).toEqual({ id: 'LA1_123', champion: 'Ahri' })
    expect(isLoading.value).toBe(false)
  })

  test('exposes a friendly error and preserves its status', async () => {
    const requestError = new Error('Match not found')
    requestError.status = 404
    getMatch.mockRejectedValue(requestError)

    const { error } = setupComposable()
    await flushPromises()

    expect(error.value.message).toBe('No se pudo cargar la partida.')
    expect(error.value.status).toBe(404)
  })

  test('requests the current match again when loadMatch is called', async () => {
    getMatch.mockResolvedValue({ data: { id: 'LA1_123' } })
    const { loadMatch } = setupComposable()
    await flushPromises()

    await loadMatch()

    expect(getMatch).toHaveBeenCalledTimes(2)
    expect(getMatch).toHaveBeenLastCalledWith('LA1_123')
  })
})
