import { mount } from '@vue/test-utils'
import { describe, expect, test, vi } from 'vitest'

// The shell mounts the session controls and the sync button, which import the API layer.
// That layer reads VITE_API_URL on load, and CI has no .env, so the tests use a fake one.
vi.mock('@/api/recall', () => ({
  getAccounts: vi.fn(),
  getLatestSync: vi.fn(),
  getMe: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  resendVerificationEmail: vi.fn(),
  setUnauthorizedHandler: vi.fn(),
  startSync: vi.fn(),
}))

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
