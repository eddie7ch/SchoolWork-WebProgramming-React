/**
 * MovieCard.jsx
 * Displays a single movie summary in the grid.
 * Shows: poster image, title, release year, and rating.
 *
 * PERFORMANCE: Wrapped in React.memo — skips re-render when props are the
 * same object reference. This is especially beneficial with a large movie
 * grid where only one item's state may change.
 *
 * Props:
 *   movie   — TMDB movie object
 *   onClick — called when the card is clicked (triggers navigation to detail)
 */
import { memo } from 'react'
import { IMAGE_BASE } from '../../services/tmdbApi'
import styles from './MovieCard.module.css'

// placehold.co replaces the deprecated via.placeholder.com service
const FALLBACK_IMG = 'https://placehold.co/300x450?text=No+Image'

function MovieCard({ movie, onClick }) {
  const posterUrl = movie.poster_path
    ? `${IMAGE_BASE}/w300${movie.poster_path}`
    : FALLBACK_IMG

  const year = movie.release_date ? movie.release_date.slice(0, 4) : 'N/A'
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'

  return (
    <div
      className={styles.card}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      aria-label={`${movie.title} (${year}) — rated ${rating}`}
    >
      <div className={styles.imageWrap}>
        <img
          src={posterUrl}
          alt={movie.title}
          className={styles.poster}
          loading="lazy"
        />
        {/* Rating badge overlaid on the poster */}
        <span className={styles.rating} aria-hidden="true">⭐ {rating}</span>
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>{movie.title}</h3>
        <p className={styles.year}>{year}</p>
      </div>
    </div>
  )
}

export default memo(MovieCard)
