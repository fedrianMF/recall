import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { getChampions } from '@/api/recall'
import { useAccount } from '@/composables/useAccount'
import ChampionsView from '@/views/ChampionsView.vue'

import { createControlledPromise } from '../helpers/controlledPromise'

vi.mock('@/api/recall', () => ({
  getChampions: vi.fn(),
}))

vi.mock('@/composables/useDataDragonVersion', async () => {
  const { ref } = await import('vue')

  return {
    useDataDragonVersion: () => ({ version: ref('14.1.1') }),
  }
})

const champions = [
  {
    champion: 'Ahri',
    games: 8,
    wins: 5,
    winrate: 62.5,
    kda: 4.2,
    cs_per_min: 7.1,
    damage_per_min: 530.4,
    kill_participation: 64.8,
  },
  {
    champion: 'Braum',
    games: 3,
    wins: 1,
    winrate: 33.3,
    kda: null,
    cs_per_min: 1.2,
    damage_per_min: 245.6,
    kill_participation: 71.2,
  },
  {
    champion: 'Caitlyn',
    games: 12,
    wins: 7,
    winrate: 58.3,
    kda: 3.1,
    cs_per_min: 8.4,
    damage_per_min: 610.2,
    kill_participation: 55,
  },
  {
    champion: 'Darius',
    games: 5,
    wins: 4,
    winrate: 80,
    kda: 2.4,
    cs_per_min: 6.3,
    damage_per_min: 480.7,
    kill_participation: 49.5,
  },
]

const { setAccount } = useAccount()

let wrapper

function mountView() {
  wrapper = mount(ChampionsView)

  return wrapper
}

function getChampionNames() {
  return wrapper.findAll('tbody tr').map((row) => row.get('td').text())
}

function findHeader(label) {
  return wrapper.findAll('thead th').find((header) => header.get('button').text().startsWith(label))
}

function findRow(championName) {
  return wrapper.findAll('tbody tr').find((row) => row.get('td').text() === championName)
}

