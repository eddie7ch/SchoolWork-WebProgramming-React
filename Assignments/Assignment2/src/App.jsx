import { useState, useEffect } from 'react'
import './App.css'
import { searchByIngredient, searchByName, getMealById, getCategories } from './services/mealApi'
import SearchBar from './components/SearchBar/SearchBar'
import FilterBar from './components/FilterBar/FilterBar'
import RecipeCard from './components/RecipeCard/RecipeCard'
import RecipeDetail from './components/RecipeDetail/RecipeDetail'

/**
 * App - Root component for the Recipe Search Engine.
 *
 * Flow:
 * 1. User enters ingredients (comma-separated) → searches each ingredient
 *    against TheMealDB and merges unique results.
 * 2. Results can be filtered by category using the FilterBar.
 * 3. Clicking a RecipeCard fetches full details and opens the modal.
 */
function App() {
  const [meals, setMeals] = useState([])
  const [filteredMeals, setFilteredMeals] = useState([])
  const [categories, setCategories] = useState([])
  // activeFilters is a Set — supports multi-selection of categories
  const [activeFilters, setActiveFilters] = useState(new Set())
  const [selectedMeal, setSelectedMeal] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Load categories on mount for the filter bar
  useEffect(() => {
    getCategories().then(setCategories)
  }, [])

  // Re-apply category filters whenever meals list or activeFilters changes
  useEffect(() => {
    if (activeFilters.size === 0) {
      setFilteredMeals(meals)
    } else {
      setFilteredMeals(meals.filter((m) => activeFilters.has(m.strCategory)))
    }
  }, [meals, activeFilters])

  /**
   * handleSearch - Called by SearchBar on submit.
   * Splits input by comma, searches each ingredient, deduplicates results,
   * then fetches full details so category/area info is available for filtering.
   */
  async function handleSearch(input) {
    setLoading(true)
    setError('')
    setMeals([])
      setActiveFilters(new Set())
    try {
      // Split on commas and trim each ingredient
      const ingredients = input.split(',').map((i) => i.trim()).filter(Boolean)

      // Search all ingredients in parallel
      const results = await Promise.all(ingredients.map(searchByIngredient))

      // Flatten and deduplicate by meal ID
      const seen = new Set()
      const unique = results.flat().filter((meal) => {
        if (seen.has(meal.idMeal)) return false
        seen.add(meal.idMeal)
        return true
      })

      if (unique.length === 0) {
        setError('No recipes found. Try different ingredients.')
        setLoading(false)
        return
      }

      // Fetch full details for each meal (needed for category filtering)
      const detailed = await Promise.all(unique.map((m) => getMealById(m.idMeal)))
      setMeals(detailed.filter(Boolean))
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  /**
   * handleCardClick - Fetches full meal detail and opens the modal.
   */
  async function handleCardClick(id) {
    const meal = await getMealById(id)
    setSelectedMeal(meal)
  }

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">🍽️ Recipe Search Engine</h1>
        <p className="app__subtitle">Enter ingredients you have on hand to find recipes</p>
      </header>

      {/* Search bar — accepts comma-separated ingredients */}
      <SearchBar onSearch={handleSearch} />

      {/* Filter by category — supports multi-selection; only shown once results are loaded */}
      {meals.length > 0 && (
        <FilterBar
          categories={categories}
          activeFilters={activeFilters}
          onToggle={(cat) => {
            // Toggle the selected category in the Set
            setActiveFilters((prev) => {
              const next = new Set(prev)
              next.has(cat) ? next.delete(cat) : next.add(cat)
              return next
            })
          }}
          onClear={() => setActiveFilters(new Set())}
        />
      )}

      {/* Loading, error, and empty states */}
      {loading && <p className="app__status">Searching for recipes...</p>}
      {error && <p className="app__status app__status--error">{error}</p>}
      {!loading && meals.length > 0 && filteredMeals.length === 0 && (
        <p className="app__status">No recipes match the selected filters.</p>
      )}

      {/* Recipe grid */}
      <div className="recipe-grid">
        {filteredMeals.map((meal) => (
          <RecipeCard
            key={meal.idMeal}
            meal={meal}
            onClick={() => handleCardClick(meal.idMeal)}
          />
        ))}
      </div>

      {/* Recipe detail modal */}
      {selectedMeal && (
        <RecipeDetail meal={selectedMeal} onClose={() => setSelectedMeal(null)} />
      )}
    </div>
  )
}

export default App
