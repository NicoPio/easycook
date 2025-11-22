import type { RecipeListResponse } from '~/types/api'

export function useRecipes() {
  const recipes = ref<any[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const pagination = ref({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })

  async function fetchRecipes(params?: {
    page?: number
    limit?: number
    robotType?: string
    difficulty?: string
  }) {
    loading.value = true
    error.value = null

    try {
      const query = new URLSearchParams()
      if (params?.page) query.append('page', params.page.toString())
      if (params?.limit) query.append('limit', params.limit.toString())
      if (params?.robotType) query.append('robotType', params.robotType)
      if (params?.difficulty) query.append('difficulty', params.difficulty)

      const response = await $fetch<any>(`/api/recipes?${query.toString()}`)

      recipes.value = response.recipes
      pagination.value = response.pagination
    } catch (e) {
      error.value = e as Error
      console.error('Error fetching recipes:', e)
    } finally {
      loading.value = false
    }
  }

  function nextPage() {
    if (pagination.value.page < pagination.value.totalPages) {
      fetchRecipes({ page: pagination.value.page + 1 })
    }
  }

  function prevPage() {
    if (pagination.value.page > 1) {
      fetchRecipes({ page: pagination.value.page - 1 })
    }
  }

  return {
    recipes,
    loading,
    error,
    pagination,
    fetchRecipes,
    nextPage,
    prevPage
  }
}
