<script setup lang="ts">
import { computed } from "vue"
import { CIcon } from "@/shared/ui"

const props = withDefaults(
  defineProps<{
    /** Base colour for the placeholder gradient. */
    color?: string
    /** Show a centered play affordance. */
    play?: boolean
    /** Duration badge, e.g. "0:15". */
    duration?: string
    rounded?: string
  }>(),
  { color: "#C9A98C", play: false, rounded: "rounded-xl" }
)

// A soft two-stop gradient off the base colour keeps the placeholders from
// looking like flat swatches while the real thumbnails are wired up.
const style = computed(() => ({
  background: `linear-gradient(135deg, ${props.color} 0%, ${props.color}99 55%, ${props.color}55 100%)`,
}))
</script>

<template>
  <div
    class="relative flex items-center justify-center overflow-hidden"
    :class="rounded"
    :style="style"
  >
    <span
      v-if="play"
      class="grid h-11 w-11 place-items-center rounded-full bg-white/90 text-[#15151B] shadow-[0_4px_14px_rgba(0,0,0,0.25)] backdrop-blur"
    >
      <CIcon name="play" class="ml-0.5 h-5 w-5" stroke-width="2" />
    </span>
    <span
      v-if="duration"
      class="absolute right-2 top-2 rounded-md bg-black/55 px-1.5 py-0.5 text-[11px] font-semibold text-white"
    >
      {{ duration }}
    </span>
    <slot />
  </div>
</template>
