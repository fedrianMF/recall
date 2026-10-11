import { mount } from '@vue/test-utils'
import { describe, expect, test } from 'vitest'

import SummaryErrorPanel from '@/components/summary/SummaryErrorPanel.vue'

describe('SummaryErrorPanel', () => {
  test('is announced as an alert', () => {
    const wrapper = mount(SummaryErrorPanel, { props: { message: 'Algo falló.' } })

    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
  })

  test('shows the message it receives', () => {
    const wrapper = mount(SummaryErrorPanel, { props: { message: 'Algo falló.' } })

    expect(wrapper.get('[role="alert"]').text()).toContain('Algo falló.')
  })

  test('emits retry when the retry button is clicked', async () => {
    const wrapper = mount(SummaryErrorPanel, { props: { message: 'Algo falló.' } })

    await wrapper.get('button').trigger('click')

    expect(wrapper.get('button').text()).toBe('Reintentar')
    expect(wrapper.emitted('retry')).toHaveLength(1)
  })

  test('does not emit retry before the button is clicked', () => {
    const wrapper = mount(SummaryErrorPanel, { props: { message: 'Algo falló.' } })

    expect(wrapper.emitted('retry')).toBeUndefined()
  })
})
