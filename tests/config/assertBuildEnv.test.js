import { afterEach, describe, expect, test, vi } from 'vitest'

function getThrownError(callback) {
  try {
    callback()
  } catch (error) {
    return error
  }

  throw new Error('Expected the callback to throw')
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe('assertBuildEnv', () => {
  test.each([
    ['serve', 'production', { VITE_USE_MOCKS: 'true' }],
    ['build', 'development', {}],
    ['build', 'test', { VITE_USE_MOCKS: 'true' }],
  ])('skips validation for command %s in mode %s', async (command, mode, env) => {
    const { assertBuildEnv } = await import('@/config/assertBuildEnv')

    const result = assertBuildEnv({ command, mode, env })

    expect(result).toBeUndefined()
  })

  test.each([
    ['false', { apiUrl: 'https://api.example.com', useMocks: false }],
    [undefined, { apiUrl: 'https://api.example.com', useMocks: false }],
  ])(
    'returns the validated production configuration when mock mode is %j',
    async (useMocks, expectedConfig) => {
      const { assertBuildEnv } = await import('@/config/assertBuildEnv')
      const env = {
        VITE_API_URL: 'https://api.example.com',
        VITE_USE_MOCKS: useMocks,
      }

      const config = assertBuildEnv({ command: 'build', mode: 'production', env })

      expect(config).toEqual(expectedConfig)
    },
  )

  test('rejects mock mode in a production build with recovery guidance', async () => {
    const { assertBuildEnv } = await import('@/config/assertBuildEnv')
    const { ConfigError } = await import('@/config/parseEnv')
    const env = {
      VITE_API_URL: 'https://api.example.com',
      VITE_USE_MOCKS: 'true',
    }

    const error = getThrownError(() =>
      assertBuildEnv({ command: 'build', mode: 'production', env }),
    )

    expect(error).toBeInstanceOf(ConfigError)
    expect(error.message).toContain('VITE_USE_MOCKS')
    expect(error.message).toContain('production')
    expect(error.message).toContain('.env.development')
  })

  test.each([undefined, ''])('rejects a missing production API URL: %j', async (apiUrl) => {
    const { assertBuildEnv } = await import('@/config/assertBuildEnv')
    const { ConfigError } = await import('@/config/parseEnv')
    const env = {
      VITE_API_URL: apiUrl,
      VITE_USE_MOCKS: 'false',
    }

    const error = getThrownError(() =>
      assertBuildEnv({ command: 'build', mode: 'production', env }),
    )

    expect(error).toBeInstanceOf(ConfigError)
    expect(error.message).toContain('VITE_API_URL')
  })

  test.each([undefined, 'https://api.example.com/base'])(
    'does not suggest .env.development for an API URL error: %j',
    async (apiUrl) => {
      const { assertBuildEnv } = await import('@/config/assertBuildEnv')
      const env = {
        VITE_API_URL: apiUrl,
        VITE_USE_MOCKS: 'false',
      }

      const error = getThrownError(() =>
        assertBuildEnv({ command: 'build', mode: 'production', env }),
      )

      expect(error.message).not.toContain('.env.development')
    },
  )

  test.each(['https://api.example.com/base', 'api.example.com'])(
    'rejects an invalid production API URL: %s',
    async (apiUrl) => {
      const { assertBuildEnv } = await import('@/config/assertBuildEnv')
      const { ConfigError } = await import('@/config/parseEnv')
      const env = {
        VITE_API_URL: apiUrl,
        VITE_USE_MOCKS: 'false',
      }

      const error = getThrownError(() =>
        assertBuildEnv({ command: 'build', mode: 'production', env }),
      )

      expect(error).toBeInstanceOf(ConfigError)
      expect(error.message).toContain('VITE_API_URL')
    },
  )

  test.each(['TRUE', '1'])('treats %s as real API mode in production', async (useMocks) => {
    const { assertBuildEnv } = await import('@/config/assertBuildEnv')
    const env = {
      VITE_API_URL: 'https://api.example.com',
      VITE_USE_MOCKS: useMocks,
    }

    const config = assertBuildEnv({ command: 'build', mode: 'production', env })

    expect(config).toEqual({ apiUrl: 'https://api.example.com', useMocks: false })
  })

  test.each([
    [{ VITE_API_URL: 'https://api.example.com', VITE_USE_MOCKS: 'true' }],
    [{ VITE_API_URL: '', VITE_USE_MOCKS: 'false' }],
    [{ VITE_API_URL: 'https://api.example.com/base', VITE_USE_MOCKS: 'false' }],
  ])('prefixes production validation errors for env %j', async (env) => {
    const { assertBuildEnv } = await import('@/config/assertBuildEnv')

    const error = getThrownError(() =>
      assertBuildEnv({ command: 'build', mode: 'production', env }),
    )

    expect(error.message.startsWith('Invalid production build configuration.')).toBe(true)
  })

  test('validates only the environment object passed by the caller', async () => {
    vi.stubEnv('VITE_API_URL', '')
    vi.stubEnv('VITE_USE_MOCKS', 'true')
    vi.resetModules()
    const { assertBuildEnv } = await import('@/config/assertBuildEnv')
    const env = {
      VITE_API_URL: 'https://api.example.com',
      VITE_USE_MOCKS: 'false',
    }

    const config = assertBuildEnv({ command: 'build', mode: 'production', env })

    expect(config).toEqual({ apiUrl: 'https://api.example.com', useMocks: false })
  })
})
