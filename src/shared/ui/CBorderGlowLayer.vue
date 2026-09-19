<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue"

/*
  Border glow, adapted from Vue Bits' BorderGlow
  (https://vue-bits.dev/components/border-glow).

  Mount it once in a layout: the `.surface-card-lift` card under the pointer
  gets a coloured edge and a halo that face the pointer and brighten as it
  nears the border. Like the click sparks, the glow is drawn in fixed layers
  laid over the hovered card rather than inside it, so no card changes its
  markup or layout, and neither a card's nor its section's `overflow: hidden`
  clips the halo. Two layers let the card being left fade out while the next
  one lights up.

  Put `data-border-glow="off"` on a card, or an ancestor, to leave it plain.
*/

const CARDS = ".surface-card-lift"
const QUIET = "[data-border-glow='off']"
/** How long a left card takes to fade; matches the CSS transition. */
const FADE_MS = 750
/** Share of the way from the centre to the edge where the halo starts, %. */
const HALO_FROM = 30
/** The coloured edge starts a little later than the halo. */
const EDGE_FROM = 50

const props = withDefaults(
  defineProps<{
    /** Three stops of the edge's mesh gradient. */
    colors?: [string, string, string]
    /** Halo colour as an HSL triplet, "258 100 80". */
    glowColor?: string
    /** How far the halo reaches past the card, in px. */
    glowRadius?: number
    /** Strength of the whole effect, 0–1. */
    intensity?: number
  }>(),
  {
    colors: () => ["#B9A2FF", "#6633EE", "#F472B6"],
    glowColor: "258 100 80",
    glowRadius: 28,
    intensity: 0.35,
  }
)

interface Slot {
  el: HTMLElement
  card: HTMLElement | null
  /** When the pointer left the card; null while it is hovered. */
  leftAt: number | null
}

const layers = ref<HTMLElement[]>([])
let slots: Slot[] = []
let pointer: { x: number; y: number } | null = null
let frame = 0

const glowHsl = computed(() => {
  const [h, s, l] = props.glowColor.trim().split(/\s+/)
  return `${h}deg ${s}% ${l}%`
})

const cardFrom = (target: EventTarget | null): HTMLElement | null => {
  const card =
    target instanceof Element ? target.closest<HTMLElement>(CARDS) : null
  return card && !card.closest(QUIET) ? card : null
}

// Scrolling moves cards under a pointer that stays put.
const cardAt = (x: number, y: number) =>
  cardFrom(document.elementFromPoint?.(x, y) ?? null)

const ramp = (edge: number, from: number) =>
  Math.max(0, (edge * 100 - from) / (100 - from)).toFixed(3)

/** Covers `rect`; aims the glow at the pointer while the card is hovered. */
const paint = (slot: Slot, rect: DOMRect) => {
  const { style } = slot.el
  style.transform = `translate(${rect.left}px, ${rect.top}px)`
  style.width = `${rect.width}px`
  style.height = `${rect.height}px`
  if (slot.leftAt !== null || !pointer || !rect.width || !rect.height) return

  const cx = rect.width / 2
  const cy = rect.height / 2
  const dx = pointer.x - rect.left - cx
  const dy = pointer.y - rect.top - cy
  // 0 at the centre, 1 on the border, along the ray through the pointer.
  const edge = Math.min(1, Math.max(Math.abs(dx) / cx, Math.abs(dy) / cy))
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90
  style.setProperty("--glow-angle", `${((angle + 360) % 360).toFixed(2)}deg`)
  style.setProperty("--glow-edge", ramp(edge, EDGE_FROM))
  style.setProperty("--glow-halo", ramp(edge, HALO_FROM))
}

const release = (slot: Slot) => {
  slot.card = null
  slot.leftAt = null
  slot.el.dataset.state = "idle"
}

const tick = (now: number) => {
  for (const slot of slots) {
    if (!slot.card) continue
    const faded = slot.leftAt !== null && now - slot.leftAt > FADE_MS
    if (faded || !slot.card.isConnected) release(slot)
    else paint(slot, slot.card.getBoundingClientRect())
  }
  frame = slots.some((slot) => slot.card) ? requestAnimationFrame(tick) : 0
}

