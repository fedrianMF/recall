import { watch } from 'vue'
import { getChampions } from '../api/recall'
import { useApiRequest } from './useApiRequest'

export function useChampions(account, minGames) {
  const {
    data: champions,
    isLoading,
    error,
    load: loadChampions,
  } = useApiRequest(
    async () => {
      const response = await getChampions({
        account: account.value || undefined,
        minGames: minGames.value,
      })

      return response.data
    },
    {
      initialData: [],
      errorMessage: 'No se pudieron cargar los campeones.',
    },
  )

  watch([account, minGames], loadChampions, { immediate: true })

  return {
    champions,
    isLoading,
    error,
    loadChampions,
  }
}
