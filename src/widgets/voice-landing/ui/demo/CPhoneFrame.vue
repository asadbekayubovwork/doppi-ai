<script setup lang="ts">
import { CIcon } from "@/shared/ui"

/**
 * The device shell both phone mockups sit in: bezel, iOS status bar and home
 * indicator. The screen itself is a slot, so each demo only describes its app.
 * Fixed at 300px — the width still clears the 16px gutters on a 360px screen,
 * so nothing has to be scaled down.
 */
defineProps<{
  /** Screen background, applied under the slot content. */
  screenClass?: string
  /** Described to screen readers in place of the mock UI. */
  label: string
}>()
</script>

<template>
  <div
    class="w-[300px] shrink-0 rounded-[44px] border border-sand-800 bg-sand-950 p-2 shadow-[0_40px_80px_-40px_rgba(12,10,9,0.55)]"
    role="img"
    :aria-label="label"
  >
    <div
      class="flex min-h-[600px] flex-col overflow-hidden rounded-[36px]"
      :class="screenClass"
      aria-hidden="true"
    >
      <!-- Status bar -->
      <div
        class="flex items-center justify-between px-[18px] pb-[5px] pt-[13px]"
      >
        <span class="text-xs font-semibold text-white">9:41</span>
        <span class="flex items-center gap-[5px] text-white">
          <CIcon name="signal" class="h-[13px] w-[13px]" stroke-width="2" />
          <CIcon name="wifi" class="h-[13px] w-[13px]" stroke-width="2" />
          <CIcon
            name="battery-full"
            class="h-[13px] w-[13px]"
            stroke-width="2"
          />
        </span>
      </div>

      <slot />

      <!-- Home indicator -->
      <div class="flex justify-center pb-[9px] pt-3">
        <span class="h-1 w-[110px] rounded-full bg-white/50" />
      </div>
    </div>
  </div>
</template>
