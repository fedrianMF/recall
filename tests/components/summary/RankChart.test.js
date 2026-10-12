import { mount } from '@vue/test-utils'
import { describe, expect, test } from 'vitest'

import rankHistoryMock from '@/api/mocks/rankHistory'
import RankChart from '@/components/summary/RankChart.vue'

function buildHistory() {
  return [
    {
      taken_at: '2026-01-01T00:00:00Z',
      tier: 'SILVER',
      rank: 'II',
      league_points: 50,
      wins: 10,
      losses: 8,
    },
    {
      taken_at: '2026-01-11T00:00:00Z',
      tier: 'GOLD',
      rank: 'IV',
      league_points: 50,
      wins: 14,
      losses: 9,
    },
  ]
}

function mountChart(history) {
  return mount(RankChart, { props: { history } })
}

// Texts of the innermost elements (no children) of a container, in DOM order.
// It does not matter if the labels are <span>, <p> or <li>: each one is a leaf.
function getLeafTexts(wrapper, selector) {
  return wrapper
    .findAll(`${selector} *`)
    .filter((element) => element.element.children.length === 0)
    .map((element) => element.text())
}

function buildRoundingHistory() {
  return [
    {
      taken_at: '2026-01-01T00:00:00Z',
      tier: 'SILVER',
      rank: 'II',
      league_points: 50,
      wins: 10,
      losses: 8,
    },
    {
      taken_at: '2026-01-11T00:00:00Z',
      tier: 'SILVER',
      rank: 'II',
      league_points: 80,
      wins: 12,
      losses: 9,
    },
    {
      taken_at: '2026-01-31T00:00:00Z',
      tier: 'GOLD',
      rank: 'IV',
      league_points: 50,
      wins: 14,
      losses: 9,
    },
  ]
}

function getDataRows(wrapper) {
  return wrapper.findAll('tr').slice(1)
}

