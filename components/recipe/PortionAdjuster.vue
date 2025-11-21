<template>
  <div class="portion-adjuster">
    <div class="flex items-center justify-between mb-3">
      <label
        for="servings"
        class="text-lg font-semibold text-gray-900"
      >
        Nombre de personnes
      </label>
      <span class="text-3xl font-bold text-primary-600">
        {{ modelValue }}
      </span>
    </div>

    <div class="flex items-center gap-4">
      <!-- Decrease button -->
      <button
        type="button"
        class="flex-shrink-0 w-12 h-12 rounded-full bg-primary-500 text-white font-bold text-xl hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="modelValue <= 1"
        @click="decrease"
        aria-label="Diminuer le nombre de personnes"
      >
        −
      </button>

      <!-- Slider -->
      <input
        id="servings"
        type="range"
        min="1"
        max="20"
        :value="modelValue"
        class="flex-1 h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
        @input="updateValue"
      />

      <!-- Increase button -->
      <button
        type="button"
        class="flex-shrink-0 w-12 h-12 rounded-full bg-primary-500 text-white font-bold text-xl hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="modelValue >= 20"
        @click="increase"
        aria-label="Augmenter le nombre de personnes"
      >
        +
      </button>
    </div>

    <!-- Reset button -->
    <div class="mt-3 text-center">
      <button
        v-if="modelValue !== baseServings"
        type="button"
        class="text-sm text-primary-600 hover:text-primary-700 underline"
        @click="reset"
      >
        Réinitialiser ({{ baseServings }} personnes)
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: number
  baseServings: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const updateValue = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', Number(target.value))
}

const decrease = () => {
  if (props.modelValue > 1) {
    emit('update:modelValue', props.modelValue - 1)
  }
}

const increase = () => {
  if (props.modelValue < 20) {
    emit('update:modelValue', props.modelValue + 1)
  }
}

const reset = () => {
  emit('update:modelValue', props.baseServings)
}
</script>
