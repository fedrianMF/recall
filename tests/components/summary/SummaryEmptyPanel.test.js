import { mount } from '@vue/test-utils'
import { describe, expect, test } from 'vitest'

import SummaryEmptyPanel from '@/components/summary/SummaryEmptyPanel.vue'

describe('SummaryEmptyPanel', () => {
  test('shows the default texts', () => {
    const wrapper = mount(SummaryEmptyPanel)

    const text = wrapper.text()

    expect(text).toContain('Aún no hay partidas registradas para esta cuenta.')
    expect(text).toContain('Cuando juegues, aparecerán aquí tus estadísticas.')
  })

  test('shows custom texts passed as props', () => {
    const wrapper = mount(SummaryEmptyPanel, {
      props: { title: 'Nada por aquí', description: 'Vuelve más tarde.' },
    })

    const text = wrapper.text()

    expect(text).toContain('Nada por aquí')
    expect(text).toContain('Vuelve más tarde.')
    expect(text).not.toContain('Aún no hay partidas registradas')
  })
})
