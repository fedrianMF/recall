import { mount } from '@vue/test-utils'
import { describe, expect, test } from 'vitest'

import TeamTable from '@/components/TeamTable.vue'

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
    cs: null,
    damage: null,
    is_me: false,
  },
]

function createTeam(overrides = {}) {
  return {
    team_id: 100,
    win: true,
    kills: 18,
    players,
    ...overrides,
  }
}

function mountTable(team = createTeam()) {
  return mount(TeamTable, {
    props: { team, dataDragonVersion: '14.1.1' },
  })
}

describe('TeamTable', () => {
  test.each([
    [100, 'Equipo azul'],
    [200, 'Equipo rojo'],
    [300, 'Equipo rojo'],
  ])('shows the expected team name for team id %s', (teamId, teamName) => {
    const wrapper = mountTable(createTeam({ team_id: teamId }))

    expect(wrapper.get('h3').text()).toContain(teamName)
  })

  test('shows the team kill count', () => {
    const wrapper = mountTable()

    expect(wrapper.get('h3').text()).toContain('18 asesinatos')
  })

  test.each([
    [true, 'Victoria'],
    [false, 'Derrota'],
  ])('shows the team result when win is %s', (win, result) => {
    const wrapper = mountTable(createTeam({ win }))

    expect(wrapper.text()).toContain(result)
  })

  test('shows the five column headings', () => {
    const wrapper = mountTable()

    expect(wrapper.findAll('thead th').map((heading) => heading.text())).toEqual([
      'Jugador',
      'Posición',
      'K / D / A',
      'CS',
      'Daño',
    ])
  })

  test('shows one row per player with its literal values', () => {
    const wrapper = mountTable()

    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(2)
    expect(rows[0].text()).toContain('PlayerOne#LAN')
    expect(rows[0].text()).toContain('Ahri')
    expect(rows[0].text()).toContain('MIDDLE')
    expect(rows[0].text()).toContain('7 / 2 / 11')
    expect(rows[0].text()).toContain('187')
    expect(rows[0].text()).toContain('23456')
    expect(rows[1].text()).toContain('PlayerTwo#LAN')
    expect(rows[1].text()).toContain('Braum')
    expect(rows[1].text()).toContain('UTILITY')
    expect(rows[1].text()).toContain('1 / 4 / 16')
  })

  test('marks only the current player as Tú', () => {
    const wrapper = mountTable()

    const rows = wrapper.findAll('tbody tr')
    expect(rows[0].text()).toContain('Tú')
    expect(rows[1].text()).not.toContain('Tú')
    expect(wrapper.findAll('tbody tr span').filter((badge) => badge.text() === 'Tú')).toHaveLength(
      1,
    )
  })

  test('shows a dash for null CS and damage values', () => {
    const wrapper = mountTable()

    const cells = wrapper.findAll('tbody tr')[1].findAll('td')
    expect(cells[3].text()).toBe('—')
    expect(cells[4].text()).toBe('—')
  })
})
