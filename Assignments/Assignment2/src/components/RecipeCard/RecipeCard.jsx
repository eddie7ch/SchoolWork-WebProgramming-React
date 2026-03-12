/**
 * RecipeCard - Displays a single recipe summary card.
 * Shows image, name, category, cooking area, estimated cooking time,
 * a brief description, and a "View Recipe" button.
 * Props:
 *   meal    - full meal object from getMealById()
 *   onClick - called when the card button is clicked, triggers detail view
 */
function RecipeCard({ meal, onClick }) {
  // Derive an estimated cooking time from instruction length.
  // TheMealDB does not provide a cooking time field, so we estimate:
  // short instructions (~<500 chars) = 20 min, medium = 30 min, long = 45 min.
  function estimateCookingTime(instructions) {
    if (!instructions) return 'N/A'
    const len = instructions.length
    if (len < 500) return '~20 min'
    if (len < 1200) return '~30 min'
    return '~45 min'
  }

  // Brief description: first 100 characters of the instructions, followed by ellipsis
  const briefDescription = meal.strInstructions
    ? meal.strInstructions.slice(0, 100).trim() + '…'
    : 'No description available.'

  const cookingTime = estimateCookingTime(meal.strInstructions)

  return (
    <div className="recipe-card" onClick={onClick}>
      <img
        src={meal.strMealThumb}
        alt={meal.strMeal}
        className="recipe-card__image"
      />
      <div className="recipe-card__body">
        <h3 className="recipe-card__title">{meal.strMeal}</h3>

        {/* Category and area tags — only present in full meal objects */}
        {meal.strCategory && (
          <span className="recipe-card__tag">{meal.strCategory}</span>
        )}
        {meal.strArea && (
          <span className="recipe-card__tag">{meal.strArea}</span>
        )}

        {/* Estimated cooking time */}
        <p className="recipe-card__time">⏱ Cooking time: {cookingTime}</p>

        {/* Brief description from the start of the instructions */}
        <p className="recipe-card__description">{briefDescription}</p>

        <button className="recipe-card__btn">View Recipe</button>
      </div>
    </div>
  )
}

export default RecipeCard
