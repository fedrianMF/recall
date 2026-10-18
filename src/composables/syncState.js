import { shallowRef } from 'vue'

export const latest = shallowRef(null)
export const isRunning = shallowRef(false)
export const error = shallowRef(null)
export const completedCount = shallowRef(0)

export let timer = null
export let startedAt = 0
export let requestInFlight = false
export let latestLoaded = false
export let latestLoadPromise = null
export let pollingGeneration = 0

export function setTimer(value) {
  timer = value
}
export function setStartedAt(value) {
  startedAt = value
}
export function setRequestInFlight(value) {
  requestInFlight = value
}
export function setLatestLoaded(value) {
  latestLoaded = value
}
export function setLatestLoadPromise(value) {
  latestLoadPromise = value
}
export function nextPollingGeneration() {
  pollingGeneration += 1
  return pollingGeneration
}

export function clearSyncState() {
  if (timer) clearTimeout(timer)
  timer = null
  startedAt = 0
  requestInFlight = false
  latestLoaded = false
  latestLoadPromise = null
  nextPollingGeneration()
  latest.value = null
  isRunning.value = false
  error.value = null
  completedCount.value = 0
}
