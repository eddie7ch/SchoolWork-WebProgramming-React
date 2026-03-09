/**
 * mealApi.js
 * Handles all communication with TheMealDB public API.
 * Free developer key "1" is used — no account required.
 */

const API_KEY = '1'
const BASE_URL = `https://www.themealdb.com/api/json/v1/${API_KEY}`

/**
 * Search meals by ingredient name.
 * Returns an array of meal summary objects, or empty array if none found.
 */
export async function searchByIngredient(ingredient) {
  const res = await fetch(`${BASE_URL}/filter.php?i=${encodeURIComponent(ingredient)}`)
  const data = await res.json()
  return data.meals || []
}

/**
 * Search meals by name (used when user types a dish name).
 * Returns an array of full meal objects including category and area.
 */
export async function searchByName(name) {
  const res = await fetch(`${BASE_URL}/search.php?s=${encodeURIComponent(name)}`)
  const data = await res.json()
  return data.meals || []
}

/**
 * Get full meal details by meal ID.
 * Returns a single meal object with ingredients and instructions.
 */
export async function getMealById(id) {
  const res = await fetch(`${BASE_URL}/lookup.php?i=${id}`)
  const data = await res.json()
  return data.meals ? data.meals[0] : null
}

/**
 * Get all available meal categories (used for dietary-style filter).
 * Returns an array of category objects.
 */
export async function getCategories() {
  const res = await fetch(`${BASE_URL}/categories.php`)
  const data = await res.json()
  return data.categories || []
}
