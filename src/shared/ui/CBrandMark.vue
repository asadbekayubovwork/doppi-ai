<script setup lang="ts">
import { computed } from "vue"
import { BRAND_MARKS } from "./brand-marks"

// Filled single-colour brand logos (see brand-marks.ts). They are solid
// shapes, not strokes, so they cannot live in the ICONS set CIcon renders.
// The mark takes `currentColor`; tint it with a text colour class.
const props = defineProps<{ name: string }>()

const mark = computed(() => BRAND_MARKS[props.name])
</script>

<template>
  <svg
    v-if="mark"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
  >
    <path :d="mark.path" />
  </svg>
</template>
