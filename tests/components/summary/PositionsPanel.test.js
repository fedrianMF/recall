import { mount } from '@vue/test-utils'
import { describe, expect, test } from 'vitest'

import PositionsPanel from '@/components/summary/PositionsPanel.vue'

function buildPositions() {
  return [
    {
      position: 'TOP',
      games: 18,
      wins: 10,
      winrate: 55.6,
      kda: 2.4,
      cs_per_min: 6.8,
      damage_per_min: 512.3,
      kill_participation: 43.7,
    },
    {
      position: 'JUNGLE',
      games: 26,
      wins: 15,
      winrate: 57.7,
      kda: 3.1,
      cs_per_min: 5.9,
      damage_per_min: 476.8,
      kill_participation: 61.2,
    },
    {
      position: 'UTILITY',
      games: 5,
      wins: 2,
      winrate: 40,
      kda: 1.9,
      cs_per_min: 1.2,
      damage_per_min: 210.4,
      kill_participation: null,
    },
  ]
}

function mountPanel(props = {}) {
  return mount(PositionsPanel, { props })
}

describe('PositionsPanel', () => {
  test('shows the panel title as a level 2 heading', () => {
    const wrapper = mountPanel({ positions: buildPositions() })

    expect(wrapper.get('h2').text()).toBe('Rendimiento por posición')
  })

  test('lists one row per position', () => {
    const wrapper = mountPanel({ positions: buildPositions() })

    expect(wrapper.findAll('ul li')).toHaveLength(3)
  })

  test('orders the rows by games, most played first', () => {
    const wrapper = mountPanel({ positions: buildPositions() })

    const rows = wrapper.findAll('li')

    expect(rows[0].text()).toContain('Jungla')
    expect(rows[1].text()).toContain('Superior')
    expect(rows[2].text()).toContain('Soporte')
  })

  test('does not reorder the positions prop it receives', () => {
    const positions = buildPositions()
    const expected = buildPositions()

    mountPanel({ positions })

    expect(positions).toEqual(expected)
  })

  test('shows the games count of a row', () => {
    const wrapper = mountPanel({ positions: buildPositions() })

    expect(wrapper.findAll('li')[0].text()).toContain('26 partidas')
  })

  test('uses the singular "1 partida" for a single game', () => {
    const positions = [{ ...buildPositions()[0], games: 1, wins: 1, winrate: 100 }]
    const wrapper = mountPanel({ positions })

    expect(wrapper.get('li').text()).toMatch(/1 partida(?!s)/)
  })

  test('shows the winrate with a percent sign', () => {
    const wrapper = mountPanel({ positions: buildPositions() })

    expect(wrapper.findAll('li')[1].text()).toContain('55.6%')
  })

  test('shows the KDA of a row', () => {
    const wrapper = mountPanel({ positions: buildPositions() })

    expect(wrapper.findAll('li')[0].text()).toContain('KDA 3.1')
  })

  test('describes each bar with the position label', () => {
    const wrapper = mountPanel({ positions: buildPositions() })

    const labels = wrapper.findAll('li [role="img"]').map((bar) => bar.attributes('aria-label'))

    expect(labels).toEqual([
      'Jungla: 26 partidas, 57.7% de victorias',
      'Superior: 18 partidas, 55.6% de victorias',
      'Soporte: 5 partidas, 40% de victorias',
    ])
  })

  test('shows the empty message when there are no positions', () => {
    const wrapper = mountPanel({ positions: [] })

    expect(wrapper.text()).toContain('Aún no hay partidas con posición registrada.')
    expect(wrapper.find('ul').exists()).toBe(false)
  })

  test('shows the empty message when no positions prop is given', () => {
    const wrapper = mountPanel()

    expect(wrapper.text()).toContain('Aún no hay partidas con posición registrada.')
  })

  test('shows a loading status and no list while loading without data', () => {
    const wrapper = mountPanel({ positions: [], isLoading: true })

    expect(wrapper.get('[role="status"]').text()).toContain('Cargando posiciones…')
    expect(wrapper.find('ul').exists()).toBe(false)
  })

  test('does not show the empty message while loading without data', () => {
    const wrapper = mountPanel({ positions: [], isLoading: true })

    expect(wrapper.text()).not.toContain('Aún no hay partidas con posición registrada.')
  })

  test('keeps showing the data while reloading', () => {
    const wrapper = mountPanel({ positions: buildPositions(), isLoading: true })

    expect(wrapper.findAll('li')).toHaveLength(3)
    expect(wrapper.find('[role="status"]').exists()).toBe(false)
  })

  test('shows the error message in an alert when there is no data', () => {
    const wrapper = mountPanel({ positions: [], error: new Error('No se pudo cargar.') })

    expect(wrapper.get('[role="alert"]').text()).toContain('No se pudo cargar.')
    expect(wrapper.find('ul').exists()).toBe(false)
  })

  test('prefers the error over the loading state when there is no data', () => {
    const wrapper = mountPanel({
      positions: [],
      isLoading: true,
      error: new Error('No se pudo cargar.'),
    })

    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
    expect(wrapper.find('[role="status"]').exists()).toBe(false)
  })

  test('emits retry once when the retry button is clicked', async () => {
    const wrapper = mountPanel({ positions: [], error: new Error('No se pudo cargar.') })

    await wrapper.get('button').trigger('click')

    expect(wrapper.get('button').text()).toBe('Reintentar')
    expect(wrapper.emitted('retry')).toHaveLength(1)
  })

  test('does not emit retry before the button is clicked', () => {
    const wrapper = mountPanel({ positions: [], error: new Error('No se pudo cargar.') })

    expect(wrapper.emitted('retry')).toBeUndefined()
  })

  test('shows both the data and the alert when there is data and an error', () => {
    const wrapper = mountPanel({
      positions: buildPositions(),
      error: new Error('No se pudo actualizar.'),
    })

    expect(wrapper.findAll('li')).toHaveLength(3)
    expect(wrapper.get('[role="alert"]').text()).toContain('No se pudo actualizar.')
  })

  test('places the alert above the data', () => {
    const wrapper = mountPanel({
      positions: buildPositions(),
      error: new Error('No se pudo actualizar.'),
    })

    const alert = wrapper.get('[role="alert"]').element
    const list = wrapper.get('ul').element

    // DOCUMENT_POSITION_FOLLOWING (4): the list comes after the alert.
    expect(alert.compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  test('shows the inner error title as a level 3 heading under the level 2 panel title', () => {
    const wrapper = mountPanel({ positions: [], error: new Error('No se pudo cargar.') })

    expect(wrapper.findAll('h2')).toHaveLength(1)
    expect(wrapper.get('h2').text()).toBe('Rendimiento por posición')
    expect(wrapper.get('h3').text()).toBe('No se pudieron cargar las posiciones')
  })

  test('shows the visible count of wins and losses of a row', () => {
    const wrapper = mountPanel({ positions: buildPositions() })

    const text = wrapper.findAll('li')[1].text()

    expect(text).toContain('✓ 10 V')
    expect(text).toContain('✕ 8 D')
  })

  test('shows neither NaN nor Infinity for a position with no games', () => {
    const positions = [{ ...buildPositions()[0], games: 0, wins: 0, winrate: null, kda: null }]
    const wrapper = mountPanel({ positions })

    const text = wrapper.get('li').text()

    expect(text).not.toContain('NaN')
    expect(text).not.toContain('Infinity')
    expect(text).toContain('✓ 0 V')
    expect(text).toContain('✕ 0 D')
  })

  test('draws a single neutral segment in the bar of a position with no games', () => {
    const positions = [{ ...buildPositions()[0], games: 0, wins: 0, winrate: null, kda: null }]
    const wrapper = mountPanel({ positions })

    const bar = wrapper.get('li [role="img"]')

    expect(bar.findAll('span')).toHaveLength(1)
    expect(bar.findAll('span[style]')).toHaveLength(0)
  })

  test('shows a dash when the KDA is null', () => {
    const positions = [{ ...buildPositions()[0], kda: null }]
    const wrapper = mountPanel({ positions })

    expect(wrapper.get('li').text()).toContain('KDA —')
  })
})
