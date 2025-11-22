import localforage from 'localforage'
import type { RecipeDetail } from '~/types/recipe'

const CACHE_KEY_PREFIX = 'recipe_'
const CACHE_INDEX_KEY = 'recipe_cache_index'
const MAX_CACHED_RECIPES = 10

// Configure localForage for IndexedDB
const recipeStore = localforage.createInstance({
  name: 'easycook',
  storeName: 'recipes',
  description: 'Offline cache for recipes'
})

interface CacheIndex {
  recipeIds: string[]
  lastUpdated: number
}

export function useOfflineCache() {
  const isSupported = ref(true)
  const error = ref<string | null>(null)

  onMounted(() => {
    // Check if IndexedDB is supported
    if (process.client && !window.indexedDB) {
      isSupported.value = false
      error.value = 'IndexedDB non supporté sur cet appareil'
    }
  })

  /**
   * Get cache index (list of cached recipe IDs in order)
   */
  async function getCacheIndex(): Promise<CacheIndex> {
    try {
      const index = await recipeStore.getItem<CacheIndex>(CACHE_INDEX_KEY)
      return index || { recipeIds: [], lastUpdated: Date.now() }
    } catch (err) {
      console.error('Error reading cache index:', err)
      return { recipeIds: [], lastUpdated: Date.now() }
    }
  }

  /**
   * Update cache index
   */
  async function updateCacheIndex(recipeIds: string[]): Promise<void> {
    try {
      await recipeStore.setItem<CacheIndex>(CACHE_INDEX_KEY, {
        recipeIds,
        lastUpdated: Date.now()
      })
    } catch (err) {
      console.error('Error updating cache index:', err)
      throw err
    }
  }

  /**
   * Save a recipe to offline cache
   * Maintains maximum of 10 recipes, removes oldest when limit exceeded
   */
  async function saveRecipe(recipe: RecipeDetail): Promise<void> {
    if (!isSupported.value) {
      error.value = 'Cache non supporté'
      return
    }

    try {
      error.value = null

      // Get current index
      const index = await getCacheIndex()

      // Remove recipe ID if already exists (to move it to the end)
      const recipeIds = index.recipeIds.filter((id) => id !== recipe.id)

      // Add recipe to the end (most recent)
      recipeIds.push(recipe.id)

      // If we exceed the limit, remove oldest recipes
      const toRemove: string[] = []
      while (recipeIds.length > MAX_CACHED_RECIPES) {
        const oldestId = recipeIds.shift()
        if (oldestId) {
          toRemove.push(oldestId)
        }
      }

      // Remove old recipes from storage
      for (const id of toRemove) {
        await recipeStore.removeItem(`${CACHE_KEY_PREFIX}${id}`)
      }

      // Save the recipe
      await recipeStore.setItem(`${CACHE_KEY_PREFIX}${recipe.id}`, {
        ...recipe,
        cachedAt: Date.now()
      })

      // Update index
      await updateCacheIndex(recipeIds)
    } catch (err) {
      console.error('Error saving recipe to cache:', err)
      error.value = 'Erreur lors de la sauvegarde en cache'
      throw err
    }
  }

  /**
   * Get a recipe from offline cache
   */
  async function getRecipe(recipeId: string): Promise<RecipeDetail | null> {
    if (!isSupported.value) {
      return null
    }

    try {
      error.value = null
      const recipe = await recipeStore.getItem<RecipeDetail & { cachedAt: number }>(
        `${CACHE_KEY_PREFIX}${recipeId}`
      )
      return recipe || null
    } catch (err) {
      console.error('Error getting recipe from cache:', err)
      error.value = 'Erreur lors de la récupération du cache'
      return null
    }
  }

  /**
   * Get all cached recipes (for offline browsing)
   */
  async function getAllCachedRecipes(): Promise<RecipeDetail[]> {
    if (!isSupported.value) {
      return []
    }

    try {
      error.value = null
      const index = await getCacheIndex()
      const recipes: RecipeDetail[] = []

      for (const recipeId of index.recipeIds) {
        const recipe = await getRecipe(recipeId)
        if (recipe) {
          recipes.push(recipe)
        }
      }

      // Return in reverse order (most recent first)
      return recipes.reverse()
    } catch (err) {
      console.error('Error getting all cached recipes:', err)
      error.value = 'Erreur lors de la récupération des recettes en cache'
      return []
    }
  }

  /**
   * Clear all cached recipes
   */
  async function clearCache(): Promise<void> {
    if (!isSupported.value) {
      return
    }

    try {
      error.value = null
      await recipeStore.clear()
    } catch (err) {
      console.error('Error clearing cache:', err)
      error.value = 'Erreur lors du vidage du cache'
      throw err
    }
  }

  /**
   * Get cache statistics
   */
  async function getCacheStats(): Promise<{
    count: number
    maxCount: number
  }> {
    const index = await getCacheIndex()
    return {
      count: index.recipeIds.length,
      maxCount: MAX_CACHED_RECIPES
    }
  }

  return {
    isSupported: readonly(isSupported),
    error: readonly(error),
    saveRecipe,
    getRecipe,
    getAllCachedRecipes,
    clearCache,
    getCacheStats
  }
}
