import summaryMock from './mocks/summary'

const apiUrl = import.meta.env.VITE_API_URL
const useMocks = import.meta.env.VITE_USE_MOCKS === 'true'
const validAccounts = ['la1', 'la2']

export async function getSummary({ account } = {}) {
  if (account && !validAccounts.includes(account)) {
    throw new Error(`Invalid account: ${account}`)
  }

  if (useMocks) {
    return summaryMock
  }

  const url = new URL('/api/v1/summary', apiUrl)

  if (account) {
    url.searchParams.set('account', account)
  }

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Could not load the summary (${response.status})`)
  }

  return response.json()
}
