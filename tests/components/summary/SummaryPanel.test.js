import { mount } from '@vue/test-utils'
import { describe, expect, test } from 'vitest'

import SummaryPanel from '@/components/summary/SummaryPanel.vue'

function mountPanel() {
  return mount(SummaryPanel, {
    props: { title: 'Panel title' },
    slots: { default: '<p>Panel content</p>' },
  })
}

describe('SummaryPanel', () => {
  test('renders a section as the root element', () => {
    const wrapper = mountPanel()

    expect(wrapper.element.tagName).toBe('SECTION')
  })

  test('makes the section a non-interactive focus target with tabindex -1', () => {
    const wrapper = mountPanel()

    expect(wrapper.attributes('tabindex')).toBe('-1')
  })

  test('shows the title as a level 2 heading', () => {
    const wrapper = mountPanel()

    expect(wrapper.get('h2').text()).toBe('Panel title')
  })

  test('renders the slot content', () => {
    const wrapper = mountPanel()

    expect(wrapper.text()).toContain('Panel content')
  })

  test('labels the section with the id of the heading', () => {
    const wrapper = mountPanel()

    const headingId = wrapper.get('h2').attributes('id')
    expect(headingId).toBeTruthy()
    expect(wrapper.attributes('aria-labelledby')).toBe(headingId)
  })
})
