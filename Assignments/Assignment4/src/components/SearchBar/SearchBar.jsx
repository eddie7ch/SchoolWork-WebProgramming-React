/**
 * SearchBar.jsx
 * Text input for searching movies by title.
 * Submits on form submit (Enter or button click).
 *
 * PERFORMANCE: Wrapped in React.memo — skips re-render when props unchanged.
 *
 * BUG FIX (Assignment 4): Added useEffect to sync internal 'value' state
 * whenever the parent resets currentQuery to '' (e.g. clearing all filters).
 * Previously the input would stay populated even after an external reset.
 *
 * ACCESSIBILITY: Added explicit aria-label to the text input and to the
 * clear button so screen readers can identify them.
 *
 * Props:
 *   onSearch(query: string) — called with the trimmed input value
 *   currentQuery: string   — current active query (for clear button + sync)
 */
import { useState, useEffect, memo } from 'react'
import styles from './SearchBar.module.css'

function SearchBar({ onSearch, currentQuery }) {
  const [value, setValue] = useState(currentQuery || '')

  // Sync internal state when parent resets the query externally
  useEffect(() => {
    setValue(currentQuery || '')
  }, [currentQuery])

  function handleSubmit(e) {
    e.preventDefault()
    onSearch(value.trim())
  }

  function handleClear() {
    setValue('')
    onSearch('')
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} role="search">
      {/* Visually-hidden label satisfies WCAG 1.3.1 (info & relationships) */}
      <label htmlFor="movie-search" className="sr-only">Search movies by title</label>
      <input
        id="movie-search"
        type="text"
        className={styles.input}
        placeholder="Search movies by title..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label="Search movies by title"
      />
      {value && (
        <button
          type="button"
          className={styles.clearBtn}
          onClick={handleClear}
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
      <button type="submit" className={styles.searchBtn}>Search</button>
    </form>
  )
}

export default memo(SearchBar)
