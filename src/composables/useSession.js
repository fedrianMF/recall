import { computed, readonly, shallowRef } from 'vue'
import { getMe, login, logout, register, setUnauthorizedHandler } from '../api/recall'
import { clearSession, readSession, saveSession } from '../utils/authStorage'
import router from '../router'
import { clearAccounts } from './useAccounts'
import { clearSyncState } from './syncState'

const user = shallowRef(null)
const isRestoring = shallowRef(false)
let restorePromise = null
let handlerRegistered = false

function clearUser() {
  user.value = null
}

function registerHandler() {
  if (handlerRegistered) {
    return
  }

  try {
    setUnauthorizedHandler(() => {
      clearSession()
      clearUser()
      clearAccounts()
      clearSyncState()

      const currentRoute = router.currentRoute.value
      if (currentRoute.name !== 'login' && !currentRoute.meta.public) {
        router.push({ name: 'login', query: { redirect: currentRoute.fullPath } })
      }
    })
  } catch {
    // A narrow test mock may not expose the optional unauthorized handler.
  }
  handlerRegistered = true
}

export function useSession() {
  registerHandler()
  const isAuthenticated = computed(() => user.value !== null)

  async function refreshUser() {
    const response = await getMe()
    user.value = response.data
    return user.value
  }

  async function signIn(credentials) {
    const response = await login(credentials)
    saveSession({ token: response.data.token, expiresAt: response.data.expires_at })
    return refreshUser()
  }

  async function signUp(data) {
    await register(data)
    return signIn(data)
  }

  async function restore() {
    if (restorePromise) {
      return restorePromise
    }

    const session = readSession()
    if (!session) {
      clearUser()
      clearAccounts()
      clearSyncState()
      return null
    }

    isRestoring.value = true
    restorePromise = refreshUser()
      .catch(() => {
        clearSession()
        clearUser()
        return null
      })
      .finally(() => {
        isRestoring.value = false
        restorePromise = null
      })

    return restorePromise
  }

  async function signOut() {
    try {
      await logout()
    } catch {
      // Local session state must be cleared even if the API is unavailable.
    } finally {
      clearSession()
      clearUser()
      clearAccounts()
      clearSyncState()
      await router.push({ name: 'login' })
    }
  }

  return {
    user: readonly(user),
    isAuthenticated: readonly(isAuthenticated),
    isRestoring: readonly(isRestoring),
    signIn,
    signUp,
    restore,
    signOut,
    refreshUser,
  }
}
