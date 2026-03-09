/**
 * MoviePortal.jsx
 *
 * Renders full movie details as a React Portal.
 *
 * React Portal explanation:
 *   Normally, a React component renders inside its parent DOM node.
 *   createPortal() lets us render content into a DIFFERENT DOM node
 *   (here: #portal-root in index.html), completely outside #root.
 *   This means the overlay sits above ALL other page content at the
 *   DOM level, while still living inside the React component tree
 *   (so context, events, and hooks all work normally).
 *
 * BUG FIX (Assignment 4): role="dialog" was incorrectly placed on the
 * backdrop/overlay div. It has been moved to the modal container div,
 * which is the actual dialog element. aria-labelledby now points to the
 * movie title heading for correct screen reader announcement.
 *
 * Navigation:
 *   This component is mounted by React Router when the URL is /movie/:id.
 *   Closing (back button or backdrop click) navigates back with useNavigate(-1),
 *   returning to the previous home page state without a full reload.
 */
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useParams, useNavigate } from 'react-router-dom'
import { getMovieDetails, getMovieCredits, IMAGE_BASE } from '../../services/tmdbApi'
import styles from './MoviePortal.module.css'

const FALLBACK_POSTER = 'https://placehold.co/300x450?text=No+Image'

function MoviePortal() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [movie, setMovie] = useState(null)
  const [credits, setCredits] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch full details + credits in parallel when the movie ID changes
  useEffect(() => {
    setLoading(true)
    setError('')
    Promise.all([getMovieDetails(id), getMovieCredits(id)])
      .then(([movieData, creditsData]) => {
        setMovie(movieData)
        setCredits(creditsData)
      })
      .catch(() => setError('Failed to load movie details.'))
      .finally(() => setLoading(false))
  }, [id])

  // Lock body scroll while the portal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  function handleClose() {
    navigate(-1)
  }

  const portalRoot = document.getElementById('portal-root')

  // Build top-billed cast list (max 8 names)
  const topCast = credits?.cast?.slice(0, 8) || []

  const content = (
    // Backdrop is a presentation overlay — clicking it closes the modal
    <div
      className={styles.backdrop}
      onClick={handleClose}
      role="presentation"
    >
      {/*
        BUG FIX: role="dialog" belongs on the *modal container*, not the backdrop.
        aria-labelledby references the movie title h1 for correct announcement.
        Stop propagation so clicks inside the modal don't close it.
      */}
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-movie-title"
      >
        <button
          className={styles.closeBtn}
          onClick={handleClose}
          aria-label="Close movie details"
        >
          ✕
        </button>

        {loading && <p className={styles.loading}>Loading...</p>}
        {error && <p className={styles.errorMsg}>{error}</p>}

        {!loading && movie && (
          <>
            {/* Backdrop banner image */}
            {movie.backdrop_path && (
              <div className={styles.bannerWrap}>
                <img
                  src={`${IMAGE_BASE}/w1280${movie.backdrop_path}`}
                  alt={`${movie.title} backdrop`}
                  className={styles.banner}
                />
                <div className={styles.bannerOverlay} aria-hidden="true" />
              </div>
            )}

            <div className={styles.content}>
              {/* Poster */}
              <div className={styles.posterWrap}>
                <img
                  src={
                    movie.poster_path
                      ? `${IMAGE_BASE}/w300${movie.poster_path}`
                      : FALLBACK_POSTER
                  }
                  alt={`${movie.title} poster`}
                  className={styles.poster}
                />
              </div>

              {/* Details */}
              <div className={styles.details}>
                {/* id matches aria-labelledby on the dialog */}
                <h1 id="modal-movie-title" className={styles.movieTitle}>
                  {movie.title}
                </h1>

                {movie.tagline && (
                  <p className={styles.tagline}>"{movie.tagline}"</p>
                )}

                {/* Meta row: rating, year, runtime */}
                <div className={styles.meta}>
                  <span className={styles.metaItem}>⭐ {movie.vote_average?.toFixed(1)}</span>
                  <span className={styles.metaItem}>{movie.release_date?.slice(0, 4)}</span>
                  {movie.runtime > 0 && (
                    <span className={styles.metaItem}>{movie.runtime} min</span>
                  )}
                  {movie.status && (
                    <span className={styles.metaItem}>{movie.status}</span>
                  )}
                </div>

                {/* Genre tags */}
                {movie.genres?.length > 0 && (
                  <div className={styles.genres}>
                    {movie.genres.map((g) => (
                      <span key={g.id} className={styles.genreTag}>{g.name}</span>
                    ))}
                  </div>
                )}

                {/* Overview */}
                <p className={styles.overview}>{movie.overview}</p>

                {/* Cast */}
                {topCast.length > 0 && (
                  <div className={styles.castSection}>
                    <h3 className={styles.sectionTitle}>Top Cast</h3>
                    <p className={styles.castList}>
                      {topCast.map((a) => a.name).join(' · ')}
                    </p>
                  </div>
                )}

                <button className={styles.backBtn} onClick={handleClose}>
                  ← Back to Movies
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )

  // createPortal renders content into #portal-root, outside #root
  return createPortal(content, portalRoot)
}

export default MoviePortal
