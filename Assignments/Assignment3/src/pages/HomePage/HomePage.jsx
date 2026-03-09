/**
 * HomePage.jsx
 *
 * Main page of the Movie Browser app.
 * Responsibilities:
 *   - Fetch and display a paginated list of movies from TMDB
 *   - Support full-text search (by title)
 *   - Support multi-genre filtering via the Discover API
 *   - Render the nested route <Outlet /> so MoviePortal can overlay
 */
import { useState, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import {
  getTopRatedMovies,
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
          // Default: top-rated movies (as per assignment requirements)
          data = await getTopRatedMovies(page)
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

  /** Called by SearchBar on submit — resets to page 1 */
  function handleSearch(newQuery) {
    setQuery(newQuery)
    setPage(1)
  }

  /** Toggles a genre in the active set, resets to page 1 */
  function handleGenreToggle(genreId) {
    setActiveGenres((prev) => {
      const next = new Set(prev)
      next.has(genreId) ? next.delete(genreId) : next.add(genreId)
      return next
    })
    setPage(1)
  }

  /** Clears all genre selections */
  function handleGenreClear() {
    setActiveGenres(new Set())
    setPage(1)
  }

  /** Navigates to the movie detail route (triggers MoviePortal) */
  function handleMovieClick(id) {
    navigate(`/movie/${id}`)
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>🎬 Movie Browser</h1>
        <p className={styles.subtitle}>Browse top-rated movies — search and filter powered by TMDB</p>
      </header>

      <SearchBar onSearch={handleSearch} currentQuery={query} />

      <GenreFilter
        genres={genres}
        activeGenres={activeGenres}
        onToggle={handleGenreToggle}
        onClear={handleGenreClear}
      />

      {/* Status messages */}
      {loading && <p className={styles.status}>Loading movies...</p>}
      {error && <p className={`${styles.status} ${styles.error}`}>{error}</p>}
      {!loading && !error && movies.length === 0 && (
        <p className={styles.status}>No movies found. Try a different search.</p>
      )}

      {/* Movie grid */}
      <div className={styles.grid}>
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} onClick={() => handleMovieClick(movie.id)} />
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
