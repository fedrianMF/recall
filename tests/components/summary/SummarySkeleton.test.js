import { mount } from '@vue/test-utils'
import { describe, expect, test } from 'vitest'

import SummarySkeleton from '@/components/summary/SummarySkeleton.vue'

describe('SummarySkeleton', () => {
  test('is announced as a status with the loading text', () => {
    const wrapper = mount(SummarySkeleton)

    const status = wrapper.get('[role="status"]')

    expect(status.text()).toBe('Cargando resumen…')
  })
})
