import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { getMatches } from '@/api/recall'
import { useAccount } from '@/composables/useAccount'
import MatchesView from '@/views/MatchesView.vue'

import { createControlledPromise } from '../helpers/controlledPromise'
import { createTestRouter } from '../helpers/createTestRouter'

vi.mock('@/api/recall', () => ({
  getMatches: vi.fn(),
}))

vi.mock('@/composables/useDataDragonVersion', async () => {
  const { ref } = await import('vue')

  return {
    useDataDragonVersion: () => ({ version: ref('14.1.1') }),
  }
})

function createMatch(id, champion, overrides = {}) {
  return {
    id,
    platform: 'la1',
    queue: { id: 420, name: 'Ranked Solo/Duo' },
    started_at: '2026-01-01T10:00:00Z',
    duration_seconds: 1800,
    champion,
    position: 'MIDDLE',
    win: true,
    kills: 5,
    deaths: 3,
    assists: 8,
    kda: 4.3,
    cs: 200,
    cs_per_min: 6.7,
    damage_to_champions: 20000,
    vision_score: 25,
    remake: false,
    ...overrides,
  }
}

const matches = [createMatch(1, 'Ahri'), createMatch(2, 'Braum'), createMatch(3, 'Caitlyn')]

function createResponse(currentPage = 1, lastPage = 1, data = matches) {
  return {
    data,
    links: {},
    meta: { current_page: currentPage, last_page: lastPage, total: 42 },
  }
}

// Answers like the real API: the returned meta.current_page matches the requested page.
function mockPaginatedApi(lastPage = 3) {
  getMatches.mockImplementation(({ page }) => Promise.resolve(createResponse(page, lastPage)))
}

const { setAccount } = useAccount()

let wrapper

async function mountView(options = {}) {
  const router = await createTestRouter()

  wrapper = mount(MatchesView, { global: { plugins: [router] }, ...options })

  return wrapper
}

function findButton(label) {
  return wrapper.findAll('button').find((button) => button.text() === label)
}

async function clickButton(label) {
  await findButton(label).trigger('click')
  await flushPromises()
}

