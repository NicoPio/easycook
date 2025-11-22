<template>
  <div class="container mx-auto px-4 py-8">
    <header class="mb-8">
      <h1 class="text-4xl font-bold mb-2">EasyCook</h1>
      <p class="text-gray-600 dark:text-gray-400">Recettes pour robots cuisiniers</p>
    </header>

    <!-- Filters section -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
      <div class="space-y-6">
        <!-- Search bar -->
        <SearchBar
          v-model="filters.searchQuery.value"
          :searching="filters.loading.value"
          @search="handleSearch"
        />

        <!-- Robot type filter -->
        <RobotFilter
          v-model="filters.robotType.value"
          @change="handleRobotFilter"
        />

        <!-- Time filter -->
        <TimeFilter
          v-model="filters.maxTotalTime.value"
          @change="handleTimeFilter"
        />

        <!-- Reset filters button -->
        <div v-if="filters.hasActiveFilters.value" class="flex justify-end">
          <UButton
            color="gray"
            variant="soft"
            @click="handleResetFilters"
          >
            <Icon name="heroicons:x-mark" class="w-4 h-4 mr-2" />
            Réinitialiser les filtres
          </UButton>
        </div>
      </div>
    </div>

    <!-- Loading state with skeletons -->
    <div v-if="filters.loading.value">
      <div class="mb-4">
        <Skeleton height="h-4" width="w-32" />
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <RecipeCardSkeleton v-for="i in 6" :key="i" />
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="filters.error.value" class="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg">
      <p class="font-semibold">Erreur lors du chargement des recettes</p>
      <p class="text-sm">{{ filters.error.value.message }}</p>
    </div>

    <!-- Results -->
    <div v-else>
      <!-- No results message -->
      <div v-if="filters.recipes.value.length === 0" class="text-center py-12">
        <Icon name="heroicons:magnifying-glass" class="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <p class="text-gray-500 dark:text-gray-400 text-lg mb-2">
          {{ filters.hasActiveFilters.value ? 'Aucune recette ne correspond à vos critères' : 'Aucune recette disponible pour le moment' }}
        </p>
        <p v-if="filters.hasActiveFilters.value" class="text-gray-400 dark:text-gray-500 text-sm">
          Essayez de modifier vos filtres de recherche
        </p>
      </div>

      <!-- Recipe grid -->
      <div v-else>
        <!-- Results count -->
        <div class="mb-4 text-sm text-gray-600 dark:text-gray-400">
          {{ filters.pagination.value.total }} recette{{ filters.pagination.value.total > 1 ? 's' : '' }} trouvée{{ filters.pagination.value.total > 1 ? 's' : '' }}
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <RecipeCard
            v-for="recipe in filters.recipes.value"
            :key="recipe.id"
            :recipe="recipe"
          />
        </div>

        <!-- Pagination -->
        <div v-if="filters.pagination.value.totalPages > 1" class="flex justify-center gap-2">
          <UButton
            color="gray"
            variant="soft"
            :disabled="filters.pagination.value.page === 1"
            @click="filters.prevPage"
          >
            <Icon name="heroicons:arrow-left" class="w-4 h-4 mr-2" />
            Précédent
          </UButton>

          <span class="px-4 py-2 text-gray-700 dark:text-gray-300">
            Page {{ filters.pagination.value.page }} / {{ filters.pagination.value.totalPages }}
          </span>

          <UButton
            color="gray"
            variant="soft"
            :disabled="filters.pagination.value.page === filters.pagination.value.totalPages"
            @click="filters.nextPage"
          >
            Suivant
            <Icon name="heroicons:arrow-right" class="w-4 h-4 ml-2" />
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Homepage with recipe catalog, search and filters
 *
 * FR-001: Le système DOIT afficher une liste de toutes les recettes disponibles
 * FR-013: Le système DOIT permettre de filtrer par type de robot
 * FR-014: Le système DOIT permettre de filtrer par temps de préparation
 * FR-015: Le système DOIT permettre de filtrer par difficulté
 * FR-016: Le système DOIT permettre de rechercher par mot-clé
 */

const filters = useFilters()

// Fetch all recipes on mount
onMounted(() => {
  filters.search()
})

/**
 * Handle search query submission
 */
function handleSearch(query: string) {
  filters.setSearchQuery(query)
}

/**
 * Handle robot type filter change
 */
function handleRobotFilter(type: string) {
  filters.setRobotType(type)
}

/**
 * Handle time filter change
 */
function handleTimeFilter(time: number | null) {
  filters.setMaxTotalTime(time)
}

/**
 * Reset all filters and reload recipes
 */
function handleResetFilters() {
  filters.resetFilters()
  filters.search()
}
</script>
