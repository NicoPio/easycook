<template>
  <div class="portion-adjuster bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
    <label
      for="servings-input"
      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
    >
      Nombre de personnes
    </label>

    <div class="flex items-center gap-4" role="group" aria-label="Ajustement du nombre de portions">
      <button
        type="button"
        class="btn-touch bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
        :disabled="modelValue <= 1"
        @click="decrement"
        aria-label="Diminuer le nombre de personnes"
      >
        <span class="text-xl" aria-hidden="true">−</span>
      </button>

      <input
        id="servings-input"
        :value="modelValue"
        type="number"
        min="1"
        max="20"
        class="w-20 text-center text-xl font-semibold border border-gray-300 dark:border-gray-600 rounded-lg py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        :aria-label="`Nombre de personnes: ${modelValue}`"
        aria-describedby="servings-hint"
        @input="handleInput"
        @blur="validateOnBlur"
      />

      <button
        type="button"
        class="btn-touch bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
        :disabled="modelValue >= 20"
        @click="increment"
        aria-label="Augmenter le nombre de personnes"
      >
        <span class="text-xl" aria-hidden="true">+</span>
      </button>
    </div>

    <div id="servings-hint" class="mt-2 text-sm text-gray-500 dark:text-gray-400">
      <span v-if="modelValue !== originalServings">
        Recette originale : {{ originalServings }} personne{{ originalServings > 1 ? 's' : '' }}
      </span>
      <span v-else class="text-gray-400 dark:text-gray-500"> Entre 1 et 20 personnes </span>
    </div>

    <!-- Validation warning -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 transform scale-95"
      enter-to-class="opacity-100 transform scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 transform scale-100"
      leave-to-class="opacity-0 transform scale-95"
    >
      <div
        v-if="validationWarning"
        class="mt-2 flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400"
        role="alert"
      >
        <UIcon name="i-lucide-alert-triangle" class="w-4 h-4 flex-shrink-0" />
        <span>{{ validationWarning }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: number
  originalServings: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()

const validationWarning = ref<string | null>(null)
let warningTimeout: ReturnType<typeof setTimeout> | null = null

function showWarning(message: string) {
  validationWarning.value = message

  // Clear existing timeout
  if (warningTimeout) {
    clearTimeout(warningTimeout)
  }

  // Auto-hide after 3 seconds
  warningTimeout = setTimeout(() => {
    validationWarning.value = null
  }, 3000)
}

function increment() {
  if (props.modelValue < 20) {
    emit('update:modelValue', props.modelValue + 1)
  } else {
    showWarning('Le nombre maximum de personnes est 20')
  }
}

function decrement() {
  if (props.modelValue > 1) {
    emit('update:modelValue', props.modelValue - 1)
  } else {
    showWarning('Le nombre minimum de personnes est 1')
  }
}

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  let value = parseInt(target.value)
  let corrected = false

  // Validate: 1-20 persons (FR-004)
  if (isNaN(value) || value < 1) {
    value = 1
    corrected = true
    showWarning('Le nombre de personnes doit être au moins 1')
  } else if (value > 20) {
    value = 20
    corrected = true
    showWarning('Le nombre de personnes ne peut pas dépasser 20')
  }

  emit('update:modelValue', value)

  // Update input value if corrected
  if (corrected) {
    target.value = String(value)
  }
}

function validateOnBlur(event: Event) {
  const target = event.target as HTMLInputElement

  // Ensure value is valid on blur
  if (target.value === '' || isNaN(parseInt(target.value))) {
    target.value = String(props.modelValue)
  }
}

// Cleanup timeout on unmount
onUnmounted(() => {
  if (warningTimeout) {
    clearTimeout(warningTimeout)
  }
})
</script>
