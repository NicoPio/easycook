<template>
  <div class="container mx-auto px-4 py-8">
    <NuxtLink
      to="/"
      class="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
    >
      <span class="mr-2">←</span>
      Retour au catalogue
    </NuxtLink>

    <RecipeDetailSkeleton v-if="loading" />

    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
      <p class="font-semibold">Erreur lors du chargement</p>
      <p class="text-sm">{{ error.message }}</p>
    </div>

    <div v-else-if="recipe" class="max-w-4xl mx-auto">
      <RecipeDetail :recipe="recipe" />

      <!-- Start step-by-step mode button -->
      <div class="my-8 flex justify-center">
        <UButton
          size="xl"
          @click="startStepByStep"
          class="shadow-lg hover:shadow-xl transition-shadow"
        >
          <Icon name="heroicons:play-circle" class="w-6 h-6 mr-2" />
          Démarrer le mode pas-à-pas
        </UButton>
      </div>

      <div class="grid md:grid-cols-2 gap-8 mt-8">
        <div>
          <PortionAdjuster
            v-model="adjustedServings"
            :original-servings="recipe.servings"
          />

          <div class="mt-6">
            <IngredientsList :ingredients="adjustedIngredients" />
          </div>
        </div>

        <div>
          <h2 class="text-2xl font-bold mb-4">Étapes</h2>
          <ol class="space-y-4">
            <li
              v-for="step in recipe.steps"
              :key="step.id"
              class="border-l-4 border-blue-500 pl-4 py-2"
            >
              <div class="flex items-start gap-3">
                <span class="inline-flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full font-bold flex-shrink-0">
                  {{ step.stepNumber }}
                </span>
                <div class="flex-1">
                  <p class="text-gray-800">{{ step.description }}</p>

                  <div v-if="step.duration || step.temperature || step.speed" class="mt-2 text-sm text-gray-600 space-y-1">
                    <div v-if="step.duration" class="flex items-center gap-2">
                      <span>⏱️</span>
                      <span>{{ step.duration }} min</span>
                    </div>
                    <div v-if="step.temperature" class="flex items-center gap-2">
                      <span>🌡️</span>
                      <span>{{ step.temperature }}°C</span>
                    </div>
                    <div v-if="step.speed" class="flex items-center gap-2">
                      <span>⚡</span>
                      <span>Vitesse: {{ step.speed }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const recipeId = route.params.id

const {
  recipe,
  loading,
  error,
  adjustedServings,
  adjustedIngredients,
  fetchRecipe
} = useRecipeDetail(recipeId as string)

// Fetch recipe on mount
onMounted(() => {
  fetchRecipe()
})

/**
 * Navigate to step-by-step cooking mode
 * FR-007: Le système DOIT permettre de déclencher un mode pas-à-pas depuis la page de détail
 */
function startStepByStep() {
  router.push(`/recettes/${recipeId}/pas-a-pas`)
}
</script>
