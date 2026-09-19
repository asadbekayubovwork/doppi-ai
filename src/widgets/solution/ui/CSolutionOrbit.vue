<script setup lang="ts">
import { useId } from "vue"
import { CIcon } from "@/shared/ui"
import type { SolutionModule } from "../model/types"
import CSolutionHub from "./CSolutionHub.vue"

const props = defineProps<{
  modules: SolutionModule[]
  entered: boolean
  /** Lit module: the hovered one, otherwise the auto-highlight. */
  current: number | null
  hovered: number | null
  /** Module whose light is travelling in; null when motion is off. */
  flowIndex: number | null
}>()

defineEmits<{ hover: [index: number | null] }>()

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

const spokeClass = (i: number) => {
  if (props.current === i) return "stroke-[#8F6BFF]"
  return props.hovered === null ? "stroke-[#6633EE]/30" : "stroke-[#6633EE]/10"
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
  <div
    class="constellation relative mx-auto mt-16 hidden h-[30rem] w-[30rem] lg:block"
    :class="{ 'is-entered': entered }"
  >
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
        @mouseenter="$emit('hover', i)"
        @mouseleave="$emit('hover', null)"
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
              :class="current === i ? 'bg-[#6633EE]/35' : 'bg-[#6633EE]/15'"
            >
              <CIcon
                :name="module.icon"
                class="h-5 w-5 transition-colors duration-300"
                :class="current === i ? 'text-white' : 'text-[#B9A2FF]'"
              />
            </span>
            <span class="whitespace-nowrap text-sm font-medium text-white">{{
              module.label
            }}</span>
          </div>
        </div>
      </li>
    </ul>

    <CSolutionHub :entered="entered" :flow-index="flowIndex" />
  </div>
</template>

<style scoped>
/* Entrance ------------------------------------------------------------------
   Nothing in the constellation shows until it scrolls into view; then the hub
   pops (CSolutionHub), the orbit swings in, the spokes grow out of the hub and
   the modules burst out along them, clockwise from the top. */

.constellation:not(.is-entered) .orbit-in,
.constellation:not(.is-entered) .comet-in,
.constellation:not(.is-entered) .spoke,
.constellation:not(.is-entered) .chip {
  opacity: 0;
}

/* SVG parts scale and spin about the hub, the centre of the 100×100 viewBox. */
.orbit-in,
.comet,
.spoke {
  transform-box: view-box;
  transform-origin: 50% 50%;
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

/* The highlight lap (2.4s, see CYCLE_MS in CSolution): the light leaves the
   chip and reaches the hub edge around 30%, where CSolutionHub answers it. */

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
