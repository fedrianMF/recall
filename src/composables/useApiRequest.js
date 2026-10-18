import { readonly, ref } from 'vue'

export function useApiRequest(request, options = {}) {
  const { initialData = null, errorMessage = 'No se pudo completar la solicitud.' } = options

  const data = ref(initialData)
  const isLoading = ref(false)
  const error = ref(null)
  let latestRequestId = 0

  async function load() {
    const requestId = ++latestRequestId

    isLoading.value = true
    error.value = null

    try {
      const result = await request()

      if (requestId !== latestRequestId) {
        return
      }

      data.value = result
    } catch (requestError) {
      if (requestId !== latestRequestId) {
        return
      }

      if (requestError instanceof Error) {
        const displayError = new Error(errorMessage, { cause: requestError })

        if ('status' in requestError) {
          displayError.status = requestError.status
        }

        if ('code' in requestError) {
          displayError.code = requestError.code
        }

        if ('errors' in requestError) {
          displayError.errors = requestError.errors
        }

        error.value = displayError
      } else {
        error.value = new Error(errorMessage)
      }
    } finally {
      if (requestId === latestRequestId) {
        isLoading.value = false
      }
    }
  }

  // Back to the initial state. Bumping the id invalidates any request still in flight,
  // so its late response cannot write anything.
  function reset() {
    latestRequestId++
    data.value = initialData
    error.value = null
    isLoading.value = false
  }

  return {
    data: readonly(data),
    isLoading: readonly(isLoading),
    error: readonly(error),
    load,
    reset,
  }
}
