import { describe, expect, test, vi } from 'vitest'

import { useApiRequest } from '@/composables/useApiRequest'

import { createControlledPromise } from '../helpers/controlledPromise'

describe('useApiRequest', () => {
  test('starts with the default state', () => {
    const request = vi.fn()

    const { data, isLoading, error } = useApiRequest(request)

    expect(data.value).toBe(null)
    expect(isLoading.value).toBe(false)
    expect(error.value).toBe(null)
  })

  test('starts with the configured initial data', () => {
    const request = vi.fn()
    const initialData = 'cached result'

    const { data } = useApiRequest(request, { initialData })

    expect(data.value).toBe('cached result')
  })

  test('exposes the loading lifecycle of a successful request', async () => {
    const controlledRequest = createControlledPromise()
    const request = vi.fn(() => controlledRequest.promise)
    const { data, isLoading, error, load } = useApiRequest(request)

    const loadPromise = load()

    expect(isLoading.value).toBe(true)

    controlledRequest.resolve('loaded result')
    await loadPromise

    expect(data.value).toBe('loaded result')
    expect(isLoading.value).toBe(false)
    expect(error.value).toBe(null)
  })

  test('wraps an Error with the configured message, cause, and status', async () => {
    const originalError = new Error('Server unavailable')
    originalError.status = 503
    const request = vi.fn().mockRejectedValue(originalError)
    const { error, load } = useApiRequest(request, { errorMessage: 'Could not load data.' })

    await load()

    expect(error.value.message).toBe('Could not load data.')
    expect(error.value.cause).toBe(originalError)
    expect(error.value.status).toBe(503)
  })

  test('uses the default message when an Error is rejected', async () => {
    const originalError = new Error('Server unavailable')
    const request = vi.fn().mockRejectedValue(originalError)
    const { error, load } = useApiRequest(request)

    await load()

    expect(error.value.message).toBe('No se pudo completar la solicitud.')
  })

  test('normalizes a rejected non-Error value', async () => {
    const request = vi.fn().mockRejectedValue('network failure')
    const { error, load } = useApiRequest(request, { errorMessage: 'Could not load data.' })

    await load()

    expect(error.value).toBeInstanceOf(Error)
    expect(error.value.message).toBe('Could not load data.')
  })

  test('clears the previous error when a new load starts', async () => {
    const nextRequest = createControlledPromise()
    const request = vi
      .fn()
      .mockRejectedValueOnce(new Error('First request failed'))
      .mockReturnValueOnce(nextRequest.promise)
    const { error, load } = useApiRequest(request)
    await load()

    const nextLoadPromise = load()

    expect(error.value).toBe(null)

    nextRequest.resolve('recovered result')
    await nextLoadPromise
  })

  test('keeps data from the latest request when an older request resolves last', async () => {
    const firstRequest = createControlledPromise()
    const secondRequest = createControlledPromise()
    const request = vi
      .fn()
      .mockReturnValueOnce(firstRequest.promise)
      .mockReturnValueOnce(secondRequest.promise)
    const { data, load } = useApiRequest(request)
    const firstLoadPromise = load()
    const secondLoadPromise = load()

    secondRequest.resolve('second result')
    await secondLoadPromise
    firstRequest.resolve('first result')
    await firstLoadPromise

    expect(data.value).toBe('second result')
  })

  test('stays loading when an older request resolves before the latest request', async () => {
    const firstRequest = createControlledPromise()
    const secondRequest = createControlledPromise()
    const request = vi
      .fn()
      .mockReturnValueOnce(firstRequest.promise)
      .mockReturnValueOnce(secondRequest.promise)
    const { isLoading, load } = useApiRequest(request)
    const firstLoadPromise = load()
    const secondLoadPromise = load()

    try {
      firstRequest.resolve('first result')
      await firstLoadPromise

      expect(isLoading.value).toBe(true)
    } finally {
      secondRequest.resolve('second result')
      await secondLoadPromise
    }
  })

  test('ignores an older request error after the latest request succeeds', async () => {
    const firstRequest = createControlledPromise()
    const secondRequest = createControlledPromise()
    const request = vi
      .fn()
      .mockReturnValueOnce(firstRequest.promise)
      .mockReturnValueOnce(secondRequest.promise)
    const { error, load } = useApiRequest(request)
    const firstLoadPromise = load()
    const secondLoadPromise = load()

    secondRequest.resolve('second result')
    await secondLoadPromise
    firstRequest.reject(new Error('First request failed'))
    await firstLoadPromise

    expect(error.value).toBe(null)
  })

  test('prevents external writes to data', () => {
    const request = vi.fn()
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { data } = useApiRequest(request, { initialData: 'internal result' })

    try {
      data.value = 'external result'

      expect(data.value).toBe('internal result')
      expect(warnSpy).toHaveBeenCalled()
    } finally {
      warnSpy.mockRestore()
    }
  })
})
