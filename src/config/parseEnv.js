export class ConfigError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ConfigError'
  }
}

function normalizeApiUrl(value) {
  let url

  try {
    url = new URL(value.trim())
  } catch {
    throw new ConfigError(
      'VITE_API_URL must be an absolute HTTP or HTTPS URL such as https://api.example.com',
    )
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new ConfigError('VITE_API_URL must use HTTP or HTTPS, such as https://api.example.com')
  }

  if (url.pathname !== '/' || url.search || url.hash) {
    throw new ConfigError(
      'VITE_API_URL must be an origin such as https://api.example.com (no path, query or hash)',
    )
  }

  return url.origin
}

export function parseEnv(env) {
  // Only the exact string enables mocks. Values such as "TRUE" or "1" fail safely toward the real API.
  const useMocks = env.VITE_USE_MOCKS === 'true'
  const rawApiUrl = env.VITE_API_URL
  const apiUrlIsMissing =
    rawApiUrl === undefined || (typeof rawApiUrl === 'string' && rawApiUrl.trim() === '')

  if (useMocks && env.PROD === true) {
    throw new ConfigError('VITE_USE_MOCKS=true is not allowed in production')
  }

  if (apiUrlIsMissing) {
    if (useMocks) {
      return { apiUrl: null, useMocks }
    }

    throw new ConfigError(
      'VITE_API_URL is required and must be an origin such as https://api.example.com',
    )
  }

  return {
    apiUrl: normalizeApiUrl(rawApiUrl),
    useMocks,
  }
}
