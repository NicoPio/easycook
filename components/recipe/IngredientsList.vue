<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-2xl font-bold text-gray-900 mb-4">
      Ingrédients
    </h2>

    <ul class="space-y-2">
      <li
        v-for="ingredient in ingredients"
        :key="ingredient.id"
        class="ingredient-item"
        :class="{ 'opacity-60': ingredient.optional }"
      >
        <span class="font-medium text-primary-600 min-w-[80px] inline-block">
          {{ formatQuantity(ingredient.quantity) }} {{ ingredient.unit }}
        </span>
        <span class="text-gray-900">
          {{ ingredient.name }}
        </span>
        <span
          v-if="ingredient.optional"
          class="text-xs text-gray-500 ml-2"
        >
          (optionnel)
        </span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { Ingredient } from '~/types/recipe'

const props = defineProps<{
  ingredients: Ingredient[]
  formatQuantity: (quantity: number) => string
}>()
</script>
