<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Back button -->
    <div class="bg-white border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <NuxtLink
          to="/"
          class="inline-flex items-center text-primary-600 hover:text-primary-700"
        >
          <span class="text-xl mr-2">←</span>
          <span>Retour aux recettes</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Loading state -->
    <div
      v-if="pending"
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div class="bg-white rounded-lg shadow-md h-96 animate-pulse" />
    </div>

    <!-- Error state -->
    <div
      v-else-if="error"
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center"
    >
      <div class="text-6xl mb-4">❌</div>
      <h2 class="text-2xl font-semibold text-gray-900 mb-2">
        Recette introuvable
      </h2>
      <p class="text-gray-600 mb-6">
        La recette que vous recherchez n'existe pas ou a été supprimée
      </p>
      <NuxtLink
        to="/"
        class="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 inline-block"
      >
        Retour à l'accueil
      </NuxtLink>
    </div>

    <!-- Recipe content -->
    <div
      v-else-if="recipe"
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"
    >
      <!-- Recipe header and metadata -->
      <RecipeDetail :recipe="recipe" />

      <!-- Portion adjuster -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <PortionAdjuster
          v-model="adjustedServings"
          :base-servings="recipe.servings"
        />
      </div>

      <!-- Ingredients list with adjusted quantities -->
      <IngredientsList
        :ingredients="adjustedIngredients"
        :format-quantity="formatQuantity"
      />

      <!-- Steps -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">
          Préparation
        </h2>

        <div class="space-y-6">
          <div
            v-for="(step, index) in recipe.steps"
            :key="step.id"
            class="flex gap-4"
          >
            <!-- Step number -->
            <div
              class="flex-shrink-0 w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold"
            >
              {{ index + 1 }}
            </div>

            <!-- Step content -->
            <div class="flex-1">
              <p class="text-gray-900 mb-3">
                {{ step.description }}
              </p>

              <!-- Step parameters -->
              <div
                v-if="step.duration || step.temperature || step.speed"
                class="flex flex-wrap gap-3 text-sm"
              >
                <div
                  v-if="step.duration"
                  class="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full"
                >
                  <span>⏱️</span>
                  <span>{{ step.duration }} min</span>
                </div>

                <div
                  v-if="step.temperature"
                  class="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full"
                >
                  <span>🌡️</span>
                  <span>{{ step.temperature }}°C</span>
                </div>

                <div
                  v-if="step.speed"
                  class="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full"
                >
                  <span>⚡</span>
                  <span>Vitesse {{ step.speed }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const recipeId = route.params.id as string

// Fetch recipe with portion adjustment logic
const {
  recipe,
  pending,
  error,
  adjustedServings,
  adjustedIngredients,
  formatQuantity,
} = useRecipeDetail(recipeId)

// SEO
useHead({
  title: () =>
    recipe.value
      ? `${recipe.value.title} - EasyCook`
      : 'Recette - EasyCook',
  meta: [
    {
      name: 'description',
      content: () => recipe.value?.description || 'Recette de cuisine',
    },
  ],
})
</script>
