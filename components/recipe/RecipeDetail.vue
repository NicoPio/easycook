<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden">
    <!-- Recipe header image -->
    <div class="relative h-64 md:h-96 bg-gray-200">
      <img
        v-if="recipe.imageUrl"
        :src="recipe.imageUrl"
        :alt="recipe.title"
        class="w-full h-full object-cover"
      />
      <div
        v-else
        class="w-full h-full flex items-center justify-center text-gray-400"
      >
        <span class="text-6xl">🍳</span>
      </div>
    </div>

    <!-- Recipe metadata -->
    <div class="p-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">
        {{ recipe.title }}
      </h1>

      <p
        v-if="recipe.description"
        class="text-gray-600 mb-6"
      >
        {{ recipe.description }}
      </p>

      <!-- Info grid -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <!-- Prep time -->
        <div class="text-center p-4 bg-gray-50 rounded-lg">
          <div class="text-2xl mb-1">⏲️</div>
          <div class="text-sm text-gray-600">Préparation</div>
          <div class="text-lg font-semibold">{{ recipe.prepTime }} min</div>
        </div>

        <!-- Cook time -->
        <div class="text-center p-4 bg-gray-50 rounded-lg">
          <div class="text-2xl mb-1">🔥</div>
          <div class="text-sm text-gray-600">Cuisson</div>
          <div class="text-lg font-semibold">{{ recipe.cookTime }} min</div>
        </div>

        <!-- Difficulty -->
        <div class="text-center p-4 bg-gray-50 rounded-lg">
          <div class="text-2xl mb-1">📊</div>
          <div class="text-sm text-gray-600">Difficulté</div>
          <div class="text-lg font-semibold">{{ difficultyLabel }}</div>
        </div>

        <!-- Robot type -->
        <div class="text-center p-4 bg-gray-50 rounded-lg">
          <div class="text-2xl mb-1">🤖</div>
          <div class="text-sm text-gray-600">Robot</div>
          <div class="text-lg font-semibold">{{ recipe.robotType.name }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RecipeWithRelations } from '~/types/recipe'

const props = defineProps<{
  recipe: RecipeWithRelations
}>()

const difficultyLabel = computed(() => {
  const labels = {
    facile: 'Facile',
    moyen: 'Moyen',
    difficile: 'Difficile',
  }
  return labels[props.recipe.difficulty]
})
</script>
