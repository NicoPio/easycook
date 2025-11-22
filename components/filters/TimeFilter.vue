<template>
  <div>
    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
      Temps de préparation
    </label>

    <div class="flex flex-wrap gap-2">
      <button
        @click="selectTime(null)"
        :class="[
          'px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2',
          selectedTime === null
            ? 'bg-primary-600 text-white shadow-md'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
        ]"
      >
        Tous
      </button>

      <button
        v-for="option in timeOptions"
        :key="option.value"
        @click="selectTime(option.value)"
        :class="[
          'px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2',
          selectedTime === option.value
            ? 'bg-primary-600 text-white shadow-md'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
        ]"
      >
        <Icon name="heroicons:clock" class="w-4 h-4" />
        {{ option.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * TimeFilter component for filtering recipes by total time
 *
 * FR-014: Le système DOIT permettre de filtrer les recettes par temps de préparation total
 */

interface TimeOption {
  value: number
  label: string
}

interface Props {
  modelValue?: number | null
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null
})

const emit = defineEmits<{
  'update:modelValue': [value: number | null]
  change: [value: number | null]
}>()

const selectedTime = ref<number | null>(props.modelValue)

// Watch for external changes
watch(
  () => props.modelValue,
  (newValue) => {
    selectedTime.value = newValue
  }
)

// Time range options (in minutes)
const timeOptions: TimeOption[] = [
  { value: 30, label: '< 30 min' },
  { value: 60, label: '30-60 min' },
  { value: 999, label: '> 1h' }
]

function selectTime(time: number | null) {
  selectedTime.value = time
  emit('update:modelValue', time)
  emit('change', time)
}
</script>
