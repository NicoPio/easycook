<template>
  <NuxtLink
    :to="`/recettes/${recipe.id}`"
    class="recipe-card block"
  >
    <div class="relative h-48 bg-gray-200">
      <img
        v-if="recipe.imageUrl"
        :src="recipe.imageUrl"
        :alt="recipe.title"
        class="w-full h-full object-cover"
        loading="lazy"
      />
      <div
        v-else
        class="w-full h-full flex items-center justify-center text-gray-400"
      >
        <span class="text-4xl">🍳</span>
      </div>

      <!-- Difficulty badge -->
      <div
        class="absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-semibold"
        :class="difficultyBadgeClass"
      >
        {{ difficultyLabel }}
      </div>
    </div>

    <div class="p-4">
      <h3 class="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">
        {{ recipe.title }}
      </h3>

      <p
        v-if="recipe.description"
        class="text-sm text-gray-600 line-clamp-2 mb-3"
      >
        {{ recipe.description }}
      </p>

      <div class="flex items-center justify-between text-sm text-gray-500">
        <div class="flex items-center gap-4">
          <!-- Time -->
          <div class="flex items-center gap-1">
            <span class="text-lg">⏱️</span>
            <span>{{ totalTime }} min</span>
          </div>

          <!-- Servings -->
          <div class="flex items-center gap-1">
            <span class="text-lg">👥</span>
            <span>{{ recipe.servings }}</span>
          </div>
        </div>

        <!-- Robot type -->
        <div class="text-xs font-medium text-primary-600">
          {{ recipe.robotType.name }}
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { RecipeSummary } from '~/types/recipe'

const props = defineProps<{
  recipe: RecipeSummary
}>()

const totalTime = computed(
  () => props.recipe.prepTime + props.recipe.cookTime
)

const difficultyLabel = computed(() => {
  const labels = {
    facile: 'Facile',
    moyen: 'Moyen',
    difficile: 'Difficile',
  }
  return labels[props.recipe.difficulty]
})

const difficultyBadgeClass = computed(() => {
  const classes = {
    facile: 'bg-green-100 text-green-800',
    moyen: 'bg-yellow-100 text-yellow-800',
    difficile: 'bg-red-100 text-red-800',
  }
  return classes[props.recipe.difficulty]
})
</script>
