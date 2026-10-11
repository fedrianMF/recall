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
    wrapper.unmount()
  })

  describe('while the first request is pending', () => {
    test('shows the loading state', async () => {
      getSummary.mockReturnValue(createControlledPromise().promise)

      await mountView()

      expect(wrapper.get('[role="status"]').text()).toBe('Cargando resumen…')
    })

    test('disables the refresh button and shows "Actualizando…"', async () => {
      getSummary.mockReturnValue(createControlledPromise().promise)

      await mountView()

      const button = findButton('Actualizando…')
      expect(button).toBeDefined()
      expect(button.attributes('disabled')).toBeDefined()
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

      expect(wrapper.find('[role="status"]').exists()).toBe(false)
      expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    })

    test('enables the refresh button with the text "Actualizar"', async () => {
      getSummary.mockResolvedValue(summaryMock)

      await mountView()
      await flushPromises()

      const button = findButton('Actualizar')
      expect(button).toBeDefined()
      expect(button.attributes('disabled')).toBeUndefined()
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
      expect(wrapper.find('[role="status"]').exists()).toBe(false)
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
      expect(wrapper.find('[role="status"]').exists()).toBe(false)
    })

    test('disables the button until the refresh answers', async () => {
      const refresh = createControlledPromise()
      getSummary.mockResolvedValueOnce(summaryMock)
      getSummary.mockReturnValueOnce(refresh.promise)
      await mountView()
      await flushPromises()

      await findButton('Actualizar').trigger('click')

      const pendingButton = findButton('Actualizando…')
      expect(pendingButton.attributes('disabled')).toBeDefined()

      refresh.resolve(summaryMock)
      await flushPromises()

      expect(findButton('Actualizar').attributes('disabled')).toBeUndefined()
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
