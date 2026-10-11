import { flushPromises } from '@vue/test-utils'
import { effectScope, nextTick, ref } from 'vue'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { getSummary } from '@/api/recall'
import { useSummary } from '@/composables/useSummary'

import { createControlledPromise } from '../helpers/controlledPromise'

vi.mock('@/api/recall', () => ({
  getSummary: vi.fn(),
}))

let scope

function setupComposable(account = ref('')) {
  scope = effectScope()

  const result = scope.run(() => useSummary(account))

  return { ...result, account }
}

describe('useSummary', () => {
  beforeEach(() => {
    getSummary.mockReset()
  })

  afterEach(() => {
    scope?.stop()
    scope = undefined
  })

  test('requests the summary without an account when created with an empty account', async () => {
    getSummary.mockResolvedValue({ data: null })

    setupComposable()
    await flushPromises()

    expect(getSummary).toHaveBeenCalledTimes(1)
    expect(getSummary).toHaveBeenCalledWith({ account: undefined })
  })

  test('requests the summary with the selected account when created', async () => {
    getSummary.mockResolvedValue({ data: null })

    setupComposable(ref('la1'))
    await flushPromises()

    expect(getSummary).toHaveBeenCalledTimes(1)
    expect(getSummary).toHaveBeenCalledWith({ account: 'la1' })
  })

  test('requests the summary again when the account changes', async () => {
    getSummary.mockResolvedValue({ data: null })
    const { account } = setupComposable()
    await flushPromises()

    account.value = 'la2'
    await nextTick()
    await flushPromises()

    expect(getSummary).toHaveBeenCalledTimes(2)
    expect(getSummary).toHaveBeenLastCalledWith({ account: 'la2' })
  })

  test('exposes loading and summary data from a successful response', async () => {
    const request = createControlledPromise()
    const expectedSummary = { games: 12, wins: 7, winrate: 58.3 }
    getSummary.mockReturnValue(request.promise)

    const { summary, isLoading } = setupComposable()

    expect(isLoading.value).toBe(true)

    request.resolve({ data: expectedSummary })
    await flushPromises()

    expect(summary.value).toEqual(expectedSummary)
    expect(isLoading.value).toBe(false)
  })

  test('exposes a friendly error and keeps a null summary when the request fails', async () => {
    getSummary.mockRejectedValue(new Error('Server unavailable'))

    const { summary, error } = setupComposable()
    await flushPromises()

    expect(error.value.message).toBe('No se pudo cargar el resumen.')
    expect(summary.value).toBeNull()
  })

  test('requests the summary again when loadSummary is called', async () => {
    getSummary.mockResolvedValue({ data: null })
    const { loadSummary } = setupComposable(ref('la1'))
    await flushPromises()

    await loadSummary()

    expect(getSummary).toHaveBeenCalledTimes(2)
    expect(getSummary).toHaveBeenLastCalledWith({ account: 'la1' })
  })
})
