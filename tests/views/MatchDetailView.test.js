import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { getMatch } from '@/api/recall'
import MatchDetailView from '@/views/MatchDetailView.vue'

import { createControlledPromise } from '../helpers/controlledPromise'
import { createTestRouter } from '../helpers/createTestRouter'

vi.mock('@/api/recall', () => ({
  getMatch: vi.fn(),
}))

vi.mock('@/composables/useDataDragonVersion', async () => {
  const { ref } = await import('vue')

  return {
    useDataDragonVersion: () => ({ version: ref('14.1.1') }),
  }
})

const players = [
  {
    riot_id: 'PlayerOne#LAN',
    champion: 'Ahri',
    position: 'MIDDLE',
    kills: 7,
    deaths: 2,
    assists: 11,
    cs: 187,
    damage: 23456,
    is_me: true,
  },
  {
    riot_id: 'PlayerTwo#LAN',
    champion: 'Braum',
    position: 'UTILITY',
    kills: 1,
    deaths: 4,
    assists: 16,
    cs: 32,
    damage: 5432,
    is_me: false,
  },
]

function createMatch(overrides = {}) {
  return {
    id: 'LA1_123',
    platform: 'la1',
    queue: { id: 420, name: 'Ranked Solo/Dúo' },
    started_at: '2026-01-01T10:00:00Z',
    duration_seconds: 709,
    champion: 'Ahri',
    position: 'MIDDLE',
    win: true,
    kills: 7,
    deaths: 2,
    assists: 11,
    kda: 9,
    cs: 187,
    cs_per_min: 7.4,
    damage_to_champions: 23456,
    vision_score: 28,
    remake: false,
    kill_participation: 48.5,
    cs_at_10: null,
    team_damage_percentage: 37.2,
    early_gold_xp_advantage: 420,
    solo_kills: null,
    teams: [
      { team_id: 100, win: true, kills: 18, players },
      { team_id: 200, win: false, kills: 9, players: [] },
    ],
    ...overrides,
  }
}

let wrapper
let router

async function mountView(path = '/matches/LA1_123') {
  router = await createTestRouter()
  await router.push(path)
  await router.isReady()

  wrapper = mount(MatchDetailView, {
    global: { plugins: [router] },
  })

  return wrapper
}

function findMetric(label) {
  return wrapper.findAll('article').find((card) => card.findAll('p')[0].text() === label)
}