describe('RankChart', () => {
  test('describes the chart with a visible caption', () => {
    const wrapper = mountChart(buildHistory())

    expect(wrapper.get('figure figcaption').text()).toBe(
      'Evolución del rango: de Silver II 50 LP a Gold IV 50 LP en 10 días. Subió 200 LP.',
    )
  })

  test('draws an svg with the 400x200 view box as an image', () => {
    const wrapper = mountChart(buildHistory())

    const svg = wrapper.get('figure svg')

    expect(svg.attributes('viewBox')).toBe('0 0 400 200')
    expect(svg.attributes('role')).toBe('img')
  })

  test('labels the svg with the id of the caption and nothing else', () => {
    const wrapper = mountChart(buildHistory())

    const svg = wrapper.get('svg')
    const captionId = wrapper.get('figcaption').attributes('id')

    expect(captionId).toBeTruthy()
    expect(svg.attributes('aria-labelledby')).toBe(captionId)
    expect(svg.attributes('aria-label')).toBeUndefined()
  })

  test('draws the line with the path of the chart', () => {
    const wrapper = mountChart(buildHistory())

    expect(wrapper.get('svg path').attributes('d')).toBe('M12 158.67 L388 41.33')
  })

  test('marks the first point with a circle', () => {
    const wrapper = mountChart(buildHistory())

    const circles = wrapper.findAll('svg circle')

    expect(
      circles.some((c) => c.attributes('cx') === '12' && c.attributes('cy') === '158.67'),
    ).toBe(true)
  })

  test('marks the last point with a circle', () => {
    const wrapper = mountChart(buildHistory())

    const circles = wrapper.findAll('svg circle')

    expect(
      circles.some((c) => c.attributes('cx') === '388' && c.attributes('cy') === '41.33'),
    ).toBe(true)
  })

  test('shows the rank ticks of the Y axis as HTML text, in order', () => {
    const wrapper = mountChart(buildHistory())

    const ticks = getLeafTexts(wrapper, '[data-axis-y]')

    expect(ticks).toEqual(['Silver II', 'Silver I', 'Gold IV', 'Gold III'])
  })

  test('hides the Y axis labels from assistive technology', () => {
    const wrapper = mountChart(buildHistory())

    expect(wrapper.get('[data-axis-y]').attributes('aria-hidden')).toBe('true')
  })

  test('shows the dates of the first and last points on the X axis as HTML text', () => {
    const wrapper = mountChart(buildHistory())

    const dates = getLeafTexts(wrapper, '[data-axis-x]')

    expect(dates).toEqual(['1 ene', '11 ene'])
  })

  test('hides the X axis labels from assistive technology', () => {
    const wrapper = mountChart(buildHistory())

    expect(wrapper.get('[data-axis-x]').attributes('aria-hidden')).toBe('true')
  })

  test('shows a single direct label with the last value outside the svg', () => {
    const wrapper = mountChart(buildHistory())

    const labels = wrapper.findAll('[data-end-label]')

    expect(labels).toHaveLength(1)
    expect(labels[0].text()).toBe('Gold IV 50 LP')
    expect(wrapper.get('[data-plot]').find('[data-end-label]').exists()).toBe(true)
    expect(wrapper.get('svg').find('[data-end-label]').exists()).toBe(false)
  })

  test('keeps every text out of the svg so it does not shrink with the container', () => {
    const wrapper = mountChart(buildHistory())

    expect(wrapper.findAll('svg text')).toHaveLength(0)
  })

  test('puts the svg inside the plot container', () => {
    const wrapper = mountChart(buildHistory())

    expect(wrapper.get('[data-plot]').find('svg').exists()).toBe(true)
  })

  test('puts a table with the data inside a details element', () => {
    const wrapper = mountChart(buildHistory())

    expect(wrapper.get('details summary').text()).toBe('Ver datos en tabla')
    expect(wrapper.find('details table').exists()).toBe(true)
  })

  test('shows the table column headers', () => {
    const wrapper = mountChart(buildHistory())

    // Row headers (scope="row") also are <th>, so only the column headers are selected.
    const headers = wrapper.findAll('th[scope="col"]').map((th) => th.text())

    expect(headers).toEqual(['Fecha', 'Rango', 'LP', 'Victorias', 'Derrotas'])
  })

  test('shows one table row per measurement', () => {
    const wrapper = mountChart(buildHistory())

    expect(getDataRows(wrapper)).toHaveLength(2)
  })

  test('fills the first table row with the first measurement', () => {
    const wrapper = mountChart(buildHistory())

    const cells = getDataRows(wrapper)[0]
      .findAll('td, th')
      .map((cell) => cell.text())

    expect(cells).toEqual(['1 ene', 'Silver II', '50', '10', '8'])
  })

  test('captions the table and makes the date cell a row header', () => {
    const wrapper = mountChart(buildHistory())

    const firstRowHeader = getDataRows(wrapper)[0].get('th')

    expect(wrapper.get('table caption').text()).toBe('Mediciones del rango')
    expect(firstRowHeader.attributes('scope')).toBe('row')
    expect(firstRowHeader.text()).toBe('1 ene')
    expect(getDataRows(wrapper)[0].findAll('td')).toHaveLength(4)
  })

  test('makes the scrollable table container a focusable labelled region', () => {
    const wrapper = mountChart(buildHistory())

    const region = wrapper.get('details [role="region"]')

    expect(region.attributes('aria-label')).toBe('Tabla de mediciones del rango')
    expect(region.attributes('tabindex')).toBe('0')
    expect(region.find('table').exists()).toBe(true)
  })

  test('renders one hover area per measurement', () => {
    const wrapper = mountChart(buildHistory())

    expect(wrapper.findAll('[data-point]')).toHaveLength(2)
  })

  test('shows no tooltip before hovering', () => {
    const wrapper = mountChart(buildHistory())

    expect(wrapper.find('[role="tooltip"]').exists()).toBe(false)
  })

  test('shows a tooltip with the date and rank of the hovered point', async () => {
    const wrapper = mountChart(buildHistory())

    await wrapper.findAll('[data-point]')[1].trigger('mouseenter')

    const tooltip = wrapper.get('[role="tooltip"]')
    expect(tooltip.text()).toContain('11 ene')
    expect(tooltip.text()).toContain('Gold IV 50 LP')
  })

  test('hides the tooltip when the pointer leaves the point', async () => {
    const wrapper = mountChart(buildHistory())
    const point = wrapper.findAll('[data-point]')[1]
    await point.trigger('mouseenter')

    await point.trigger('mouseleave')

    expect(wrapper.find('[role="tooltip"]').exists()).toBe(false)
  })

  test('renders nothing with a single valid measurement', () => {
    const wrapper = mountChart([buildHistory()[0]])

    expect(wrapper.find('svg').exists()).toBe(false)
    expect(wrapper.find('figure').exists()).toBe(false)
  })

  test('renders nothing with an empty history', () => {
    const wrapper = mountChart([])

    expect(wrapper.find('svg').exists()).toBe(false)
    expect(wrapper.find('figure').exists()).toBe(false)
  })

  test('renders nothing when the only other measurement has an unknown tier', () => {
    const unknown = { ...buildHistory()[1], tier: 'WOOD' }
    const wrapper = mountChart([buildHistory()[0], unknown])

    expect(wrapper.find('svg').exists()).toBe(false)
    expect(wrapper.find('figure').exists()).toBe(false)
  })

  test('draws an unsorted history the same as a sorted one', () => {
    const sorted = mountChart(buildHistory())
    const unsorted = mountChart([...buildHistory()].reverse())

    expect(unsorted.get('svg path').attributes('d')).toBe(sorted.get('svg path').attributes('d'))
    expect(getDataRows(unsorted).map((row) => row.text())).toEqual(
      getDataRows(sorted).map((row) => row.text()),
    )
  })

  test('does not modify the history prop', () => {
    const history = [...buildHistory()].reverse()
    const expected = structuredClone(history)

    mountChart(history)

    expect(history).toEqual(expected)
  })

  test('renders a hover area and a table row for every measurement of the mock', () => {
    const wrapper = mountChart(rankHistoryMock.data)

    expect(wrapper.findAll('[data-point]')).toHaveLength(12)
    expect(getDataRows(wrapper)).toHaveLength(12)
  })

  test('places the tooltip inside the plot container, not in the caption or the table', async () => {
    const wrapper = mountChart(buildHistory())

    await wrapper.findAll('[data-point]')[1].trigger('mouseenter')

    expect(wrapper.get('[data-plot]').find('[role="tooltip"]').exists()).toBe(true)
    expect(wrapper.get('figcaption').find('[role="tooltip"]').exists()).toBe(false)
    expect(wrapper.get('details').find('[role="tooltip"]').exists()).toBe(false)
  })

  test('aligns the tooltip to the start for a point near the left edge', async () => {
    const wrapper = mountChart(buildHistory())

    await wrapper.findAll('[data-point]')[0].trigger('mouseenter')

    expect(wrapper.get('[role="tooltip"]').attributes('data-align')).toBe('start')
  })

  test('aligns the tooltip to the end for a point near the right edge', async () => {
    const wrapper = mountChart(buildHistory())

    await wrapper.findAll('[data-point]')[1].trigger('mouseenter')

    expect(wrapper.get('[role="tooltip"]').attributes('data-align')).toBe('end')
  })

  test('centers the tooltip for a point in the middle of the chart', async () => {
    const wrapper = mountChart(buildRoundingHistory())

    await wrapper.findAll('[data-point]')[1].trigger('mouseenter')

    expect(wrapper.get('[role="tooltip"]').attributes('data-align')).toBe('center')
  })

  test('rounds the coordinates of a middle point to two decimals', () => {
    const wrapper = mountChart(buildRoundingHistory())

    const middle = wrapper.findAll('[data-point]')[1]

    expect(middle.attributes('cx')).toBe('137.33')
    expect(middle.attributes('cy')).toBe('141.07')
    expect(wrapper.get('svg path').attributes('d')).toBe('M12 158.67 L137.33 141.07 L388 41.33')
  })
})
