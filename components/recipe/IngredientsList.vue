<template>
  <div class="ingredients-list">
    <h2 class="text-2xl font-bold mb-4">Ingrédients</h2>

    <ul class="space-y-2">
      <li
        v-for="ingredient in ingredients"
        :key="ingredient.id"
        class="flex justify-between items-start py-2 border-b border-gray-200 last:border-0"
      >
        <span class="flex-1" :class="{ 'text-gray-500': ingredient.isOptional }">
          {{ ingredient.name }}
          <span v-if="ingredient.isOptional" class="text-xs">(optionnel)</span>
        </span>
        <span class="font-semibold text-right ml-4">
          {{ formatQuantity(ingredient.adjustedQuantity) }} {{ ingredient.unit }}
        </span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { AdjustedIngredient } from '~/types/recipe'

const props = defineProps<{
  ingredients: AdjustedIngredient[]
}>()

/**
 * Format quantity for display
 * Show integers without decimal, decimals with 1 place
 */
function formatQuantity(quantity: number): string {
  return Number.isInteger(quantity) ? quantity.toString() : quantity.toFixed(1)
}
</script>