describe('MatchesView', () => {
  beforeEach(() => {
    getMatches.mockReset()
    setAccount('')
  })

  afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
  })

  describe('states', () => {
    test('shows the loading status without a list while the request is pending', async () => {
      getMatches.mockReturnValue(createControlledPromise().promise)

      await mountView()

      expect(wrapper.get('[role="status"]').text()).toContain('Cargando historial…')
      expect(wrapper.find('ul').exists()).toBe(false)
    })

    test('shows the empty message without list or pagination when there are no matches', async () => {
      getMatches.mockResolvedValue(createResponse(1, 1, []))

      await mountView()
      await flushPromises()

      expect(wrapper.text()).toContain('No hay partidas para mostrar')
      expect(wrapper.find('ul').exists()).toBe(false)
      expect(wrapper.find('nav').exists()).toBe(false)
    })

    test('shows a friendly error alert with a retry button when the request fails', async () => {
      getMatches.mockRejectedValue(new Error('Server unavailable'))

      await mountView()
      await flushPromises()

      const alert = wrapper.get('[role="alert"]')
      expect(alert.text()).toContain('No se pudo cargar el historial.')
      expect(alert.get('button').text()).toBe('Reintentar')
      expect(wrapper.find('ul').exists()).toBe(false)
    })

    test('retries a failed request and replaces the alert with the list on success', async () => {
      getMatches.mockRejectedValueOnce(new Error('Server unavailable'))
      getMatches.mockResolvedValueOnce(createResponse())
      await mountView()
      await flushPromises()

      await wrapper.get('[role="alert"] button').trigger('click')
      await flushPromises()

      expect(getMatches).toHaveBeenCalledTimes(2)
      expect(wrapper.find('[role="alert"]').exists()).toBe(false)
      expect(wrapper.findAll('li')).toHaveLength(3)
    })
  })

  describe('content', () => {
    test('shows one row per match with its champion', async () => {
      getMatches.mockResolvedValue(createResponse())

      await mountView()
      await flushPromises()

      const rows = wrapper.findAll('li')
      expect(rows).toHaveLength(3)
      expect(rows[0].text()).toContain('Ahri')
      expect(rows[1].text()).toContain('Braum')
      expect(rows[2].text()).toContain('Caitlyn')
    })

    test('shows the total number of matches found', async () => {
      getMatches.mockResolvedValue(createResponse())

      await mountView()
      await flushPromises()

      expect(wrapper.text()).toContain('42 partidas encontradas.')
    })

    test('links each row to its match detail', async () => {
      getMatches.mockResolvedValue(createResponse())

      await mountView()
      await flushPromises()

      expect(wrapper.findAll('li a').map((link) => link.attributes('href'))).toEqual([
        '/matches/1',
        '/matches/2',
        '/matches/3',
      ])
    })
  })

  describe('queue filter', () => {
    test.each([
      ['Solo/Dúo', '420'],
      ['Flex', '440'],
      ['ARAM', '450'],
      ['Normal', '400'],
    ])('requests page 1 of the %s queue (%s) when it is selected', async (_label, queueId) => {
      getMatches.mockResolvedValue(createResponse())
      await mountView()
      await flushPromises()

      await wrapper.get('select').setValue(queueId)
      await flushPromises()

      expect(getMatches).toHaveBeenCalledTimes(2)
      expect(getMatches).toHaveBeenLastCalledWith({
        account: undefined,
        queue: queueId,
        page: 1,
      })
    })

    test('requests without a queue when Todas is selected again', async () => {
      getMatches.mockResolvedValue(createResponse())
      await mountView()
      await flushPromises()
      await wrapper.get('select').setValue('420')
      await flushPromises()

      await wrapper.get('select').setValue('')
      await flushPromises()

      expect(getMatches).toHaveBeenCalledTimes(3)
      expect(getMatches).toHaveBeenLastCalledWith({
        account: undefined,
        queue: undefined,
        page: 1,
      })
    })

    test('offers the five queue options by their visible label', async () => {
      getMatches.mockResolvedValue(createResponse())

      await mountView()
      await flushPromises()

      expect(wrapper.findAll('option').map((option) => option.text())).toEqual([
        'Todas',
        'Solo/Dúo',
        'Flex',
        'ARAM',
        'Normal',
      ])
    })
  })

  describe('pagination', () => {
    test('moves focus to the page title immediately when Siguiente is clicked', async () => {
      const nextPageRequest = createControlledPromise()
      getMatches.mockResolvedValueOnce(createResponse(1, 3))
      getMatches.mockReturnValueOnce(nextPageRequest.promise)
      await mountView({ attachTo: document.body })
      await flushPromises()

      await findButton('Siguiente').trigger('click')

      const title = wrapper.get('#matches-title')
      expect(title.attributes('tabindex')).toBe('-1')
      expect(document.activeElement).toBe(title.element)
    })

    test('moves focus to the page title immediately when Anterior is clicked', async () => {
      const previousPageRequest = createControlledPromise()
      getMatches.mockResolvedValueOnce(createResponse(1, 3))
      getMatches.mockResolvedValueOnce(createResponse(2, 3))
      getMatches.mockReturnValueOnce(previousPageRequest.promise)
      await mountView({ attachTo: document.body })
      await flushPromises()
      await findButton('Siguiente').trigger('click')
      await flushPromises()
      // The previous click left focus on the title: put it back on the button, where a real user is.
      findButton('Anterior').element.focus()
      expect(document.activeElement).toBe(findButton('Anterior').element)

      await findButton('Anterior').trigger('click')

      const title = wrapper.get('#matches-title')
      expect(title.attributes('tabindex')).toBe('-1')
      expect(document.activeElement).toBe(title.element)
    })

    test('disables Anterior and enables Siguiente on the first page', async () => {
      mockPaginatedApi()

      await mountView()
      await flushPromises()

      expect(findButton('Anterior').attributes('disabled')).toBeDefined()
      expect(findButton('Siguiente').attributes('disabled')).toBeUndefined()
      expect(wrapper.get('nav').text()).toContain('Página 1 de 3')
    })

    test('requests page 2 and shows it when Siguiente is clicked', async () => {
      mockPaginatedApi()
      await mountView()
      await flushPromises()

      await clickButton('Siguiente')

      expect(getMatches).toHaveBeenCalledTimes(2)
      expect(getMatches).toHaveBeenLastCalledWith({
        account: undefined,
        queue: undefined,
        page: 2,
      })
      expect(wrapper.get('nav').text()).toContain('Página 2 de 3')
    })

    test('disables Siguiente on the last page', async () => {
      mockPaginatedApi()
      await mountView()
      await flushPromises()

      await clickButton('Siguiente')
      await clickButton('Siguiente')

      expect(wrapper.get('nav').text()).toContain('Página 3 de 3')
      expect(findButton('Siguiente').attributes('disabled')).toBeDefined()
      expect(findButton('Anterior').attributes('disabled')).toBeUndefined()
    })

    test('goes back to the previous page when Anterior is clicked', async () => {
      mockPaginatedApi()
      await mountView()
      await flushPromises()
      await clickButton('Siguiente')
      await clickButton('Siguiente')

      await clickButton('Anterior')

      expect(getMatches).toHaveBeenLastCalledWith({
        account: undefined,
        queue: undefined,
        page: 2,
      })
      expect(wrapper.get('nav').text()).toContain('Página 2 de 3')
    })

    test('requests page 1 only once when the queue changes from page 2', async () => {
      mockPaginatedApi()
      await mountView()
      await flushPromises()
      await clickButton('Siguiente')
      getMatches.mockClear()

      await wrapper.get('select').setValue('450')
      await flushPromises()

      expect(getMatches).toHaveBeenCalledTimes(1)
      expect(getMatches).toHaveBeenCalledWith({ account: undefined, queue: '450', page: 1 })
      expect(wrapper.get('nav').text()).toContain('Página 1 de 3')
    })
  })

  describe('retry focus', () => {
    test('moves focus to the page title immediately when Reintentar is clicked', async () => {
      const retryRequest = createControlledPromise()
      getMatches.mockRejectedValueOnce(new Error('Server unavailable'))
      getMatches.mockReturnValueOnce(retryRequest.promise)
      await mountView({ attachTo: document.body })
      await flushPromises()

      await wrapper.get('[role="alert"] button').trigger('click')

      const title = wrapper.get('#matches-title')
      expect(title.attributes('tabindex')).toBe('-1')
      expect(document.activeElement).toBe(title.element)
    })
  })

  describe('account', () => {
    test('requests with the account that was selected before mounting', async () => {
      getMatches.mockResolvedValue(createResponse())
      setAccount('la2')

      await mountView()
      await flushPromises()

      expect(getMatches).toHaveBeenCalledTimes(1)
      expect(getMatches).toHaveBeenCalledWith({ account: 'la2', queue: undefined, page: 1 })
    })

    test('requests again with the account selected after mounting', async () => {
      getMatches.mockResolvedValue(createResponse())
      await mountView()
      await flushPromises()

      setAccount('la2')
      await flushPromises()

      expect(getMatches).toHaveBeenCalledTimes(2)
      expect(getMatches).toHaveBeenLastCalledWith({ account: 'la2', queue: undefined, page: 1 })
    })
  })
})
