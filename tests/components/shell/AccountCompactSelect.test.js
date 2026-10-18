import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { ref } from 'vue'

import AccountCompactSelect from '@/components/shell/AccountCompactSelect.vue'
import { useAccount } from '@/composables/useAccount'

vi.mock('@/composables/useAccounts', () => ({
  useAccounts: () => ({ accounts: ref([{ platform: 'la1' }, { platform: 'la2' }]) }),
}))

const { account, setAccount } = useAccount()

describe('AccountCompactSelect', () => {
  // useAccount keeps its state at module level, so it is shared by every test.
  beforeEach(() => {
    setAccount('')
  })

  test('offers both accounts and "Ambas"', () => {
    const wrapper = mount(AccountCompactSelect)

    const options = wrapper.findAll('option').map((option) => option.text())

    expect(options).toEqual(['Ambas', 'LAN', 'LAS'])
  })

  test('is labelled "Cuenta" for assistive technologies', () => {
    const wrapper = mount(AccountCompactSelect)

    expect(wrapper.get('label').text()).toContain('Cuenta')
  })

  test('selects the current global account', () => {
    setAccount('la2')

    const wrapper = mount(AccountCompactSelect)

    expect(wrapper.get('select').element.value).toBe('la2')
  })

  test('updates the global account when the user picks LAN', async () => {
    const wrapper = mount(AccountCompactSelect)

    await wrapper.get('select').setValue('la1')

    expect(account.value).toBe('la1')
  })

  test('sets the global account back to empty when the user picks "Ambas"', async () => {
    setAccount('la1')
    const wrapper = mount(AccountCompactSelect)

    await wrapper.get('select').setValue('')

    expect(account.value).toBe('')
  })

  test('reflects an account changed from somewhere else', async () => {
    const wrapper = mount(AccountCompactSelect)

    setAccount('la1')
    await nextTick()

    expect(wrapper.get('select').element.value).toBe('la1')
  })
})
