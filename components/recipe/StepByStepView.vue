<template>
  <div class="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col">
    <!-- Header with progress -->
    <header class="bg-primary-600 dark:bg-primary-700 text-white p-4 shadow-lg">
      <div class="flex items-center justify-between mb-2">
        <button
          @click="$emit('exit')"
          class="p-3 hover:bg-primary-700 dark:hover:bg-primary-800 rounded-lg transition-colors touch-target"
          aria-label="Quitter le mode pas-à-pas"
        >
          <Icon name="heroicons:x-mark" class="w-6 h-6" />
        </button>

        <div class="text-center flex-1">
          <h1 class="text-xl font-bold">{{ recipeTitle }}</h1>
          <p class="text-sm opacity-90">Étape {{ stepNumber }} / {{ totalSteps }}</p>
        </div>

        <div class="w-12"></div>
        <!-- Spacer for centering -->
      </div>

      <!-- Progress bar -->
      <div
        class="w-full bg-primary-800 dark:bg-primary-900 rounded-full h-2"
        role="progressbar"
        :aria-valuenow="progress"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-label="`Progression: ${progress}% complété`"
      >
        <div
          class="bg-white h-2 rounded-full transition-all duration-300"
          :style="{ width: `${progress}%` }"
        ></div>
      </div>
    </header>

    <!-- Screen reader announcements -->
    <div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
      <span v-if="!isCompleted">
        Étape {{ stepNumber }} sur {{ totalSteps }}: {{ currentStep?.description }}
      </span>
      <span v-else> Recette terminée ! Toutes les étapes sont complétées. </span>
    </div>

    <!-- Main content - scrollable -->
    <main class="flex-1 overflow-y-auto p-6" role="main">
      <div class="max-w-3xl mx-auto space-y-6">
        <!-- Completion message -->
        <div v-if="isCompleted" class="text-center py-12">
          <Icon name="heroicons:check-circle" class="w-24 h-24 text-green-500 mx-auto mb-4" />
          <h2 class="text-3xl font-bold mb-4">Recette terminée !</h2>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            Félicitations, vous avez complété toutes les étapes.
          </p>
          <UButton size="xl" @click="$emit('restart')" class="touch-target">
            <Icon name="heroicons:arrow-path" class="w-5 h-5 mr-2" />
            Recommencer
          </UButton>
        </div>

        <!-- Step content -->
        <div v-else-if="currentStep">
          <!-- Step description -->
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
            <h2 class="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              {{ currentStep.description }}
            </h2>
          </div>

          <!-- Robot parameters -->
          <div v-if="hasRobotParams" class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div
              v-if="currentStep.duration"
              class="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 text-center"
            >
              <Icon
                name="heroicons:clock"
                class="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2"
              />
              <div class="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {{ currentStep.duration }} min
              </div>
              <div class="text-sm text-blue-700 dark:text-blue-300">Durée</div>
            </div>

            <div
              v-if="currentStep.temperature"
              class="bg-red-50 dark:bg-red-900 rounded-lg p-4 text-center"
            >
              <Icon
                name="heroicons:fire"
                class="w-8 h-8 text-red-600 dark:text-red-400 mx-auto mb-2"
              />
              <div class="text-2xl font-bold text-red-900 dark:text-red-100">
                {{ currentStep.temperature }}°C
              </div>
              <div class="text-sm text-red-700 dark:text-red-300">Température</div>
            </div>

            <div
              v-if="currentStep.speed"
              class="bg-green-50 dark:bg-green-900 rounded-lg p-4 text-center"
            >
              <Icon
                name="heroicons:bolt"
                class="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2"
              />
              <div class="text-2xl font-bold text-green-900 dark:text-green-100">
                Vitesse {{ currentStep.speed }}
              </div>
              <div class="text-sm text-green-700 dark:text-green-300">Vitesse</div>
            </div>
          </div>

          <!-- Ingredients for this step (optional, if provided) -->
          <div v-if="stepIngredients && stepIngredients.length > 0" class="mb-6">
            <h3 class="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
              Ingrédients nécessaires
            </h3>
            <ul class="space-y-2">
              <li
                v-for="ingredient in stepIngredients"
                :key="ingredient.id"
                class="flex items-center bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm"
              >
                <Icon
                  name="heroicons:check-circle"
                  class="w-5 h-5 text-primary-500 mr-3 flex-shrink-0"
                />
                <span class="text-gray-900 dark:text-white">
                  {{ ingredient.quantity }} {{ ingredient.unit }} {{ ingredient.name }}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>

    <!-- Navigation footer -->
    <footer class="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
      <div class="max-w-3xl mx-auto flex justify-between items-center gap-4">
        <!-- Previous button -->
        <UButton
          size="xl"
          color="gray"
          variant="soft"
          @click="$emit('previous')"
          :disabled="!hasPrevious"
          :aria-label="`Étape précédente (${stepNumber - 1}/${totalSteps})`"
          class="flex-1 touch-target min-h-[60px]"
        >
          <Icon name="heroicons:arrow-left" class="w-6 h-6 mr-2" aria-hidden="true" />
          Précédent
        </UButton>

        <!-- Next button -->
        <UButton
          size="xl"
          @click="$emit('next')"
          :disabled="!hasNext && !isCompleted"
          :aria-label="
            hasNext ? `Étape suivante (${stepNumber + 1}/${totalSteps})` : 'Terminer la recette'
          "
          class="flex-1 touch-target min-h-[60px]"
        >
          <template v-if="!hasNext && !isCompleted">
            Terminer
            <Icon name="heroicons:check" class="w-6 h-6 ml-2" aria-hidden="true" />
          </template>
          <template v-else>
            Suivant
            <Icon name="heroicons:arrow-right" class="w-6 h-6 ml-2" aria-hidden="true" />
          </template>
        </UButton>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import type { Step, AdjustedIngredient } from '~/types/recipe'

