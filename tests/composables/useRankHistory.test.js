import { flushPromises } from '@vue/test-utils'
import { effectScope, nextTick, ref } from 'vue'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { getRankHistory } from '@/api/recall'
import { useRankHistory } from '@/composables/useRankHistory'

import { createControlledPromise } from '../helpers/controlledPromise'

vi.mock('@/api/recall', () => ({
  getRankHistory: vi.fn(),
}))

let scope

function setupComposable(account = ref(''), queueType = ref('RANKED_SOLO_5x5')) {
  scope = effectScope()

  const result = scope.run(() => useRankHistory(account, queueType))

  return { ...result, account, queueType }
}

const soloSnapshot = {
  taken_at: '2026-01-01T12:00:00Z',
  tier: 'SILVER',
  rank: 'I',
  league_points: 42,
  wins: 30,
  losses: 28,
}

describe('useRankHistory', () => {
  beforeEach(() => {
    getRankHistory.mockReset()
  })

  afterEach(() => {
    scope?.stop()
    scope = undefined
  })

  describe('without an account', () => {
    test('does not request the history when created with an empty account', async () => {
      setupComposable()
      await flushPromises()

      expect(getRankHistory).not.toHaveBeenCalled()
    })

    test('exposes an idle state when created with an empty account', async () => {
      const { history, isLoading, error, hasAccount } = setupComposable()
      await flushPromises()

      expect(history.value).toEqual([])
      expect(isLoading.value).toBe(false)
      expect(error.value).toBeNull()
      expect(hasAccount.value).toBe(false)
    })

    test('does nothing when loadHistory is called with an empty account', async () => {
      const { loadHistory } = setupComposable()
      await flushPromises()

      await loadHistory()

      expect(getRankHistory).not.toHaveBeenCalled()
    })
  })

  describe('with an account', () => {
    test('requests the history with the account and queue type when created', async () => {
      getRankHistory.mockResolvedValue({ data: [] })

      setupComposable(ref('la1'), ref('RANKED_SOLO_5x5'))
      await flushPromises()

      expect(getRankHistory).toHaveBeenCalledTimes(1)
      expect(getRankHistory).toHaveBeenCalledWith({
        account: 'la1',
        queueType: 'RANKED_SOLO_5x5',
      })
    })

    test('reports that there is an account', async () => {
      getRankHistory.mockResolvedValue({ data: [] })

      const { hasAccount } = setupComposable(ref('la1'))
      await flushPromises()

      expect(hasAccount.value).toBe(true)
    })

    test('sends an undefined queue type when the queue type is empty', async () => {
      getRankHistory.mockResolvedValue({ data: [] })

      setupComposable(ref('la1'), ref(''))
      await flushPromises()

      expect(getRankHistory).toHaveBeenCalledWith({ account: 'la1', queueType: undefined })
    })

    test('requests the history when the account changes from empty to an account', async () => {
      getRankHistory.mockResolvedValue({ data: [] })
      const { account } = setupComposable()
      await flushPromises()

      account.value = 'la2'
      await nextTick()
      await flushPromises()

      expect(getRankHistory).toHaveBeenCalledTimes(1)
      expect(getRankHistory).toHaveBeenCalledWith({
        account: 'la2',
        queueType: 'RANKED_SOLO_5x5',
      })
    })

    test('requests the history again when the queue type changes', async () => {
      getRankHistory.mockResolvedValue({ data: [] })
      const { queueType } = setupComposable(ref('la1'))
      await flushPromises()

      queueType.value = 'RANKED_FLEX_SR'
      await nextTick()
      await flushPromises()

      expect(getRankHistory).toHaveBeenCalledTimes(2)
      expect(getRankHistory).toHaveBeenLastCalledWith({
        account: 'la1',
        queueType: 'RANKED_FLEX_SR',
      })
    })

    test('exposes the loading state and history from a successful response', async () => {
      const request = createControlledPromise()
      getRankHistory.mockReturnValue(request.promise)

      const { history, isLoading } = setupComposable(ref('la1'))

      expect(isLoading.value).toBe(true)

      request.resolve({ data: [soloSnapshot] })
      await flushPromises()

      expect(history.value).toEqual([soloSnapshot])
      expect(isLoading.value).toBe(false)
    })

    test('exposes a friendly error and keeps an empty list when the request fails', async () => {
      getRankHistory.mockRejectedValue(new Error('Server unavailable'))

      const { history, error } = setupComposable(ref('la1'))
      await flushPromises()

      expect(error.value.message).toBe('No se pudo cargar el historial de rango.')
      expect(history.value).toEqual([])
    })

    test('requests the history again when loadHistory is called', async () => {
      getRankHistory.mockResolvedValue({ data: [] })
      const { loadHistory } = setupComposable(ref('la1'))
      await flushPromises()

      await loadHistory()

      expect(getRankHistory).toHaveBeenCalledTimes(2)
      expect(getRankHistory).toHaveBeenLastCalledWith({
        account: 'la1',
        queueType: 'RANKED_SOLO_5x5',
      })
    })
  })

  describe('when the account goes back to empty', () => {
    test('clears the history loaded for the previous account', async () => {
      getRankHistory.mockResolvedValue({ data: [soloSnapshot] })
      const { history, account } = setupComposable(ref('la1'))
      await flushPromises()

      account.value = ''
      await nextTick()
      await flushPromises()

      expect(history.value).toEqual([])
    })

    test('resets loading, error and hasAccount without a new request', async () => {
      getRankHistory.mockResolvedValue({ data: [soloSnapshot] })
      const { isLoading, error, hasAccount, account } = setupComposable(ref('la1'))
      await flushPromises()

      account.value = ''
      await nextTick()
      await flushPromises()

      expect(isLoading.value).toBe(false)
      expect(error.value).toBeNull()
      expect(hasAccount.value).toBe(false)
      expect(getRankHistory).toHaveBeenCalledTimes(1)
    })

    test('hides the error of the previous account', async () => {
      getRankHistory.mockRejectedValue(new Error('Server unavailable'))
      const { error, account } = setupComposable(ref('la1'))
      await flushPromises()

      account.value = ''
      await nextTick()
      await flushPromises()

      expect(error.value).toBeNull()
    })

    test('ignores a late response from the previous account', async () => {
      const request = createControlledPromise()
      getRankHistory.mockReturnValue(request.promise)
      const { history, isLoading, account } = setupComposable(ref('la1'))

      account.value = ''
      await nextTick()
      request.resolve({ data: [soloSnapshot] })
      await flushPromises()

      expect(history.value).toEqual([])
      expect(isLoading.value).toBe(false)
    })

    test('does not report loading while its request is still pending without an account', async () => {
      const request = createControlledPromise()
      getRankHistory.mockReturnValue(request.promise)
      const { isLoading, account } = setupComposable(ref('la1'))
      expect(isLoading.value).toBe(true)

      account.value = ''
      await nextTick()

      expect(isLoading.value).toBe(false)
    })

    test('requests the history again when a new account is selected', async () => {
      getRankHistory.mockResolvedValue({ data: [] })
      const { account } = setupComposable(ref('la1'))
      await flushPromises()
      account.value = ''
      await nextTick()

      account.value = 'la2'
      await nextTick()
      await flushPromises()

      expect(getRankHistory).toHaveBeenCalledTimes(2)
      expect(getRankHistory).toHaveBeenLastCalledWith({
        account: 'la2',
        queueType: 'RANKED_SOLO_5x5',
      })
    })
  })

  describe('when the account or queue type changes', () => {
    test('shows no history of the previous account while a new account is pending after going empty', async () => {
      const firstRequest = createControlledPromise()
      const secondRequest = createControlledPromise()
      getRankHistory
        .mockReturnValueOnce(firstRequest.promise)
        .mockReturnValueOnce(secondRequest.promise)
      const { history, isLoading, account } = setupComposable(ref('la1'))

      account.value = ''
      await nextTick()
      firstRequest.resolve({ data: [soloSnapshot] })
      await flushPromises()
      account.value = 'la2'
      await nextTick()

      expect(history.value).toEqual([])
      expect(isLoading.value).toBe(true)
    })

    test('shows no history of the previous account while the new account is loading', async () => {
      const newRequest = createControlledPromise()
      getRankHistory
        .mockResolvedValueOnce({ data: [soloSnapshot] })
        .mockReturnValueOnce(newRequest.promise)
      const { history, isLoading, account } = setupComposable(ref('la1'))
      await flushPromises()
      expect(history.value).toEqual([soloSnapshot])

      account.value = 'la2'
      await nextTick()

      expect(history.value).toEqual([])
      expect(isLoading.value).toBe(true)
    })

    test('keeps no old history and exposes the error when the new account fails', async () => {
      getRankHistory
        .mockResolvedValueOnce({ data: [soloSnapshot] })
        .mockRejectedValueOnce(new Error('Server unavailable'))
      const { history, error, account } = setupComposable(ref('la1'))
      await flushPromises()

      account.value = 'la2'
      await nextTick()
      await flushPromises()

      expect(history.value).toEqual([])
      expect(error.value.message).toBe('No se pudo cargar el historial de rango.')
    })

    test('shows no history of the previous queue type while the new queue type is loading', async () => {
      const newRequest = createControlledPromise()
      getRankHistory
        .mockResolvedValueOnce({ data: [soloSnapshot] })
        .mockReturnValueOnce(newRequest.promise)
      const { history, isLoading, queueType } = setupComposable(ref('la1'))
      await flushPromises()

      queueType.value = 'RANKED_FLEX_SR'
      await nextTick()

      expect(history.value).toEqual([])
      expect(isLoading.value).toBe(true)
    })
  })

  describe('when loadHistory is called manually', () => {
    test('keeps the current history visible while reloading', async () => {
      const reloadRequest = createControlledPromise()
      getRankHistory
        .mockResolvedValueOnce({ data: [soloSnapshot] })
        .mockReturnValueOnce(reloadRequest.promise)
      const { history, isLoading, loadHistory } = setupComposable(ref('la1'))
      await flushPromises()

      loadHistory()
      await nextTick()

      expect(history.value).toEqual([soloSnapshot])
      expect(isLoading.value).toBe(true)
    })
  })
})
