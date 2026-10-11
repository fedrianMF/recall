import { mount } from '@vue/test-utils'
import { describe, expect, test } from 'vitest'

import MatchesPanel from '@/components/summary/MatchesPanel.vue'

describe('MatchesPanel', () => {
  test('shows the games, wins and losses numbers next to their labels', () => {
    const wrapper = mount(MatchesPanel, { props: { games: 105, wins: 55, losses: 50 } })

    const text = wrapper.text()

    expect(text).toMatch(/Partidas\s*105/)
    expect(text).toMatch(/Victorias\s+55/)
    expect(text).toMatch(/Derrotas\s+50/)
  })

  test('describes wins out of games in the bar accessible label', () => {
    const wrapper = mount(MatchesPanel, { props: { games: 105, wins: 55, losses: 50 } })

    const label = wrapper.get('[role="img"]').attributes('aria-label')

    expect(label).toBe('55 victorias de 105 partidas')
  })

  test('paints the win segment of the bar with the share of wins', () => {
    const wrapper = mount(MatchesPanel, { props: { games: 4, wins: 1, losses: 3 } })

    const winSegments = wrapper.get('[role="img"]').findAll('span[style]')

    expect(winSegments).toHaveLength(1)
    expect(winSegments[0].attributes('style')).toContain('width: 25%')
  })

  // The component renders a single neutral segment (no inline width) when games is 0.
  test('does not paint a win segment when games is 0', () => {
    const wrapper = mount(MatchesPanel, { props: { games: 0, wins: 0, losses: 0 } })

    const bar = wrapper.get('[role="img"]')

    expect(bar.findAll('span[style]')).toHaveLength(0)
    expect(bar.findAll('span')).toHaveLength(1)
  })

  test('shows dashes when the numbers are missing', () => {
    const wrapper = mount(MatchesPanel)

    expect(wrapper.text()).toMatch(/Partidas\s*—/)
    expect(wrapper.get('[role="img"]').attributes('aria-label')).toBe('— victorias de — partidas')
  })
})
