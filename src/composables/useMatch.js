import { watch } from 'vue'
import { getMatch } from '../api/recall'
import { useApiRequest } from './useApiRequest'

export function useMatch(id) {
  const {
    data: match,
    isLoading,
    error,
    load: loadMatch,
  } = useApiRequest(
    async () => {
      const response = await getMatch(id.value)

      return response.data
    },
    {
      initialData: null,
      errorMessage: 'No se pudo cargar la partida.',
    },
  )

  watch(id, loadMatch, { immediate: true })

  return {
    match,
    isLoading,
    error,
    loadMatch,
  }
}
