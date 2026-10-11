import { flushPromises } from '@vue/test-utils'
import { effectScope, nextTick, ref } from 'vue'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { getChampions } from '@/api/recall'
import { useChampions } from '@/composables/useChampions'

import { createControlledPromise } from '../helpers/controlledPromise'

vi.mock('@/api/recall', () => ({
  getChampions: vi.fn(),
}))

let scope

function setupComposable(account = ref(''), minGames = ref(1)) {
  scope = effectScope()

  const result = scope.run(() => useChampions(account, minGames))

  return { ...result, account, minGames }
}

describe('useChampions', () => {
  beforeEach(() => {
    getChampions.mockReset()
  })

  afterEach(() => {
    scope?.stop()
    scope = undefined
  })

  test('requests champions with the default filters when created', async () => {
    getChampions.mockResolvedValue({ data: [] })

    setupComposable()
    await flushPromises()

    expect(getChampions).toHaveBeenCalledTimes(1)
    expect(getChampions).toHaveBeenCalledWith({ account: undefined, minGames: 1 })
  })

  test('requests champions with the selected account and minimum games when created', async () => {
    getChampions.mockResolvedValue({ data: [] })
    const account = ref('la1')
    const minGames = ref(5)

    setupComposable(account, minGames)
    await flushPromises()

    expect(getChampions).toHaveBeenCalledTimes(1)
    expect(getChampions).toHaveBeenCalledWith({ account: 'la1', minGames: 5 })
  })

  test('requests champions again when the account changes', async () => {
    getChampions.mockResolvedValue({ data: [] })
    const { account } = setupComposable()
    await flushPromises()

    account.value = 'la2'
    await nextTick()
    await flushPromises()

    expect(getChampions).toHaveBeenCalledTimes(2)
    expect(getChampions).toHaveBeenLastCalledWith({ account: 'la2', minGames: 1 })
  })

  test('requests champions again when the minimum games changes', async () => {
    getChampions.mockResolvedValue({ data: [] })
    const { minGames } = setupComposable()
    await flushPromises()

    minGames.value = 10
    await nextTick()
    await flushPromises()

    expect(getChampions).toHaveBeenCalledTimes(2)
    expect(getChampions).toHaveBeenLastCalledWith({ account: undefined, minGames: 10 })
  })

  test('exposes the loading state and champions from a successful response', async () => {
    const request = createControlledPromise()
    getChampions.mockReturnValue(request.promise)
    const expectedChampions = [
      {
        champion: 'Ahri',
        games: 8,
        wins: 5,
        winrate: 62.5,
        kda: 4.2,
        cs_per_min: 7.1,
        damage_per_min: 530.4,
        kill_participation: 64.8,
      },
    ]

    const { champions, isLoading } = setupComposable()

    expect(isLoading.value).toBe(true)

    request.resolve({ data: expectedChampions })
    await flushPromises()

    expect(champions.value).toEqual(expectedChampions)
    expect(isLoading.value).toBe(false)
  })

  test('exposes a friendly error and keeps an empty list when the request fails', async () => {
    getChampions.mockRejectedValue(new Error('Server unavailable'))

    const { champions, error } = setupComposable()
    await flushPromises()

    expect(error.value.message).toBe('No se pudieron cargar los campeones.')
    expect(champions.value).toEqual([])
  })

  test('requests champions again when loadChampions is called', async () => {
    getChampions.mockResolvedValue({ data: [] })
    const { loadChampions } = setupComposable()
    await flushPromises()

    await loadChampions()

    expect(getChampions).toHaveBeenCalledTimes(2)
    expect(getChampions).toHaveBeenLastCalledWith({ account: undefined, minGames: 1 })
  })
})
