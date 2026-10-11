import { mount } from '@vue/test-utils'
import { describe, expect, test } from 'vitest'

import PerformanceMetricCard from '@/components/summary/PerformanceMetricCard.vue'

describe('PerformanceMetricCard', () => {
  test('shows the label, value and caption', () => {
    const wrapper = mount(PerformanceMetricCard, {
      props: { label: 'KDA', value: '2.8', caption: '(K + A) / muertes' },
    })

    const text = wrapper.text()

    expect(text).toContain('KDA')
    expect(text).toContain('2.8')
    expect(text).toContain('(K + A) / muertes')
  })

  test('has no progress bar when progress is not given', () => {
    const wrapper = mount(PerformanceMetricCard, { props: { label: 'KDA', value: '2.8' } })

    expect(wrapper.find('[role="img"]').exists()).toBe(false)
  })

  test('shows a progress bar whose label combines label and value', () => {
    const wrapper = mount(PerformanceMetricCard, {
      props: { label: 'Participación', value: '48.5%', progress: 48.5 },
    })

    const bar = wrapper.get('[role="img"]')

    expect(bar.attributes('aria-label')).toBe('Participación 48.5%')
  })

  test('shows the progress bar even when progress is 0', () => {
    const wrapper = mount(PerformanceMetricCard, {
      props: { label: 'Participación', value: '0%', progress: 0 },
    })

    expect(wrapper.find('[role="img"]').exists()).toBe(true)
  })

  test('does not render a caption when none is given', () => {
    const wrapper = mount(PerformanceMetricCard, { props: { label: 'KDA', value: '2.8' } })

    expect(wrapper.findAll('dd')).toHaveLength(1)
  })
})
