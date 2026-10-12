import { ConfigError, parseEnv } from './parseEnv.js'

export function assertBuildEnv({ command, mode, env }) {
  if (command !== 'build' || mode !== 'production') {
    return undefined
  }

  try {
    return parseEnv({ ...env, PROD: true })
  } catch (error) {
    if (!(error instanceof ConfigError)) {
      throw error
    }

    let message = `Invalid production build configuration. ${error.message}`

    if (error.message.includes('VITE_USE_MOCKS')) {
      message +=
        '. Move VITE_USE_MOCKS=true to .env.development (it is read only by "npm run dev"), or build with VITE_USE_MOCKS=false.'
    }

    throw new ConfigError(message)
  }
}
