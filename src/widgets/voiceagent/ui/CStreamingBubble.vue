<script setup lang="ts">
import { ref, toRef, watch, onUnmounted } from "vue"
import { useTypewriter } from "@/shared/lib"

const props = defineProps<{ text: string; role: "agent" | "user" }>()
const emit = defineEmits<{ (e: "done"): void }>()

const active = ref(true)
const { typed, done } = useTypewriter(toRef(props, "text"), {
  active,
  startDelay: 0,
  speed: 24,
})

// Hold the finished bubble for a beat before handing the turn back, so the
// conversation reads at a human pace rather than snapping to the next line.
let handoff = 0
watch(done, (isDone) => {
  window.clearTimeout(handoff)
  if (isDone) handoff = window.setTimeout(() => emit("done"), 650)
})
onUnmounted(() => window.clearTimeout(handoff))
</script>

<template>
  <p
    :class="
      role === 'agent'
        ? 'max-w-[80%] rounded-2xl rounded-tl-sm border border-sand-200 bg-sand-100 px-4 py-2.5 text-sm leading-relaxed text-sand-900'
        : 'ml-auto max-w-[80%] rounded-2xl rounded-tr-sm border border-sand-200 bg-white px-4 py-2.5 text-sm leading-relaxed text-sand-700'
    "
  >
    {{ typed }}
    <span
      class="ml-0.5 inline-block h-3.5 w-px translate-y-0.5 animate-pulse bg-signal align-middle"
      aria-hidden="true"
    />
  </p>
</template>
