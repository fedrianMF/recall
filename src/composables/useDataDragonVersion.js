import { ref } from 'vue'
import { getDataDragonVersion } from '../api/recall'

const version = ref(null)
let requestStarted = false

async function loadVersion() {
  if (requestStarted || version.value) {
    return
  }

  requestStarted = true

  try {
    version.value = await getDataDragonVersion()
  } catch {
    version.value = null
  } finally {
    requestStarted = false
  }
}

export function useDataDragonVersion() {
  loadVersion()

  return { version }
}
