/**
 * MovieCard.jsx
 * Displays a single movie summary in the grid.
 * Shows: poster image, title, release year, and rating.
 * Props:
 *   movie   — TMDB movie object
 *   onClick — called when the card is clicked (triggers navigation to detail)
 */
import { IMAGE_BASE } from '../../services/tmdbApi'
import styles from './MovieCard.module.css'

const FALLBACK_IMG = 'https://via.placeholder.com/300x450?text=No+Image'

function MovieCard({ movie, onClick }) {
  const posterUrl = movie.poster_path
    ? `${IMAGE_BASE}/w300${movie.poster_path}`
    : FALLBACK_IMG

  const year = movie.release_date ? movie.release_date.slice(0, 4) : 'N/A'
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'

  return (
    <div className={styles.card} onClick={onClick} role="button" tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}>
      <div className={styles.imageWrap}>
        <img src={posterUrl} alt={movie.title} className={styles.poster} loading="lazy" />
        {/* Rating badge overlaid on the poster */}
        <span className={styles.rating}>⭐ {rating}</span>
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>{movie.title}</h3>
        <p className={styles.year}>{year}</p>
      </div>
    </div>
  )
}

export default MovieCard
