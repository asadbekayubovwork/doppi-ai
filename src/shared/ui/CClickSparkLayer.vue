<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue"
import { usePrefersReducedMotion } from "@/shared/lib"

/*
  Click sparks, adapted from Vue Bits' ClickSpark
  (https://vue-bits.dev/animations/click-spark).

  Mount it once at the app root: a delegated listener bursts on every click
  anywhere on the page. One fixed, viewport-sized canvas serves the whole app
  instead of a canvas wrapped around each element, so nothing has to change its
  layout, sparks are never clipped by the element under the cursor, and a burst
  outlives the route change a link triggers. The canvas only holds a backing
  store and runs a frame loop while sparks are alive.

  Put `data-click-spark="off"` on an element to keep its subtree quiet.
*/

// Typing and picking a value need the caret and the option under the cursor,
// which a burst covers; text selection ends in a click that is a drag, not a tap.
const QUIET =
  "input, textarea, select, [contenteditable], [data-click-spark='off']"

const props = withDefaults(
  defineProps<{
    color?: string
    /** Sparks per click. */
    count?: number
    /** How far a spark travels, in px. */
    radius?: number
    /** Starting length of a spark, in px. */
    size?: number
    /** Burst length, in ms. */
    duration?: number
  }>(),
  { color: "#8F6BFF", count: 8, radius: 22, size: 12, duration: 450 }
)

interface Spark {
  x: number
  y: number
  angle: number
  born: number
}

const canvas = ref<HTMLCanvasElement | null>(null)
const reduced = usePrefersReducedMotion()

const sparks: Spark[] = []
let frame = 0

const easeOut = (t: number) => t * (2 - t)

/** Sizes the canvas to the viewport; false when drawing is unavailable. */
const prepare = (): CanvasRenderingContext2D | null => {
  const el = canvas.value
  const ctx = el?.getContext("2d")
  if (!el || !ctx) return null
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const width = Math.round(window.innerWidth * dpr)
  const height = Math.round(window.innerHeight * dpr)
  if (el.width !== width || el.height !== height) {
    el.width = width
    el.height = height
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  return ctx
}

const release = () => {
  // A zero-sized canvas drops its backing store until the next burst.
  if (canvas.value) canvas.value.width = canvas.value.height = 0
}

const draw = (now: number) => {
  const ctx = canvas.value?.getContext("2d")
  if (!ctx) return

  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
  ctx.strokeStyle = props.color
  ctx.lineWidth = 2
  ctx.lineCap = "round"
  ctx.beginPath()

  for (let i = sparks.length - 1; i >= 0; i--) {
    const spark = sparks[i]
    // The frame timestamp can predate the click that spawned the spark.
    const t = Math.max(0, (now - spark.born) / props.duration)
    if (t >= 1) {
      sparks.splice(i, 1)
      continue
    }
    const eased = easeOut(t)
    const distance = eased * props.radius
    const length = props.size * (1 - eased)
    const cos = Math.cos(spark.angle)
    const sin = Math.sin(spark.angle)
    ctx.moveTo(spark.x + distance * cos, spark.y + distance * sin)
    ctx.lineTo(
      spark.x + (distance + length) * cos,
      spark.y + (distance + length) * sin
    )
  }

  ctx.stroke()

  if (sparks.length) {
    frame = requestAnimationFrame(draw)
  } else {
    frame = 0
    release()
  }
}

const onClick = (event: MouseEvent) => {
  if (reduced.value) return
  const target = event.target instanceof Element ? event.target : null
  if (!target || target.closest(QUIET)) return
  const selection = window.getSelection()
  if (selection && !selection.isCollapsed) return
  if (!prepare()) return

  let x = event.clientX
  let y = event.clientY
  // Keyboard activation reports a click at 0,0 — burst from the centre.
  if (event.detail === 0) {
    const rect = target.getBoundingClientRect()
    x = rect.left + rect.width / 2
    y = rect.top + rect.height / 2
  }

  const born = performance.now()
  for (let i = 0; i < props.count; i++) {
    sparks.push({ x, y, angle: (2 * Math.PI * i) / props.count, born })
  }
  if (!frame) frame = requestAnimationFrame(draw)
}

// Capture phase: a handler that stops propagation cannot swallow the burst.
onMounted(() => document.addEventListener("click", onClick, true))

onUnmounted(() => {
  document.removeEventListener("click", onClick, true)
  if (frame) cancelAnimationFrame(frame)
  frame = 0
  sparks.length = 0
})
</script>

<template>
  <canvas
    ref="canvas"
    width="0"
    height="0"
    class="pointer-events-none fixed inset-0 z-[9999] h-full w-full"
    aria-hidden="true"
  />
</template>
