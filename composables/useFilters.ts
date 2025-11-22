import { ref, computed, watch } from 'vue'
import type { RecipeListResponse } from '~/types/api'
import type { Recipe } from '~/types/recipe'

/**
 * Composable to manage recipe search and filters
 *
 * FR-013: Filtre par type de robot
 * FR-014: Filtre par temps de préparation
 * FR-015: Filtre par difficulté
 * FR-016: Recherche par mot-clé
 */
export function useFilters() {
  // Filter state
  const searchQuery = ref('')
  const robotType = ref('')
  const difficulty = ref('')
  const maxTotalTime = ref<number | null>(null)
  const page = ref(1)
  const limit = ref(20)

  // Results
  const recipes = ref<Recipe[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const pagination = ref({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })

  /**
   * Check if any filter is active
   */
  const hasActiveFilters = computed(() => {
    return !!(
      searchQuery.value ||
      robotType.value ||
      difficulty.value ||
      maxTotalTime.value
    )
  })

  /**
   * Search recipes with current filters
   */
  async function search() {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<RecipeListResponse>('/api/recipes/search', {
        method: 'POST',
        body: {
          query: searchQuery.value,
          robotType: robotType.value,
          difficulty: difficulty.value,
          maxTotalTime: maxTotalTime.value,
          page: page.value,
          limit: limit.value
        }
      })

      recipes.value = response.recipes as Recipe[]
      pagination.value = response.pagination
    } catch (e) {
      error.value = e as Error
      console.error('Search error:', e)
    } finally {
      loading.value = false
    }
  }

  /**
   * Reset all filters to default values
   */
  function resetFilters() {
    searchQuery.value = ''
    robotType.value = ''
    difficulty.value = ''
    maxTotalTime.value = null
    page.value = 1
  }

  /**
   * Navigate to next page
   */
  function nextPage() {
    if (page.value < pagination.value.totalPages) {
      page.value++
      search()
    }
  }

  /**
   * Navigate to previous page
   */
  function prevPage() {
    if (page.value > 1) {
      page.value--
      search()
    }
  }

  /**
   * Set search query and trigger search
   */
  function setSearchQuery(query: string) {
    searchQuery.value = query
    page.value = 1 // Reset to first page
    search()
  }

  /**
   * Set robot type filter and trigger search
   */
  function setRobotType(type: string) {
    robotType.value = type
    page.value = 1
    search()
  }

  /**
   * Set difficulty filter and trigger search
   */
  function setDifficulty(level: string) {
    difficulty.value = level
    page.value = 1
    search()
  }

  /**
   * Set max total time filter and trigger search
   */
  function setMaxTotalTime(time: number | null) {
    maxTotalTime.value = time
    page.value = 1
    search()
  }

  return {
    // State
    searchQuery,
    robotType,
    difficulty,
    maxTotalTime,
    recipes,
    loading,
    error,
    pagination,
    hasActiveFilters,

    // Actions
    search,
    resetFilters,
    nextPage,
    prevPage,
    setSearchQuery,
    setRobotType,
    setDifficulty,
    setMaxTotalTime
  }
}
