import { mount } from '@vue/test-utils'
import { describe, expect, test } from 'vitest'

import AppShell from '@/components/shell/AppShell.vue'

import { createTestRouter } from '../../helpers/createTestRouter'

async function mountShell() {
  const router = await createTestRouter()

  return mount(AppShell, { global: { plugins: [router] } })
}

describe('AppShell', () => {
  test('offers a "Saltar al contenido" link that points to #main', async () => {
    const wrapper = await mountShell()

    const link = wrapper.findAll('a').find((anchor) => anchor.text() === 'Saltar al contenido')

    expect(link).toBeDefined()
    expect(link.attributes('href')).toBe('#main')
  })

  test('gives the main landmark the id "main" so the skip link has a target', async () => {
    const wrapper = await mountShell()

    expect(wrapper.get('main').attributes('id')).toBe('main')
  })

  test('renders the slot content inside the main landmark', async () => {
    const wrapper = mount(AppShell, {
      global: { plugins: [await createTestRouter()] },
      slots: { default: '<p>Slot content</p>' },
    })

    expect(wrapper.get('main').text()).toContain('Slot content')
  })
})
