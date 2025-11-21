<template>
  <div id="app" class="h-full">
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
// Global app setup
useHead({
  htmlAttrs: {
    lang: 'fr',
  },
})

// Detect offline/online status
const isOnline = ref(true)

if (process.client) {
  isOnline.value = navigator.onLine

  window.addEventListener('online', () => {
    isOnline.value = true
  })

  window.addEventListener('offline', () => {
    isOnline.value = false
  })
}

// Global error handler
const handleError = (error: Error) => {
  console.error('Global error:', error)
  // TODO: Add toast notification or error display
}

if (process.client) {
  window.addEventListener('unhandledrejection', (event) => {
    handleError(new Error(event.reason))
  })
}
</script>

<style>
/* Global styles are imported from assets/css/main.css via nuxt.config.ts */
</style>
