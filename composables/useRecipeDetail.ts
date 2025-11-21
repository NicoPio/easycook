import type { RecipeWithDetails, Ingredient, AdjustedIngredient } from '~/types/recipe'

export function useRecipeDetail(recipeId: number | string) {
  const recipe = ref<RecipeWithDetails | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const adjustedServings = ref<number>(4)

  async function fetchRecipe() {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<{ recipe: RecipeWithDetails }>(`/api/recipes/${recipeId}`)
      recipe.value = response.recipe
      adjustedServings.value = response.recipe.servings
    } catch (e) {
      error.value = e as Error
      console.error('Error fetching recipe:', e)
    } finally {
      loading.value = false
    }
  }

  /**
   * Calculate adjusted quantity for an ingredient based on serving size
   * Implements FR-035: Rounding logic for discrete vs measurable ingredients
   */
  function calculateAdjustedQuantity(
    ingredient: Ingredient,
    originalServings: number,
    newServings: number
  ): number {
    const ratio = newServings / originalServings
    const rawQuantity = ingredient.quantity * ratio

    // Discrete units (eggs, pieces) - round to nearest whole number (≥0.5 rounds up)
    const discreteUnits = ['pièce']
    if (discreteUnits.includes(ingredient.unit)) {
      return Math.round(rawQuantity)
    }

    // Measurable units (g, ml, etc.) - keep 1 decimal place
    return Math.round(rawQuantity * 10) / 10
  }

  /**
   * Get adjusted ingredients based on current serving size
   */
  const adjustedIngredients = computed<AdjustedIngredient[]>(() => {
    if (!recipe.value) return []

    return recipe.value.ingredients.map((ingredient) => ({
      ...ingredient,
      adjustedQuantity: calculateAdjustedQuantity(
        ingredient,
        recipe.value!.servings,
        adjustedServings.value
      ),
      originalQuantity: ingredient.quantity,
      originalServings: recipe.value!.servings,
      newServings: adjustedServings.value
    }))
  })

  /**
   * Update serving size (1-20 persons as per FR-004)
   */
  function setServings(newServings: number) {
    if (newServings < 1 || newServings > 20) {
      console.warn('Servings must be between 1 and 20')
      return
    }
    adjustedServings.value = newServings
  }

  return {
    recipe,
    loading,
    error,
    adjustedServings,
    adjustedIngredients,
    fetchRecipe,
    setServings
  }
}
