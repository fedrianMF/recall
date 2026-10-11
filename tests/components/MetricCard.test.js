import { mount } from '@vue/test-utils'
import { describe, expect, test } from 'vitest'

import MetricCard from '@/components/MetricCard.vue'

describe('MetricCard', () => {
  test('shows its label and numeric value', () => {
    const wrapper = mount(MetricCard, {
      props: { label: 'KDA', value: 4.5 },
    })

    expect(wrapper.text()).toContain('KDA')
    expect(wrapper.text()).toContain('4.5')
  })

  test.each([
    ['null', null],
    ['absent', undefined],
  ])('shows a dash when the value is %s', (_case, value) => {
    const props = value === undefined ? { label: 'CS' } : { label: 'CS', value }

    const wrapper = mount(MetricCard, { props })

    expect(wrapper.text()).toContain('—')
  })

  test('appends the suffix to a value', () => {
    const wrapper = mount(MetricCard, {
      props: { label: 'Participación', value: 48.5, suffix: '%' },
    })

    expect(wrapper.text()).toContain('48.5%')
  })

  test('shows a text value', () => {
    const wrapper = mount(MetricCard, {
      props: { label: 'K / D / A', value: '7 / 2 / 11' },
    })

    expect(wrapper.text()).toContain('7 / 2 / 11')
  })
})
