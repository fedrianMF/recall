import { ref, watch } from 'vue'
import { getMatch } from '../api/recall'

export function useMatch(id) {
  const match = ref(null)
  const isLoading = ref(false)
  const error = ref(null)
  let latestRequestId = 0

  async function loadMatch() {
    const requestId = ++latestRequestId

    isLoading.value = true
    error.value = null

    try {
      const response = await getMatch(id.value)

      if (requestId !== latestRequestId) {
        return
      }

      match.value = response.data
    } catch (requestError) {
      if (requestId !== latestRequestId) {
        return
      }

      error.value =
        requestError instanceof Error ? requestError : new Error('No se pudo cargar la partida.')
    } finally {
      if (requestId === latestRequestId) {
        isLoading.value = false
      }
    }
  }

  watch(id, loadMatch, { immediate: true })

  return {
    match,
    isLoading,
    error,
    loadMatch,
  }
}
