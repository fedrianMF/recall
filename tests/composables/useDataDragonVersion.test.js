import { flushPromises } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { createControlledPromise } from '../helpers/controlledPromise'

const { getDataDragonVersion } = vi.hoisted(() => ({
  getDataDragonVersion: vi.fn(),
}))

vi.mock('@/api/recall', () => ({
  getDataDragonVersion,
}))

async function loadComposable() {
  vi.resetModules()

  return import('@/composables/useDataDragonVersion')
}

describe('useDataDragonVersion', () => {
  beforeEach(() => {
    getDataDragonVersion.mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('starts with a null version and requests it once', async () => {
    getDataDragonVersion.mockReturnValue(createControlledPromise().promise)
    const { useDataDragonVersion } = await loadComposable()

    const { version } = useDataDragonVersion()

    expect(version.value).toBeNull()
    expect(getDataDragonVersion).toHaveBeenCalledTimes(1)
  })

  test('exposes the version when the request resolves', async () => {
    getDataDragonVersion.mockResolvedValue('14.1.1')
    const { useDataDragonVersion } = await loadComposable()

    const { version } = useDataDragonVersion()
    await flushPromises()

    expect(version.value).toBe('14.1.1')
  })

  test('shares one pending request between multiple composable calls', async () => {
    const request = createControlledPromise()
    getDataDragonVersion.mockReturnValue(request.promise)
    const { useDataDragonVersion } = await loadComposable()

    const first = useDataDragonVersion()
    const second = useDataDragonVersion()

    expect(first.version.value).toBeNull()
    expect(second.version.value).toBeNull()
    expect(getDataDragonVersion).toHaveBeenCalledTimes(1)

    request.resolve('14.1.1')
    await flushPromises()

    expect(first.version.value).toBe('14.1.1')
    expect(second.version.value).toBe('14.1.1')
  })

  test('keeps a null version and does not throw when the request fails', async () => {
    getDataDragonVersion.mockRejectedValue(new Error('Data Dragon unavailable'))
    const { useDataDragonVersion } = await loadComposable()

    const { version } = useDataDragonVersion()
    await flushPromises()

    expect(version.value).toBeNull()
  })

  test('exposes the version as readonly', async () => {
    getDataDragonVersion.mockResolvedValue('14.1.1')
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { useDataDragonVersion } = await loadComposable()
    const { version } = useDataDragonVersion()
    await flushPromises()

    version.value = '99.9.9'

    expect(version.value).toBe('14.1.1')
    expect(warnSpy).toHaveBeenCalled()
  })
})
