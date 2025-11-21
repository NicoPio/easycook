<template>
  <div class="container mx-auto px-4 py-8">
    <header class="mb-8">
      <h1 class="text-4xl font-bold mb-2">EasyCook</h1>
      <p class="text-gray-600">Recettes pour robots cuisiniers</p>
    </header>

    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      <p class="mt-2 text-gray-600">Chargement des recettes...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
      <p class="font-semibold">Erreur lors du chargement des recettes</p>
      <p class="text-sm">{{ error.message }}</p>
    </div>

    <div v-else>
      <div v-if="recipes.length === 0" class="text-center py-12">
        <p class="text-gray-500">Aucune recette disponible pour le moment.</p>
      </div>

      <div v-else>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <RecipeCard
            v-for="recipe in recipes"
            :key="recipe.id"
            :recipe="recipe"
          />
        </div>

        <div v-if="pagination.totalPages > 1" class="flex justify-center gap-2">
          <button
            class="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
            :disabled="pagination.page === 1"
            @click="prevPage"
          >
            Précédent
          </button>

          <span class="px-4 py-2">
            Page {{ pagination.page }} / {{ pagination.totalPages }}
          </span>

          <button
            class="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
            :disabled="pagination.page === pagination.totalPages"
            @click="nextPage"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { recipes, loading, error, pagination, fetchRecipes, nextPage, prevPage } = useRecipes()

// Fetch recipes on mount
onMounted(() => {
  fetchRecipes()
})
</script>