/** Lights `card` up and lets every other lit card fade. */
const track = (card: HTMLElement | null) => {
  for (const slot of slots) {
    if (!slot.card || slot.card === card || slot.leftAt !== null) continue
    slot.leftAt = performance.now()
    slot.el.dataset.state = "leaving"
  }
  if (!card || !slots.length) return

  let slot = slots.find((item) => item.card === card)
  if (!slot) {
    // A free layer, or else the one that has been fading the longest.
    slot =
      slots.find((item) => !item.card) ??
      slots.reduce((oldest, item) =>
        (item.leftAt ?? Infinity) < (oldest.leftAt ?? Infinity) ? item : oldest
      )
    slot.card = card
    slot.el.style.borderRadius = getComputedStyle(card).borderRadius
  }
  slot.leftAt = null
  slot.el.dataset.state = "active"
  paint(slot, card.getBoundingClientRect())
  if (!frame) frame = requestAnimationFrame(tick)
}

const onPointerMove = (event: PointerEvent) => {
  // A touch has no hover to follow.
  if (event.pointerType === "touch") return
  pointer = { x: event.clientX, y: event.clientY }
  track(cardFrom(event.target))
}

const onPointerOut = (event: PointerEvent) => {
  // No related target: the pointer left the window.
  if (event.relatedTarget) return
  pointer = null
  track(null)
}

const onScroll = () => {
  if (pointer) track(cardAt(pointer.x, pointer.y))
}

onMounted(() => {
  slots = layers.value.map((el) => ({ el, card: null, leftAt: null }))
  document.addEventListener("pointermove", onPointerMove, { passive: true })
  document.addEventListener("pointerout", onPointerOut, { passive: true })
  window.addEventListener("scroll", onScroll, { capture: true, passive: true })
})

onUnmounted(() => {
  document.removeEventListener("pointermove", onPointerMove)
  document.removeEventListener("pointerout", onPointerOut)
  window.removeEventListener("scroll", onScroll, { capture: true })
  if (frame) cancelAnimationFrame(frame)
  frame = 0
  slots = []
})
</script>

<template>
  <div
    v-for="n in 2"
    :key="n"
    ref="layers"
    class="border-glow"
    data-state="idle"
    :style="{
      '--glow-c1': colors[0],
      '--glow-c2': colors[1],
      '--glow-c3': colors[2],
      '--glow-hsl': glowHsl,
      '--glow-radius': `${glowRadius}px`,
      '--glow-intensity': intensity,
    }"
    aria-hidden="true"
  >
    <span class="border-glow__edge" />
    <span class="border-glow__wash" />
    <span class="border-glow__halo">
      <span class="border-glow__halo-shape" />
    </span>
  </div>
</template>

<style scoped>
/* One fixed layer per lit card, placed over it by script. Additive blending
   lets the colours light up the dark cards beneath instead of covering them;
   `screen` is the fallback where `plus-lighter` is unsupported. */
.border-glow {
  --glow-angle: 45deg;
  --glow-edge: 0;
  --glow-halo: 0;
  --glow-mesh:
    radial-gradient(at 80% 55%, var(--glow-c1) 0, transparent 50%),
    radial-gradient(at 69% 34%, var(--glow-c2) 0, transparent 50%),
    radial-gradient(at 8% 6%, var(--glow-c3) 0, transparent 50%),
    radial-gradient(at 41% 38%, var(--glow-c1) 0, transparent 50%),
    radial-gradient(at 86% 85%, var(--glow-c2) 0, transparent 50%),
    radial-gradient(at 82% 18%, var(--glow-c3) 0, transparent 50%),
    radial-gradient(at 51% 4%, var(--glow-c2) 0, transparent 50%),
    linear-gradient(var(--glow-c1) 0 100%);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 30;
  width: 0;
  height: 0;
  pointer-events: none;
  mix-blend-mode: screen;
  mix-blend-mode: plus-lighter;
}

