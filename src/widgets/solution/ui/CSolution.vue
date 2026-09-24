<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue"
import { useI18nList, useInView, usePrefersReducedMotion } from "@/shared/lib"
import { CSectionHeading } from "@/shared/ui"
import {
  COMET_SWEEP_DEG,
  ORBIT_RADIUS,
  orbitAngleAt,
  orbitEntryAngle,
  type OrbitFlow,
} from "../model/orbit"
import type { SolutionModule } from "../model/types"
import CSolutionModuleList from "./CSolutionModuleList.vue"
import CSolutionOrbit from "./CSolutionOrbit.vue"

const modules = useI18nList<SolutionModule>("solution.modules")

// One send: a light travels from the lit module down its spoke and the hub
// pings when it lands. Must match the 2.4s keyframes in CSolutionOrbit and
// CSolutionHub.
const SEND_MS = 2400
// One comet lap, paced so each light has landed in the hub before the comet
// reaches the next chip.
const LAP_MS = SEND_MS * 6
// The first chip lights up once the entrance choreography has settled.
const ENTRANCE_MS = 1800
// After a stalled frame (tab switch, jank) the comet moves this much at most,
// so it never skips a chip.
const MAX_STEP_MS = 50

const stage = ref<HTMLElement | null>(null)
const entered = useInView(stage, { threshold: 0.3, once: true })
const visible = useInView(stage, { threshold: 0 })
const reduced = usePrefersReducedMotion()

const hovered = ref<number | null>(null)
const active = ref<number | null>(null)
const current = computed(() => hovered.value ?? active.value)

// The travelling light and the hub ping are pure decoration.
const flow = ref<OrbitFlow | null>(null)
let flowId = 0
const send = (index: number) => {
  if (!reduced.value) flow.value = { index, id: ++flowId }
}

/* The comet ---------------------------------------------------------------
   Its head, in degrees clockwise from 12 o'clock, goes straight into a CSS
   variable rather than through Vue, so a frame costs no re-render. A chip
   lights up and sends its light in when the head reaches it. */

let head = 0
let started = false
/** Per chip, where the comet reaches it. */
let entries: number[] = []

const paintComet = () =>
  stage.value?.style.setProperty(
    "--comet-angle",
    `${head - COMET_SWEEP_DEG}deg`
  )

// The comet reaches a chip at its edge, where it slips beneath it — so the
// chips are measured. Hidden (below lg) they fall back to their anchors.
const measure = () => {
  const box = stage.value?.querySelector("[data-orbit]")?.getBoundingClientRect()
  const chips = stage.value?.querySelectorAll("[data-orbit-chip]") ?? []
  entries = modules.value.map((_, i) => {
    const chip = chips[i]?.getBoundingClientRect()
    if (!box?.width || !chip?.width) return orbitAngleAt(i)
    const cx = box.left + box.width / 2
    const cy = box.top + box.height / 2
    return orbitEntryAngle(
      orbitAngleAt(i),
      {
        left: chip.left - cx,
        top: chip.top - cy,
        right: chip.right - cx,
        bottom: chip.bottom - cy,
      },
      (box.width * ORBIT_RADIUS) / 100
    )
  })
}

/** Did a clockwise move from `from` to `to` pass `angle`? */
const passes = (from: number, to: number, angle: number) =>
  from <= to ? from < angle && angle <= to : angle > from || angle <= to

let frame = 0
let last = 0
let hoverTimer = 0

const tick = (now: number) => {
  const step = Math.max(0, Math.min(now - last, MAX_STEP_MS))
  const from = head
  head = (head + (step / LAP_MS) * 360) % 360
  last = now
  paintComet()

  entries.forEach((angle, i) => {
    if (!passes(from, head, angle)) return
    active.value = i
    send(i)
  })
  frame = requestAnimationFrame(tick)
}

const stop = () => {
  cancelAnimationFrame(frame)
  window.clearInterval(hoverTimer)
}

// The comet circles while the section is on screen. A hover holds it and keeps
// sending from the hovered chip; leaving lets it carry on from where it was.
watch(
  [entered, visible, reduced, hovered],
  () => {
    stop()
    if (!entered.value || !visible.value || reduced.value) return

    const i = hovered.value
    if (i !== null) {
      send(i)
      hoverTimer = window.setInterval(() => send(i), SEND_MS)
      return
    }

    measure()
    if (!started) {
      started = true
      // Set off just far enough back to reach the first chip on cue.
      head = ((entries[0] ?? 0) - (ENTRANCE_MS / LAP_MS) * 360 + 360) % 360
    }
    last = performance.now()
    frame = requestAnimationFrame(tick)
  },
  { immediate: true }
)

// Chip widths follow the labels, so a language switch moves the entry points.
watch(modules, () => nextTick(measure))

onMounted(() => {
  paintComet()
  window.addEventListener("resize", measure, { passive: true })
})

onUnmounted(() => {
  stop()
  window.removeEventListener("resize", measure)
})

const onHover = (i: number | null) => {
  hovered.value = i
}
</script>

<template>
  <section id="solution" class="section-ground py-[60px] sm:py-[100px]">
    <div class="doppi-veil pointer-events-none absolute inset-0 bg-doppi opacity-[0.07]" aria-hidden="true" />
    <div
      class="ambient-glow-cool left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2"
      aria-hidden="true"
    />

    <div class="container relative z-10">
      <CSectionHeading :title="$t('solution.title')" />

      <div ref="stage" :class="{ 'is-paused': !visible }">
        <!-- Desktop: constellation of modules around the Do'ppi hub -->
        <CSolutionOrbit
          :modules="modules"
          :entered="entered"
          :current="current"
          :hovered="hovered"
          :flow="flow"
          @hover="onHover"
        />

        <!-- Mobile / tablet: hub chip + module grid -->
        <CSolutionModuleList :modules="modules" :current="current" />
      </div>
    </div>
  </section>
</template>

<style scoped>
/* The ornament clears out behind the hub and orbit and fades into the
   neighbouring sections, so it frames the diagram instead of crossing it. */
.doppi-veil {
  -webkit-mask-image: radial-gradient(
    ellipse 70% 60% at 50% 55%,
    transparent 30%,
    black 75%
  ),
  linear-gradient(to bottom, transparent, black 20%, black 80%, transparent);
  -webkit-mask-composite: source-in;
  mask-image: radial-gradient(
    ellipse 70% 60% at 50% 55%,
    transparent 30%,
    black 75%
  ),
  linear-gradient(to bottom, transparent, black 20%, black 80%, transparent);
  mask-composite: intersect;
}

/* Off screen, every loop holds still instead of burning frames. */
.is-paused,
.is-paused :deep(*) {
  animation-play-state: paused !important;
}
</style>
