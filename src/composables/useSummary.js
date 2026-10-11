import { watch } from 'vue'
import { getSummary } from '../api/recall'
import { useApiRequest } from './useApiRequest'

export function useSummary(account) {
  const {
    data: summary,
    isLoading,
    error,
    load: loadSummary,
  } = useApiRequest(
    async () => {
      const response = await getSummary({ account: account.value || undefined })

      return response.data
    },
    {
      initialData: null,
      errorMessage: 'No se pudo cargar el resumen.',
    },
  )

  watch(account, loadSummary, { immediate: true })

  return {
    summary,
    isLoading,
    error,
    loadSummary,
  }
}
