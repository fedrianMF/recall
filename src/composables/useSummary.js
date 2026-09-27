import { ref, watch } from 'vue'
import { getSummary } from '../api/recall'

export function useSummary(account) {
  const summary = ref(null)
  const isLoading = ref(false)
  const error = ref(null)
  let latestRequestId = 0

  async function loadSummary() {
    const requestId = ++latestRequestId

    isLoading.value = true
    error.value = null

    try {
      const response = await getSummary({ account: account.value || undefined })

      if (requestId !== latestRequestId) {
        return
      }

      summary.value = response.data
    } catch (requestError) {
      if (requestId !== latestRequestId) {
        return
      }

      error.value =
        requestError instanceof Error ? requestError : new Error('No se pudo cargar el resumen.')
    } finally {
      if (requestId === latestRequestId) {
        isLoading.value = false
      }
    }
  }

  watch(account, loadSummary, { immediate: true })

  return {
    summary,
    isLoading,
    error,
    loadSummary,
  }
}
