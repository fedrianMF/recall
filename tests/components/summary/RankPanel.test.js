import { mount } from '@vue/test-utils'
import { describe, expect, test } from 'vitest'

import RankPanel from '@/components/summary/RankPanel.vue'

const goldRank = {
  platform: 'la1',
  queue_type: 'RANKED_SOLO_5x5',
  tier: 'GOLD',
  rank: 'II',
  league_points: 45,
  wins: 30,
  losses: 28,
}

// Returns the text of the <dd> that belongs to the <dt> with the given label.
function getDetail(wrapper, term) {
  const termElement = wrapper.findAll('dt').find((dt) => dt.text() === term)

  return termElement.element.nextElementSibling.textContent.trim()
}

const masterRank = { ...goldRank, tier: 'MASTER', rank: 'I', league_points: 312 }

describe('RankPanel', () => {
  test('shows the tier and division of the rank', () => {
    const wrapper = mount(RankPanel, { props: { rank: goldRank } })

    expect(wrapper.text()).toContain('Gold II')
  })

  test('shows the league points out of 100', () => {
    const wrapper = mount(RankPanel, { props: { rank: goldRank } })

    expect(wrapper.text()).toMatch(/45\s*\/ 100 LP/)
  })

  test('describes the league points in the progress bar accessible label', () => {
    const wrapper = mount(RankPanel, { props: { rank: goldRank } })

    const label = wrapper.get('[role="img"]').attributes('aria-label')

    expect(label).toBe('45 de 100 LP')
  })

  test('lists the platform and queue in a description list', () => {
    const wrapper = mount(RankPanel, { props: { rank: goldRank } })

    expect(wrapper.find('dl').exists()).toBe(true)
    expect(getDetail(wrapper, 'Plataforma')).toBe('LAN')
    expect(getDetail(wrapper, 'Cola')).toBe('Solo/Dúo')
  })

  test('lists the tier and division in the description list', () => {
    const wrapper = mount(RankPanel, { props: { rank: goldRank } })

    expect(getDetail(wrapper, 'Liga')).toBe('GOLD')
    expect(getDetail(wrapper, 'División')).toBe('II')
  })

  test('shows the league points of an apex tier without "/ 100"', () => {
    const wrapper = mount(RankPanel, { props: { rank: masterRank } })

    const text = wrapper.text()

    expect(text).toMatch(/312\s*LP/)
    expect(text).not.toContain('/ 100')
  })

  test('shows no progress bar for an apex tier', () => {
    const wrapper = mount(RankPanel, { props: { rank: masterRank } })

    expect(wrapper.find('[role="img"]').exists()).toBe(false)
  })

  test('keeps the progress bar and "/ 100 LP" for a non-apex tier', () => {
    const wrapper = mount(RankPanel, { props: { rank: goldRank } })

    expect(wrapper.find('[role="img"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('/ 100')
  })

  test('shows "Sin rango" when rank is null', () => {
    const wrapper = mount(RankPanel, { props: { rank: null } })

    expect(wrapper.text()).toContain('Sin rango')
  })

  test('shows no details list and no progress bar when rank is null', () => {
    const wrapper = mount(RankPanel, { props: { rank: null } })

    expect(wrapper.find('dl').exists()).toBe(false)
    expect(wrapper.find('[role="img"]').exists()).toBe(false)
  })

  test('shows "Sin rango" when no rank prop is given', () => {
    const wrapper = mount(RankPanel)

    expect(wrapper.text()).toContain('Sin rango')
  })
})
