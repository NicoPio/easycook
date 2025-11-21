<template>
  <div>
    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <Icon name="heroicons:arrow-path" class="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
        <p class="text-gray-600 dark:text-gray-400">Chargement de la recette...</p>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="flex items-center justify-center min-h-screen">
      <div class="text-center max-w-md mx-auto p-6">
        <Icon name="heroicons:exclamation-triangle" class="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 class="text-2xl font-bold mb-2">Erreur</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6">{{ error.message }}</p>
        <UButton
          @click="navigateTo('/recettes')"
          variant="soft"
        >
          Retour aux recettes
        </UButton>
      </div>
    </div>

    <!-- Wake Lock fallback warning -->
    <div
      v-else-if="!wakeLock.isSupported && !wakeLockWarningDismissed"
      class="bg-yellow-50 dark:bg-yellow-900 border-b border-yellow-200 dark:border-yellow-700 p-4"
    >
      <div class="max-w-3xl mx-auto flex items-start gap-4">
        <Icon name="heroicons:exclamation-triangle" class="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
        <div class="flex-1">
          <p class="text-sm text-yellow-800 dark:text-yellow-200 font-medium mb-1">
            Mode veille non désactivé
          </p>
          <p class="text-sm text-yellow-700 dark:text-yellow-300">
            Votre appareil ne supporte pas la désactivation automatique de la mise en veille.
            Pensez à ajuster les paramètres de veille de votre écran manuellement.
          </p>
        </div>
        <button
          @click="wakeLockWarningDismissed = true"
          class="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200"
          aria-label="Fermer"
        >
          <Icon name="heroicons:x-mark" class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Step-by-step view -->
    <StepByStepView
      v-else-if="recipe"
      :recipe-title="recipe.title"
      :current-step="stepByStep.currentStep.value"
      :step-number="stepByStep.currentStepNumber.value"
      :total-steps="stepByStep.totalSteps.value"
      :progress="stepByStep.progress.value"
      :is-completed="stepByStep.isCompleted.value"
      :has-next="stepByStep.hasNext.value"
      :has-previous="stepByStep.hasPrevious.value"
      @next="handleNext"
      @previous="stepByStep.previous"
      @exit="handleExit"
      @restart="stepByStep.restart"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * Step-by-step cooking mode page
 *
 * FR-007: Le système DOIT permettre de déclencher un mode pas-à-pas depuis la page de détail
 * FR-011: Le système DOIT empêcher la mise en veille de l'écran pendant le mode pas-à-pas
 * FR-012: Le système DOIT permettre de quitter le mode pas-à-pas à tout moment
 */

const route = useRoute()
const router = useRouter()

// Fetch recipe data
const recipeId = computed(() => Number(route.params.id))
const { recipe, loading, error, fetchRecipe } = useRecipeDetail()

// Step navigation
const stepByStep = computed(() => {
  if (!recipe.value?.steps) {
    return useStepByStep([])
  }
  return useStepByStep(recipe.value.steps)
})

// Wake Lock to keep screen on
const wakeLock = useWakeLock()
const wakeLockWarningDismissed = ref(false)

// Load recipe on mount
onMounted(async () => {
  await fetchRecipe(recipeId.value)

  // Request wake lock when entering step-by-step mode
  if (wakeLock.isSupported.value) {
    await wakeLock.request()
  }

  // Enter fullscreen if supported
  if (document.documentElement.requestFullscreen) {
    try {
      await document.documentElement.requestFullscreen()
    } catch (err) {
      // Fullscreen not allowed or failed, continue anyway
      console.warn('Fullscreen not available:', err)
    }
  }
})

// Clean up on unmount
onUnmounted(async () => {
  // Release wake lock
  await wakeLock.release()

  // Exit fullscreen if active
  if (document.fullscreenElement) {
    try {
      await document.exitFullscreen()
    } catch (err) {
      console.warn('Exit fullscreen failed:', err)
    }
  }
})

/**
 * Handle next step - complete recipe when reaching the last step
 */
function handleNext() {
  if (!stepByStep.value.hasNext.value) {
    // Mark as completed
    stepByStep.value.next()
  } else {
    stepByStep.value.next()
  }
}

/**
 * Handle exit - return to recipe detail page
 */
async function handleExit() {
  // Exit fullscreen first
  if (document.fullscreenElement) {
    try {
      await document.exitFullscreen()
    } catch (err) {
      console.warn('Exit fullscreen failed:', err)
    }
  }

  // Navigate back to recipe detail
  router.push(`/recettes/${recipeId.value}`)
}

// Set page meta
definePageMeta({
  layout: false, // No layout for fullscreen mode
  pageTransition: {
    name: 'fade',
    mode: 'out-in'
  }
})

// SEO
useHead({
  title: computed(() => recipe.value ? `${recipe.value.title} - Mode pas-à-pas` : 'Mode pas-à-pas'),
  meta: [
    {
      name: 'robots',
      content: 'noindex' // Don't index step-by-step pages
    }
  ]
})
</script>
