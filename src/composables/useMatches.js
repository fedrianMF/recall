import { computed, watch } from 'vue'
import { getMatches } from '../api/recall'
import { useApiRequest } from './useApiRequest'

export function useMatches(account, queue, page) {
  const {
    data: response,
    isLoading,
    error,
    load: loadMatches,
  } = useApiRequest(
    async () => {
      return getMatches({
        account: account.value || undefined,
        queue: queue.value || undefined,
        page: page.value,
      })
    },
    {
      initialData: null,
      errorMessage: 'No se pudo cargar el historial.',
    },
  )

  const matches = computed(() => response.value?.data ?? [])
  const links = computed(() => response.value?.links ?? {})
  const meta = computed(() => response.value?.meta ?? { current_page: 1, last_page: 1, total: 0 })

  watch([account, queue], () => {
    if (page.value === 1) {
      loadMatches()
      return
    }

    page.value = 1
  })

  watch(page, loadMatches, { immediate: true })

  return {
    matches,
    links,
    meta,
    isLoading,
    error,
    loadMatches,
  }
}
