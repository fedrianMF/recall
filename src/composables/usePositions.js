import { watch } from 'vue'
import { getPositions } from '../api/recall'
import { useApiRequest } from './useApiRequest'

export function usePositions(account) {
  const {
    data: positions,
    isLoading,
    error,
    load: loadPositions,
    reset,
  } = useApiRequest(
    async () => {
      const response = await getPositions({ account: account.value || undefined })

      return response.data
    },
    {
      initialData: [],
      errorMessage: 'No se pudieron cargar las posiciones.',
    },
  )

  // A new account starts clean, so data or errors of the previous one never show.
  // The exposed loadPositions (manual refresh) does not reset.
  watch(
    account,
    () => {
      reset()
      loadPositions()
    },
    { immediate: true },
  )

  return {
    positions,
    isLoading,
    error,
    loadPositions,
  }
}
