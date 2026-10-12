import { afterEach, describe, expect, test } from 'vitest'

afterEach(() => {
  document.body.replaceChildren()
})

describe('showConfigError', () => {
  test('renders an accessible configuration error in the provided container', async () => {
    const { showConfigError } = await import('@/config/showConfigError')
    const container = document.createElement('div')
    const error = new Error('VITE_API_URL is required')

    showConfigError(error, container)

    const alert = container.querySelector('[role="alert"]')
    expect(alert).not.toBe(null)
    expect(alert.querySelector('h1').textContent).toBe('Error de configuración')
    expect(alert.querySelector('p').textContent).toBe('VITE_API_URL is required')
  })

  test('returns the created alert element', async () => {
    const { showConfigError } = await import('@/config/showConfigError')
    const container = document.createElement('div')
    const error = new Error('Invalid configuration')

    const result = showConfigError(error, container)

    expect(result).toBe(container.querySelector('[role="alert"]'))
  })

  test('renders an HTML-shaped message as text without creating elements', async () => {
    const { showConfigError } = await import('@/config/showConfigError')
    const container = document.createElement('div')
    const message = '<img src=x onerror=alert(1)>'
    const error = new Error(message)

    showConfigError(error, container)

    expect(container.querySelector('p').textContent).toBe(message)
    expect(container.querySelector('img')).toBe(null)
  })

  test('uses the app element when no container is provided', async () => {
    const { showConfigError } = await import('@/config/showConfigError')
    const app = document.createElement('div')
    app.id = 'app'
    document.body.append(app)
    const error = new Error('Invalid configuration')

    const result = showConfigError(error)

    expect(result.parentElement).toBe(app)
    expect(app.querySelector('[role="alert"]')).toBe(result)
  })

  test('uses the document body when no container or app element exists', async () => {
    const { showConfigError } = await import('@/config/showConfigError')
    const error = new Error('Invalid configuration')

    const result = showConfigError(error)

    expect(result.parentElement).toBe(document.body)
    expect(document.body.querySelector('[role="alert"]')).toBe(result)
  })

  test('replaces previous container content', async () => {
    const { showConfigError } = await import('@/config/showConfigError')
    const container = document.createElement('div')
    const previousContent = document.createElement('button')
    previousContent.textContent = 'Retry'
    container.append(previousContent)
    const error = new Error('Invalid configuration')

    showConfigError(error, container)

    expect(container.childElementCount).toBe(1)
    expect(container.querySelector('button')).toBe(null)
    expect(container.querySelector('[role="alert"]')).not.toBe(null)
  })

  test('renders a non-Error value as its string message', async () => {
    const { showConfigError } = await import('@/config/showConfigError')
    const container = document.createElement('div')

    expect(() => showConfigError('boom', container)).not.toThrow()
    expect(container.querySelector('p').textContent).toBe('boom')
  })
})
