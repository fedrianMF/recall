import championsMock from './mocks/champions'
import matchMock from './mocks/match'
import matchesMock from './mocks/matches'
import positionsMock from './mocks/positions'
import rankHistoryMock from './mocks/rankHistory'
import summaryMock from './mocks/summary'
import { apiUrl, useMocks } from '../config/env'
import { clearSession, readSession } from '../utils/authStorage'

const validAccounts = ['la1', 'la2']
const dataDragonVersionsUrl = 'https://ddragon.leagueoflegends.com/api/versions.json'
let dataDragonVersionRequest = null

export class ApiError extends Error {
  constructor(message, status, code, errors) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.errors = errors
  }
}

let unauthorizedHandler = null

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler
}

function validateAccount(account) {
  if (account && !validAccounts.includes(account)) {
    throw new Error(`Invalid account: ${account}`)
  }
}

async function fetchJson(url, errorMessage, options = {}) {
  const { method = 'GET', body, auth = true } = options
  const headers = { Accept: 'application/json' }

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  const session = auth ? readSession() : null

  if (auth && session?.token) {
    headers.Authorization = `Bearer ${session.token}`
  }

  const requestOptions = {
    headers,
    ...(method === 'GET' ? {} : { method }),
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  }
  const response = await fetch(url, requestOptions)

  if (!response.ok) {
    let errorBody

    try {
      errorBody = await response.json()
    } catch {
      errorBody = undefined
    }

    if (response.status === 401 && auth) {
      clearSession()
      unauthorizedHandler?.()
    }

    throw new ApiError(
      `${errorMessage} (${response.status})`,
      response.status,
      errorBody?.code,
      errorBody?.errors,
    )
  }

  if (response.status === 204) {
    return null
  }

  const parsedBody = await response.json()

  return options.returnStatus ? { body: parsedBody, status: response.status } : parsedBody
}

function requireApiUrl(endpoint) {
  if (!apiUrl) {
    throw new Error(`Cannot call ${endpoint} without VITE_API_URL`)
  }

  return apiUrl
}

function authUrl(path) {
  return new URL(`/api/v1${path}`, requireApiUrl(path))
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

export async function getPositions({ account, minGames } = {}) {
  validateAccount(account)

  if (useMocks) {
    return positionsMock
  }

  const url = new URL('/api/v1/positions', apiUrl)

  if (account) {
    url.searchParams.set('account', account)
  }

  if (minGames !== undefined) {
    url.searchParams.set('min_games', minGames)
  }

  return fetchJson(url, 'Could not load positions')
}

export async function getMatches({ account, queue, page } = {}) {
  validateAccount(account)

  if (useMocks) {
    return matchesMock
  }

  const url = new URL('/api/v1/matches', apiUrl)

  if (account) {
    url.searchParams.set('account', account)
  }

  if (queue) {
    url.searchParams.set('queue', queue)
  }

  if (page !== undefined) {
    url.searchParams.set('page', page)
  }

  return fetchJson(url, 'Could not load matches')
}

export async function getMatch(id) {
  if (useMocks) {
    const matchExists = matchesMock.data.some((match) => match.id === id)

    if (!matchExists) {
      throw new ApiError('Match not found (404)', 404)
    }

    return matchMock
  }

  const encodedId = encodeURIComponent(id)
  const url = new URL(`/api/v1/matches/${encodedId}`, apiUrl)

  return fetchJson(url, 'Could not load the match')
}

export async function getRankHistory({ account, queueType } = {}) {
  if (!account) {
    throw new Error('Account is required to load the rank history')
  }

  validateAccount(account)

  if (useMocks) {
    return rankHistoryMock
  }

  const url = new URL('/api/v1/ranks/history', apiUrl)
  url.searchParams.set('account', account)

  if (queueType) {
    url.searchParams.set('queue_type', queueType)
  }

  return fetchJson(url, 'Could not load the rank history')
}

export async function getDataDragonVersion() {
  if (!dataDragonVersionRequest) {
    dataDragonVersionRequest = fetchJson(
      dataDragonVersionsUrl,
      'Could not load the Data Dragon version',
      { auth: false },
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

export function login({ email, password }) {
  return fetchJson(authUrl('/auth/login'), 'Could not log in', {
    method: 'POST',
    body: { email, password, device_name: 'Recall web' },
    auth: false,
  })
}

export function register({ name, email, password, passwordConfirmation }) {
  return fetchJson(authUrl('/auth/register'), 'Could not register', {
    method: 'POST',
    body: {
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
    },
    auth: false,
  })
}

export function logout() {
  return fetchJson(authUrl('/auth/logout'), 'Could not log out', { method: 'POST' })
}

export function getMe() {
  return fetchJson(authUrl('/auth/me'), 'Could not load the current user')
}

export function resendVerificationEmail() {
  return fetchJson(authUrl('/auth/email/resend'), 'Could not resend the verification email', {
    method: 'POST',
  })
}

export function getAccounts() {
  return fetchJson(authUrl('/accounts'), 'Could not load accounts')
}

export async function linkAccount({ gameName, tagLine, platform }) {
  const response = await fetchJson(authUrl('/accounts'), 'Could not link account', {
    method: 'POST',
    body: { game_name: gameName, tag_line: tagLine, platform },
    returnStatus: true,
  })

  return { data: response.body, created: response.status === 201 }
}

export async function getLatestSync() {
  try {
    return await fetchJson(authUrl('/sync/latest'), 'Could not load the latest sync')
  } catch (error) {
    if (error.status === 404) {
      return null
    }

    throw error
  }
}

export function startSync() {
  return fetchJson(authUrl('/sync'), 'Could not start sync', { method: 'POST' })
}
