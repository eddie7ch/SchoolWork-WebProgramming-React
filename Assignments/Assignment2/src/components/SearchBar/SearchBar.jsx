/**
 * SearchBar - Handles multi-ingredient input (comma-separated)
 * and triggers search on form submit.
 * Props:
 *   onSearch(ingredients: string) - called with the raw input value
 */
function SearchBar({ onSearch }) {
  function handleSubmit(e) {
    e.preventDefault()
    const value = e.target.elements.ingredients.value.trim()
    if (value) onSearch(value)
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        name="ingredients"
        className="search-input"
        placeholder="Enter ingredients (e.g. chicken, garlic, lemon)"
      />
      <button type="submit" className="search-btn">Search</button>
    </form>
  )
}

export default SearchBar
