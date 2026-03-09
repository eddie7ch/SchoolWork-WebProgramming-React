/**
 * GenreFilter.jsx
 * Horizontal scrollable row of genre toggle buttons.
 * Supports multi-selection — active genres are highlighted.
 * Props:
 *   genres        — array of { id, name } genre objects from TMDB
 *   activeGenres  — Set of currently selected genre IDs
 *   onToggle(id)  — called to toggle a genre
 *   onClear()     — called to clear all selections
 */
import styles from './GenreFilter.module.css'

function GenreFilter({ genres, activeGenres, onToggle, onClear }) {
  return (
    <div className={styles.wrapper}>
      {/* "All" clears all active genre filters */}
      <button
        className={`${styles.btn} ${activeGenres.size === 0 ? styles.active : ''}`}
        onClick={onClear}
      >
        All
      </button>

      {genres.map((genre) => (
        <button
          key={genre.id}
          className={`${styles.btn} ${activeGenres.has(genre.id) ? styles.active : ''}`}
          onClick={() => onToggle(genre.id)}
        >
          {genre.name}
        </button>
      ))}
    </div>
  )
}

export default GenreFilter
