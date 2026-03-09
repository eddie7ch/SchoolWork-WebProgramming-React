/**
 * RecipeCard - Displays a single recipe summary card.
 * Shows image, name, category, cooking area, and a "View Recipe" button.
 * Props:
 *   meal   - meal object (either summary from ingredient search or full from name search)
 *   onClick - called when the card button is clicked, triggers detail view
 */
function RecipeCard({ meal, onClick }) {
  return (
    <div className="recipe-card" onClick={onClick}>
      <img
        src={meal.strMealThumb}
        alt={meal.strMeal}
        className="recipe-card__image"
      />
      <div className="recipe-card__body">
        <h3 className="recipe-card__title">{meal.strMeal}</h3>

        {/* Category and area are only present in full meal objects */}
        {meal.strCategory && (
          <span className="recipe-card__tag">{meal.strCategory}</span>
        )}
        {meal.strArea && (
          <span className="recipe-card__tag">{meal.strArea}</span>
        )}

        <button className="recipe-card__btn">View Recipe</button>
      </div>
    </div>
  )
}

export default RecipeCard
