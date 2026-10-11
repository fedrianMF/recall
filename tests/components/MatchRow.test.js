import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, test } from 'vitest'

import MatchRow from '@/components/MatchRow.vue'

import { createTestRouter } from '../helpers/createTestRouter'

const baseMatch = {
  id: 77,
  platform: 'la1',
  queue: { id: 420, name: 'Ranked Solo/Duo' },
  started_at: '2026-01-01T10:00:00Z',
  duration_seconds: 709,
  champion: 'Ahri',
  position: 'MIDDLE',
  win: true,
  kills: 7,
  deaths: 2,
  assists: 11,
  kda: 9,
  cs: 215,
  cs_per_min: 7.3,
  damage_to_champions: 24500,
  vision_score: 30,
  remake: false,
}

let wrapper

// RouterLink needs a router, so we install the in-memory one as a plugin.
async function mountRow(matchOverrides = {}, props = {}) {
  const router = await createTestRouter()

  wrapper = mount(MatchRow, {
    props: { match: { ...baseMatch, ...matchOverrides }, ...props },
    global: { plugins: [router] },
  })

  return wrapper
}

describe('MatchRow', () => {
  afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
  })

  describe('result', () => {
    test('shows Victoria for a win', async () => {
      await mountRow({ win: true, remake: false })

      expect(wrapper.text()).toContain('Victoria')
      expect(wrapper.text()).not.toContain('Derrota')
    })

    test('shows Derrota for a loss', async () => {
      await mountRow({ win: false, remake: false })

      expect(wrapper.text()).toContain('Derrota')
      expect(wrapper.text()).not.toContain('Victoria')
    })

    test('shows Remake instead of Victoria when a won match is a remake', async () => {
      await mountRow({ win: true, remake: true })

      expect(wrapper.text()).toContain('Remake')
      expect(wrapper.text()).not.toContain('Victoria')
    })

    test('shows Remake instead of Derrota when a lost match is a remake', async () => {
      await mountRow({ win: false, remake: true })

      expect(wrapper.text()).toContain('Remake')
      expect(wrapper.text()).not.toContain('Derrota')
    })
  })

  describe('content', () => {
    test('shows the champion name and the queue name', async () => {
      await mountRow({ champion: 'Ahri', queue: { id: 450, name: 'ARAM' } })

      expect(wrapper.text()).toContain('Ahri')
      expect(wrapper.text()).toContain('ARAM')
    })

    test('shows the duration as minutes and seconds', async () => {
      await mountRow({ duration_seconds: 709 })

      expect(wrapper.text()).toContain('11:49')
    })

    test('pads the seconds of the duration with a zero', async () => {
      await mountRow({ duration_seconds: 605 })

      expect(wrapper.text()).toContain('10:05')
    })

    test('shows kills, deaths and assists', async () => {
      await mountRow({ kills: 7, deaths: 2, assists: 11 })

      expect(wrapper.text()).toContain('7 / 2 / 11')
    })

    test('shows the KDA value', async () => {
      await mountRow({ kda: 4.5 })

      expect(wrapper.text()).toMatch(/KDA\s*4\.5/)
    })

    test('shows the CS total and CS per minute', async () => {
      await mountRow({ cs: 215, cs_per_min: 7.3 })

      expect(wrapper.text()).toContain('215 · 7.3/min')
    })

    test('shows the damage to champions', async () => {
      await mountRow({ damage_to_champions: 24500 })

      expect(wrapper.text()).toMatch(/Daño\s*24500/)
    })

    test('shows a dash for a null KDA', async () => {
      await mountRow({ kda: null })

      expect(wrapper.text()).toMatch(/KDA\s*—/)
    })

    test('shows a dash for a null duration', async () => {
      await mountRow({ duration_seconds: null })

      expect(wrapper.text()).toContain('—')
      expect(wrapper.text()).not.toContain('0:00')
    })
  })

  describe('link', () => {
    test('is a link to the detail page of that match', async () => {
      await mountRow({ id: 77 })

      // An <a> with an href has the implicit role "link".
      const link = wrapper.get('a')

      expect(link.attributes('href')).toBe('/matches/77')
    })

    test('links to a different detail page for a different match', async () => {
      await mountRow({ id: 123 })

      expect(wrapper.get('a').attributes('href')).toBe('/matches/123')
    })
  })

  describe('champion image', () => {
    test('renders without a Data Dragon version', async () => {
      await mountRow()

      expect(wrapper.text()).toContain('Ahri')
      expect(wrapper.find('img').exists()).toBe(false)
    })

    test('shows the champion image when a Data Dragon version is given', async () => {
      await mountRow({}, { dataDragonVersion: '14.1.1' })

      expect(wrapper.get('img').attributes('src')).toBe(
        'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Ahri.png',
      )
    })
  })
})