describe('MatchDetailView', () => {
  beforeEach(() => {
    getMatch.mockReset()
  })

  afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
    router = undefined
  })

  describe('states', () => {
    test('shows the loading status without match content while the request is pending', async () => {
      getMatch.mockReturnValue(createControlledPromise().promise)

      await mountView()

      expect(wrapper.get('[role="status"]').text()).toContain('Cargando partida…')
      expect(wrapper.text()).not.toContain('Tus métricas')
      // The current loading state has no h1. Its heading hierarchy is reported as a finding.
    })

    test('shows the not-found state with one heading and two history links for a 404', async () => {
      const error = new Error('Match not found')
      error.status = 404
      getMatch.mockRejectedValue(error)

      await mountView()
      await flushPromises()

      expect(wrapper.findAll('h1')).toHaveLength(1)
      expect(wrapper.get('h1').text()).toBe('Partida no encontrada')
      expect(wrapper.text()).toContain('La partida solicitada no existe o ya no está disponible.')
      expect(
        wrapper.findAll('a').filter((link) => link.text().includes('Volver al historial')),
      ).toHaveLength(2)
      expect(wrapper.findAll('a').map((link) => link.attributes('href'))).toEqual([
        '/matches',
        '/matches',
      ])
      expect(wrapper.find('button').exists()).toBe(false)
    })

    test('shows a retryable alert with one heading for a non-404 error', async () => {
      const error = new Error('Server unavailable')
      error.status = 500
      getMatch.mockRejectedValue(error)

      await mountView()
      await flushPromises()

      const alert = wrapper.get('[role="alert"]')
      expect(wrapper.findAll('h1')).toHaveLength(1)
      expect(alert.get('h1').text()).toBe('No se pudo cargar la partida')
      expect(alert.text()).toContain('No se pudo cargar la partida.')
      expect(alert.get('button').text()).toBe('Reintentar')
    })

    test('retries another error and replaces the alert with the match', async () => {
      const error = new Error('Server unavailable')
      error.status = 500
      getMatch.mockRejectedValueOnce(error)
      getMatch.mockResolvedValueOnce({ data: createMatch() })
      await mountView()
      await flushPromises()

      await wrapper.get('[role="alert"] button').trigger('click')
      await flushPromises()

      expect(getMatch).toHaveBeenCalledTimes(2)
      expect(wrapper.find('[role="alert"]').exists()).toBe(false)
      expect(wrapper.get('h1').text()).toBe('Ahri')
    })

    test('shows match content with exactly one main heading', async () => {
      getMatch.mockResolvedValue({ data: createMatch() })

      await mountView()
      await flushPromises()

      expect(wrapper.findAll('h1')).toHaveLength(1)
      expect(wrapper.get('h1').text()).toBe('Ahri')
    })
  })

  describe('match summary', () => {
    test('shows the champion, queue, position and formatted duration', async () => {
      getMatch.mockResolvedValue({ data: createMatch() })

      await mountView()
      await flushPromises()

      expect(wrapper.get('h1').text()).toBe('Ahri')
      expect(wrapper.text()).toContain('Ranked Solo/Dúo · MIDDLE')
      expect(wrapper.text()).toContain('11:49')
    })

    test.each([
      [{ remake: false, win: true }, 'Victoria'],
      [{ remake: false, win: false }, 'Derrota'],
      [{ remake: true, win: true }, 'Remake'],
    ])('shows %s as %s', async (overrides, expectedResult) => {
      getMatch.mockResolvedValue({ data: createMatch(overrides) })

      await mountView()
      await flushPromises()

      expect(wrapper.get('header').get('span').text()).toBe(expectedResult)
    })

    test('links back to the match history', async () => {
      getMatch.mockResolvedValue({ data: createMatch() })

      await mountView()
      await flushPromises()

      const link = wrapper.findAll('a').find((item) => item.text() === '← Volver al historial')
      expect(link.attributes('href')).toBe('/matches')
    })
  })

  describe('personal metrics', () => {
    test('shows the eleven metric labels and their literal values', async () => {
      getMatch.mockResolvedValue({ data: createMatch() })

      await mountView()
      await flushPromises()

      expect(wrapper.text()).toContain('Tus métricas')
      expect(wrapper.findAll('article')).toHaveLength(11)
      expect(findMetric('K / D / A').text()).toContain('7 / 2 / 11')
      expect(findMetric('KDA').text()).toContain('9')
      expect(findMetric('CS').text()).toContain('187')
      expect(findMetric('CS/min').text()).toContain('7.4')
      expect(findMetric('Daño').text()).toContain('23456')
      expect(findMetric('Visión').text()).toContain('28')
      expect(findMetric('Participación').text()).toContain('48.5%')
      expect(findMetric('CS al minuto 10').text()).toContain('—')
      expect(findMetric('Daño del equipo').text()).toContain('37.2%')
      expect(findMetric('Ventaja temprana oro/XP').text()).toContain('420')
      expect(findMetric('Asesinatos en solitario').text()).toContain('—')
    })
  })

  describe('teams', () => {
    test('shows the blue and red team tables', async () => {
      getMatch.mockResolvedValue({ data: createMatch() })

      await mountView()
      await flushPromises()

      expect(wrapper.findAll('h3').map((heading) => heading.text())).toEqual([
        'Tus métricas',
        'Equipo azul 18 asesinatos',
        'Equipo rojo 9 asesinatos',
      ])
    })
  })

  describe('route changes', () => {
    test('requests the new match when the route id changes', async () => {
      getMatch.mockResolvedValue({ data: createMatch() })
      await mountView()
      await flushPromises()

      await router.push('/matches/LA1_999')
      await flushPromises()

      expect(getMatch).toHaveBeenCalledTimes(2)
      expect(getMatch).toHaveBeenLastCalledWith('LA1_999')
    })
  })
})
