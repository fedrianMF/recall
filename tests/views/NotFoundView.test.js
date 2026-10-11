import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, test } from 'vitest'

import NotFoundView from '@/views/NotFoundView.vue'

import { createTestRouter } from '../helpers/createTestRouter'

let wrapper

describe('NotFoundView', () => {
  afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
  })

  test('shows the not-found message with one main heading', async () => {
    const router = await createTestRouter()
    wrapper = mount(NotFoundView, { global: { plugins: [router] } })

    expect(wrapper.findAll('h1')).toHaveLength(1)
    expect(wrapper.get('h1').text()).toBe('Página no encontrada')
    expect(wrapper.text()).toContain('404')
    expect(wrapper.text()).toContain('La dirección que abriste no existe o fue movida.')
  })

  test('links back to the summary', async () => {
    const router = await createTestRouter()
    wrapper = mount(NotFoundView, { global: { plugins: [router] } })

    const link = wrapper.get('a')
    expect(link.text()).toBe('Volver al resumen')
    expect(link.attributes('href')).toBe('/')
  })
})
