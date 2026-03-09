/**
 * GenreFilter.jsx
 * Horizontal scrollable row of genre toggle buttons.
 * Supports multi-selection — active genres are highlighted.
 *
 * PERFORMANCE: Wrapped in React.memo — skips re-render when props unchanged.
 *
 * ACCESSIBILITY: Added aria-pressed to each button so screen readers
 * announce selection state (e.g. "Action, pressed" vs "Action, not pressed").
 * Added role="group" and aria-label on the wrapper for clear landmark context.
 *
 * Props:
 *   genres        — array of { id, name } genre objects from TMDB
 *   activeGenres  — Set of currently selected genre IDs
 *   onToggle(id)  — called to toggle a genre
 *   onClear()     — called to clear all selections
 */
import { memo } from 'react'
import styles from './GenreFilter.module.css'

function GenreFilter({ genres, activeGenres, onToggle, onClear }) {
  const allActive = activeGenres.size === 0

  return (
    <div
      className={styles.wrapper}
      role="group"
      aria-label="Filter by genre"
    >
      {/* "All" clears all active genre filters */}
      <button
        className={`${styles.btn} ${allActive ? styles.active : ''}`}
        onClick={onClear}
        aria-pressed={allActive}
      >
        All
      </button>

      {genres.map((genre) => {
        const isActive = activeGenres.has(genre.id)
        return (
          <button
            key={genre.id}
            className={`${styles.btn} ${isActive ? styles.active : ''}`}
            onClick={() => onToggle(genre.id)}
            aria-pressed={isActive}
          >
            {genre.name}
          </button>
        )
      })}
    </div>
  )
}

export default memo(GenreFilter)
