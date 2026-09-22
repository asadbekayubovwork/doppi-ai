<script setup lang="ts">
/**
 * The CRM window both desktop mockups sit in. Colours come from the dashboard
 * token set (app/styles/tokens.css) rather than the landing's sand scale —
 * these panels are a picture of the product's own UI.
 */
defineProps<{
  /** Text in the window's title bar. */
  title: string
  /** Described to screen readers in place of the mock UI. */
  label: string
}>()
</script>

<template>
  <div
    class="w-full overflow-hidden rounded-2xl border border-[#E5E5E1] bg-white shadow-[0_40px_80px_-44px_rgba(12,10,9,0.4)]"
    role="img"
    :aria-label="label"
  >
    <div
      class="flex items-center gap-3 border-b border-[#E5E5E1] bg-[#FAFAF9] px-4 py-[11px]"
      aria-hidden="true"
    >
      <span class="flex items-center gap-1.5">
        <span
          v-for="dot in 3"
          :key="dot"
          class="h-[9px] w-[9px] rounded-full bg-[#E5E5E1]"
        />
      </span>
      <span class="truncate text-[12.5px] font-medium text-[#84848E]">{{
        title
      }}</span>
    </div>

    <div aria-hidden="true">
      <slot />
    </div>
  </div>
</template>
