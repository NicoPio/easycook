/**
 * Composable for fetching recipe details and handling portion adjustment
 * Implements the business logic for ingredient quantity calculation
 */

import type { RecipeDetailResponse } from '~/types/api'
import type { RecipeWithRelations, Ingredient } from '~/types/recipe'

export function useRecipeDetail(recipeId: MaybeRef<string | number>) {
  const id = computed(() => unref(recipeId))

  // Fetch recipe details
  const {
    data: response,
    pending,
    error,
    refresh,
  } = useFetch<RecipeDetailResponse>(() => `/api/recipes/${id.value}`, {
    key: `recipe-${id.value}`,
  })

  // Extract recipe from response
  const recipe = computed<RecipeWithRelations | null>(
    () => response.value?.recipe || null
  )

  // Reactive serving size (starts with recipe's base servings)
  const adjustedServings = ref<number>(recipe.value?.servings || 4)

  // Watch recipe changes to update adjusted servings
  watch(
    recipe,
    (newRecipe) => {
      if (newRecipe) {
        adjustedServings.value = newRecipe.servings
      }
    },
    { immediate: true }
  )

  // Calculate adjusted quantity for an ingredient
  const calculateAdjustedQuantity = (
    baseQuantity: number,
    baseServings: number,
    targetServings: number
  ): number => {
    if (baseServings === 0) return baseQuantity
    return (baseQuantity * targetServings) / baseServings
  }

  // Format adjusted quantity for display (2 decimal places)
  const formatQuantity = (quantity: number): string => {
    // Round to 2 decimals
    const rounded = Math.round(quantity * 100) / 100

    // Show as integer if it's a whole number
    if (rounded % 1 === 0) {
      return rounded.toString()
    }

    return rounded.toFixed(2)
  }

  // Computed adjusted ingredients with recalculated quantities
  const adjustedIngredients = computed<Ingredient[]>(() => {
    if (!recipe.value) return []

    return recipe.value.ingredients.map((ingredient) => ({
      ...ingredient,
      quantity: calculateAdjustedQuantity(
        ingredient.quantity,
        recipe.value!.servings,
        adjustedServings.value
      ),
    }))
  })

  // Total time (prep + cook)
  const totalTime = computed(() => {
    if (!recipe.value) return 0
    return recipe.value.prepTime + recipe.value.cookTime
  })

  // Set adjusted servings (with validation)
  const setServings = (servings: number) => {
    if (servings < 1 || servings > 20) {
      console.warn('Servings must be between 1 and 20')
      return
    }
    adjustedServings.value = servings
  }

  // Reset to base servings
  const resetServings = () => {
    if (recipe.value) {
      adjustedServings.value = recipe.value.servings
    }
  }

  return {
    recipe,
    pending,
    error,
    refresh,
    adjustedServings,
    adjustedIngredients,
    totalTime,
    setServings,
    resetServings,
    formatQuantity,
  }
}
