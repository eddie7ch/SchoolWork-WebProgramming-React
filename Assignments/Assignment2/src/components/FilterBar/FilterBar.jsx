/**
 * FilterBar - Renders a row of category filter buttons.
 * Supports multi-selection — clicking a category toggles it on/off.
 * Props:
 *   categories    - array of category objects from TheMealDB
 *   activeFilters - Set of currently selected category strings
 *   onToggle(category: string) - called when a filter button is toggled
 *   onClear()                  - called when "All" is clicked to clear filters
 */
function FilterBar({ categories, activeFilters, onToggle, onClear }) {
  return (
    <div className="filter-bar">
      {/* "All" button clears all active filters */}
      <button
        className={`filter-btn ${activeFilters.size === 0 ? 'active' : ''}`}
        onClick={onClear}
      >
        All
      </button>

      {categories.map((cat) => (
        <button
          key={cat.idCategory}
          className={`filter-btn ${activeFilters.has(cat.strCategory) ? 'active' : ''}`}
          onClick={() => onToggle(cat.strCategory)}
        >
          {cat.strCategory}
        </button>
      ))}
    </div>
  )
}

export default FilterBar
