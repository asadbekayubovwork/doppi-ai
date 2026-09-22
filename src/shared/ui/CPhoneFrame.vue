<script setup lang="ts">
import { computed } from "vue"
import CIcon from "./CIcon.vue"

/**
 * The device shell the landing phone mockups sit in: bezel, status bar and the
 * bottom navigation. The screen itself is a slot, so each demo only describes
 * its app. Fixed at 300px — the width still clears the 16px gutters on a 360px
 * screen, so nothing has to be scaled down.
 */
const props = withDefaults(
  defineProps<{
    /** Screen background, applied under the slot content. */
    screenClass?: string
    /** Ink for the status bar and the navigation: a dark app screen needs light chrome. */
    tone?: "light" | "dark"
    /** Background for the status bar and navigation rows, when the app tints them. */
    chromeClass?: string
    /** Clock in the status bar. */
    time?: string
    /** Bottom navigation: an iOS home indicator, or Android's three buttons. */
    nav?: "pill" | "android"
    /** Described to screen readers in place of the mock UI. */
    label: string
  }>(),
  { tone: "dark", time: "9:41", nav: "pill" }
)

const onDark = computed(() => props.tone === "dark")
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
        :class="[chromeClass, onDark ? 'text-white' : 'text-[#15151B]']"
      >
        <span class="text-xs font-semibold">{{ time }}</span>
        <span class="flex items-center gap-[5px]">
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

      <!-- Bottom navigation -->
      <div
        v-if="nav === 'android'"
        class="flex items-center justify-around px-10 pb-2.5 pt-3"
        :class="[chromeClass, onDark ? 'text-white/70' : 'text-[#15151B]/60']"
      >
        <span class="flex items-center gap-[3px]">
          <span
            v-for="bar in 3"
            :key="bar"
            class="h-3.5 w-[2px] rounded-full bg-current"
          />
        </span>
        <span
          class="h-[15px] w-[15px] rounded-full border-[1.5px] border-current"
        />
        <CIcon name="chevron-left" class="h-4 w-4" stroke-width="2" />
      </div>

      <div
        v-else
        class="flex justify-center pb-[9px] pt-3"
        :class="chromeClass"
      >
        <span
          class="h-1 w-[110px] rounded-full"
          :class="onDark ? 'bg-white/50' : 'bg-[#15151B]/40'"
        />
      </div>
    </div>
  </div>
</template>