/**
 * StepByStepView component for fullscreen step-by-step cooking mode
 *
 * FR-008: Le système DOIT afficher le mode pas-à-pas en plein écran avec affichage simplifié
 * FR-009: Le système DOIT afficher pour chaque étape : numéro, description, ingrédients, paramètres robot, progression
 * FR-010: Le système DOIT permettre de naviguer entre les étapes avec contrôles tactiles larges
 * SC-003: Le mode pas-à-pas est navigable d'une seule main avec zones tactiles d'au moins 44x44px
 */

interface Props {
  recipeTitle: string
  currentStep: Step | null
  stepNumber: number
  totalSteps: number
  progress: number
  isCompleted: boolean
  hasNext: boolean
  hasPrevious: boolean
  stepIngredients?: AdjustedIngredient[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  next: []
  previous: []
  exit: []
  restart: []
}>()

const hasRobotParams = computed(() => {
  if (!props.currentStep) return false
  return !!(props.currentStep.duration || props.currentStep.temperature || props.currentStep.speed)
})

// Keyboard navigation
onMounted(() => {
  const handleKeydown = (event: KeyboardEvent) => {
    // Left arrow - previous step
    if (event.key === 'ArrowLeft' && props.hasPrevious) {
      event.preventDefault()
      emit('previous')
    }

    // Right arrow - next step
    if (event.key === 'ArrowRight' && (props.hasNext || !props.isCompleted)) {
      event.preventDefault()
      emit('next')
    }

    // Escape - exit step-by-step mode
    if (event.key === 'Escape') {
      event.preventDefault()
      emit('exit')
    }
  }

  window.addEventListener('keydown', handleKeydown)

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
  })
})
</script>

<style scoped>
/* Ensure minimum touch target size of 44x44px for accessibility */
.touch-target {
  min-width: 44px;
  min-height: 44px;
}

/* Prevent text selection during navigation */
.no-select {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>
