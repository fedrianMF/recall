import { afterEach, describe, expect, test, vi } from 'vitest'

vi.mock('@/api/recall', () => ({ getAccounts: vi.fn() }))

import { getAccounts } from '@/api/recall'
import { clearAccounts, useAccounts } from '@/composables/useAccounts'

afterEach(() => {
  clearAccounts()
  vi.clearAllMocks()
})

describe('useAccounts', () => {
  test('loads and shares accounts', async () => {
    getAccounts.mockResolvedValue({
      data: [{ id: 1, game_name: 'Demo', tag_line: 'LAN', platform: 'la1' }],
    })
    const first = useAccounts()
    const second = useAccounts()
    await first.load()
    expect(second.accounts.value).toHaveLength(1)
    expect(first.hasLoaded.value).toBe(true)
  })

  test('adds a linked account once', () => {
    const { add, accounts } = useAccounts()
    add({ id: 1, platform: 'la1' })
    add({ id: 1, platform: 'la1' })
    expect(accounts.value).toHaveLength(1)
  })
})
