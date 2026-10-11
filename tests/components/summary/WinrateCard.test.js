import { mount } from '@vue/test-utils'
import { describe, expect, test } from 'vitest'

import WinrateCard from '@/components/summary/WinrateCard.vue'

describe('WinrateCard', () => {
  test('shows the winrate value', () => {
    const wrapper = mount(WinrateCard, { props: { winrate: 52.4, wins: 55, losses: 50 } })

    expect(wrapper.text()).toContain('52.4')
  })

  test('shows the "above 50%" badge when winrate is 52.4', () => {
    const wrapper = mount(WinrateCard, { props: { winrate: 52.4, wins: 55, losses: 50 } })

    expect(wrapper.text()).toContain('Por encima del 50%')
  })

  test.each([50, 48])('does not show the "above 50%" badge when winrate is %s', (winrate) => {
    const wrapper = mount(WinrateCard, { props: { winrate, wins: 10, losses: 10 } })

    expect(wrapper.text()).not.toContain('Por encima del 50%')
  })

  test('shows a dash and no badge when winrate is null', () => {
    const wrapper = mount(WinrateCard, { props: { winrate: null, wins: 0, losses: 0 } })

    expect(wrapper.text()).toContain('—')
    expect(wrapper.text()).not.toContain('Por encima del 50%')
  })

  test('shows the wins and losses legend', () => {
    const wrapper = mount(WinrateCard, { props: { winrate: 52.4, wins: 55, losses: 50 } })

    const legend = wrapper.get('ul').text()

    expect(legend).toContain('Victorias')
    expect(legend).toContain('Derrotas')
  })

  test('passes wins and losses to the ring accessible label', () => {
    const wrapper = mount(WinrateCard, { props: { winrate: 52.4, wins: 55, losses: 50 } })

    const label = wrapper.get('[role="img"]').attributes('aria-label')

    expect(label).toBe('Winrate 52.4%: 55 victorias y 50 derrotas')
  })
})
