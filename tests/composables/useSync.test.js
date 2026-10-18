import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, test, vi } from 'vitest'

vi.mock('@/api/recall', () => ({
  getLatestSync: vi.fn(),
  startSync: vi.fn(),
}))

vi.mock('@/composables/useSession', async () => {
  const { ref } = await import('vue')
  const user = ref({ id: 1 })
  return { useSession: () => ({ user }) }
})

import { getLatestSync } from '@/api/recall'
import { clearSyncState, useSync } from '@/composables/useSync'

const TestComponent = {
  setup() {
    return useSync()
  },
  template: '<div />',
}

afterEach(() => {
  clearSyncState()
  vi.clearAllMocks()
  vi.useRealTimers()
})

describe('useSync shared lifecycle', () => {
  test('loads latest once across multiple mounted consumers and survives one unmount', async () => {
    vi.useFakeTimers()
    getLatestSync.mockResolvedValue({ data: { id: 1, status: 'running', new_matches: 0 } })

    const first = mount(TestComponent)
    const second = mount(TestComponent)
    const third = mount(TestComponent)
    await flushPromises()

    expect(getLatestSync).toHaveBeenCalledTimes(2)

    first.unmount()
    vi.advanceTimersByTime(3000)
    await flushPromises()

    expect(getLatestSync).toHaveBeenCalledTimes(3)
    second.unmount()
    third.unmount()
  })
})
