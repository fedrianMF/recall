import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { getPositions, getRankHistory, getSummary } from '@/api/recall'
import positionsMock from '@/api/mocks/positions'
import rankHistoryMock from '@/api/mocks/rankHistory'
import summaryMock from '@/api/mocks/summary'
import { useAccount } from '@/composables/useAccount'
import NewHomeView from '@/views/NewHomeView.vue'

import { createControlledPromise } from '../helpers/controlledPromise'
import { createTestRouter } from '../helpers/createTestRouter'

// vi.mock is hoisted: Vitest moves it above the imports, so when NewHomeView
// imports useSummary -> api/recall, it already receives this fake module.
vi.mock('@/api/recall', () => ({
  getSummary: vi.fn(),
  getPositions: vi.fn(),
  getRankHistory: vi.fn(),
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
    getPositions.mockReset()
    getRankHistory.mockReset()
    // Default answers, so the existing summary tests are not affected by the new panels.
    getPositions.mockResolvedValue(positionsMock)
    getRankHistory.mockResolvedValue(rankHistoryMock)
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

  describe('positions and rank history panels', () => {
    const allHeadings = [
      'Winrate',
      'Partidas',
      'Rango',
      'Rendimiento en partida',
      'Rendimiento por posición',
      'Evolución del rango',
    ]

    // The panel is the <section> whose first <h2> is the panel title
    // (an error alert inside the panel has its own <h2> after it).
    function findPanel(title) {
      return wrapper.findAll('section').find((section) => section.get('h2').text() === title)
    }

    async function mountWithFocus() {
      // Focus needs the wrapper attached to the document (see "retry focus" above).
      const router = await createTestRouter()
      wrapper = mount(NewHomeView, { global: { plugins: [router] }, attachTo: document.body })
      await flushPromises()
    }

    describe('visibility', () => {
      test('shows both new panels after the summary panels, in this order', async () => {
        getSummary.mockResolvedValue(summaryMock)

        await mountView()
        await flushPromises()

        expect(getHeadings()).toEqual(allHeadings)
      })

      test('does not show the new panels while the first summary request is pending', async () => {
        getSummary.mockReturnValue(createControlledPromise().promise)

        await mountView()

        expect(getHeadings()).not.toContain('Rendimiento por posición')
        expect(getHeadings()).not.toContain('Evolución del rango')
      })

      test('does not show the new panels when the summary request fails', async () => {
        getSummary.mockRejectedValue(new Error('Server unavailable'))

        await mountView()
        await flushPromises()

        expect(getHeadings()).not.toContain('Rendimiento por posición')
        expect(getHeadings()).not.toContain('Evolución del rango')
      })

      test('does not show the new panels when the account has no games', async () => {
        getSummary.mockResolvedValue({
          data: { ...summaryMock.data, games: 0, wins: 0, losses: 0, winrate: null, ranks: [] },
        })

        await mountView()
        await flushPromises()

        expect(getHeadings()).not.toContain('Rendimiento por posición')
        expect(getHeadings()).not.toContain('Evolución del rango')
      })
    })

    describe('positions request', () => {
      test('requests the positions once without an account on mount', async () => {
        getSummary.mockResolvedValue(summaryMock)

        await mountView()
        await flushPromises()

        expect(getPositions).toHaveBeenCalledTimes(1)
        expect(getPositions).toHaveBeenCalledWith({ account: undefined })
      })

      test('requests the positions again, only once, when the account changes', async () => {
        getSummary.mockResolvedValue(summaryMock)
        await mountView()
        await flushPromises()

        setAccount('la1')
        await flushPromises()

        expect(getPositions).toHaveBeenCalledTimes(2)
        expect(getPositions).toHaveBeenLastCalledWith({ account: 'la1' })
      })

      test('shows the position names in Spanish inside the positions panel', async () => {
        getSummary.mockResolvedValue(summaryMock)

        await mountView()
        await flushPromises()

        const text = findPanel('Rendimiento por posición').text()
        expect(text).toContain('Superior')
        expect(text).toContain('Jungla')
      })
    })

    describe('rank history request', () => {
      test('does not request the rank history with the empty account', async () => {
        getSummary.mockResolvedValue(summaryMock)

        await mountView()
        await flushPromises()

        expect(getRankHistory).not.toHaveBeenCalled()
      })

      test('asks to choose LAN or LAS with the empty account', async () => {
        getSummary.mockResolvedValue(summaryMock)

        await mountView()
        await flushPromises()

        const panel = findPanel('Evolución del rango')
        expect(panel.text()).toContain('Elige LAN o LAS para ver la evolución de tu rango.')
        expect(panel.find('figure').exists()).toBe(false)
      })

      test('requests the solo queue history when an account is chosen', async () => {
        getSummary.mockResolvedValue(summaryMock)
        await mountView()
        await flushPromises()

        setAccount('la1')
        await flushPromises()

        expect(getRankHistory).toHaveBeenCalledTimes(1)
        expect(getRankHistory).toHaveBeenCalledWith({
          account: 'la1',
          queueType: 'RANKED_SOLO_5x5',
        })
      })

      test('draws the chart and hides the message once an account is chosen', async () => {
        getSummary.mockResolvedValue(summaryMock)
        await mountView()
        await flushPromises()

        setAccount('la1')
        await flushPromises()

        const panel = findPanel('Evolución del rango')
        expect(panel.find('figure svg').exists()).toBe(true)
        expect(panel.text()).not.toContain('Elige LAN o LAS')
      })

      test('removes the chart and brings back the message when the account is cleared', async () => {
        getSummary.mockResolvedValue(summaryMock)
        await mountView()
        setAccount('la1')
        await flushPromises()

        setAccount('')
        await flushPromises()

        const panel = findPanel('Evolución del rango')
        expect(panel.find('figure').exists()).toBe(false)
        expect(panel.text()).toContain('Elige LAN o LAS para ver la evolución de tu rango.')
      })
    })

    describe('independent failures: positions', () => {
      test('shows an alert inside the positions panel and keeps the other panels', async () => {
        getSummary.mockResolvedValue(summaryMock)
        getPositions.mockRejectedValue(new Error('Server unavailable'))

        await mountView()
        await flushPromises()

        const alert = findPanel('Rendimiento por posición').get('[role="alert"]')
        expect(alert.text()).toContain('No se pudieron cargar las posiciones.')
        expect(getHeadings()).toContain('Winrate')
        expect(findPanel('Evolución del rango').find('[role="alert"]').exists()).toBe(false)
      })

      test('retries only the positions request', async () => {
        getSummary.mockResolvedValue(summaryMock)
        getPositions.mockRejectedValueOnce(new Error('Server unavailable'))
        await mountView()
        await flushPromises()

        await findPanel('Rendimiento por posición').get('[role="alert"] button').trigger('click')
        await flushPromises()

        expect(getPositions).toHaveBeenCalledTimes(2)
        expect(getSummary).toHaveBeenCalledTimes(1)
        expect(getRankHistory).not.toHaveBeenCalled()
      })

      test('retries only the positions request even when an account is selected', async () => {
        setAccount('la1')
        getSummary.mockResolvedValue(summaryMock)
        getPositions.mockRejectedValueOnce(new Error('Server unavailable'))
        await mountView()
        await flushPromises()

        await findPanel('Rendimiento por posición').get('[role="alert"] button').trigger('click')
        await flushPromises()

        expect(getPositions).toHaveBeenCalledTimes(2)
        expect(getRankHistory).toHaveBeenCalledTimes(1)
        expect(getSummary).toHaveBeenCalledTimes(1)
      })

      test('removes the alert and shows the rows when the retry succeeds', async () => {
        getSummary.mockResolvedValue(summaryMock)
        getPositions.mockRejectedValueOnce(new Error('Server unavailable'))
        await mountView()
        await flushPromises()

        await findPanel('Rendimiento por posición').get('[role="alert"] button').trigger('click')
        await flushPromises()

        const panel = findPanel('Rendimiento por posición')
        expect(panel.find('[role="alert"]').exists()).toBe(false)
        expect(panel.text()).toContain('Superior')
      })
    })

    describe('independent failures: rank history', () => {
      test('shows an alert inside the evolution panel and keeps the other panels', async () => {
        getSummary.mockResolvedValue(summaryMock)
        getRankHistory.mockRejectedValue(new Error('Server unavailable'))
        setAccount('la1')

        await mountView()
        await flushPromises()

        const alert = findPanel('Evolución del rango').get('[role="alert"]')
        expect(alert.text()).toContain('No se pudo cargar el historial de rango.')
        expect(getHeadings()).toContain('Winrate')
        expect(findPanel('Rendimiento por posición').find('[role="alert"]').exists()).toBe(false)
      })

      test('retries only the rank history request', async () => {
        getSummary.mockResolvedValue(summaryMock)
        getRankHistory.mockRejectedValueOnce(new Error('Server unavailable'))
        setAccount('la1')
        await mountView()
        await flushPromises()

        await findPanel('Evolución del rango').get('[role="alert"] button').trigger('click')
        await flushPromises()

        expect(getRankHistory).toHaveBeenCalledTimes(2)
        expect(getSummary).toHaveBeenCalledTimes(1)
        expect(getPositions).toHaveBeenCalledTimes(1)
      })

      test('removes the alert and draws the chart when the retry succeeds', async () => {
        getSummary.mockResolvedValue(summaryMock)
        getRankHistory.mockRejectedValueOnce(new Error('Server unavailable'))
        setAccount('la1')
        await mountView()
        await flushPromises()

        await findPanel('Evolución del rango').get('[role="alert"] button').trigger('click')
        await flushPromises()

        const panel = findPanel('Evolución del rango')
        expect(panel.find('[role="alert"]').exists()).toBe(false)
        expect(panel.find('figure svg').exists()).toBe(true)
      })
    })

    describe('retry focus on the new panels', () => {
      test('moves the focus to the positions panel when its "Reintentar" is clicked', async () => {
        getSummary.mockResolvedValue(summaryMock)
        getPositions.mockRejectedValueOnce(new Error('Server unavailable'))
        getPositions.mockReturnValueOnce(createControlledPromise().promise)
        await mountWithFocus()

        await findPanel('Rendimiento por posición').get('[role="alert"] button').trigger('click')

        const panel = findPanel('Rendimiento por posición')
        expect(panel.attributes('tabindex')).toBe('-1')
        expect(document.activeElement).toBe(panel.element)
      })

      test('moves the focus to the evolution panel when its "Reintentar" is clicked', async () => {
        getSummary.mockResolvedValue(summaryMock)
        getRankHistory.mockRejectedValueOnce(new Error('Server unavailable'))
        getRankHistory.mockReturnValueOnce(createControlledPromise().promise)
        setAccount('la1')
        await mountWithFocus()

        await findPanel('Evolución del rango').get('[role="alert"] button').trigger('click')

        const panel = findPanel('Evolución del rango')
        expect(panel.attributes('tabindex')).toBe('-1')
        expect(document.activeElement).toBe(panel.element)
      })
    })

    describe('"Actualizar" refreshes the whole page', () => {
      test('requests summary, positions and rank history again when there is an account', async () => {
        getSummary.mockResolvedValue(summaryMock)
        setAccount('la1')
        await mountView()
        await flushPromises()

        await findButton('Actualizar').trigger('click')
        await flushPromises()

        expect(getSummary).toHaveBeenCalledTimes(2)
        expect(getPositions).toHaveBeenCalledTimes(2)
        expect(getRankHistory).toHaveBeenCalledTimes(2)
      })

      test('does not request the rank history when there is no account', async () => {
        getSummary.mockResolvedValue(summaryMock)
        await mountView()
        await flushPromises()

        await findButton('Actualizar').trigger('click')
        await flushPromises()

        expect(getSummary).toHaveBeenCalledTimes(2)
        expect(getPositions).toHaveBeenCalledTimes(2)
        expect(getRankHistory).not.toHaveBeenCalled()
      })
    })
  })

  describe('refresh button while the panels are loading', () => {
    function expectNoNewRequests() {
      expect(getSummary).toHaveBeenCalledTimes(1)
      expect(getPositions).toHaveBeenCalledTimes(1)
      expect(getRankHistory).toHaveBeenCalledTimes(1)
    }

    test('shows "Actualizando…" while only the positions are pending', async () => {
      const positionsRequest = createControlledPromise()
      getSummary.mockResolvedValue(summaryMock)
      getPositions.mockReturnValue(positionsRequest.promise)
      await mountView()
      await flushPromises()

      const button = findButton('Actualizando…')

      expect(button).toBeDefined()
      expect(button.attributes('aria-disabled')).toBe('true')
    })

    test('announces "Actualizando resumen…" while only the positions are pending', async () => {
      getSummary.mockResolvedValue(summaryMock)
      getPositions.mockReturnValue(createControlledPromise().promise)
      await mountView()
      await flushPromises()

      expect(findStatus('Actualizando resumen…')).toBeDefined()
    })

    test('does not request anything again when clicked while only the positions are pending', async () => {
      getSummary.mockResolvedValue(summaryMock)
      getPositions.mockReturnValue(createControlledPromise().promise)
      setAccount('la1')
      await mountView()
      await flushPromises()

      await findButton('Actualizando…').trigger('click')
      await flushPromises()

      expectNoNewRequests()
    })

    test('shows "Actualizando…" while only the rank history is pending', async () => {
      getSummary.mockResolvedValue(summaryMock)
      getRankHistory.mockReturnValue(createControlledPromise().promise)
      setAccount('la1')
      await mountView()
      await flushPromises()

      const button = findButton('Actualizando…')

      expect(button).toBeDefined()
      expect(button.attributes('aria-disabled')).toBe('true')
    })

    test('does not request anything again when clicked while only the rank history is pending', async () => {
      getSummary.mockResolvedValue(summaryMock)
      getRankHistory.mockReturnValue(createControlledPromise().promise)
      setAccount('la1')
      await mountView()
      await flushPromises()

      await findButton('Actualizando…').trigger('click')
      await flushPromises()

      expectNoNewRequests()
    })

    test('goes back to "Actualizar" when the pending positions answer', async () => {
      const positionsRequest = createControlledPromise()
      getSummary.mockResolvedValue(summaryMock)
      getPositions.mockReturnValue(positionsRequest.promise)
      await mountView()
      await flushPromises()

      positionsRequest.resolve(positionsMock)
      await flushPromises()

      expect(findButton('Actualizar').attributes('aria-disabled')).toBe('false')
    })

    test('goes back to "Actualizar" when the pending rank history answers', async () => {
      const historyRequest = createControlledPromise()
      getSummary.mockResolvedValue(summaryMock)
      getRankHistory.mockReturnValue(historyRequest.promise)
      setAccount('la1')
      await mountView()
      await flushPromises()

      historyRequest.resolve(rankHistoryMock)
      await flushPromises()

      expect(findButton('Actualizar').attributes('aria-disabled')).toBe('false')
    })

    test('does not keep the button busy for a rank history that is not requested', async () => {
      getSummary.mockResolvedValue(summaryMock)
      await mountView()
      await flushPromises()

      expect(findButton('Actualizar').attributes('aria-disabled')).toBe('false')
      expect(getRankHistory).not.toHaveBeenCalled()
    })
  })

  describe('when the account changes with positions on screen', () => {
    function findPositionsPanel() {
      return wrapper
        .findAll('section')
        .find((section) => section.get('h2').text() === 'Rendimiento por posición')
    }

    test('hides the rows of the previous account and shows the loading state', async () => {
      const newAccountPositions = createControlledPromise()
      getSummary.mockResolvedValue(summaryMock)
      getPositions
        .mockResolvedValueOnce(positionsMock)
        .mockReturnValueOnce(newAccountPositions.promise)
      setAccount('la1')
      await mountView()
      await flushPromises()
      expect(findPositionsPanel().findAll('li').length).toBeGreaterThan(0)

      setAccount('la2')
      await flushPromises()

      const panel = findPositionsPanel()
      expect(panel.findAll('li')).toHaveLength(0)
      expect(panel.get('[role="status"]').text()).toBe('Cargando posiciones…')
    })

    test('keeps showing the summary data while the positions of the new account load', async () => {
      getSummary.mockResolvedValue(summaryMock)
      getPositions
        .mockResolvedValueOnce(positionsMock)
        .mockReturnValueOnce(createControlledPromise().promise)
      setAccount('la1')
      await mountView()
      await flushPromises()

      setAccount('la2')
      await flushPromises()

      expect(getHeadings()).toContain('Winrate')
      expect(wrapper.text()).toContain('Gold II')
    })

    test('shows the rows of the new account when its positions answer', async () => {
      const newAccountPositions = createControlledPromise()
      getSummary.mockResolvedValue(summaryMock)
      getPositions
        .mockResolvedValueOnce(positionsMock)
        .mockReturnValueOnce(newAccountPositions.promise)
      setAccount('la1')
      await mountView()
      await flushPromises()
      setAccount('la2')
      await flushPromises()

      newAccountPositions.resolve(positionsMock)
      await flushPromises()

      const panel = findPositionsPanel()
      expect(panel.findAll('li').length).toBeGreaterThan(0)
      expect(panel.find('[role="status"]').exists()).toBe(false)
    })
  })

  describe('queue shown in the rank history panel', () => {
    function findHistoryPanel() {
      return wrapper
        .findAll('section')
        .find((section) => section.get('h2').text() === 'Evolución del rango')
    }

    test('shows the solo queue when an account is chosen', async () => {
      getSummary.mockResolvedValue(summaryMock)
      await mountView()
      await flushPromises()

      setAccount('la1')
      await flushPromises()

      expect(findHistoryPanel().text()).toContain('Cola: Solo/Dúo')
    })

    test('does not show the queue with the empty account', async () => {
      getSummary.mockResolvedValue(summaryMock)

      await mountView()
      await flushPromises()

      expect(findHistoryPanel().text()).not.toContain('Cola:')
    })
  })
})
