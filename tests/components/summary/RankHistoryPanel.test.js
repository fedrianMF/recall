import { mount } from '@vue/test-utils'
import { describe, expect, test } from 'vitest'

import rankHistoryMock from '@/api/mocks/rankHistory'
import RankHistoryPanel from '@/components/summary/RankHistoryPanel.vue'

const sufficientHistory = rankHistoryMock.data
const insufficientHistory = [rankHistoryMock.data[0]]

function mountPanel(props = {}) {
  return mount(RankHistoryPanel, { props })
}

describe('RankHistoryPanel', () => {
  test('shows the panel title as a level 2 heading', () => {
    const wrapper = mountPanel({ history: sufficientHistory })

    expect(wrapper.get('h2').text()).toBe('Evolución del rango')
  })

  test('draws the chart when there are enough measurements', () => {
    const wrapper = mountPanel({ history: sufficientHistory })

    expect(wrapper.find('figure svg').exists()).toBe(true)
  })

  test('keeps the chart visible while reloading', () => {
    const wrapper = mountPanel({ history: sufficientHistory, isLoading: true })

    expect(wrapper.find('figure svg').exists()).toBe(true)
    expect(wrapper.find('[role="status"]').exists()).toBe(false)
  })

  test('keeps the chart and shows the alert when there is data and an error', () => {
    const wrapper = mountPanel({
      history: sufficientHistory,
      error: new Error('No se pudo actualizar.'),
    })

    expect(wrapper.find('figure svg').exists()).toBe(true)
    expect(wrapper.get('[role="alert"]').text()).toContain('No se pudo actualizar.')
  })

  test('places the alert above the chart', () => {
    const wrapper = mountPanel({
      history: sufficientHistory,
      error: new Error('No se pudo actualizar.'),
    })

    const alert = wrapper.get('[role="alert"]').element
    const figure = wrapper.get('figure').element

    // DOCUMENT_POSITION_FOLLOWING (4): the figure comes after the alert.
    expect(alert.compareDocumentPosition(figure) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  test('shows the message to pick an account when there is none', () => {
    const wrapper = mountPanel({ history: sufficientHistory, hasAccount: false })

    expect(wrapper.text()).toContain('Elige LAN o LAS para ver la evolución de tu rango.')
  })

  test('shows only the account message without an account, even with data, loading and error', () => {
    const wrapper = mountPanel({
      history: sufficientHistory,
      hasAccount: false,
      isLoading: true,
      error: new Error('Falló.'),
    })

    expect(wrapper.find('svg').exists()).toBe(false)
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.find('[role="status"]').exists()).toBe(false)
  })

  test('assumes there is an account when hasAccount is not given', () => {
    const wrapper = mountPanel({ history: [] })

    expect(wrapper.text()).not.toContain('Elige LAN o LAS')
  })

  test('shows the error message in an alert when there is not enough data', () => {
    const wrapper = mountPanel({ history: [], error: new Error('No se pudo cargar.') })

    expect(wrapper.get('[role="alert"]').text()).toContain('No se pudo cargar.')
    expect(wrapper.find('svg').exists()).toBe(false)
  })

  test('does not show the empty message next to the error alert', () => {
    const wrapper = mountPanel({ history: [], error: new Error('No se pudo cargar.') })

    expect(wrapper.text()).not.toContain('Aún no hay suficientes mediciones')
  })

  test('emits retry once when the retry button is clicked', async () => {
    const wrapper = mountPanel({ history: [], error: new Error('No se pudo cargar.') })

    await wrapper.get('button').trigger('click')

    expect(wrapper.get('button').text()).toBe('Reintentar')
    expect(wrapper.emitted('retry')).toHaveLength(1)
  })

  test('does not emit retry before the button is clicked', () => {
    const wrapper = mountPanel({ history: [], error: new Error('No se pudo cargar.') })

    expect(wrapper.emitted('retry')).toBeUndefined()
  })

  test('prefers the error over the loading state when there is not enough data', () => {
    const wrapper = mountPanel({
      history: [],
      isLoading: true,
      error: new Error('No se pudo cargar.'),
    })

    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
    expect(wrapper.find('[role="status"]').exists()).toBe(false)
  })

  test('shows a loading status while loading without enough data', () => {
    const wrapper = mountPanel({ history: [], isLoading: true })

    expect(wrapper.get('[role="status"]').text()).toContain('Cargando evolución del rango…')
  })

  test('does not show the empty message while loading', () => {
    const wrapper = mountPanel({ history: [], isLoading: true })

    expect(wrapper.text()).not.toContain('Aún no hay suficientes mediciones')
  })

  test('shows the empty message when the history is empty', () => {
    const wrapper = mountPanel({ history: [] })

    expect(wrapper.text()).toContain('Aún no hay suficientes mediciones para dibujar la evolución.')
    expect(wrapper.find('svg').exists()).toBe(false)
  })

  test('shows the empty message with a single valid measurement', () => {
    const wrapper = mountPanel({ history: insufficientHistory })

    expect(wrapper.text()).toContain('Aún no hay suficientes mediciones para dibujar la evolución.')
    expect(wrapper.find('svg').exists()).toBe(false)
  })

  test('shows the empty message when the second measurement has an unknown tier', () => {
    const unknown = { ...rankHistoryMock.data[1], tier: 'WOOD' }
    const wrapper = mountPanel({ history: [rankHistoryMock.data[0], unknown] })

    expect(wrapper.text()).toContain('Aún no hay suficientes mediciones para dibujar la evolución.')
  })

  test('shows the inner error title as a level 3 heading under the level 2 panel title', () => {
    const wrapper = mountPanel({ history: [], error: new Error('No se pudo cargar.') })

    expect(wrapper.findAll('h2')).toHaveLength(1)
    expect(wrapper.get('h2').text()).toBe('Evolución del rango')
    expect(wrapper.get('h3').text()).toBe('No se pudo cargar la evolución del rango')
  })

  test('shows the solo queue under the title when there is an account', () => {
    const wrapper = mountPanel({ history: sufficientHistory, queueType: 'RANKED_SOLO_5x5' })

    expect(wrapper.text()).toContain('Cola: Solo/Dúo')
  })

  test('shows the flex queue under the title when there is an account', () => {
    const wrapper = mountPanel({ history: sufficientHistory, queueType: 'RANKED_FLEX_SR' })

    expect(wrapper.text()).toContain('Cola: Flexible')
  })

  test('does not show the queue without an account', () => {
    const wrapper = mountPanel({
      history: sufficientHistory,
      hasAccount: false,
      queueType: 'RANKED_SOLO_5x5',
    })

    expect(wrapper.text()).not.toContain('Cola:')
  })

  test('does not show the queue when no queue type is given', () => {
    const wrapper = mountPanel({ history: sufficientHistory })

    expect(wrapper.text()).not.toContain('Cola:')
  })
})
