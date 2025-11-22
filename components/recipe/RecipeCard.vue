<template>
  <NuxtLink :to="`/recettes/${recipe.id}`" class="recipe-card block">
    <div v-if="recipe.imageUrl" class="aspect-video overflow-hidden">
      <img :src="recipe.imageUrl" :alt="recipe.title" class="w-full h-full object-cover" />
    </div>
    <div v-else class="aspect-video bg-gray-200 flex items-center justify-center">
      <span class="text-gray-400">Pas d'image</span>
    </div>

    <div class="p-4">
      <h3 class="font-semibold text-lg mb-2 text-balance">
        {{ recipe.title }}
      </h3>

      <p v-if="recipe.descriptionShort" class="text-sm text-gray-600 mb-3 line-clamp-2">
        {{ recipe.descriptionShort }}
      </p>

      <div class="flex items-center gap-4 text-sm text-gray-500">
        <div class="flex items-center gap-1">
          <span>⏱️</span>
          <span>{{ totalTime }} min</span>
        </div>

        <div class="flex items-center gap-1">
          <span>👨‍🍳</span>
          <span class="capitalize">{{ recipe.difficulty }}</span>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { Recipe } from '~/types/recipe'

const props = defineProps<{
  recipe: Recipe
}>()

const totalTime = computed(() => props.recipe.prepTime + props.recipe.cookTime)
</script>
