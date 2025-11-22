<template>
  <div class="relative">
    <div class="relative">
      <Icon
        name="heroicons:magnifying-glass"
        class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
      />
      <input
        v-model="localQuery"
        type="text"
        placeholder="Rechercher une recette..."
        class="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        @input="handleInput"
        @keyup.enter="handleSearch"
      />
      <button
        v-if="localQuery"
        @click="clearSearch"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        aria-label="Effacer la recherche"
      >
        <Icon name="heroicons:x-mark" class="w-5 h-5" />
      </button>
    </div>

    <p v-if="localQuery && !searching" class="mt-2 text-sm text-gray-600 dark:text-gray-400">
      Appuyez sur Entrée pour rechercher
    </p>

    <div v-if="searching" class="mt-2 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
      <Icon name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
      <span>Recherche en cours...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * SearchBar component for recipe search
 *
 * FR-016: Le système DOIT permettre de rechercher des recettes par mot-clé dans le titre ou la description
 */

interface Props {
  modelValue?: string
  searching?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  searching: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'search': [query: string]
}>()

const localQuery = ref(props.modelValue)

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  localQuery.value = newValue
})

// Debounced input handler (optional - can be used for real-time search)
let debounceTimer: ReturnType<typeof setTimeout> | null = null

function handleInput() {
  emit('update:modelValue', localQuery.value)

  // Clear existing timer
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  // Set new timer for debounced search (optional)
  // debounceTimer = setTimeout(() => {
  //   emit('search', localQuery.value)
  // }, 500)
}

function handleSearch() {
  emit('search', localQuery.value)
}

function clearSearch() {
  localQuery.value = ''
  emit('update:modelValue', '')
  emit('search', '')
}
</script>
