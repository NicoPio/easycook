<template>
  <div class="portion-adjuster bg-gray-50 p-4 rounded-lg">
    <label class="block text-sm font-medium text-gray-700 mb-2">
      Nombre de personnes
    </label>

    <div class="flex items-center gap-4">
      <button
        type="button"
        class="btn-touch bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        :disabled="modelValue <= 1"
        @click="decrement"
      >
        <span class="text-xl">−</span>
      </button>

      <input
        :value="modelValue"
        type="number"
        min="1"
        max="20"
        class="w-20 text-center text-xl font-semibold border border-gray-300 rounded-lg py-2"
        @input="handleInput"
      >

      <button
        type="button"
        class="btn-touch bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        :disabled="modelValue >= 20"
        @click="increment"
      >
        <span class="text-xl">+</span>
      </button>
    </div>

    <div class="mt-2 text-sm text-gray-500">
      <span v-if="modelValue !== originalServings">
        Recette originale : {{ originalServings }} personne{{ originalServings > 1 ? 's' : '' }}
      </span>
    </div>
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

function increment() {
  if (props.modelValue < 20) {
    emit('update:modelValue', props.modelValue + 1)
  }
}

function decrement() {
  if (props.modelValue > 1) {
    emit('update:modelValue', props.modelValue - 1)
  }
}

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  let value = parseInt(target.value)

  // Validate: 1-20 persons (FR-004)
  if (isNaN(value) || value < 1) {
    value = 1
  } else if (value > 20) {
    value = 20
  }

  emit('update:modelValue', value)
}
</script>
