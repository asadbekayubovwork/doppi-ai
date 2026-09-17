<script setup lang="ts">
import CIcon from "./CIcon.vue"
import type { BadgeTone } from "./types"

withDefaults(
  defineProps<{
    tone?: BadgeTone
    size?: "sm" | "md"
    /** Leading status dot in the text colour — "Live", "Active". */
    dot?: boolean
    icon?: string
  }>(),
  { tone: "neutral", size: "md" }
)

const TONES: Record<BadgeTone, string> = {
  neutral: "bg-[#F2F2EF] text-[#6A6A74]",
  accent: "bg-[#EFECFF] text-[#5B4BE8]",
  success: "bg-[#E7F6EC] text-[#177A46]",
  warning: "bg-[#FFF1E0] text-[#B45309]",
  danger: "bg-[#FFF0F0] text-[#C42B2B]",
  outline: "border border-[#E5E5E1] bg-white text-[#3F3F46]",
}

const SIZES = {
  sm: "h-5 gap-1 px-1.5 text-[11px]",
  md: "h-6 gap-1.5 px-2.5 text-xs",
}
</script>

<template>
  <span
    class="inline-flex shrink-0 items-center whitespace-nowrap rounded-full font-medium"
    :class="[TONES[tone], SIZES[size]]"
  >
    <span
      v-if="dot"
      class="h-1.5 w-1.5 rounded-full bg-current"
      aria-hidden="true"
    />
    <CIcon v-if="icon" :name="icon" class="h-3.5 w-3.5 shrink-0" />
    <slot />
  </span>
</template>
