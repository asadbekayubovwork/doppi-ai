<script setup lang="ts">
import { computed, onUnmounted, ref, useId, watch } from "vue"
import { useI18nList, useInView, usePrefersReducedMotion } from "@/shared/lib"
import { CIcon, CSectionHeading, CDoppiMark } from "@/shared/ui"

interface Module {
  icon: string
  label: string
}

const modules = useI18nList<Module>("solution.modules")

// Fixed anchor points (percent of the square diagram box); each chip is centred
// on its point. Listed clockwise from the top, which is also the order the
// chips enter in and the order the auto-highlight walks through them.
const ORBIT_POSITIONS = [
  { top: 2, left: 50 },
  { top: 27, left: 93 },
  { top: 73, left: 93 },
  { top: 98, left: 50 },
  { top: 73, left: 7 },
  { top: 27, left: 7 },
]

// How far (px) a chip starts from its anchor, pulled in towards the hub, so the
// entrance reads as the modules bursting out of Do'ppi.
const CHIP_ENTRY_OFFSET = 56

const orbit = ORBIT_POSITIONS.map((pos) => {
  const dx = 50 - pos.left
  const dy = 50 - pos.top
  const len = Math.hypot(dx, dy)
  return {
    ...pos,
    fromX: (dx / len) * CHIP_ENTRY_OFFSET,
    fromY: (dy / len) * CHIP_ENTRY_OFFSET,
  }
})

const orbitAt = (i: number) => orbit[i % orbit.length]

// One lap of the highlight: a light travels from the lit module down its spoke
// and the hub pings when it lands. Must match the 2.4s keyframes below.
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

const onChipEnter = (i: number) => {
  hovered.value = i
  active.value = i
}

const spokeClass = (i: number) => {
  if (current.value === i) return "stroke-[#8F6BFF]"
  return hovered.value === null ? "stroke-[#6633EE]/30" : "stroke-[#6633EE]/10"
}

const uid = useId()
const glowId = `${uid}-glow`
const cometId = `${uid}-comet`

