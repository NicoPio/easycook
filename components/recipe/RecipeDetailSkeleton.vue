<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto space-y-8">
      <!-- Header skeleton -->
      <div class="space-y-4">
        <Skeleton height="h-10" width="w-3/4" />
        <Skeleton height="h-6" width="w-1/2" />
      </div>

      <!-- Meta information skeleton -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Skeleton v-for="i in 4" :key="i" height="h-20" />
      </div>

      <!-- Description skeleton -->
      <div class="space-y-3">
        <Skeleton height="h-6" width="w-40" />
        <Skeleton height="h-4" width="w-full" />
        <Skeleton height="h-4" width="w-full" />
        <Skeleton height="h-4" width="w-3/4" />
      </div>

      <!-- Ingredients skeleton -->
      <div class="space-y-4">
        <Skeleton height="h-6" width="w-48" />
        <div class="space-y-2">
          <Skeleton v-for="i in 8" :key="i" height="h-10" />
        </div>
      </div>

      <!-- Steps skeleton -->
      <div class="space-y-4">
        <Skeleton height="h-6" width="w-36" />
        <div class="space-y-4">
          <div v-for="i in 5" :key="i" class="space-y-2">
            <Skeleton height="h-24" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Skeleton component for RecipeDetail loading state
</script>
