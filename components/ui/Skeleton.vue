<template>
  <div
    class="animate-pulse bg-gray-200 dark:bg-gray-700 rounded"
    :class="[
      heightClass,
      widthClass,
      customClass
    ]"
  />
</template>

<script setup lang="ts">
interface Props {
  height?: string
  width?: string
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  height: 'h-4',
  width: 'w-full',
  class: ''
})

const heightClass = computed(() => props.height)
const widthClass = computed(() => props.width)
const customClass = computed(() => props.class)
</script>
