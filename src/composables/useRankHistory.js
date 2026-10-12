import { computed, watch } from 'vue'
import { getRankHistory } from '../api/recall'
import { useApiRequest } from './useApiRequest'

export function useRankHistory(account, queueType) {
  const {
    data,
    isLoading: isLoadingRequest,
    error: errorRequest,
    load,
    reset,
  } = useApiRequest(
    async () => {
      const response = await getRankHistory({
        account: account.value,
        queueType: queueType.value || undefined,
      })

      return response.data
    },
    {
      initialData: [],
      errorMessage: 'No se pudo cargar el historial de rango.',
    },
  )

  // The endpoint requires an account, so nothing is requested without one.
  const hasAccount = computed(() => Boolean(account.value))

  // With an empty account, or when the account or queue changes, the state is reset and
  // the request in flight is invalidated, so data of another account is never shown.
  const history = data
  const isLoading = isLoadingRequest
  const error = errorRequest

  function loadHistory() {
    if (!hasAccount.value) {
      return
    }

    return load()
  }

  watch(
    [account, queueType],
    () => {
      reset()

      if (hasAccount.value) {
        load()
      }
    },
    { immediate: true },
  )

  return {
    history,
    isLoading,
    error,
    hasAccount,
    loadHistory,
  }
}
