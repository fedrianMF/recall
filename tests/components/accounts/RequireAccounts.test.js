import { flushPromises, mount } from '@vue/test-utils'
import { ref } from 'vue'
import { describe, expect, test, vi } from 'vitest'

const state = {
  accounts: ref([]),
  isLoading: ref(false),
  error: ref(null),
  hasLoaded: ref(false),
  load: vi.fn().mockResolvedValue(undefined),
}

vi.mock('@/composables/useAccounts', () => ({ useAccounts: () => state }))

import RequireAccounts from '@/components/accounts/RequireAccounts.vue'

describe('RequireAccounts', () => {
  test('keeps the skeleton until the first account load completes', async () => {
    const wrapper = mount(RequireAccounts, { slots: { default: '<p>Contenido protegido</p>' } })
    await flushPromises()

    expect(wrapper.get('[role="status"]').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('Aún no tienes cuentas vinculadas')
  })
})
