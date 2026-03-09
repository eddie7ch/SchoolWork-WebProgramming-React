/**
 * RecipeDetail - Modal overlay that shows full recipe details.
 * Extracts the ingredient list dynamically from TheMealDB's
 * strIngredient1–20 and strMeasure1–20 fields.
 * Props:
 *   meal    - full meal object from getMealById()
 *   onClose - called when the user closes the modal
 */
function RecipeDetail({ meal, onClose }) {
  if (!meal) return null

  // Build ingredient list from the 20 possible ingredient slots
  const ingredients = []
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`]
    const measure = meal[`strMeasure${i}`]
    if (ingredient && ingredient.trim()) {
      ingredients.push(`${measure ? measure.trim() : ''} ${ingredient.trim()}`.trim())
    }
  }

  return (
    // Clicking the backdrop closes the modal
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose}>✕</button>

        <img src={meal.strMealThumb} alt={meal.strMeal} className="modal__image" />

        <h2 className="modal__title">{meal.strMeal}</h2>

        <div className="modal__tags">
          {meal.strCategory && <span className="recipe-card__tag">{meal.strCategory}</span>}
          {meal.strArea && <span className="recipe-card__tag">{meal.strArea}</span>}
          {meal.strTags && meal.strTags.split(',').map((tag) => (
            <span key={tag} className="recipe-card__tag">{tag.trim()}</span>
          ))}
        </div>

        <h3>Ingredients</h3>
        <ul className="modal__ingredients">
          {ingredients.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>

        <h3>Instructions</h3>
        <p className="modal__instructions">{meal.strInstructions}</p>
      </div>
    </div>
  )
}

export default RecipeDetail
