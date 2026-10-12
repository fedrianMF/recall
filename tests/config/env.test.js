import { afterEach, describe, expect, test, vi } from 'vitest'

async function loadConfig({ apiUrl = 'http://api.test', useMocks = 'false' } = {}) {
  vi.stubEnv('VITE_API_URL', apiUrl)
  vi.stubEnv('VITE_USE_MOCKS', useMocks)
  vi.resetModules()

  return import('@/config/env')
}

function getThrownError(callback) {
  try {
    callback()
  } catch (error) {
    return error
  }

  throw new Error('Expected the callback to throw')
}

function createResponse(data) {
  return {
    ok: true,
    status: 200,
    json: vi.fn().mockResolvedValue(data),
  }
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.resetModules()
})

describe('environment configuration', () => {
  describe('ConfigError', () => {
    test('is an Error named ConfigError', async () => {
      const { ConfigError } = await loadConfig()

      const error = new ConfigError('Invalid configuration')

      expect(error).toBeInstanceOf(Error)
      expect(error.name).toBe('ConfigError')
      expect(error.message).toBe('Invalid configuration')
    })
  })

  describe('parseEnv', () => {
    test('enables mocks only for the exact true string', async () => {
      const { parseEnv } = await loadConfig()
      const env = { VITE_USE_MOCKS: 'true', PROD: false }

      const config = parseEnv(env)

      expect(config).toEqual({ apiUrl: null, useMocks: true })
    })

    test.each(['false', 'TRUE', '1', '', undefined])(
      'does not enable mocks for %j',
      async (value) => {
        const { parseEnv } = await loadConfig()
        const env = {
          VITE_API_URL: 'http://api.test',
          VITE_USE_MOCKS: value,
          PROD: false,
        }

        const config = parseEnv(env)

        expect(config).toEqual({ apiUrl: 'http://api.test', useMocks: false })
      },
    )

    test('rejects mock mode in production', async () => {
      const { ConfigError, parseEnv } = await loadConfig()
      const env = { VITE_USE_MOCKS: 'true', PROD: true }

      const error = getThrownError(() => parseEnv(env))

      expect(error).toBeInstanceOf(ConfigError)
      expect(error.message).toContain('VITE_USE_MOCKS')
      expect(error.message).toContain('production')
    })

    test.each([undefined, ''])('allows an absent API URL in mock mode: %j', async (apiUrl) => {
      const { parseEnv } = await loadConfig()
      const env = {
        VITE_API_URL: apiUrl,
        VITE_USE_MOCKS: 'true',
        PROD: false,
      }

      const config = parseEnv(env)

      expect(config).toEqual({ apiUrl: null, useMocks: true })
    })

    test('normalizes an optional API URL in mock mode', async () => {
      const { parseEnv } = await loadConfig()
      const env = {
        VITE_API_URL: 'https://api.example.com/',
        VITE_USE_MOCKS: 'true',
        PROD: false,
      }

      const config = parseEnv(env)

      expect(config).toEqual({ apiUrl: 'https://api.example.com', useMocks: true })
    })

    test('rejects an invalid optional API URL in mock mode', async () => {
      const { ConfigError, parseEnv } = await loadConfig()
      const env = {
        VITE_API_URL: 'not a url',
        VITE_USE_MOCKS: 'true',
        PROD: false,
      }

      const error = getThrownError(() => parseEnv(env))

      expect(error).toBeInstanceOf(ConfigError)
      expect(error.message).toContain('VITE_API_URL')
    })

    test('rejects an optional API URL with a path in mock mode', async () => {
      const { ConfigError, parseEnv } = await loadConfig()
      const env = {
        VITE_API_URL: 'http://api.test/base/',
        VITE_USE_MOCKS: 'true',
        PROD: false,
      }

      const error = getThrownError(() => parseEnv(env))

      expect(error).toBeInstanceOf(ConfigError)
      expect(error.message).toContain('VITE_API_URL')
      expect(error.message).toContain('origin')
    })

    test.each([undefined, '', '   '])(
      'rejects a missing API URL outside mock mode: %j',
      async (apiUrl) => {
        const { ConfigError, parseEnv } = await loadConfig()
        const env = {
          VITE_API_URL: apiUrl,
          VITE_USE_MOCKS: 'false',
          PROD: false,
        }

        const error = getThrownError(() => parseEnv(env))

        expect(error).toBeInstanceOf(ConfigError)
        expect(error.message).toContain('VITE_API_URL')
      },
    )

    test.each(['api.test', 'not a url', 'ftp://api.test', 'javascript:alert(1)'])(
      'rejects a non-HTTP absolute API URL: %s',
      async (apiUrl) => {
        const { ConfigError, parseEnv } = await loadConfig()
        const env = {
          VITE_API_URL: apiUrl,
          VITE_USE_MOCKS: 'false',
          PROD: false,
        }

        const error = getThrownError(() => parseEnv(env))

        expect(error).toBeInstanceOf(ConfigError)
        expect(error.message).toContain('VITE_API_URL')
      },
    )

    test.each([
      'http://api.test/base/',
      'http://api.test/v1',
      'http://api.test?x=1',
      'http://api.test/#top',
    ])('rejects an API URL that is not only an origin: %s', async (apiUrl) => {
      const { ConfigError, parseEnv } = await loadConfig()
      const env = {
        VITE_API_URL: apiUrl,
        VITE_USE_MOCKS: 'false',
        PROD: false,
      }

      const error = getThrownError(() => parseEnv(env))

      expect(error).toBeInstanceOf(ConfigError)
      expect(error.message).toContain('VITE_API_URL')
      expect(error.message).toContain('origin')
    })

    test.each([
      ['https://api.example.com/', 'https://api.example.com'],
      ['http://localhost:8000', 'http://localhost:8000'],
      ['HTTP://API.TEST', 'http://api.test'],
      ['http://api.test', 'http://api.test'],
      ['http://api.test/', 'http://api.test'],
    ])('normalizes the API origin %s', async (apiUrl, expectedApiUrl) => {
      const { parseEnv } = await loadConfig()
      const env = {
        VITE_API_URL: apiUrl,
        VITE_USE_MOCKS: 'false',
        PROD: false,
      }

      const config = parseEnv(env)

      expect(config).toEqual({ apiUrl: expectedApiUrl, useMocks: false })
    })

    test('accepts a valid API origin in production outside mock mode', async () => {
      const { parseEnv } = await loadConfig()
      const env = {
        VITE_API_URL: 'https://api.example.com/',
        VITE_USE_MOCKS: 'false',
        PROD: true,
      }

      const config = parseEnv(env)

      expect(config).toEqual({ apiUrl: 'https://api.example.com', useMocks: false })
    })
  })

  describe('module exports', () => {
    test('exports mock mode calculated from import.meta.env', async () => {
      const config = await loadConfig({ apiUrl: '', useMocks: 'true' })

      expect(config.useMocks).toBe(true)
      expect(config.apiUrl).toBe(null)
    })

    test('exports a normalized API origin calculated from import.meta.env', async () => {
      const config = await loadConfig({ apiUrl: 'http://api.test/', useMocks: 'false' })

      expect(config.useMocks).toBe(false)
      expect(config.apiUrl).toBe('http://api.test')
    })

    test('rejects the module import when the required API URL is empty', async () => {
      vi.stubEnv('VITE_API_URL', '')
      vi.stubEnv('VITE_USE_MOCKS', 'false')
      vi.resetModules()

      const configImport = import('@/config/env')

      await expect(configImport).rejects.toMatchObject({
        name: 'ConfigError',
        message: expect.stringContaining('VITE_API_URL'),
      })
    })
  })

  describe('recall API integration', () => {
    test('rejects the API module import when configuration is invalid', async () => {
      vi.stubEnv('VITE_API_URL', '')
      vi.stubEnv('VITE_USE_MOCKS', 'false')
      vi.resetModules()

      const apiImport = import('@/api/recall')

      await expect(apiImport).rejects.toMatchObject({
        name: 'ConfigError',
        message: expect.stringContaining('VITE_API_URL'),
      })
    })

    test('uses the validated API origin for summary requests', async () => {
      const responseBody = { data: { games: 12 } }
      const fetchMock = vi.fn().mockResolvedValue(createResponse(responseBody))
      vi.stubGlobal('fetch', fetchMock)
      vi.stubEnv('VITE_API_URL', 'http://api.test')
      vi.stubEnv('VITE_USE_MOCKS', 'false')
      vi.resetModules()
      const { getSummary } = await import('@/api/recall')

      const result = await getSummary()

      expect(String(fetchMock.mock.calls[0][0])).toBe('http://api.test/api/v1/summary')
      expect(result).toBe(responseBody)
    })
  })
})
