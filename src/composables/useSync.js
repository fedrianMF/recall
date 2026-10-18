import { onMounted, readonly, watch } from 'vue'
import { getLatestSync, startSync } from '../api/recall'
import { isActiveSync } from '../utils/syncStatus'
import { useSession } from './useSession'
import {
  clearSyncState,
  completedCount,
  error,
  isRunning,
  latest,
  latestLoadPromise,
  latestLoaded,
  nextPollingGeneration,
  pollingGeneration,
  requestInFlight,
  setLatestLoadPromise,
  setLatestLoaded,
  setRequestInFlight,
  setStartedAt,
  setTimer,
  startedAt,
  timer,
} from './syncState'

function stopPolling() {
  if (timer) clearTimeout(timer)
  setTimer(null)
  isRunning.value = false
  nextPollingGeneration()
}

async function poll() {
  if (requestInFlight || !isRunning.value) return
  const generation = pollingGeneration
  if (Date.now() - startedAt >= 5 * 60 * 1000) {
    stopPolling()
    error.value = 'La sincronización tarda más de lo normal.'
    return
  }

  setRequestInFlight(true)
  try {
    const result = await getLatestSync()
    if (generation !== pollingGeneration) return
    latest.value = result?.data ?? null
    if (!latest.value || !isActiveSync(latest.value.status)) {
      if (latest.value?.status === 'completed') completedCount.value += 1
      stopPolling()
    } else setTimer(setTimeout(poll, 3000))
  } catch (requestError) {
    if (generation === pollingGeneration) {
      error.value = requestError
      stopPolling()
    }
  } finally {
    setRequestInFlight(false)
  }
}

function beginPolling(run) {
  latest.value = run
  if (!isActiveSync(run?.status)) return
  if (!isRunning.value) {
    isRunning.value = true
    setStartedAt(Date.now())
    nextPollingGeneration()
  }
  poll()
}

function loadLatest() {
  if (latestLoaded) return latestLoadPromise
  setLatestLoaded(true)
  const promise = getLatestSync()
    .then((result) => {
      latest.value = result?.data ?? null
      if (isActiveSync(latest.value?.status)) beginPolling(latest.value)
      return latest.value
    })
    .catch((requestError) => {
      error.value = requestError
      return null
    })
    .finally(() => setLatestLoadPromise(null))
  setLatestLoadPromise(promise)
  return promise
}

export function useSync() {
  const { user } = useSession()

  onMounted(() => {
    if (user.value) loadLatest()
  })

  watch(user, (value) => {
    if (!value) clearSyncState()
    else loadLatest()
  })

  async function start() {
    if (isRunning.value) return
    error.value = null
    try {
      const response = await startSync()
      beginPolling(response.data)
    } catch (requestError) {
      if (requestError.status === 409) {
        isRunning.value = true
        setStartedAt(Date.now())
        nextPollingGeneration()
        await poll()
      } else error.value = requestError
    }
  }

  return {
    latest: readonly(latest),
    isRunning: readonly(isRunning),
    error: readonly(error),
    start,
    completedCount: readonly(completedCount),
  }
}

export { clearSyncState }
