<template>
  <div>
    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
      Type de robot
    </label>

    <div class="flex flex-wrap gap-2">
      <button
        @click="selectRobot('')"
        :class="[
          'px-4 py-2 rounded-lg font-medium transition-all',
          !selectedRobot
            ? 'bg-primary-600 text-white shadow-md'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
        ]"
      >
        Tous
      </button>

      <button
        v-for="robot in robotTypes"
        :key="robot.slug"
        @click="selectRobot(robot.slug)"
        :class="[
          'px-4 py-2 rounded-lg font-medium transition-all',
          selectedRobot === robot.slug
            ? 'bg-primary-600 text-white shadow-md'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
        ]"
      >
        {{ robot.name }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * RobotFilter component for filtering recipes by robot type
 *
 * FR-013: Le système DOIT permettre de filtrer les recettes par type de robot cuisinier
 */

interface RobotType {
  slug: string
  name: string
}

interface Props {
  modelValue?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'change': [value: string]
}>()

const selectedRobot = ref(props.modelValue)

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  selectedRobot.value = newValue
})

// Common robot types
const robotTypes: RobotType[] = [
  { slug: 'thermomix', name: 'Thermomix' },
  { slug: 'cookeo', name: 'Cookeo' },
  { slug: 'monsieur-cuisine', name: 'Monsieur Cuisine' },
  { slug: 'manuel', name: 'Manuel' }
]

function selectRobot(slug: string) {
  selectedRobot.value = slug
  emit('update:modelValue', slug)
  emit('change', slug)
}
</script>
