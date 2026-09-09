<script setup lang="ts">
import { ref, toRef } from "vue"
import { useInView, useCountUp } from "@/shared/lib"

const props = defineProps<{ value: string; duration?: number }>()

// Counts the leading number up the first time the stat scrolls into view.
// Ranges and composites ("24/7", "2–5×", "Maxsus") render statically.
const el = ref<HTMLElement | null>(null)
const inView = useInView(el, { threshold: 0.4, once: true })
const display = useCountUp(toRef(props, "value"), inView, props.duration)
</script>

<template>
  <span ref="el" class="tabular-nums">{{ display }}</span>
</template>
