import championsMock from './mocks/champions'
import summaryMock from './mocks/summary'

const apiUrl = import.meta.env.VITE_API_URL
const useMocks = import.meta.env.VITE_USE_MOCKS === 'true'
const validAccounts = ['la1', 'la2']
const dataDragonVersionsUrl = 'https://ddragon.leagueoflegends.com/api/versions.json'
let dataDragonVersionRequest = null

function validateAccount(account) {
  if (account && !validAccounts.includes(account)) {
    throw new Error(`Invalid account: ${account}`)
  }
}

async function fetchJson(url, errorMessage) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`${errorMessage} (${response.status})`)
  }

  return response.json()
}

export async function getSummary({ account } = {}) {
  validateAccount(account)

  if (useMocks) {
    return summaryMock
  }

  const url = new URL('/api/v1/summary', apiUrl)

  if (account) {
    url.searchParams.set('account', account)
  }

  return fetchJson(url, 'Could not load the summary')
}

export async function getChampions({ account, minGames } = {}) {
  validateAccount(account)

  if (useMocks) {
    return championsMock
  }

  const url = new URL('/api/v1/champions', apiUrl)

  if (account) {
    url.searchParams.set('account', account)
  }

  if (minGames !== undefined) {
    url.searchParams.set('min_games', minGames)
  }

  return fetchJson(url, 'Could not load champions')
}

export async function getDataDragonVersion() {
  if (!dataDragonVersionRequest) {
    dataDragonVersionRequest = fetchJson(
      dataDragonVersionsUrl,
      'Could not load the Data Dragon version',
    )
      .then(([latestVersion]) => {
        if (!latestVersion) {
          throw new Error('Data Dragon did not return a version')
        }

        return latestVersion
      })
      .catch((error) => {
        dataDragonVersionRequest = null
        throw error
      })
  }

  return dataDragonVersionRequest
}
