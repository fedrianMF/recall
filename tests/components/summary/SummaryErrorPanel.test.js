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

  test('shows the title as a level 2 heading by default', () => {
    const wrapper = mount(SummaryErrorPanel, {
      props: { title: 'Título del error', message: 'Algo falló.' },
    })

    expect(wrapper.get('h2').text()).toBe('Título del error')
    expect(wrapper.find('h3').exists()).toBe(false)
  })

  test('shows the title as a level 3 heading when headingLevel is 3', () => {
    const wrapper = mount(SummaryErrorPanel, {
      props: { title: 'Título del error', message: 'Algo falló.', headingLevel: 3 },
    })

    expect(wrapper.get('h3').text()).toBe('Título del error')
    expect(wrapper.find('h2').exists()).toBe(false)
  })

  test('keeps the alert role and the retry button with a level 3 heading', () => {
    const wrapper = mount(SummaryErrorPanel, {
      props: { message: 'Algo falló.', headingLevel: 3 },
    })

    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
    expect(wrapper.get('button').text()).toBe('Reintentar')
  })
})
