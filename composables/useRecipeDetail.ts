import type { RecipeWithDetails, Ingredient, AdjustedIngredient } from '~/types/recipe'

export function useRecipeDetail(recipeId: number | string) {
  const recipe = ref<RecipeWithDetails | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const adjustedServings = ref<number>(4)
  const fromCache = ref(false)

  const offlineCache = useOfflineCache()

  async function fetchRecipe() {
    loading.value = true
    error.value = null
    fromCache.value = false

    try {
      // Try to fetch from network
      const response = await $fetch<{ recipe: RecipeWithDetails }>(`/api/recipes/${recipeId}`)
      recipe.value = response.recipe
      adjustedServings.value = response.recipe.servings

      // Save to offline cache for future offline access
      if (process.client && offlineCache.isSupported.value) {
        try {
          await offlineCache.saveRecipe(response.recipe)
        } catch (cacheError) {
          // Don't fail if cache save fails
          console.warn('Failed to cache recipe:', cacheError)
        }
      }
    } catch (e) {
      error.value = e as Error
      console.error('Error fetching recipe:', e)

      // Try to load from offline cache as fallback
      if (process.client && offlineCache.isSupported.value) {
        try {
          const cachedRecipe = await offlineCache.getRecipe(String(recipeId))
          if (cachedRecipe) {
            recipe.value = cachedRecipe
            adjustedServings.value = cachedRecipe.servings
            fromCache.value = true
            error.value = null // Clear error since we have cached data
            console.info('Loaded recipe from offline cache')
          }
        } catch (cacheError) {
          console.error('Failed to load from cache:', cacheError)
        }
      }
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
    fromCache,
    fetchRecipe,
    setServings
  }
}