.border-glow[data-state="idle"] {
  visibility: hidden;
}

.border-glow__edge,
.border-glow__wash,
.border-glow__halo {
  position: absolute;
  border-radius: inherit;
  transition: opacity 0.25s ease-out;
}

.border-glow[data-state="leaving"] > * {
  opacity: 0 !important;
  transition: opacity 0.75s ease-in-out;
}

/* The mesh gradient, cut to the 1px border and to a cone facing the pointer. */
.border-glow__edge {
  inset: 0;
  padding: 1px;
  background: var(--glow-mesh);
  opacity: calc(var(--glow-edge) * var(--glow-intensity));
  -webkit-mask:
    conic-gradient(
      from var(--glow-angle) at center,
      #000 25%,
      transparent 40%,
      transparent 60%,
      #000 75%
    ),
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite: source-in, xor;
  mask:
    conic-gradient(
      from var(--glow-angle) at center,
      #000 25%,
      transparent 40%,
      transparent 60%,
      #000 75%
    ),
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  mask-composite: intersect, exclude;
}

/* A faint wash of the same colours inside the edge the pointer is near. */
.border-glow__wash {
  inset: 0;
  background: var(--glow-mesh);
  opacity: calc(var(--glow-edge) * var(--glow-intensity) * 0.25);
  -webkit-mask:
    linear-gradient(#000 0 0),
    radial-gradient(ellipse at 50% 50%, #000 40%, transparent 65%),
    conic-gradient(
      from var(--glow-angle) at center,
      transparent 5%,
      #000 15%,
      #000 85%,
      transparent 95%
    );
  -webkit-mask-composite: source-out, source-over;
  mask:
    linear-gradient(#000 0 0),
    radial-gradient(ellipse at 50% 50%, #000 40%, transparent 65%),
    conic-gradient(
      from var(--glow-angle) at center,
      transparent 5%,
      #000 15%,
      #000 85%,
      transparent 95%
    );
  mask-composite: subtract, add;
}

/* The halo: a card-sized shape glowing inwards and outwards, shown only in a
   narrow cone around the pointer's direction. */
.border-glow__halo {
  inset: calc(var(--glow-radius) * -1);
  opacity: calc(var(--glow-halo) * var(--glow-intensity));
  -webkit-mask: conic-gradient(
    from var(--glow-angle) at center,
    #000 2.5%,
    transparent 10%,
    transparent 90%,
    #000 97.5%
  );
  mask: conic-gradient(
    from var(--glow-angle) at center,
    #000 2.5%,
    transparent 10%,
    transparent 90%,
    #000 97.5%
  );
}

.border-glow__halo-shape {
  position: absolute;
  inset: var(--glow-radius);
  border-radius: inherit;
  box-shadow:
    inset 0 0 0 1px hsl(var(--glow-hsl) / 100%),
    inset 0 0 1px 0 hsl(var(--glow-hsl) / 60%),
    inset 0 0 3px 0 hsl(var(--glow-hsl) / 50%),
    inset 0 0 6px 0 hsl(var(--glow-hsl) / 40%),
    inset 0 0 15px 0 hsl(var(--glow-hsl) / 30%),
    inset 0 0 25px 2px hsl(var(--glow-hsl) / 20%),
    inset 0 0 50px 2px hsl(var(--glow-hsl) / 10%),
    0 0 1px 0 hsl(var(--glow-hsl) / 60%),
    0 0 3px 0 hsl(var(--glow-hsl) / 50%),
    0 0 6px 0 hsl(var(--glow-hsl) / 40%),
    0 0 15px 0 hsl(var(--glow-hsl) / 30%),
    0 0 25px 2px hsl(var(--glow-hsl) / 20%),
    0 0 50px 2px hsl(var(--glow-hsl) / 10%);
}

@media (prefers-reduced-motion: reduce) {
  .border-glow > *,
  .border-glow[data-state="leaving"] > * {
    transition: none;
  }
}
</style>
