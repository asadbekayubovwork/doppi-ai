<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue"

const props = withDefaults(
  defineProps<{
    modelValue: string
    length?: number
    disabled?: boolean
    // `light` is used on the split-screen auth pages, whose form column sits
    // on a white panel instead of the dark landing ground.
    tone?: "dark" | "light"
    // Paints the boxes red after a rejected code.
    invalid?: boolean
  }>(),
  { length: 6, disabled: false, tone: "dark", invalid: false }
)

const emit = defineEmits<{
  "update:modelValue": [value: string]
  complete: [value: string]
}>()

// Seeded from the incoming value so a code restored by the parent shows up;
// assigning directly (rather than via `setCode`) keeps mount side-effect free.
const digits = ref<string[]>(
  Array.from(
    { length: props.length },
    (_, index) => props.modelValue.replace(/\D/g, "")[index] || ""
  )
)
const inputs = ref<HTMLInputElement[]>([])

const isLight = computed(() => props.tone === "light")

// The light tone sits in the auth pages' form column, where the boxes are
// square, left-aligned with the rest of the column, and tint once filled.
const groupClass = computed(() =>
  isLight.value ? "justify-start gap-3" : "justify-center gap-2 sm:gap-3"
)

const boxClass = (index: number) => {
  if (!isLight.value) {
    return "h-12 w-10 text-lg border-white/10 bg-black/20 text-white focus:border-[#8F6BFF] sm:h-14 sm:w-12"
  }

  if (props.invalid) {
    return "h-[62px] w-[62px] text-xl border-[#C42B2B] bg-[#FFF0F0] text-[#C42B2B] focus:border-[#C42B2B]"
  }

  return [
    "h-[62px] w-[62px] rounded-[12px] text-xl border-[#D6D6D1] text-[#15151B] focus:border-[#5B4BE8]",
    digits.value[index] ? "bg-[#FAFAF9]" : "bg-white",
  ]
}

const setInput = (element: Element | null, index: number) => {
  if (element instanceof HTMLInputElement) inputs.value[index] = element
}

const setCode = (value: string) => {
  const sanitized = value.replace(/\D/g, "").slice(0, props.length)
  digits.value = Array.from(
    { length: props.length },
    (_, index) => sanitized[index] || ""
  )
  emit("update:modelValue", sanitized)
  if (sanitized.length === props.length) emit("complete", sanitized)
}

const handleInput = (index: number, event: Event) => {
  const value = (event.target as HTMLInputElement).value.replace(/\D/g, "")

  if (value.length > 1) {
    setCode(`${digits.value.slice(0, index).join("")}${value}`)
    const nextIndex = Math.min(index + value.length, props.length - 1)
    nextTick(() => inputs.value[nextIndex]?.focus())
    return
  }

  digits.value[index] = value
  const code = digits.value.join("")
  emit("update:modelValue", code)
  if (value && index < props.length - 1)
    nextTick(() => inputs.value[index + 1]?.focus())
  if (code.length === props.length) emit("complete", code)
}

const handleKeydown = (index: number, event: KeyboardEvent) => {
  if (event.key === "Backspace" && !digits.value[index] && index > 0) {
    digits.value[index - 1] = ""
    emit("update:modelValue", digits.value.join(""))
    nextTick(() => inputs.value[index - 1]?.focus())
  }
  if (event.key === "ArrowLeft" && index > 0) inputs.value[index - 1]?.focus()
  if (event.key === "ArrowRight" && index < props.length - 1)
    inputs.value[index + 1]?.focus()
}

watch(
  () => props.modelValue,
  (value) => {
    if (value !== digits.value.join("")) setCode(value)
  }
)

onMounted(() =>
  nextTick(() => {
    // Land on the first empty box so a partially restored code can be finished.
    const next = digits.value.findIndex((digit) => !digit)
    inputs.value[next === -1 ? props.length - 1 : next]?.focus()
  })
)
</script>

<template>
  <div :class="['flex', groupClass]" role="group" aria-label="Tasdiqlash kodi">
    <input
      v-for="(_, index) in digits"
      :key="index"
      :ref="(element) => setInput(element, index)"
      :value="digits[index]"
      type="text"
      inputmode="numeric"
      autocomplete="one-time-code"
      pattern="[0-9]*"
      maxlength="1"
      :disabled="disabled"
      :aria-label="`${index + 1}-raqam`"
      :class="[
        'rounded-xl border text-center font-semibold outline-none transition disabled:cursor-not-allowed disabled:opacity-60',
        boxClass(index),
      ]"
      @input="handleInput(index, $event)"
      @keydown="handleKeydown(index, $event)"
      @paste.prevent="setCode($event.clipboardData?.getData('text') || '')"
    />
  </div>
</template>
