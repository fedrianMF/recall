import { ref, watch } from 'vue'
import { getMatches } from '../api/recall'

export function useMatches(account, queue, page) {
  const matches = ref([])
  const links = ref({})
  const meta = ref({ current_page: 1, last_page: 1, total: 0 })
  const isLoading = ref(false)
  const error = ref(null)
  let latestRequestId = 0

  async function loadMatches() {
    const requestId = ++latestRequestId

    isLoading.value = true
    error.value = null

    try {
      const response = await getMatches({
        account: account.value || undefined,
        queue: queue.value || undefined,
        page: page.value,
      })

      if (requestId !== latestRequestId) {
        return
      }

      matches.value = response.data
      links.value = response.links
      meta.value = response.meta
    } catch (requestError) {
      if (requestId !== latestRequestId) {
        return
      }

      error.value =
        requestError instanceof Error
          ? requestError
          : new Error('No se pudo cargar el historial.')
    } finally {
      if (requestId === latestRequestId) {
        isLoading.value = false
      }
    }
  }

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
