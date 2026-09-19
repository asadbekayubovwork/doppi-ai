<script setup lang="ts" generic="T">
import { onMounted, onUnmounted, ref, watch } from "vue"
import { useInView, usePrefersReducedMotion } from "@/shared/lib"

/*
  Endless horizontal strip, adapted from Vue Bits' LogoLoop
  (https://vue-bits.dev/animations/logo-loop).

  Unlike a CSS marquee it eases its velocity, so hovering glides the strip to
  `hoverSpeed` instead of freezing it mid-frame. It renders as many copies of
  the list as the container needs to stay seamless, only animates while on
  screen, and stands still under reduced motion.

  Edge fading is left to the caller (e.g. `mask-fade-x`): a mask works on any
  ground colour, where a painted gradient would clash with the colour picker.
*/

const props = withDefaults(
  defineProps<{
    items: T[]
    /** Cruising speed in px/s. */
    speed?: number
    direction?: "left" | "right"
    /** Speed while a mouse is over the strip; 0 glides it to a stop. */
    hoverSpeed?: number
    /** Space between items, in px. */
    gap?: number
    ariaLabel?: string
  }>(),
  { speed: 40, direction: "left", hoverSpeed: 0, gap: 12, ariaLabel: undefined }
)

defineSlots<{ item(props: { item: T; index: number }): unknown }>()

/** Seconds it takes the velocity to close most of the gap to its target. */
const SMOOTH_TAU = 0.25

const root = ref<HTMLElement | null>(null)
const track = ref<HTMLElement | null>(null)
const copies = ref(2)
const hovered = ref(false)

const inView = useInView(root, { threshold: 0 })
const reduced = usePrefersReducedMotion()

let sequenceWidth = 0
let offset = 0
let velocity = 0
let frame = 0
let last = 0
let observer: ResizeObserver | null = null

const signedSpeed = (speed: number) =>
  props.direction === "left" ? speed : -speed

const measure = () => {
  const sequence = track.value?.firstElementChild as HTMLElement | null
  const width = root.value?.clientWidth ?? 0
  sequenceWidth = sequence?.getBoundingClientRect().width ?? 0
  if (sequenceWidth > 0) {
    copies.value = Math.max(2, Math.ceil(width / sequenceWidth) + 1)
  }
}

const tick = (now: number) => {
  // Clamp the step so a frame after a long pause cannot jump the strip.
  const dt = last ? Math.min((now - last) / 1000, 0.1) : 0
  last = now

  const target = signedSpeed(hovered.value ? props.hoverSpeed : props.speed)
  velocity += (target - velocity) * (1 - Math.exp(-dt / SMOOTH_TAU))

  if (sequenceWidth > 0 && track.value) {
    offset =
      (((offset + velocity * dt) % sequenceWidth) + sequenceWidth) %
      sequenceWidth
    track.value.style.transform = `translate3d(${-offset}px, 0, 0)`
  }

  frame = requestAnimationFrame(tick)
}

const stop = () => {
  if (frame) cancelAnimationFrame(frame)
  frame = 0
  last = 0
}

const sync = () => {
  stop()
  if (inView.value && !reduced.value) frame = requestAnimationFrame(tick)
}

// Touch taps fire pointerenter without a matching leave, which would park the
// strip after the first tap; only a real mouse slows it down.
const onPointerEnter = (event: PointerEvent) => {
  if (event.pointerType === "mouse") hovered.value = true
}
const onPointerLeave = () => {
  hovered.value = false
}

onMounted(() => {
  velocity = signedSpeed(props.speed)
  measure()
  // No ResizeObserver (jsdom) → keep the first measurement.
  if (typeof ResizeObserver !== "undefined") {
    observer = new ResizeObserver(measure)
    if (root.value) observer.observe(root.value)
    const sequence = track.value?.firstElementChild
    if (sequence) observer.observe(sequence)
  }
})

watch([inView, reduced], sync)

onUnmounted(() => {
  stop()
  observer?.disconnect()
})
</script>

<template>
  <div
    ref="root"
    class="relative overflow-hidden"
    :role="ariaLabel ? 'region' : undefined"
    :aria-label="ariaLabel"
  >
    <div
      ref="track"
      class="flex w-max will-change-transform"
      @pointerenter="onPointerEnter"
      @pointerleave="onPointerLeave"
    >
      <!-- Copies after the first only keep the loop seamless: hidden from
           screen readers and out of the tab order. -->
      <ul
        v-for="copy in copies"
        :key="copy"
        class="flex shrink-0 items-center"
        :style="{ gap: `${gap}px`, paddingRight: `${gap}px` }"
        :aria-hidden="copy > 1 ? 'true' : undefined"
        :inert="copy > 1 || undefined"
      >
        <li v-for="(item, index) in items" :key="index" class="shrink-0">
          <slot name="item" :item="item" :index="index" />
        </li>
      </ul>
    </div>
  </div>
</template>
