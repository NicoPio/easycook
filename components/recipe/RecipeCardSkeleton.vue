<template>
  <UCard>
    <div class="space-y-4">
      <!-- Image skeleton -->
      <Skeleton height="h-48" width="w-full" class="rounded-lg" />

      <!-- Title skeleton -->
      <Skeleton height="h-6" width="w-3/4" />

      <!-- Description skeleton -->
      <div class="space-y-2">
        <Skeleton height="h-4" width="w-full" />
        <Skeleton height="h-4" width="w-5/6" />
      </div>

      <!-- Metadata skeleton -->
      <div class="flex gap-4">
        <Skeleton height="h-4" width="w-20" />
        <Skeleton height="h-4" width="w-24" />
        <Skeleton height="h-4" width="w-16" />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
// Skeleton component for RecipeCard loading state
</script>
