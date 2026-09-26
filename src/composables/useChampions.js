import { ref, watch } from 'vue'
import { getChampions } from '../api/recall'

export function useChampions(account, minGames) {
  const champions = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  let latestRequestId = 0

  async function loadChampions() {
    const requestId = ++latestRequestId

    isLoading.value = true
    error.value = null

    try {
      const response = await getChampions({
        account: account.value || undefined,
        minGames: minGames.value,
      })

      if (requestId !== latestRequestId) {
        return
      }

      champions.value = response.data
    } catch (requestError) {
      if (requestId !== latestRequestId) {
        return
      }

      error.value =
        requestError instanceof Error
          ? requestError
          : new Error('No se pudieron cargar los campeones.')
    } finally {
      if (requestId === latestRequestId) {
        isLoading.value = false
      }
    }
  }

  watch([account, minGames], loadChampions, { immediate: true })

  return {
    champions,
    isLoading,
    error,
    loadChampions,
  }
}
