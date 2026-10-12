import { afterEach, describe, expect, test, vi } from 'vitest'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe('parseEnv module', () => {
  test('exports the environment parser and its configuration error', async () => {
    const config = await import('@/config/parseEnv')

    expect(config.parseEnv).toEqual(expect.any(Function))
    expect(config.ConfigError).toEqual(expect.any(Function))
  })

  test('shares the parser and error exports with the runtime configuration module', async () => {
    vi.stubEnv('VITE_API_URL', 'http://api.test')
    vi.stubEnv('VITE_USE_MOCKS', 'false')
    vi.resetModules()

    const parser = await import('@/config/parseEnv')
    const runtimeConfig = await import('@/config/env')

    expect(runtimeConfig.parseEnv).toBe(parser.parseEnv)
    expect(runtimeConfig.ConfigError).toBe(parser.ConfigError)
  })

  test('imports without evaluating the runtime environment', async () => {
    vi.stubEnv('VITE_API_URL', '')
    vi.stubEnv('VITE_USE_MOCKS', 'false')
    vi.resetModules()

    const parserImport = import('@/config/parseEnv')

    await expect(parserImport).resolves.toMatchObject({
      parseEnv: expect.any(Function),
      ConfigError: expect.any(Function),
    })
  })

  test('normalizes a valid API origin', async () => {
    const { parseEnv } = await import('@/config/parseEnv')
    const env = {
      VITE_API_URL: 'http://api.test/',
      VITE_USE_MOCKS: 'false',
    }

    const config = parseEnv(env)

    expect(config).toEqual({ apiUrl: 'http://api.test', useMocks: false })
  })
})