// The comet is a short arc on the orbit (r = 47) starting at 12 o'clock and
// sweeping clockwise; the whole group then spins round the hub.
const COMET_SWEEP = (24 * Math.PI) / 180
const cometHead = {
  x: 50 + 47 * Math.sin(COMET_SWEEP),
  y: 50 - 47 * Math.cos(COMET_SWEEP),
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

      <div
        ref="stage"
        class="solution-stage"
        :class="{ 'is-entered': entered, 'is-paused': !visible }"
      >
        <!-- Desktop: constellation of modules around the Do'ppi hub -->
        <div class="relative mx-auto mt-16 hidden h-[30rem] w-[30rem] lg:block">
          <svg
            class="absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <!-- User-space region: a vertical spoke has a zero-width bbox,
                   which would collapse a bbox-relative filter to nothing. -->
              <filter
                :id="glowId"
                filterUnits="userSpaceOnUse"
                x="-5"
                y="-5"
                width="110"
                height="110"
              >
                <feGaussianBlur stdDeviation="0.9" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient
                :id="cometId"
                gradientUnits="userSpaceOnUse"
                x1="50"
                y1="3"
                :x2="cometHead.x"
                :y2="cometHead.y"
              >
                <stop offset="0" stop-color="#8F6BFF" stop-opacity="0" />
                <stop offset="1" stop-color="#B9A2FF" stop-opacity="0.9" />
              </linearGradient>
            </defs>

            <g class="orbit-in">
              <circle
                cx="50"
                cy="50"
                r="47"
                fill="none"
                stroke-width="0.25"
                stroke-dasharray="0.5 2"
                class="stroke-[#6633EE]/30"
              />
            </g>

            <g class="comet-in">
              <g class="comet">
                <path
                  :d="`M 50 3 A 47 47 0 0 1 ${cometHead.x} ${cometHead.y}`"
                  fill="none"
                  :stroke="`url(#${cometId})`"
                  stroke-width="0.5"
                  stroke-linecap="round"
                />
                <circle
                  :cx="cometHead.x"
                  :cy="cometHead.y"
                  r="0.75"
                  fill="#D9CCFF"
                  :filter="`url(#${glowId})`"
                />
              </g>
            </g>

            <line
              v-for="(pos, i) in orbit"
              :key="i"
              x1="50"
              y1="50"
              :x2="pos.left"
              :y2="pos.top"
              :stroke-width="current === i ? 0.6 : 0.3"
              stroke-dasharray="1 1.5"
              class="spoke transition-[stroke,stroke-width] duration-300"
              :class="spokeClass(i)"
              :style="{ '--delay': `${300 + i * 80}ms` }"
            />

            <!-- A light running from the lit module into the hub. Keyed so it
                 restarts from the chip whenever the highlight moves on. -->
            <line
              v-if="flowIndex !== null"
              :key="`packet-${flowIndex}`"
              :x1="orbitAt(flowIndex).left"
              :y1="orbitAt(flowIndex).top"
              x2="50"
              y2="50"
              pathLength="100"
              stroke="#CDBBFF"
              stroke-width="0.9"
              stroke-linecap="round"
              class="packet"
              :filter="`url(#${glowId})`"
            />
          </svg>

          <ul>
            <li
              v-for="(module, i) in modules"
              :key="i"
              class="absolute -translate-x-1/2 -translate-y-1/2"
              :style="{
                top: `${orbitAt(i).top}%`,
                left: `${orbitAt(i).left}%`,
              }"
              @mouseenter="onChipEnter(i)"
              @mouseleave="hovered = null"
            >
              <div
                class="chip"
                :style="{
                  '--from-x': `${orbitAt(i).fromX}px`,
                  '--from-y': `${orbitAt(i).fromY}px`,
                  '--delay': `${450 + i * 100}ms`,
                  '--float-duration': `${5.5 + (i % 3) * 0.7}s`,
                  '--float-delay': `${-i * 0.9}s`,
                }"
              >
                <div
                  class="flex items-center gap-3 rounded-2xl border px-4 py-3 backdrop-blur-sm transition-[border-color,background-color,box-shadow] duration-300"
                  :class="
                    current === i
                      ? 'border-[#6633EE]/70 bg-[#1C0F38] shadow-[0_16px_40px_-16px_rgba(102,51,238,0.8)]'
                      : 'border-white/10 bg-[#160A2E]/80'
                  "
                >
                  <span
                    class="grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-colors duration-300"
                    :class="
                      current === i ? 'bg-[#6633EE]/35' : 'bg-[#6633EE]/15'
                    "
                  >
                    <CIcon
                      :name="module.icon"
                      class="h-5 w-5 transition-colors duration-300"
                      :class="current === i ? 'text-white' : 'text-[#B9A2FF]'"
                    />
                  </span>
                  <span
                    class="whitespace-nowrap text-sm font-medium text-white"
                    >{{ module.label }}</span
                  >
                </div>
              </div>
            </li>
          </ul>

          <!-- Center hub -->
          <div
            class="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2"
          >
            <div class="hub relative h-full w-full">
              <span
                v-if="flowIndex === null"
                class="absolute inset-0 animate-pulse-ring rounded-full border border-[#6633EE]/50"
                aria-hidden="true"
              />
              <template v-else>
                <!-- Fires as the travelling light lands, in step with it. -->
                <span
                  :key="`flash-${flowIndex}`"
                  class="hub-flash absolute -inset-10 rounded-full"
                  aria-hidden="true"
                />
                <span
                  :key="`ping-${flowIndex}`"
                  class="hub-ping absolute inset-0 rounded-full border-2 border-[#8F6BFF]"
                  aria-hidden="true"
                />
              </template>

              <div
                class="relative grid h-full w-full place-items-center rounded-full border border-[#6633EE]/50 bg-[#160A2E] text-center shadow-[0_0_60px_-10px_rgba(102,51,238,0.8)]"
              >
                <div class="flex flex-col items-center gap-1.5">
                  <CDoppiMark class="h-10 w-10 text-[#8F6BFF]" />
                  <span class="text-sm font-bold tracking-tight text-white">
                    {{ $t("solution.centerLabel") }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile / tablet: hub chip + module grid -->
        <div class="mt-12 lg:hidden">
          <div
            class="mx-auto flex w-fit items-center gap-3 rounded-2xl border border-[#6633EE]/50 bg-[#160A2E] px-5 py-3"
            data-aos="fade-up"
            data-aos-duration="800"
          >
            <CDoppiMark class="h-7 w-7 shrink-0 text-[#8F6BFF]" />
            <span class="text-sm font-bold tracking-tight text-white">
              {{ $t("solution.centerLabel") }}
            </span>
          </div>

          <ul class="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <!-- AOS owns the <li>; the card sits inside so its hover transition survives. -->
            <li
              v-for="(module, i) in modules"
              :key="i"
              data-aos="fade-up"
              data-aos-duration="800"
              :data-aos-delay="100 + i * 60"
            >
              <div
                class="surface-card flex h-full items-center gap-3 rounded-2xl px-4 py-3"
                :class="{ 'is-lit': current === i }"
              >
                <span
                  class="grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-colors duration-300"
                  :class="current === i ? 'bg-[#6633EE]/35' : 'bg-[#6633EE]/15'"
                >
                  <CIcon :name="module.icon" class="h-5 w-5 text-[#B9A2FF]" />
                </span>
                <span class="text-sm font-medium text-white">{{
                  module.label
                }}</span>
              </div>
            </li>
          </ul>
        </div>
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
/* Entrance ------------------------------------------------------------------
   Nothing in the constellation shows until the stage scrolls into view; then
   the hub pops, the orbit swings in, the spokes grow out of the hub and the
   modules burst out along them, clockwise from the top. */

.solution-stage:not(.is-entered) .hub,
.solution-stage:not(.is-entered) .orbit-in,
.solution-stage:not(.is-entered) .comet-in,
.solution-stage:not(.is-entered) .spoke,
.solution-stage:not(.is-entered) .chip {
  opacity: 0;
}

/* SVG parts scale and spin about the hub, the centre of the 100×100 viewBox. */
.orbit-in,
.comet,
.spoke {
  transform-box: view-box;
  transform-origin: 50% 50%;
}

.is-entered .hub {
  animation: hub-in 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

.is-entered .orbit-in {
  animation: orbit-in 1.1s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
}

.is-entered .comet-in {
  animation: fade-in 0.8s ease-out 1.2s both;
}

.spoke {
  animation: spoke-flow 1s linear infinite;
}

.is-entered .spoke {
  animation:
    spoke-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) var(--delay) both,
    spoke-flow 1s linear infinite;
}

/* The chip's `transform` belongs to the entrance and its `translate` to the
   idle float, so the two run side by side without fighting. */
.chip {
  animation: chip-float var(--float-duration) ease-in-out var(--float-delay)
    infinite;
}

.is-entered .chip {
  animation:
    chip-in 0.85s cubic-bezier(0.34, 1.4, 0.64, 1) var(--delay) both,
    chip-float var(--float-duration) ease-in-out var(--float-delay) infinite;
}

@keyframes hub-in {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
}

@keyframes orbit-in {
  from {
    opacity: 0;
    transform: scale(0.7) rotate(-90deg);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
}

@keyframes spoke-in {
  from {
    opacity: 0;
    transform: scale(0);
  }
}

@keyframes chip-in {
  from {
    opacity: 0;
    transform: translate(var(--from-x), var(--from-y)) scale(0.6);
  }
}

/* Idle loop ---------------------------------------------------------------- */

/* Dashes march along every spoke towards the hub: all channels feed one system. */
@keyframes spoke-flow {
  to {
    stroke-dashoffset: 2.5;
  }
}

@keyframes chip-float {
  0%,
  100% {
    translate: 0 0;
  }
  50% {
    translate: 0 -5px;
  }
}

.comet {
  animation: comet-spin 9s linear infinite;
}

@keyframes comet-spin {
  to {
    transform: rotate(360deg);
  }
}

/* The highlight lap (2.4s, see CYCLE_MS): the light leaves the chip, reaches
   the hub edge around 30%, and the hub answers with a flash and a ring. */

.packet {
  stroke-dasharray: 10 200;
  stroke-dashoffset: 16;
  animation:
    packet-travel 2.4s linear infinite,
    packet-fade 2.4s linear infinite;
}

@keyframes packet-travel {
  0% {
    stroke-dashoffset: 16;
    animation-timing-function: cubic-bezier(0.4, 0, 1, 1);
  }
  36%,
  100% {
    stroke-dashoffset: -100;
  }
}

@keyframes packet-fade {
  0% {
    opacity: 0;
  }
  6%,
  32% {
    opacity: 1;
  }
  36%,
  100% {
    opacity: 0;
  }
}

.hub-flash {
  background: radial-gradient(
    closest-side,
    rgba(143, 107, 255, 0.5),
    rgba(102, 51, 238, 0.15) 60%,
    transparent
  );
  animation: hub-flash 2.4s ease-out infinite;
}

@keyframes hub-flash {
  0%,
  28% {
    opacity: 0;
  }
  38% {
    opacity: 1;
  }
  80%,
  100% {
    opacity: 0;
  }
}

.hub-ping {
  animation: hub-ping 2.4s cubic-bezier(0.2, 0.6, 0.4, 1) infinite;
}

@keyframes hub-ping {
  0%,
  30% {
    opacity: 0;
    transform: scale(1);
  }
  34% {
    opacity: 0.9;
  }
  80%,
  100% {
    opacity: 0;
    transform: scale(1.5);
  }
}

/* Off screen, every loop holds still instead of burning frames. */
.is-paused,
.is-paused * {
  animation-play-state: paused !important;
}

/* Mobile list: the highlight walks the cards too. */
.surface-card.is-lit {
  border-color: rgba(102, 51, 238, 0.55);
  background: rgba(102, 51, 238, 0.08);
  box-shadow: 0 18px 40px -18px rgba(102, 51, 238, 0.55);
}

@media (prefers-reduced-motion: reduce) {
  .spoke,
  .chip,
  .comet,
  .is-entered .spoke,
  .is-entered .chip {
    animation: none !important;
  }

  .comet-in {
    display: none;
  }
}
</style>
