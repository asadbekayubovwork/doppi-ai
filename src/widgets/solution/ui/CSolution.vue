<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from "vue"
import { useI18nList, useInView, usePrefersReducedMotion } from "@/shared/lib"
import { CSectionHeading } from "@/shared/ui"
import type { SolutionModule } from "../model/types"
import CSolutionModuleList from "./CSolutionModuleList.vue"
import CSolutionOrbit from "./CSolutionOrbit.vue"

const modules = useI18nList<SolutionModule>("solution.modules")

// One lap of the highlight: a light travels from the lit module down its spoke
// and the hub pings when it lands. Must match the 2.4s keyframes in
// CSolutionOrbit and CSolutionHub.
const CYCLE_MS = 2400
// The auto-highlight holds off until the entrance choreography has settled.
const ENTRANCE_MS = 1800

const stage = ref<HTMLElement | null>(null)
const entered = useInView(stage, { threshold: 0.3, once: true })
const visible = useInView(stage, { threshold: 0 })
const reduced = usePrefersReducedMotion()

const hovered = ref<number | null>(null)
const active = ref<number | null>(null)
const current = computed(() => hovered.value ?? active.value)
// The travelling light and the hub ping are pure decoration.
const flowIndex = computed(() => (reduced.value ? null : current.value))

let timer = 0
const stopCycle = () => window.clearTimeout(timer)

// Walk the highlight round the modules while the section is on screen. A hover
// takes over; leaving picks the walk up from the chip that was hovered.
watch(
  [entered, visible, reduced, hovered],
  () => {
    stopCycle()
    if (!entered.value || !visible.value || reduced.value) return
    if (hovered.value !== null) return

    const step = () => {
      const count = modules.value.length
      if (!count) return
      active.value = active.value === null ? 0 : (active.value + 1) % count
      timer = window.setTimeout(step, CYCLE_MS)
    }
    timer = window.setTimeout(
      step,
      active.value === null ? ENTRANCE_MS : CYCLE_MS
    )
  },
  { immediate: true }
)
onUnmounted(stopCycle)

const onHover = (i: number | null) => {
  hovered.value = i
  if (i !== null) active.value = i
}
</script>

<template>
  <section id="solution" class="section-dark py-[60px] sm:py-[100px]">
    <div
      class="violet-glow left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2"
      aria-hidden="true"
    />

    <div class="container relative z-10">
      <CSectionHeading
        :eyebrow="$t('solution.eyebrow')"
        :title="$t('solution.title')"
        :subtitle="$t('solution.subtitle')"
      />

      <div ref="stage" :class="{ 'is-paused': !visible }">
        <!-- Desktop: constellation of modules around the Do'ppi hub -->
        <CSolutionOrbit
          :modules="modules"
          :entered="entered"
          :current="current"
          :hovered="hovered"
          :flow-index="flowIndex"
          @hover="onHover"
        />

        <!-- Mobile / tablet: hub chip + module grid -->
        <CSolutionModuleList :modules="modules" :current="current" />
      </div>

      <p
        class="mx-auto mt-14 max-w-[560px] text-center text-[#A3A3A3]"
        data-aos="fade-up"
        data-aos-duration="800"
      >
        {{ $t("solution.note") }}
      </p>
    </div>
  </section>
</template>

<style scoped>
/* Off screen, every loop holds still instead of burning frames. */
.is-paused,
.is-paused :deep(*) {
  animation-play-state: paused !important;
}
</style>
