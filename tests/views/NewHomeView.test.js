import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { getSummary } from '@/api/recall'
import summaryMock from '@/api/mocks/summary'
import { useAccount } from '@/composables/useAccount'
import NewHomeView from '@/views/NewHomeView.vue'

import { createControlledPromise } from '../helpers/controlledPromise'
import { createTestRouter } from '../helpers/createTestRouter'

// vi.mock is hoisted: Vitest moves it above the imports, so when NewHomeView
// imports useSummary -> api/recall, it already receives this fake module.
vi.mock('@/api/recall', () => ({
  getSummary: vi.fn(),
}))

const { setAccount } = useAccount()

let wrapper

async function mountView() {
  const router = await createTestRouter()

  wrapper = mount(NewHomeView, { global: { plugins: [router] } })

  return wrapper
}

function findButton(label) {
  return wrapper.findAll('button').find((button) => button.text() === label)
}

// The page has two role="status" regions while loading (the skeleton and the sr-only one),
// so we find each by its text instead of taking the first one.
function findStatus(text) {
  return wrapper.findAll('[role="status"]').find((status) => status.text() === text)
}

function getHeadings() {
  return wrapper.findAll('h2').map((heading) => heading.text())
}

describe('NewHomeView', () => {
  beforeEach(() => {
    getSummary.mockReset()
    setAccount('')
  })

  afterEach(() => {
    // Unmount so the view stops watching the global account between tests.
    // For wrappers attached to document.body this also removes them from the page.
    wrapper.unmount()
  })

  describe('while the first request is pending', () => {
    test('shows the loading state', async () => {
      getSummary.mockReturnValue(createControlledPromise().promise)

      await mountView()

      expect(findStatus('Cargando resumen…')).toBeDefined()
    })

    test('marks the refresh button as aria-disabled and shows "Actualizando…"', async () => {
      getSummary.mockReturnValue(createControlledPromise().promise)

      await mountView()

      const button = findButton('Actualizando…')
      expect(button).toBeDefined()
      expect(button.attributes('aria-disabled')).toBe('true')
    })

    test('does not show the panels yet', async () => {
      getSummary.mockReturnValue(createControlledPromise().promise)

      await mountView()

      expect(getHeadings()).not.toContain('Winrate')
    })
  })

  describe('with data', () => {
    test('shows the summary panels', async () => {
      getSummary.mockResolvedValue(summaryMock)

      await mountView()
      await flushPromises()

      expect(getHeadings()).toEqual(
        expect.arrayContaining(['Winrate', 'Partidas', 'Rango', 'Rendimiento en partida']),
      )
    })

    test('shows the main rank of the first league', async () => {
      getSummary.mockResolvedValue(summaryMock)

      await mountView()
      await flushPromises()

      expect(wrapper.text()).toContain('Gold II')
    })

    test('passes the summary numbers to the winrate and matches panels', async () => {
      getSummary.mockResolvedValue(summaryMock)

      await mountView()
      await flushPromises()

      const labels = wrapper
        .findAll('[role="img"]')
        .map((element) => element.attributes('aria-label'))
      expect(labels).toContain('Winrate 52.4%: 55 victorias y 50 derrotas')
      expect(labels).toContain('55 victorias de 105 partidas')
    })

    test('hides the loading state and the error', async () => {
      getSummary.mockResolvedValue(summaryMock)

      await mountView()
      await flushPromises()

      expect(findStatus('Cargando resumen…')).toBeUndefined()
      expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    })

    test('enables the refresh button with the text "Actualizar"', async () => {
      getSummary.mockResolvedValue(summaryMock)

      await mountView()
      await flushPromises()

      const button = findButton('Actualizar')
      expect(button).toBeDefined()
      expect(button.attributes('aria-disabled')).toBe('false')
    })

    test('shows "Sin rango" when the account has no ranks', async () => {
      getSummary.mockResolvedValue({ data: { ...summaryMock.data, ranks: [] } })

      await mountView()
      await flushPromises()

      expect(wrapper.text()).toContain('Sin rango')
    })
  })

  describe('with no games', () => {
    test('shows the empty message and no panels', async () => {
      getSummary.mockResolvedValue({
        data: { ...summaryMock.data, games: 0, wins: 0, losses: 0, winrate: null, ranks: [] },
      })

      await mountView()
      await flushPromises()

      expect(wrapper.text()).toContain('Aún no hay partidas registradas para esta cuenta.')
      expect(getHeadings()).not.toContain('Winrate')
      expect(getHeadings()).not.toContain('Rendimiento en partida')
    })
  })

  describe('when the first request fails', () => {
    test('shows the error alert and no data', async () => {
      getSummary.mockRejectedValue(new Error('Server unavailable'))

      await mountView()
      await flushPromises()

      expect(wrapper.get('[role="alert"]').text()).toContain('No se pudo cargar el resumen.')
      expect(findStatus('Cargando resumen…')).toBeUndefined()
      expect(getHeadings()).not.toContain('Winrate')
    })

    test('requests again when "Reintentar" is clicked', async () => {
      getSummary.mockRejectedValueOnce(new Error('Server unavailable'))
      getSummary.mockResolvedValueOnce(summaryMock)
      await mountView()
      await flushPromises()

      await wrapper.get('[role="alert"] button').trigger('click')
      await flushPromises()

      expect(getSummary).toHaveBeenCalledTimes(2)
    })

    test('shows the data and removes the alert when the retry succeeds', async () => {
      getSummary.mockRejectedValueOnce(new Error('Server unavailable'))
      getSummary.mockResolvedValueOnce(summaryMock)
      await mountView()
      await flushPromises()

      await wrapper.get('[role="alert"] button').trigger('click')
      await flushPromises()

      expect(wrapper.find('[role="alert"]').exists()).toBe(false)
      expect(getHeadings()).toContain('Winrate')
    })
  })

  describe('when refreshing with data on screen', () => {
    test('keeps the data visible and does not bring back the skeleton', async () => {
      const refresh = createControlledPromise()
      getSummary.mockResolvedValueOnce(summaryMock)
      getSummary.mockReturnValueOnce(refresh.promise)
      await mountView()
      await flushPromises()

      await findButton('Actualizar').trigger('click')

      expect(getHeadings()).toContain('Winrate')
      expect(findStatus('Cargando resumen…')).toBeUndefined()
    })

    test('marks the button aria-disabled until the refresh answers', async () => {
      const refresh = createControlledPromise()
      getSummary.mockResolvedValueOnce(summaryMock)
      getSummary.mockReturnValueOnce(refresh.promise)
      await mountView()
      await flushPromises()

      await findButton('Actualizar').trigger('click')

      const pendingButton = findButton('Actualizando…')
      expect(pendingButton.attributes('aria-disabled')).toBe('true')

      refresh.resolve(summaryMock)
      await flushPromises()

      expect(findButton('Actualizar').attributes('aria-disabled')).toBe('false')
    })

    test('shows the alert and keeps the data visible when the refresh fails', async () => {
      getSummary.mockResolvedValueOnce(summaryMock)
      getSummary.mockRejectedValueOnce(new Error('Server unavailable'))
      await mountView()
      await flushPromises()

      await findButton('Actualizar').trigger('click')
      await flushPromises()

      expect(wrapper.get('[role="alert"]').text()).toContain('No se pudo cargar el resumen.')
      expect(getHeadings()).toContain('Winrate')
      expect(wrapper.text()).toContain('Gold II')
    })
  })

  describe('refresh button while loading', () => {
    test('does not request the summary again when clicked during the load', async () => {
      getSummary.mockReturnValue(createControlledPromise().promise)
      await mountView()

      await findButton('Actualizando…').trigger('click')

      expect(getSummary).toHaveBeenCalledTimes(1)
    })

    test('keeps no disabled attribute so the keyboard focus is not lost', async () => {
      getSummary.mockReturnValue(createControlledPromise().promise)

      await mountView()

      expect(findButton('Actualizando…').attributes('disabled')).toBeUndefined()
    })

    test('announces "Actualizando resumen…" in the status region', async () => {
      getSummary.mockReturnValue(createControlledPromise().promise)

      await mountView()

      expect(findStatus('Actualizando resumen…')).toBeDefined()
    })

    test('empties the status region when the load finishes', async () => {
      getSummary.mockResolvedValue(summaryMock)

      await mountView()
      await flushPromises()

      expect(findStatus('Actualizando resumen…')).toBeUndefined()
      expect(wrapper.get('p.sr-only[role="status"]').text()).toBe('')
    })
  })

  describe('retry focus', () => {
    test('moves the focus to the page title when "Reintentar" is clicked', async () => {
      // document.activeElement only works for elements that are inside the document.
      // mount() renders into a detached <div> by default, where focus() does nothing,
      // so this test attaches the wrapper to document.body.
      getSummary.mockRejectedValueOnce(new Error('Server unavailable'))
      getSummary.mockReturnValueOnce(createControlledPromise().promise)
      const router = await createTestRouter()
      wrapper = mount(NewHomeView, { global: { plugins: [router] }, attachTo: document.body })
      await flushPromises()

      await wrapper.get('[role="alert"] button').trigger('click')

      expect(document.activeElement).toBe(wrapper.get('h1').element)
    })
  })

  describe('reading order', () => {
    test('puts the "Rango" heading before "Rendimiento en partida" in the DOM', async () => {
      getSummary.mockResolvedValue(summaryMock)

      await mountView()
      await flushPromises()

      const headings = getHeadings()
      expect(headings.indexOf('Rango')).toBeGreaterThanOrEqual(0)
      expect(headings.indexOf('Rango')).toBeLessThan(headings.indexOf('Rendimiento en partida'))
    })
  })

  describe('account parameter', () => {
    test('requests the summary without an account by default', async () => {
      getSummary.mockResolvedValue(summaryMock)

      await mountView()
      await flushPromises()

      expect(getSummary).toHaveBeenCalledTimes(1)
      expect(getSummary).toHaveBeenCalledWith({ account: undefined })
    })

    test('requests the summary again with the account when it changes', async () => {
      getSummary.mockResolvedValue(summaryMock)
      await mountView()
      await flushPromises()

      setAccount('la1')
      await flushPromises()

      expect(getSummary).toHaveBeenCalledTimes(2)
      expect(getSummary).toHaveBeenLastCalledWith({ account: 'la1' })
    })

    test('starts with the account that is already selected', async () => {
      getSummary.mockResolvedValue(summaryMock)
      setAccount('la2')

      await mountView()
      await flushPromises()

      expect(getSummary).toHaveBeenCalledWith({ account: 'la2' })
    })
  })
})
