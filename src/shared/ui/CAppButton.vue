<script setup lang="ts">
import { computed } from "vue"
import { RouterLink, type RouteLocationRaw } from "vue-router"
import CIcon from "./CIcon.vue"
import type { ButtonVariant } from "./types"

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariant
    size?: "sm" | "md"
    icon?: string
    type?: "button" | "submit"
    /** Renders a RouterLink styled as a button. */
    to?: RouteLocationRaw
    disabled?: boolean
    loading?: boolean
  }>(),
  { variant: "secondary", size: "md", type: "button" }
)

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-[#5B4BE8] text-white hover:bg-[#4F3FDC]",
  secondary:
    "border border-[#E5E5E1] bg-white text-[#15151B] hover:border-[#D6D6D1] hover:bg-[#FAFAF9]",
}

const SIZES = {
  sm: "h-8 gap-1.5 px-3 text-[13px]",
  md: "h-9 gap-2 px-3.5 text-sm",
}

const classes = computed(() => [
  "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-[10px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4BE8]/40 disabled:cursor-not-allowed disabled:opacity-50",
  VARIANTS[props.variant],
  SIZES[props.size],
])
</script>

<template>
  <RouterLink v-if="to" :to="to" :class="classes">
    <CIcon v-if="icon" :name="icon" class="h-4 w-4 shrink-0" />
    <slot />
  </RouterLink>
  <button
    v-else
    :type="type"
    :class="classes"
    :disabled="disabled || loading"
    :aria-busy="loading || undefined"
  >
    <span
      v-if="loading"
      class="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
      aria-hidden="true"
    />
    <CIcon v-else-if="icon" :name="icon" class="h-4 w-4 shrink-0" />
    <slot />
  </button>
</template>
