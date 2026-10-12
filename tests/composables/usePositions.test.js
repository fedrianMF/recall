import { flushPromises } from '@vue/test-utils'
import { effectScope, nextTick, ref } from 'vue'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { getPositions } from '@/api/recall'
import { usePositions } from '@/composables/usePositions'

import { createControlledPromise } from '../helpers/controlledPromise'

vi.mock('@/api/recall', () => ({
  getPositions: vi.fn(),
}))

let scope

function setupComposable(account = ref('')) {
  scope = effectScope()

  const result = scope.run(() => usePositions(account))

  return { ...result, account }
}

describe('usePositions', () => {
  beforeEach(() => {
    getPositions.mockReset()
  })

  afterEach(() => {
    scope?.stop()
    scope = undefined
  })

  test('requests positions without an account when created with an empty account', async () => {
    getPositions.mockResolvedValue({ data: [] })

    setupComposable()
    await flushPromises()

    expect(getPositions).toHaveBeenCalledTimes(1)
    expect(getPositions).toHaveBeenCalledWith({ account: undefined })
  })

  test('requests positions with the selected account when created', async () => {
    getPositions.mockResolvedValue({ data: [] })

    setupComposable(ref('la1'))
    await flushPromises()

    expect(getPositions).toHaveBeenCalledTimes(1)
    expect(getPositions).toHaveBeenCalledWith({ account: 'la1' })
  })

  test('requests positions again when the account changes', async () => {
    getPositions.mockResolvedValue({ data: [] })
    const { account } = setupComposable()
    await flushPromises()

    account.value = 'la2'
    await nextTick()
    await flushPromises()

    expect(getPositions).toHaveBeenCalledTimes(2)
    expect(getPositions).toHaveBeenLastCalledWith({ account: 'la2' })
  })

  test('exposes the loading state and positions from a successful response', async () => {
    const request = createControlledPromise()
    getPositions.mockReturnValue(request.promise)
    const expectedPositions = [
      {
        position: 'MIDDLE',
        games: 34,
        wins: 18,
        winrate: 52.9,
        kda: 2.9,
        cs_per_min: 7.1,
        damage_per_min: 623.5,
        kill_participation: 58.2,
      },
    ]

    const { positions, isLoading } = setupComposable()

    expect(isLoading.value).toBe(true)

    request.resolve({ data: expectedPositions })
    await flushPromises()

    expect(positions.value).toEqual(expectedPositions)
    expect(isLoading.value).toBe(false)
  })

  test('starts with an empty list while there is no response', () => {
    getPositions.mockReturnValue(createControlledPromise().promise)

    const { positions } = setupComposable()

    expect(positions.value).toEqual([])
  })

  test('exposes a friendly error and keeps an empty list when the request fails', async () => {
    getPositions.mockRejectedValue(new Error('Server unavailable'))

    const { positions, error } = setupComposable()
    await flushPromises()

    expect(error.value.message).toBe('No se pudieron cargar las posiciones.')
    expect(positions.value).toEqual([])
  })

  test('requests positions again when loadPositions is called', async () => {
    getPositions.mockResolvedValue({ data: [] })
    const { loadPositions } = setupComposable(ref('la1'))
    await flushPromises()

    await loadPositions()

    expect(getPositions).toHaveBeenCalledTimes(2)
    expect(getPositions).toHaveBeenLastCalledWith({ account: 'la1' })
  })

  test('ignores the stale response when the account changes twice in a row', async () => {
    const firstRequest = createControlledPromise()
    const secondRequest = createControlledPromise()
    getPositions
      .mockResolvedValueOnce({ data: [] })
      .mockReturnValueOnce(firstRequest.promise)
      .mockReturnValueOnce(secondRequest.promise)
    const { positions, account } = setupComposable()
    await flushPromises()

    account.value = 'la1'
    await nextTick()
    account.value = 'la2'
    await nextTick()

    secondRequest.resolve({ data: [{ position: 'TOP' }] })
    await flushPromises()
    firstRequest.resolve({ data: [{ position: 'JUNGLE' }] })
    await flushPromises()

    expect(positions.value).toEqual([{ position: 'TOP' }])
  })

  describe('when the account changes', () => {
    test('shows no positions of the previous account while the new account is loading', async () => {
      const newRequest = createControlledPromise()
      getPositions
        .mockResolvedValueOnce({ data: [{ position: 'TOP' }] })
        .mockReturnValueOnce(newRequest.promise)
      const { positions, isLoading, account } = setupComposable(ref('la1'))
      await flushPromises()
      expect(positions.value).toEqual([{ position: 'TOP' }])

      account.value = 'la2'
      await nextTick()

      expect(positions.value).toEqual([])
      expect(isLoading.value).toBe(true)
    })

    test('keeps no old positions and exposes the error when the new account fails', async () => {
      getPositions
        .mockResolvedValueOnce({ data: [{ position: 'TOP' }] })
        .mockRejectedValueOnce(new Error('Server unavailable'))
      const { positions, error, account } = setupComposable(ref('la1'))
      await flushPromises()

      account.value = 'la2'
      await nextTick()
      await flushPromises()

      expect(positions.value).toEqual([])
      expect(error.value.message).toBe('No se pudieron cargar las posiciones.')
    })

    test('ignores a late response from the previous account', async () => {
      const oldRequest = createControlledPromise()
      const newRequest = createControlledPromise()
      getPositions.mockReturnValueOnce(oldRequest.promise).mockReturnValueOnce(newRequest.promise)
      const { positions, isLoading, account } = setupComposable(ref('la1'))

      account.value = 'la2'
      await nextTick()
      oldRequest.resolve({ data: [{ position: 'JUNGLE' }] })
      await flushPromises()

      expect(positions.value).toEqual([])
      expect(isLoading.value).toBe(true)
    })
  })

  describe('when loadPositions is called manually', () => {
    test('keeps the current positions visible while reloading', async () => {
      const reloadRequest = createControlledPromise()
      getPositions
        .mockResolvedValueOnce({ data: [{ position: 'TOP' }] })
        .mockReturnValueOnce(reloadRequest.promise)
      const { positions, isLoading, loadPositions } = setupComposable(ref('la1'))
      await flushPromises()

      loadPositions()
      await nextTick()

      expect(positions.value).toEqual([{ position: 'TOP' }])
      expect(isLoading.value).toBe(true)
    })
  })
})
