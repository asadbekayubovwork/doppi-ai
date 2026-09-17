<script setup lang="ts">
import { computed } from "vue"

const props = withDefaults(
  defineProps<{
    /** Completion between 0 and 1. */
    value: number
    tone?: "accent" | "warning"
    label?: string
  }>(),
  { tone: "accent" }
)

const percent = computed(() =>
  Math.round(Math.min(1, Math.max(0, props.value)) * 100)
)
</script>

<template>
  <div
    class="h-1 overflow-hidden rounded-full bg-[#EEEEEA]"
    role="progressbar"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-valuenow="percent"
    :aria-label="label"
  >
    <div
      class="h-full rounded-full transition-[width] duration-300"
      :class="tone === 'warning' ? 'bg-[#D97706]' : 'bg-[#5B4BE8]'"
      :style="{ width: `${percent}%` }"
    />
  </div>
</template>
