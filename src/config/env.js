import { ConfigError, parseEnv } from './parseEnv'

export { ConfigError, parseEnv }

export const { apiUrl, useMocks } = parseEnv(import.meta.env)
