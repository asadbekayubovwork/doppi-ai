<script setup lang="ts">
import CIcon from "./CIcon.vue"

withDefaults(
  defineProps<{
    icon: string
    /** Accessible name — the button has no visible text. */
    label: string
    variant?: "outline" | "ghost"
    size?: "xs" | "sm" | "md"
    disabled?: boolean
  }>(),
  { variant: "outline", size: "md" }
)

const SIZES = {
  xs: { box: "h-6 w-6 rounded-md", icon: "h-3.5 w-3.5" },
  sm: { box: "h-8 w-8 rounded-[9px]", icon: "h-4 w-4" },
  md: { box: "h-9 w-9 rounded-[10px]", icon: "h-4 w-4" },
}
</script>

<template>
  <button
    type="button"
    class="inline-flex shrink-0 items-center justify-center text-[#6A6A74] transition hover:text-[#15151B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4BE8]/40 disabled:pointer-events-none disabled:opacity-40"
    :class="[
      variant === 'outline'
        ? 'border border-[#E5E5E1] bg-white hover:bg-[#FAFAF9]'
        : 'hover:bg-[#F2F2EF]',
      SIZES[size].box,
    ]"
    :aria-label="label"
    :title="label"
    :disabled="disabled"
  >
    <CIcon :name="icon" :class="SIZES[size].icon" />
  </button>
</template>
