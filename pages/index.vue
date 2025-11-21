<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 class="text-3xl font-bold text-gray-900">
          EasyCook
        </h1>
        <p class="text-gray-600 mt-1">
          Recettes pour robots cuisiniers
        </p>
      </div>
    </header>

    <!-- Main content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading state -->
      <div
        v-if="pending"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <div
          v-for="i in 6"
          :key="i"
          class="bg-white rounded-lg shadow-md h-96 animate-pulse"
        />
      </div>

      <!-- Error state -->
      <div
        v-else-if="error"
        class="text-center py-12"
      >
        <p class="text-red-600 text-lg">
          Erreur lors du chargement des recettes
        </p>
        <button
          class="mt-4 px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          @click="refresh"
        >
          Réessayer
        </button>
      </div>

      <!-- Empty state -->
      <div
        v-else-if="recipes.length === 0"
        class="text-center py-12"
      >
        <div class="text-6xl mb-4">🍳</div>
        <h2 class="text-2xl font-semibold text-gray-900 mb-2">
          Aucune recette disponible
        </h2>
        <p class="text-gray-600">
          Les recettes seront bientôt disponibles
        </p>
      </div>

      <!-- Recipe grid -->
      <div
        v-else
        class="space-y-6"
      >
        <div class="flex items-center justify-between">
          <p class="text-gray-600">
            {{ total }} {{ total > 1 ? 'recettes' : 'recette' }}
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <RecipeCard
            v-for="recipe in recipes"
            :key="recipe.id"
            :recipe="recipe"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
// SEO
useHead({
  title: 'EasyCook - Recettes pour robots cuisiniers',
  meta: [
    {
      name: 'description',
      content:
        'Découvrez nos recettes pour Thermomix, Cookeo et Monsieur Cuisine',
    },
  ],
})

// Fetch recipes
const { recipes, total, pending, error, refresh } = useRecipes()
</script>
