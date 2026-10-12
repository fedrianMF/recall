import { mount } from '@vue/test-utils'
import { describe, expect, test } from 'vitest'

import WinLossBar from '@/components/summary/WinLossBar.vue'

function mountBar(props = {}) {
  return mount(WinLossBar, { props: { label: 'Barra de prueba', ...props } })
}

describe('WinLossBar', () => {
  test('paints the win segment with the share of wins', () => {
    const wrapper = mountBar({ wins: 1, total: 4 })

    const winSegments = wrapper.get('[role="img"]').findAll('span[style]')

    expect(winSegments).toHaveLength(1)
    expect(winSegments[0].attributes('style')).toContain('width: 25%')
  })

  test('draws two segments when there are games', () => {
    const wrapper = mountBar({ wins: 1, total: 4 })

    expect(wrapper.get('[role="img"]').findAll('span')).toHaveLength(2)
  })

  test('fills the win segment completely when every game is a win', () => {
    const wrapper = mountBar({ wins: 4, total: 4 })

    expect(wrapper.get('span[style]').attributes('style')).toContain('width: 100%')
  })

  test('gives the win segment no width when there are no wins', () => {
    const wrapper = mountBar({ wins: 0, total: 4 })

    expect(wrapper.get('span[style]').attributes('style')).toContain('width: 0%')
  })

  test('draws a single neutral segment when total is 0', () => {
    const wrapper = mountBar({ wins: 0, total: 0 })

    const bar = wrapper.get('[role="img"]')

    expect(bar.findAll('span')).toHaveLength(1)
    expect(bar.findAll('span[style]')).toHaveLength(0)
  })

  test.each([
    ['null', null],
    ['undefined', undefined],
    ['a string', 'x'],
  ])('draws a single neutral segment without NaN when total is %s', (_name, total) => {
    const wrapper = mountBar({ wins: 3, total })

    expect(wrapper.findAll('span')).toHaveLength(1)
    expect(wrapper.findAll('span[style]')).toHaveLength(0)
    expect(wrapper.html()).not.toContain('NaN')
  })

  test('uses the label as the accessible name of the bar', () => {
    const wrapper = mountBar({ wins: 1, total: 4, label: '1 victoria de 4 partidas' })

    expect(wrapper.get('[role="img"]').attributes('aria-label')).toBe('1 victoria de 4 partidas')
  })

  test('hides the inner segments from assistive technology', () => {
    const wrapper = mountBar({ wins: 1, total: 4 })

    const segments = wrapper.get('[role="img"]').findAll('span')

    expect(segments.every((segment) => segment.attributes('aria-hidden') === 'true')).toBe(true)
  })

  test('hides the neutral segment from assistive technology', () => {
    const wrapper = mountBar({ wins: 0, total: 0 })

    expect(wrapper.get('span').attributes('aria-hidden')).toBe('true')
  })

  test('uses a different height class for each size', () => {
    const small = mountBar({ wins: 1, total: 4, size: 'sm' })
    const medium = mountBar({ wins: 1, total: 4, size: 'md' })

    expect(small.get('[role="img"]').classes()).not.toEqual(medium.get('[role="img"]').classes())
  })
})
