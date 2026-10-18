import { readonly, shallowRef } from 'vue'
import { getAccounts } from '../api/recall'

const accounts = shallowRef([])
const isLoading = shallowRef(false)
const error = shallowRef(null)
const hasLoaded = shallowRef(false)
let loadingPromise = null

export function clearAccounts() {
  accounts.value = []
  error.value = null
  hasLoaded.value = false
}

export function useAccounts() {
  async function load() {
    if (loadingPromise) return loadingPromise
    isLoading.value = true
    error.value = null
    loadingPromise = getAccounts()
      .then((response) => {
        accounts.value = response.data
        hasLoaded.value = true
        return accounts.value
      })
      .catch((requestError) => {
        error.value = requestError
        throw requestError
      })
      .finally(() => {
        isLoading.value = false
        loadingPromise = null
      })
    return loadingPromise
  }

  function add(account) {
    if (!accounts.value.some((current) => current.id === account.id)) {
      accounts.value = [...accounts.value, account]
    }
  }

  return {
    accounts: readonly(accounts),
    isLoading: readonly(isLoading),
    error: readonly(error),
    hasLoaded: readonly(hasLoaded),
    load,
    add,
  }
}
