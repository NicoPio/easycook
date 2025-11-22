import { ref, computed } from 'vue'
import type { Step } from '~/types/recipe'

/**
 * Composable to manage step-by-step navigation state
 * Handles progression through recipe steps with progress tracking
 *
 * FR-010: Le système DOIT permettre à l'utilisateur de naviguer entre les étapes (suivante, précédente)
 * FR-009: Le système DOIT afficher pour chaque étape : numéro, description, ingrédients, paramètres robot, indicateur de progression
 */
export function useStepByStep(steps: Step[]) {
  const currentStepIndex = ref(0)
  const isCompleted = ref(false)

  /**
   * Current step being displayed
   */
  const currentStep = computed(() => {
    if (currentStepIndex.value >= 0 && currentStepIndex.value < steps.length) {
      return steps[currentStepIndex.value]
    }
    return null
  })

  /**
   * Total number of steps
   */
  const totalSteps = computed(() => steps.length)

  /**
   * Current step number (1-indexed for display)
   */
  const currentStepNumber = computed(() => currentStepIndex.value + 1)

  /**
   * Progress percentage (0-100)
   */
  const progress = computed(() => {
    if (totalSteps.value === 0) return 0
    return Math.round((currentStepNumber.value / totalSteps.value) * 100)
  })

  /**
   * Check if there is a next step
   */
  const hasNext = computed(() => currentStepIndex.value < totalSteps.value - 1)

  /**
   * Check if there is a previous step
   */
  const hasPrevious = computed(() => currentStepIndex.value > 0)

  /**
   * Navigate to next step
   */
  function next() {
    if (hasNext.value) {
      currentStepIndex.value++
    } else {
      // Reached the end
      isCompleted.value = true
    }
  }

  /**
   * Navigate to previous step
   */
  function previous() {
    if (hasPrevious.value) {
      currentStepIndex.value--
      isCompleted.value = false
    }
  }

  /**
   * Jump to a specific step (0-indexed)
   */
  function goToStep(index: number) {
    if (index >= 0 && index < totalSteps.value) {
      currentStepIndex.value = index
      isCompleted.value = false
    }
  }

  /**
   * Reset to first step
   */
  function reset() {
    currentStepIndex.value = 0
    isCompleted.value = false
  }

  /**
   * Restart from beginning
   */
  function restart() {
    reset()
  }

  return {
    // State
    currentStep,
    currentStepIndex,
    currentStepNumber,
    totalSteps,
    progress,
    isCompleted,
    hasNext,
    hasPrevious,

    // Actions
    next,
    previous,
    goToStep,
    reset,
    restart
  }
}
