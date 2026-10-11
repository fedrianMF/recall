import { mount } from '@vue/test-utils'
import { describe, expect, test } from 'vitest'

import WinrateRing from '@/components/summary/WinrateRing.vue'

// The first number of "stroke-dasharray" is the visible length of the arc.
function getArcLengths(wrapper) {
  return wrapper
    .findAll('circle[stroke-dasharray]')
    .map((arc) => Number(arc.attributes('stroke-dasharray').split(' ')[0]))
}

describe('WinrateRing', () => {
  test('describes the winrate, wins and losses in the accessible label', () => {
    const wrapper = mount(WinrateRing, { props: { winrate: 52.4, wins: 55, losses: 50 } })

    const label = wrapper.get('svg[role="img"]').attributes('aria-label')

    expect(label).toBe('Winrate 52.4%: 55 victorias y 50 derrotas')
  })

  test('says there is no data in the accessible label when winrate is null', () => {
    const wrapper = mount(WinrateRing, { props: { winrate: null, wins: 0, losses: 0 } })

    const label = wrapper.get('svg[role="img"]').attributes('aria-label')

    expect(label).toBe('Winrate sin datos')
  })

  test('draws two colored arcs when there is a winrate', () => {
    const wrapper = mount(WinrateRing, { props: { winrate: 52.4, wins: 55, losses: 50 } })

    const arcs = wrapper.findAll('circle[stroke-dasharray]')

    expect(arcs).toHaveLength(2)
  })

  test('draws a longer win arc than loss arc when winrate is above 50', () => {
    const wrapper = mount(WinrateRing, { props: { winrate: 52.4, wins: 55, losses: 50 } })

    const [winLength, lossLength] = getArcLengths(wrapper)

    expect(winLength).toBeGreaterThan(lossLength)
  })

  test('draws a shorter win arc than loss arc when winrate is below 50', () => {
    const wrapper = mount(WinrateRing, { props: { winrate: 40, wins: 4, losses: 6 } })

    const [winLength, lossLength] = getArcLengths(wrapper)

    expect(winLength).toBeLessThan(lossLength)
  })

  test('shows wins and losses inside the ring when there is a winrate', () => {
    const wrapper = mount(WinrateRing, { props: { winrate: 52.4, wins: 55, losses: 50 } })

    expect(wrapper.text()).toMatch(/55\s*V/)
    expect(wrapper.text()).toMatch(/50\s*D/)
  })

  test('draws no colored arcs and shows "Sin datos" when winrate is null', () => {
    const wrapper = mount(WinrateRing, { props: { winrate: null, wins: 0, losses: 0 } })

    expect(wrapper.findAll('circle[stroke-dasharray]')).toHaveLength(0)
    expect(wrapper.text()).toContain('Sin datos')
  })

  test('does not show "Sin datos" when there is a winrate', () => {
    const wrapper = mount(WinrateRing, { props: { winrate: 52.4, wins: 55, losses: 50 } })

    expect(wrapper.text()).not.toContain('Sin datos')
  })
})
