/**
 * tmdbApi.js
 * Centralised service layer for all TMDB API v3 requests.
 * API key is loaded from the .env file via Vite's import.meta.env.
 */

const BASE_URL = 'https://api.themoviedb.org/3'

/** Base URL for TMDB poster/backdrop images */
export const IMAGE_BASE = 'https://image.tmdb.org/t/p'

/**
 * Internal helper — builds the full URL and fetches from TMDB.
 * Throws a descriptive error on non-OK responses.
 * API key is read at call time so vi.stubEnv works correctly in tests.
 */
async function apiFetch(endpoint) {
  const API_KEY = import.meta.env.VITE_TMDB_API_KEY
  const separator = endpoint.includes('?') ? '&' : '?'
  const url = `${BASE_URL}${endpoint}${separator}api_key=${API_KEY}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`TMDB error ${res.status}: ${res.statusText}`)
  return res.json()
}

/** Fetch the current popular movies for a given page. */
export async function getPopularMovies(page = 1) {
  return apiFetch(`/movie/popular?page=${page}`)
}

/** Search movies by title query for a given page. */
export async function searchMovies(query, page = 1) {
  return apiFetch(`/search/movie?query=${encodeURIComponent(query)}&page=${page}`)
}

/**
 * Discover movies filtered by one or more genre IDs.
 * genreIds should be a comma-separated string (TMDB uses AND logic).
 */
export async function discoverMovies(genreIds, page = 1) {
  return apiFetch(
    `/discover/movie?with_genres=${encodeURIComponent(genreIds)}&page=${page}&sort_by=popularity.desc`
  )
}

/** Fetch all available movie genres (used to populate the genre filter). */
export async function getGenres() {
  const data = await apiFetch('/genre/movie/list')
  return data.genres || []
}

/** Fetch full movie details by TMDB movie ID. */
export async function getMovieDetails(id) {
  return apiFetch(`/movie/${id}`)
}

/** Fetch cast and crew credits for a movie. */
export async function getMovieCredits(id) {
  return apiFetch(`/movie/${id}/credits`)
}
