const storageKey = 'recall.session'

export function readSession() {
  try {
    const rawSession = localStorage.getItem(storageKey)

    if (!rawSession) {
      return null
    }

    const session = JSON.parse(rawSession)

    if (
      !session?.token ||
      !session?.expiresAt ||
      new Date(session.expiresAt).getTime() <= Date.now()
    ) {
      clearSession()
      return null
    }

    return { token: session.token, expiresAt: session.expiresAt }
  } catch {
    return null
  }
}

export function saveSession({ token, expiresAt }) {
  try {
    localStorage.setItem(storageKey, JSON.stringify({ token, expiresAt }))
  } catch {
    // Storage can be disabled by the browser; the session remains in memory.
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(storageKey)
  } catch {
    // Storage can be disabled by the browser.
  }
}