describe('ChampionsView', () => {
  beforeEach(() => {
    getChampions.mockReset()
    setAccount('')
  })

  afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
  })

  describe('states', () => {
    test('shows the loading status without a table while the request is pending', () => {
      getChampions.mockReturnValue(createControlledPromise().promise)

      mountView()

      expect(wrapper.get('[role="status"]').text()).toContain('Cargando campeones…')
      expect(wrapper.find('table').exists()).toBe(false)
    })

    test('shows the empty message without a table when there are no champions', async () => {
      getChampions.mockResolvedValue({ data: [] })

      mountView()
      await flushPromises()

      expect(wrapper.text()).toContain('No hay campeones para mostrar')
      expect(wrapper.find('table').exists()).toBe(false)
    })

    test('shows a friendly error alert with a retry button when the request fails', async () => {
      getChampions.mockRejectedValue(new Error('Server unavailable'))

      mountView()
      await flushPromises()

      const alert = wrapper.get('[role="alert"]')
      expect(alert.text()).toContain('No se pudieron cargar los campeones.')
      expect(alert.get('button').text()).toBe('Reintentar')
      expect(wrapper.find('table').exists()).toBe(false)
    })

    test('retries a failed request and replaces the alert with the table on success', async () => {
      getChampions.mockRejectedValueOnce(new Error('Server unavailable'))
      getChampions.mockResolvedValueOnce({ data: champions })
      mountView()
      await flushPromises()

      const alert = wrapper.get('[role="alert"]')

      await alert.get('button').trigger('click')
      await flushPromises()

      expect(getChampions).toHaveBeenCalledTimes(2)
      expect(wrapper.find('[role="alert"]').exists()).toBe(false)
      expect(wrapper.find('table').exists()).toBe(true)
    })
  })

  describe('content', () => {
    test('shows the seven column headings and one row per champion', async () => {
      getChampions.mockResolvedValue({ data: champions })

      mountView()
      await flushPromises()

      const expectedHeadings = [
        'Campeón',
        'Partidas',
        'Winrate',
        'KDA',
        'CS/min',
        'Daño/min',
        'Participación',
      ]
      const headings = wrapper.findAll('thead th').map((header) => header.get('button').text())
      const visibleLabels = headings.map((heading) =>
        expectedHeadings.find((label) => heading.includes(label)),
      )

      expect(visibleLabels).toEqual(expectedHeadings)
      expect(wrapper.findAll('tbody tr')).toHaveLength(4)
    })

    test('shows each column heading as an accessible button', async () => {
      getChampions.mockResolvedValue({ data: champions })

      mountView()
      await flushPromises()

      const buttons = wrapper.findAll('thead button')
      expect(buttons).toHaveLength(7)
      expect(buttons.every((button) => button.text().trim().length > 0)).toBe(true)
      expect(buttons.map((button) => button.attributes('type'))).toEqual([
        'button',
        'button',
        'button',
        'button',
        'button',
        'button',
        'button',
      ])
    })

    test('formats percentage metrics with a percent suffix', async () => {
      getChampions.mockResolvedValue({ data: champions })

      mountView()
      await flushPromises()

      const cells = findRow('Caitlyn')
        .findAll('td')
        .map((cell) => cell.text())
      expect(cells[2]).toBe('58.3%')
      expect(cells[6]).toBe('55%')
    })

    test('shows a dash for a null metric', async () => {
      getChampions.mockResolvedValue({ data: champions })

      mountView()
      await flushPromises()

      const cells = findRow('Braum')
        .findAll('td')
        .map((cell) => cell.text())
      expect(cells[3]).toBe('—')
    })

    test('shows every champion name', async () => {
      getChampions.mockResolvedValue({ data: champions })

      mountView()
      await flushPromises()

      expect(getChampionNames()).toEqual(
        expect.arrayContaining(['Ahri', 'Braum', 'Caitlyn', 'Darius']),
      )
    })
  })

  describe('sorting', () => {
    test('orders rows by games descending initially', async () => {
      getChampions.mockResolvedValue({ data: champions })

      mountView()
      await flushPromises()

      expect(getChampionNames()).toEqual(['Caitlyn', 'Ahri', 'Darius', 'Braum'])
    })

    test('announces games as the initial descending sort and other columns as unsorted', async () => {
      getChampions.mockResolvedValue({ data: champions })

      mountView()
      await flushPromises()

      expect(findHeader('Partidas').attributes('aria-sort')).toBe('descending')
      expect(
        wrapper
          .findAll('thead th')
          .filter((header) => !header.get('button').text().startsWith('Partidas'))
          .map((header) => header.attributes('aria-sort')),
      ).toEqual(['none', 'none', 'none', 'none', 'none', 'none'])
    })

    test('orders games ascending and updates aria-sort when games is clicked again', async () => {
      getChampions.mockResolvedValue({ data: champions })
      mountView()
      await flushPromises()

      await findHeader('Partidas').get('button').trigger('click')

      expect(getChampionNames()).toEqual(['Braum', 'Darius', 'Ahri', 'Caitlyn'])
      expect(findHeader('Partidas').attributes('aria-sort')).toBe('ascending')
    })

    test('orders a new numeric column descending and marks games as unsorted', async () => {
      getChampions.mockResolvedValue({ data: champions })
      mountView()
      await flushPromises()

      await findHeader('Winrate').get('button').trigger('click')

      expect(getChampionNames()).toEqual(['Darius', 'Ahri', 'Caitlyn', 'Braum'])
      expect(findHeader('Winrate').attributes('aria-sort')).toBe('descending')
      expect(findHeader('Partidas').attributes('aria-sort')).toBe('none')
    })

    test('orders champion names ascending first and descending after a second click', async () => {
      getChampions.mockResolvedValue({ data: champions })
      mountView()
      await flushPromises()

      await findHeader('Campeón').get('button').trigger('click')

      expect(getChampionNames()).toEqual(['Ahri', 'Braum', 'Caitlyn', 'Darius'])
      expect(findHeader('Campeón').attributes('aria-sort')).toBe('ascending')

      await findHeader('Campeón').get('button').trigger('click')

      expect(getChampionNames()).toEqual(['Darius', 'Caitlyn', 'Braum', 'Ahri'])
      expect(findHeader('Campeón').attributes('aria-sort')).toBe('descending')
    })

    test('keeps a null KDA last in both sort directions', async () => {
      getChampions.mockResolvedValue({ data: champions })
      mountView()
      await flushPromises()

      await findHeader('KDA').get('button').trigger('click')

      expect(getChampionNames()).toEqual(['Ahri', 'Caitlyn', 'Darius', 'Braum'])

      await findHeader('KDA').get('button').trigger('click')

      expect(getChampionNames()).toEqual(['Darius', 'Caitlyn', 'Ahri', 'Braum'])
    })
  })

  describe('filters and account', () => {
    test('requests champions with a numeric minimum games value after selection', async () => {
      getChampions.mockResolvedValue({ data: champions })
      mountView()
      await flushPromises()

      await wrapper.get('select').setValue('5')
      await flushPromises()

      expect(getChampions).toHaveBeenCalledTimes(2)
      expect(getChampions).toHaveBeenLastCalledWith({ account: undefined, minGames: 5 })
    })

    test('starts with the account that was selected before mounting', async () => {
      getChampions.mockResolvedValue({ data: champions })
      setAccount('la2')

      mountView()
      await flushPromises()

      expect(getChampions).toHaveBeenCalledTimes(1)
      expect(getChampions).toHaveBeenCalledWith({ account: 'la2', minGames: 1 })
    })

    test('requests champions with the account selected after mounting', async () => {
      getChampions.mockResolvedValue({ data: champions })
      mountView()
      await flushPromises()

      setAccount('la2')
      await flushPromises()

      expect(getChampions).toHaveBeenCalledTimes(2)
      expect(getChampions).toHaveBeenLastCalledWith({ account: 'la2', minGames: 1 })
    })
  })
})
