import { afterEach, describe, expect, test, vi } from 'vitest'

async function loadApi({ useMocks = 'false', apiUrl = 'http://api.test' } = {}) {
  vi.stubEnv('VITE_USE_MOCKS', useMocks)
  vi.stubEnv('VITE_API_URL', apiUrl)
  vi.resetModules()

  const api = await import('@/api/recall')

  return api
}

function createResponse(data, { ok = true, status = 200 } = {}) {
  return {
    ok,
    status,
    json: vi.fn().mockResolvedValue(data),
  }
}

function stubSuccessfulFetch(data = { data: [] }) {
  const fetchMock = vi.fn().mockResolvedValue(createResponse(data))
  vi.stubGlobal('fetch', fetchMock)

  return fetchMock
}

const accountRequests = {
  getSummary: (api, account) => api.getSummary({ account }),
  getChampions: (api, account) => api.getChampions({ account }),
  getMatches: (api, account) => api.getMatches({ account }),
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('recall API', () => {
  describe('mock mode', () => {
    test('returns the summary mock by reference without fetching', async () => {
      const fetchMock = stubSuccessfulFetch()
      const api = await loadApi({ useMocks: 'true' })
      const { default: summaryMock } = await import('@/api/mocks/summary')

      const result = await api.getSummary()

      expect(result).toBe(summaryMock)
      expect(fetchMock).not.toHaveBeenCalled()
    })

    test('returns the champions mock by reference without fetching', async () => {
      const fetchMock = stubSuccessfulFetch()
      const api = await loadApi({ useMocks: 'true' })
      const { default: championsMock } = await import('@/api/mocks/champions')

      const result = await api.getChampions()

      expect(result).toBe(championsMock)
      expect(fetchMock).not.toHaveBeenCalled()
    })

    test('returns the matches mock by reference without fetching', async () => {
      const fetchMock = stubSuccessfulFetch()
      const api = await loadApi({ useMocks: 'true' })
      const { default: matchesMock } = await import('@/api/mocks/matches')

      const result = await api.getMatches()

      expect(result).toBe(matchesMock)
      expect(fetchMock).not.toHaveBeenCalled()
    })

    test('returns the match mock when the match exists without fetching', async () => {
      const fetchMock = stubSuccessfulFetch()
      const api = await loadApi({ useMocks: 'true' })
      const { default: matchMock } = await import('@/api/mocks/match')

      const result = await api.getMatch('LA1_1751384912')

      expect(result).toBe(matchMock)
      expect(fetchMock).not.toHaveBeenCalled()
    })

    test('throws an ApiError when a mocked match does not exist', async () => {
      const fetchMock = stubSuccessfulFetch()
      const api = await loadApi({ useMocks: 'true' })

      const request = api.getMatch('LA1_missing')

      await expect(request).rejects.toMatchObject({
        name: 'ApiError',
        status: 404,
        message: 'Match not found (404)',
      })
      expect(fetchMock).not.toHaveBeenCalled()
    })

    test.each(['false', 'TRUE', '1', ''])(
      'does not enable mocks when VITE_USE_MOCKS is %j',
      async (useMocks) => {
        const fetchMock = stubSuccessfulFetch({ data: { games: 1 } })
        const api = await loadApi({ useMocks })

        await api.getSummary()

        expect(fetchMock).toHaveBeenCalledTimes(1)
      },
    )
  })

  describe('account validation', () => {
    test.each([
      ['getSummary', 'true'],
      ['getChampions', 'true'],
      ['getMatches', 'true'],
      ['getSummary', 'false'],
      ['getChampions', 'false'],
      ['getMatches', 'false'],
    ])('rejects an invalid account in %s when mock mode is %s', async (method, useMocks) => {
      stubSuccessfulFetch()
      const api = await loadApi({ useMocks })

      const request = accountRequests[method](api, 'xx')

      await expect(request).rejects.toThrow('Invalid account: xx')
    })

    test.each([
      ['getSummary', 'true', 'la1'],
      ['getSummary', 'true', 'la2'],
      ['getSummary', 'true', undefined],
      ['getSummary', 'true', ''],
      ['getChampions', 'true', 'la1'],
      ['getChampions', 'true', 'la2'],
      ['getChampions', 'true', undefined],
      ['getChampions', 'true', ''],
      ['getMatches', 'true', 'la1'],
      ['getMatches', 'true', 'la2'],
      ['getMatches', 'true', undefined],
      ['getMatches', 'true', ''],
      ['getSummary', 'false', 'la1'],
      ['getSummary', 'false', 'la2'],
      ['getSummary', 'false', undefined],
      ['getSummary', 'false', ''],
      ['getChampions', 'false', 'la1'],
      ['getChampions', 'false', 'la2'],
      ['getChampions', 'false', undefined],
      ['getChampions', 'false', ''],
      ['getMatches', 'false', 'la1'],
      ['getMatches', 'false', 'la2'],
      ['getMatches', 'false', undefined],
      ['getMatches', 'false', ''],
    ])(
      'accepts a valid account in %s when mock mode is %s: %j',
      async (method, useMocks, account) => {
        stubSuccessfulFetch()
        const api = await loadApi({ useMocks })

        const request = accountRequests[method](api, account)

        await expect(request).resolves.toBeDefined()
      },
    )

    test('does not validate an account in getMatch', async () => {
      const fetchMock = stubSuccessfulFetch({ data: { id: 'xx' } })
      const api = await loadApi()

      await api.getMatch('xx')

      expect(String(fetchMock.mock.calls[0][0])).toBe('http://api.test/api/v1/matches/xx')
    })
  })

  describe('real requests', () => {
    test.each([
      ['without an account', undefined, 'http://api.test/api/v1/summary'],
      ['with an account', 'la1', 'http://api.test/api/v1/summary?account=la1'],
    ])('builds the summary URL %s', async (_case, account, expectedUrl) => {
      const fetchMock = stubSuccessfulFetch()
      const api = await loadApi()

      await api.getSummary({ account })

      expect(String(fetchMock.mock.calls[0][0])).toBe(expectedUrl)
    })

    test('builds the champions URL with all filters', async () => {
      const fetchMock = stubSuccessfulFetch()
      const api = await loadApi()

      await api.getChampions({ account: 'la2', minGames: 5 })

      expect(String(fetchMock.mock.calls[0][0])).toBe(
        'http://api.test/api/v1/champions?account=la2&min_games=5',
      )
    })

    test('includes a zero minimum games value', async () => {
      const fetchMock = stubSuccessfulFetch()
      const api = await loadApi()

      await api.getChampions({ minGames: 0 })

      expect(String(fetchMock.mock.calls[0][0])).toBe(
        'http://api.test/api/v1/champions?min_games=0',
      )
    })

    test('omits minimum games when it is undefined', async () => {
      const fetchMock = stubSuccessfulFetch()
      const api = await loadApi()

      await api.getChampions({ minGames: undefined })

      expect(String(fetchMock.mock.calls[0][0])).toBe('http://api.test/api/v1/champions')
    })

    test('builds the matches URL with all filters', async () => {
      const fetchMock = stubSuccessfulFetch()
      const api = await loadApi()

      await api.getMatches({ account: 'la1', queue: '420', page: 2 })

      expect(String(fetchMock.mock.calls[0][0])).toBe(
        'http://api.test/api/v1/matches?account=la1&queue=420&page=2',
      )
    })

    test('omits an empty queue and an undefined page', async () => {
      const fetchMock = stubSuccessfulFetch()
      const api = await loadApi()

      await api.getMatches({ queue: '', page: undefined })

      expect(String(fetchMock.mock.calls[0][0])).toBe('http://api.test/api/v1/matches')
    })

    test.each([
      ['LA1_123', 'http://api.test/api/v1/matches/LA1_123'],
      ['a/b c', 'http://api.test/api/v1/matches/a%2Fb%20c'],
    ])('builds the match URL for id %j', async (id, expectedUrl) => {
      const fetchMock = stubSuccessfulFetch()
      const api = await loadApi()

      await api.getMatch(id)

      expect(String(fetchMock.mock.calls[0][0])).toBe(expectedUrl)
    })

    test.each([
      ['getSummary', (api) => api.getSummary()],
      ['getChampions', (api) => api.getChampions()],
      ['getMatches', (api) => api.getMatches()],
      ['getMatch', (api) => api.getMatch('LA1_123')],
    ])('sends the JSON Accept header from %s', async (_method, request) => {
      const fetchMock = stubSuccessfulFetch()
      const api = await loadApi()

      await request(api)

      expect(fetchMock.mock.calls[0][1]).toEqual({
        headers: { Accept: 'application/json' },
      })
    })

    test('returns exactly the parsed JSON response', async () => {
      const responseBody = { data: { games: 42 }, meta: { source: 'test' } }
      stubSuccessfulFetch(responseBody)
      const api = await loadApi()

      const result = await api.getSummary()

      expect(result).toBe(responseBody)
    })
  })

  describe('real request errors', () => {
    test.each([
      ['summary', 500, 'Could not load the summary (500)', (api) => api.getSummary()],
      ['champions', 500, 'Could not load champions (500)', (api) => api.getChampions()],
      ['matches', 500, 'Could not load matches (500)', (api) => api.getMatches()],
      ['match', 404, 'Could not load the match (404)', (api) => api.getMatch('LA1_123')],
    ])('throws the endpoint ApiError for %s', async (_endpoint, status, message, request) => {
      const fetchMock = vi.fn().mockResolvedValue(createResponse({}, { ok: false, status }))
      vi.stubGlobal('fetch', fetchMock)
      const api = await loadApi()

      const result = request(api)

      await expect(result).rejects.toMatchObject({ name: 'ApiError', status, message })
    })

    test('preserves a fetch rejection', async () => {
      const networkError = new Error('Network unavailable')
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(networkError))
      const api = await loadApi()

      const request = api.getSummary()

      await expect(request).rejects.toBe(networkError)
    })
  })

  describe('Data Dragon version', () => {
    test('requests the versions endpoint and returns the first version', async () => {
      const fetchMock = stubSuccessfulFetch(['14.1.1', '14.1.0'])
      const api = await loadApi()

      const version = await api.getDataDragonVersion()

      expect(String(fetchMock.mock.calls[0][0])).toBe(
        'https://ddragon.leagueoflegends.com/api/versions.json',
      )
      expect(version).toBe('14.1.1')
    })

    test('reuses the cached request for sequential calls', async () => {
      const fetchMock = stubSuccessfulFetch(['14.1.1'])
      const api = await loadApi()

      const firstVersion = await api.getDataDragonVersion()
      const secondVersion = await api.getDataDragonVersion()

      expect(firstVersion).toBe('14.1.1')
      expect(secondVersion).toBe('14.1.1')
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    test('reuses the pending request for simultaneous calls', async () => {
      const fetchMock = stubSuccessfulFetch(['14.1.1'])
      const api = await loadApi()

      const firstRequest = api.getDataDragonVersion()
      const secondRequest = api.getDataDragonVersion()
      const versions = await Promise.all([firstRequest, secondRequest])

      expect(versions).toEqual(['14.1.1', '14.1.1'])
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    test('clears the cache after a failed request so the next call retries', async () => {
      const networkError = new Error('Data Dragon unavailable')
      const fetchMock = vi
        .fn()
        .mockRejectedValueOnce(networkError)
        .mockResolvedValueOnce(createResponse(['14.1.1']))
      vi.stubGlobal('fetch', fetchMock)
      const api = await loadApi()

      await expect(api.getDataDragonVersion()).rejects.toBe(networkError)
      await expect(api.getDataDragonVersion()).resolves.toBe('14.1.1')

      expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    test('does not cache an empty versions response', async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(createResponse([]))
        .mockResolvedValueOnce(createResponse(['14.1.1']))
      vi.stubGlobal('fetch', fetchMock)
      const api = await loadApi()

      await expect(api.getDataDragonVersion()).rejects.toThrow(
        'Data Dragon did not return a version',
      )
      await expect(api.getDataDragonVersion()).resolves.toBe('14.1.1')

      expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    test('still fetches Data Dragon when API mocks are enabled', async () => {
      const fetchMock = stubSuccessfulFetch(['14.1.1'])
      const api = await loadApi({ useMocks: 'true' })

      const version = await api.getDataDragonVersion()

      expect(version).toBe('14.1.1')
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })
  })
})
