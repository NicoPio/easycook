<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
    <div class="max-w-md w-full text-center">
      <UIcon
        name="i-lucide-wifi-off"
        class="w-24 h-24 mx-auto text-gray-400 dark:text-gray-600 mb-6"
      />

      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">Mode hors ligne</h1>

      <p class="text-gray-600 dark:text-gray-400 mb-8">
        Vous êtes actuellement hors ligne. Certaines fonctionnalités peuvent être limitées.
      </p>

      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg mb-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Recettes disponibles hors ligne
        </h2>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Les recettes que vous avez récemment consultées sont disponibles en mode hors ligne.
        </p>
        <UButton to="/" color="primary" size="lg" block> Voir les recettes en cache </UButton>
      </div>

      <div class="text-sm text-gray-500 dark:text-gray-500">
        <p>La connexion sera rétablie automatiquement dès que vous serez en ligne.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})
</script>
