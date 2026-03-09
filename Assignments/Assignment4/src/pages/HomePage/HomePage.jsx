/**
 * HomePage.jsx
 *
 * Main page of the Movie Browser app.
 * Responsibilities:
 *   - Fetch and display a paginated list of movies from TMDB
 *   - Support full-text search (by title)
 *   - Support multi-genre filtering via the Discover API
 *   - Render the nested route <Outlet /> so MoviePortal can overlay
 *
 * PERFORMANCE (Assignment 4):
 *   - All event handler callbacks are wrapped in useCallback so that
 *     memoised child components (SearchBar, GenreFilter, Pagination,
 *     MovieCard) do not re-render when HomePage re-renders for
 *     unrelated state changes (e.g. loading flag toggling).
 *
 * ACCESSIBILITY (Assignment 4):
 *   - Status paragraph uses aria-live="polite" so screen readers
 *     announce loading, error, and empty-result messages automatically.
 */
import { useState, useEffect, useCallback } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import {
  getPopularMovies,
  searchMovies,
  discoverMovies,
  getGenres,
} from '../../services/tmdbApi'
import SearchBar from '../../components/SearchBar/SearchBar'
import GenreFilter from '../../components/GenreFilter/GenreFilter'
import MovieCard from '../../components/MovieCard/MovieCard'
import Pagination from '../../components/Pagination/Pagination'
import styles from './HomePage.module.css'

function HomePage() {
  const navigate = useNavigate()

  const [movies, setMovies] = useState([])
  const [genres, setGenres] = useState([])
  const [query, setQuery] = useState('')
  // activeGenres holds a Set of genre ID numbers
  const [activeGenres, setActiveGenres] = useState(new Set())
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Fetch genre list once on mount
  useEffect(() => {
    getGenres()
      .then(setGenres)
      .catch(() => console.error('Failed to load genres'))
  }, [])

  // Fetch movies whenever search query, genre selection, or page changes
  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      try {
        let data
        if (query.trim()) {
          // Text search takes priority
          data = await searchMovies(query.trim(), page)
        } else if (activeGenres.size > 0) {
          // Genre filter uses TMDB Discover API
          data = await discoverMovies(Array.from(activeGenres).join(','), page)
        } else {
          // Default: popular movies
          data = await getPopularMovies(page)
        }

        if (!cancelled) {
          setMovies(data.results || [])
          // TMDB caps results at page 500
          setTotalPages(Math.min(data.total_pages || 1, 500))
        }
      } catch {
        if (!cancelled) setError('Failed to load movies. Please check your API key in .env')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [query, activeGenres, page])

  /**
   * Called by SearchBar on submit — resets to page 1.
   * Wrapped in useCallback so SearchBar (memo'd) skips re-render
   * when HomePage re-renders for loading/movies state changes.
   */
  const handleSearch = useCallback((newQuery) => {
    setQuery(newQuery)
    setPage(1)
  }, [])

  /**
   * Toggles a genre in the active set, resets to page 1.
   * Wrapped in useCallback for the same memoisation benefit.
   */
  const handleGenreToggle = useCallback((genreId) => {
    setActiveGenres((prev) => {
      const next = new Set(prev)
      next.has(genreId) ? next.delete(genreId) : next.add(genreId)
      return next
    })
    setPage(1)
  }, [])

  /** Clears all genre selections. */
  const handleGenreClear = useCallback(() => {
    setActiveGenres(new Set())
    setPage(1)
  }, [])

  /** Navigates to the movie detail route (triggers MoviePortal). */
  const handleMovieClick = useCallback((id) => {
    navigate(`/movie/${id}`)
  }, [navigate])

  // Determine the status message shown instead of the grid
  let statusMessage = null
  if (loading) statusMessage = 'Loading movies...'
  else if (error) statusMessage = error
  else if (movies.length === 0) statusMessage = 'No movies found. Try a different search.'

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>🎬 Movie Browser</h1>
        <p className={styles.subtitle}>Search, filter, and explore movies powered by TMDB</p>
      </header>

      <SearchBar onSearch={handleSearch} currentQuery={query} />

      <GenreFilter
        genres={genres}
        activeGenres={activeGenres}
        onToggle={handleGenreToggle}
        onClear={handleGenreClear}
      />

      {/*
        aria-live="polite" announces status changes to screen readers
        without interrupting the current narration.
      */}
      {statusMessage && (
        <p
          className={`${styles.status} ${error ? styles.error : ''}`}
          role="status"
          aria-live="polite"
        >
          {statusMessage}
        </p>
      )}

      {/* Movie grid */}
      <div className={styles.grid} aria-label="Movie results">
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            onClick={() => handleMovieClick(movie.id)}
          />
        ))}
      </div>

      {/* Pagination — only shown when there are results */}
      {!loading && movies.length > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}

      {/*
        Outlet renders the nested /movie/:id route.
        MoviePortal uses createPortal to break out of this DOM position
        and render into #portal-root (in index.html) instead.
      */}
      <Outlet />
    </div>
  )
}

export default HomePage
