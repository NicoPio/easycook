<template>
  <div class="recipe-detail">
    <div v-if="recipe.imageUrl" class="w-full aspect-video overflow-hidden rounded-lg mb-6">
      <img :src="recipe.imageUrl" :alt="recipe.title" class="w-full h-full object-cover" />
    </div>

    <h1 class="text-3xl font-bold mb-4">
      {{ recipe.title }}
    </h1>

    <div v-if="recipe.descriptionFull" class="text-gray-700 mb-6">
      {{ recipe.descriptionFull }}
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-gray-50 p-4 rounded-lg">
        <div class="text-sm text-gray-500">Préparation</div>
        <div class="text-lg font-semibold">{{ recipe.prepTime }} min</div>
      </div>

      <div class="bg-gray-50 p-4 rounded-lg">
        <div class="text-sm text-gray-500">Cuisson</div>
        <div class="text-lg font-semibold">{{ recipe.cookTime }} min</div>
      </div>

      <div class="bg-gray-50 p-4 rounded-lg">
        <div class="text-sm text-gray-500">Total</div>
        <div class="text-lg font-semibold">{{ totalTime }} min</div>
      </div>

      <div class="bg-gray-50 p-4 rounded-lg">
        <div class="text-sm text-gray-500">Difficulté</div>
        <div class="text-lg font-semibold capitalize">{{ recipe.difficulty }}</div>
      </div>
    </div>

    <div v-if="recipe.robotTypes && recipe.robotTypes.length" class="mb-6">
      <div class="text-sm text-gray-500 mb-2">Compatible avec :</div>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="robot in recipe.robotTypes"
          :key="robot.id"
          class="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
        >
          {{ robot.name }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RecipeWithDetails } from '~/types/recipe'

const props = defineProps<{
  recipe: RecipeWithDetails
}>()

const totalTime = computed(() => props.recipe.prepTime + props.recipe.cookTime)
</script>
