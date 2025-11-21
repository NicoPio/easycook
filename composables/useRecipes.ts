/**
 * Composable for fetching recipe list from API
 * Handles loading, error states, and filters
 */

import type { ListRecipesResponse } from '~/types/api'
import type { RecipeFilters } from '~/types/recipe'

export function useRecipes(filters?: Ref<RecipeFilters> | RecipeFilters) {
  const filterRef = isRef(filters) ? filters : ref(filters || {})

  // Build query parameters
  const queryParams = computed(() => {
    const params: Record<string, string | number> = {
      limit: 20,
      offset: 0,
    }

    if (filterRef.value.robotType) {
      params.robotType = filterRef.value.robotType
    }

    if (filterRef.value.difficulty) {
      params.difficulty = filterRef.value.difficulty
    }

    if (filterRef.value.maxTotalTime) {
      params.maxTotalTime = filterRef.value.maxTotalTime
    }

    return params
  })

  // Fetch recipes with auto-refresh on filter changes
  const {
    data: response,
    pending,
    error,
    refresh,
  } = useFetch<ListRecipesResponse>('/api/recipes', {
    query: queryParams,
    key: `recipes-${JSON.stringify(queryParams.value)}`,
  })

  // Computed properties for easier access
  const recipes = computed(() => response.value?.recipes || [])
  const total = computed(() => response.value?.total || 0)

  return {
    recipes,
    total,
    pending,
    error,
    refresh,
  }
}
