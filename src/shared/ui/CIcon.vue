<script setup lang="ts">
import { computed } from "vue"
import { ICONS } from "./icons"

const props = withDefaults(
  defineProps<{
    name: string
    strokeWidth?: number | string
  }>(),
  { strokeWidth: 1.75 }
)

// Unknown keys fall back to `sparkles` so a typo in the content tree never
// renders an empty box.
const nodes = computed(() => ICONS[props.name] ?? ICONS.sparkles)
</script>

<template>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <component :is="node[0]" v-for="(node, i) in nodes" :key="i" v-bind="node[1]" />
  </svg>
</template>
