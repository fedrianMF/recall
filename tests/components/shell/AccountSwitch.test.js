import { mount } from '@vue/test-utils'
import { describe, expect, test } from 'vitest'

import AccountSwitch from '@/components/shell/AccountSwitch.vue'

const accounts = [{ platform: 'la1' }, { platform: 'la2' }]

function getButton(wrapper, label) {
  return wrapper.findAll('button').find((button) => button.text() === label)
}

describe('AccountSwitch', () => {
  test('emits "la1" when LAN is clicked', async () => {
    const wrapper = mount(AccountSwitch, { props: { modelValue: '', accounts } })

    await getButton(wrapper, 'LAN').trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([['la1']])
  })

  test('emits "la2" when LAS is clicked', async () => {
    const wrapper = mount(AccountSwitch, { props: { modelValue: '', accounts } })

    await getButton(wrapper, 'LAS').trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([['la2']])
  })

  test('emits an empty string when the selected account is clicked again', async () => {
    const wrapper = mount(AccountSwitch, { props: { modelValue: 'la1', accounts } })

    await getButton(wrapper, 'LAN').trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([['']])
  })

  test('emits the other account when a different one is clicked', async () => {
    const wrapper = mount(AccountSwitch, { props: { modelValue: 'la1', accounts } })

    await getButton(wrapper, 'LAS').trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([['la2']])
  })

  test('marks only the selected account as pressed', () => {
    const wrapper = mount(AccountSwitch, { props: { modelValue: 'la2', accounts } })

    expect(getButton(wrapper, 'LAN').attributes('aria-pressed')).toBe('false')
    expect(getButton(wrapper, 'LAS').attributes('aria-pressed')).toBe('true')
  })

  test('marks no account as pressed when modelValue is empty', () => {
    const wrapper = mount(AccountSwitch, { props: { modelValue: '', accounts } })

    expect(getButton(wrapper, 'LAN').attributes('aria-pressed')).toBe('false')
    expect(getButton(wrapper, 'LAS').attributes('aria-pressed')).toBe('false')
  })

  test('updates the pressed state when modelValue changes', async () => {
    const wrapper = mount(AccountSwitch, { props: { modelValue: '', accounts } })

    await wrapper.setProps({ modelValue: 'la1' })

    expect(getButton(wrapper, 'LAN').attributes('aria-pressed')).toBe('true')
  })

  test('is exposed as a labelled group', () => {
    const wrapper = mount(AccountSwitch)

    const group = wrapper.get('[role="group"]')

    expect(group.attributes('aria-label')).toBe('Seleccionar cuenta')
  })
})
