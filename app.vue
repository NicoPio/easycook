<template>
  <UApp>
    <div>
      <!-- Offline indicator banner -->
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="transform -translate-y-full opacity-0"
        enter-to-class="transform translate-y-0 opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="transform translate-y-0 opacity-100"
        leave-to-class="transform -translate-y-full opacity-0"
      >
        <div
          v-if="!isOnline"
          class="fixed top-0 left-0 right-0 z-50 bg-orange-500 text-white px-4 py-3 shadow-lg"
          role="alert"
        >
          <div class="container mx-auto flex items-center justify-center gap-3">
            <UIcon name="i-lucide-wifi-off" class="w-5 h-5" />
            <span class="font-medium">
              Mode hors ligne - Les recettes récemment consultées restent disponibles
            </span>
          </div>
        </div>
      </Transition>

      <!-- Global error banner -->
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="transform -translate-y-full opacity-0"
        enter-to-class="transform translate-y-0 opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="transform translate-y-0 opacity-100"
        leave-to-class="transform -translate-y-full opacity-0"
      >
        <div
          v-if="globalError"
          :class="{ 'top-14': !isOnline, 'top-0': isOnline }"
          class="fixed left-0 right-0 z-50 bg-red-500 text-white px-4 py-3 shadow-lg"
          role="alert"
        >
          <div class="container mx-auto flex items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <UIcon name="i-lucide-alert-triangle" class="w-5 h-5 flex-shrink-0" />
              <div>
                <div class="font-medium">{{ globalError.message }}</div>
                <div v-if="globalError.details" class="text-sm opacity-90">
                  {{ globalError.details }}
                </div>
              </div>
            </div>
            <button
              @click="globalError = null"
              class="p-1 hover:bg-red-600 rounded transition-colors"
              aria-label="Fermer le message d'erreur"
            >
              <UIcon name="i-lucide-x" class="w-5 h-5" />
            </button>
          </div>
        </div>
      </Transition>

      <!-- Main content -->
      <div :class="{ 'pt-14': !isOnline || globalError, 'pt-28': !isOnline && globalError }">
        <NuxtPage />
      </div>
    </div>
  </UApp>
</template>

<script setup lang="ts">
// Root app component
// Global styles are loaded from assets/css/main.css via nuxt.config.ts

const isOnline = ref(true)
const globalError = ref<{ message: string; details?: string } | null>(null)

// Global error handler
onErrorCaptured((error, instance, info) => {
  console.error('Global error caught:', error, info)

  // Display user-friendly error message
  globalError.value = {
    message: "Une erreur inattendue s'est produite",
    details: error.message
  }

  // Auto-hide error after 5 seconds
  setTimeout(() => {
    globalError.value = null
  }, 5000)

  // Return false to prevent error from propagating further
  return false
})

onMounted(() => {
  // Set initial online status
  isOnline.value = navigator.onLine

  // Listen for online/offline events
  const handleOnline = () => {
    isOnline.value = true
  }

  const handleOffline = () => {
    isOnline.value = false
  }

  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  // Cleanup listeners on unmount
  onUnmounted(() => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  })
})
</script>
