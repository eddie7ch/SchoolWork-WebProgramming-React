/**
 * FilterBar - Renders a row of category filter buttons.
 * Props:
 *   categories - array of category objects from TheMealDB
 *   activeFilter - currently selected category string (or '')
 *   onFilter(category: string) - called when a filter button is clicked
 */
function FilterBar({ categories, activeFilter, onFilter }) {
  return (
    <div className="filter-bar">
      {/* "All" button clears the active filter */}
      <button
        className={`filter-btn ${activeFilter === '' ? 'active' : ''}`}
        onClick={() => onFilter('')}
      >
        All
      </button>

      {categories.map((cat) => (
        <button
          key={cat.idCategory}
          className={`filter-btn ${activeFilter === cat.strCategory ? 'active' : ''}`}
          onClick={() => onFilter(cat.strCategory)}
        >
          {cat.strCategory}
        </button>
      ))}
    </div>
  )
}

export default FilterBar
