/**
 * tmdbApi.test.js
 * Unit tests for the TMDB API service layer.
 * Tests verify URL construction, parameter passing, the fallback for
 * missing data, and error handling on non-OK HTTP responses.
 *
 * fetch is replaced with a vi.fn() spy so no real HTTP calls are made.
 */
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest'

// ── Mock global fetch before importing the module ────────────────────
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

// Set a fake API key so URLs include a predictable key value
vi.stubEnv('VITE_TMDB_API_KEY', 'test_api_key')

// Import after stubs are in place
import {
  getPopularMovies,
  searchMovies,
  discoverMovies,
  getGenres,
  getMovieDetails,
  getMovieCredits,
  IMAGE_BASE,
} from '../services/tmdbApi'

// Helper: resolve fetch with a JSON body
function mockOkResponse(body) {
  return Promise.resolve({ ok: true, json: () => Promise.resolve(body) })
}

// Helper: resolve fetch with a non-OK HTTP status
function mockErrorResponse(status = 401, statusText = 'Unauthorized') {
  return Promise.resolve({ ok: false, status, statusText })
}

describe('IMAGE_BASE', () => {
  test('exports the TMDB image base URL', () => {
    expect(IMAGE_BASE).toBe('https://image.tmdb.org/t/p')
  })
})

describe('getPopularMovies', () => {
  beforeEach(() => vi.clearAllMocks())

  test('calls the /movie/popular endpoint', async () => {
    mockFetch.mockReturnValue(mockOkResponse({ results: [], total_pages: 1 }))
    await getPopularMovies()
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/movie/popular')
    )
  })

  test('defaults to page 1', async () => {
    mockFetch.mockReturnValue(mockOkResponse({ results: [] }))
    await getPopularMovies()
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('page=1'))
  })

  test('passes the requested page number', async () => {
    mockFetch.mockReturnValue(mockOkResponse({ results: [] }))
    await getPopularMovies(3)
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('page=3'))
  })

  test('includes the API key in the URL', async () => {
    mockFetch.mockReturnValue(mockOkResponse({ results: [] }))
    await getPopularMovies()
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('api_key=test_api_key')
    )
  })

  test('throws a descriptive error on a non-OK response', async () => {
    mockFetch.mockReturnValue(mockErrorResponse(401, 'Unauthorized'))
    await expect(getPopularMovies()).rejects.toThrow('TMDB error 401')
  })

  test('returns the parsed JSON data', async () => {
    const data = { results: [{ id: 1, title: 'Test' }], total_pages: 5 }
    mockFetch.mockReturnValue(mockOkResponse(data))
    const result = await getPopularMovies()
    expect(result).toEqual(data)
  })
})

describe('searchMovies', () => {
  beforeEach(() => vi.clearAllMocks())

  test('calls the /search/movie endpoint', async () => {
    mockFetch.mockReturnValue(mockOkResponse({ results: [] }))
    await searchMovies('batman')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/search/movie')
    )
  })

  test('URL-encodes the search query', async () => {
    mockFetch.mockReturnValue(mockOkResponse({ results: [] }))
    await searchMovies('the dark knight')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('the%20dark%20knight')
    )
  })

  test('defaults to page 1', async () => {
    mockFetch.mockReturnValue(mockOkResponse({ results: [] }))
    await searchMovies('batman')
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('page=1'))
  })

  test('passes a custom page number', async () => {
    mockFetch.mockReturnValue(mockOkResponse({ results: [] }))
    await searchMovies('batman', 2)
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('page=2'))
  })
})

describe('discoverMovies', () => {
  beforeEach(() => vi.clearAllMocks())

  test('calls the /discover/movie endpoint', async () => {
    mockFetch.mockReturnValue(mockOkResponse({ results: [] }))
    await discoverMovies('28,12')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/discover/movie')
    )
  })

  test('includes the genre IDs in the URL', async () => {
    mockFetch.mockReturnValue(mockOkResponse({ results: [] }))
    await discoverMovies('28,12')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('with_genres=28%2C12')
    )
  })
})

describe('getGenres', () => {
  beforeEach(() => vi.clearAllMocks())

  test('calls the /genre/movie/list endpoint', async () => {
    mockFetch.mockReturnValue(mockOkResponse({ genres: [] }))
    await getGenres()
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/genre/movie/list')
    )
  })

  test('returns the genres array from the response', async () => {
    const genres = [{ id: 28, name: 'Action' }, { id: 18, name: 'Drama' }]
    mockFetch.mockReturnValue(mockOkResponse({ genres }))
    const result = await getGenres()
    expect(result).toEqual(genres)
  })

  test('returns an empty array when genres key is missing', async () => {
    mockFetch.mockReturnValue(mockOkResponse({}))
    const result = await getGenres()
    expect(result).toEqual([])
  })

  test('throws on a non-OK response', async () => {
    mockFetch.mockReturnValue(mockErrorResponse(403, 'Forbidden'))
    await expect(getGenres()).rejects.toThrow('TMDB error 403')
  })
})

describe('getMovieDetails', () => {
  beforeEach(() => vi.clearAllMocks())

  test('calls /movie/:id with the given id', async () => {
    mockFetch.mockReturnValue(mockOkResponse({ id: 550, title: 'Fight Club' }))
    await getMovieDetails(550)
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/movie/550'))
  })
})

describe('getMovieCredits', () => {
  beforeEach(() => vi.clearAllMocks())

  test('calls /movie/:id/credits with the given id', async () => {
    mockFetch.mockReturnValue(mockOkResponse({ cast: [], crew: [] }))
    await getMovieCredits(550)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/movie/550/credits')
    )
  })
})
