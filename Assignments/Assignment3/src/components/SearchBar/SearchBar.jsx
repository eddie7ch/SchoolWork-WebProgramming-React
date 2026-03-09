/**
 * SearchBar.jsx
 * Text input for searching movies by title.
 * Submits on form submit (Enter or button click).
 * Props:
 *   onSearch(query: string) — called with the trimmed input value
 *   currentQuery: string   — current active query (for clear button)
 */
import { useState } from 'react'
import styles from './SearchBar.module.css'

function SearchBar({ onSearch, currentQuery }) {
  const [value, setValue] = useState(currentQuery || '')

  function handleSubmit(e) {
    e.preventDefault()
    onSearch(value.trim())
  }

  function handleClear() {
    setValue('')
    onSearch('')
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        type="text"
        className={styles.input}
        placeholder="Search movies by title..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      {value && (
        <button type="button" className={styles.clearBtn} onClick={handleClear}>
          ✕
        </button>
      )}
      <button type="submit" className={styles.searchBtn}>Search</button>
    </form>
  )
}

export default SearchBar
