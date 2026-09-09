<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue"
import { CIcon, COtpInput } from "@/shared/ui"

const props = withDefaults(
  defineProps<{
    modelValue: string
    email: string
    title: string
    description: string
    submitLabel: string
    errorMessage?: string
    loading?: boolean
    step?: number
    steps?: number
    stepName?: string
    // Seconds before the code can be requested again.
    resendDelay?: number
  }>(),
  {
    errorMessage: "",
    loading: false,
    step: 2,
    steps: 2,
    stepName: "Tasdiqlash",
    resendDelay: 60,
  }
)

const emit = defineEmits<{
  "update:modelValue": [value: string]
  submit: []
  resend: [channel: "email" | "telegram"]
  changeEmail: []
}>()

const secondsLeft = ref(props.resendDelay)
let timerId: ReturnType<typeof setInterval> | undefined

const stopCountdown = () => {
  if (timerId) clearInterval(timerId)
  timerId = undefined
}

const startCountdown = () => {
  stopCountdown()
  secondsLeft.value = props.resendDelay
  timerId = setInterval(() => {
    secondsLeft.value -= 1
    if (secondsLeft.value <= 0) stopCountdown()
  }, 1000)
}

onMounted(startCountdown)
onBeforeUnmount(stopCountdown)

const canResend = computed(() => secondsLeft.value <= 0)
const countdown = computed(() => {
  const minutes = Math.floor(secondsLeft.value / 60)
  const seconds = secondsLeft.value % 60
  return `${minutes}:${String(seconds).padStart(2, "0")}`
})

// Telegram is an alternative channel, so it stays available while the email
// countdown is still running.
const requestCode = (channel: "email" | "telegram") => {
  if (channel === "email" && !canResend.value) return
  emit("resend", channel)
  startCountdown()
}
</script>

<template>
  <div>
    <div class="flex gap-2" aria-hidden="true">
      <span
        v-for="segment in props.steps"
        :key="segment"
        class="h-1 flex-1 rounded-full"
        :class="segment <= props.step ? 'bg-[#6633EE]' : 'bg-[#E9E9EF]'"
      />
    </div>
    <p
      class="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8E8E9C]"
    >
      {{ props.step }}-qadam / {{ props.steps }} · {{ props.stepName }}
    </p>

    <span
      class="mt-6 flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#EFEAFE] text-[#6633EE]"
    >
      <CIcon name="mail-check" class="h-6 w-6" />
    </span>

    <h1
      class="mt-6 text-[28px] font-bold tracking-[-0.02em] text-[#0F0F17] sm:text-[32px]"
    >
      {{ props.title }}
    </h1>
    <p class="mt-2 text-[15px] leading-[1.6] text-[#6B6B78]">
      {{ props.description }}
    </p>

    <div class="mt-6 flex flex-wrap items-center justify-between gap-3">
      <span
        class="inline-flex min-w-0 items-center gap-2 rounded-lg border border-[#E4E4EB] bg-white px-3 py-2 text-sm text-[#12121C]"
      >
        <CIcon name="mail" class="h-4 w-4 shrink-0 text-[#8E8E9C]" />
        <span class="truncate">{{ props.email }}</span>
      </span>
      <button
        type="button"
        class="text-sm font-semibold text-[#6633EE] transition-colors hover:text-[#4B21C4]"
        @click="emit('changeEmail')"
      >
        O'zgartirish
      </button>
    </div>

    <form class="mt-4" @submit.prevent="emit('submit')">
      <COtpInput
        :model-value="props.modelValue"
        tone="light"
        @update:model-value="emit('update:modelValue', $event)"
        @complete="emit('submit')"
      />

      <div class="mt-4 flex flex-wrap items-center justify-between gap-2">
        <span class="text-sm text-[#6B6B78]">Kod kelmadimi?</span>
        <button
          v-if="canResend"
          type="button"
          class="text-sm font-semibold text-[#6633EE] transition-colors hover:text-[#4B21C4]"
          @click="requestCode('email')"
        >
          Qayta yuborish
        </button>
        <span
          v-else
          class="inline-flex items-center gap-1.5 text-sm text-[#8E8E9C]"
        >
          <CIcon name="timer" class="h-4 w-4" />
          Qayta yuborish: {{ countdown }}
        </span>
      </div>

      <p
        v-if="props.errorMessage"
        class="mt-4 rounded-xl border border-[#FFD5D5] bg-[#FFF3F3] px-3.5 py-2.5 text-sm text-[#C42121]"
        role="alert"
      >
        {{ props.errorMessage }}
      </p>

      <button
        type="submit"
        :disabled="props.loading"
        class="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#6633EE] text-[15px] font-semibold text-white transition-colors hover:bg-[#5A2CE0] disabled:cursor-wait disabled:opacity-70"
      >
        <span
          v-if="props.loading"
          class="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white"
          aria-hidden="true"
        />
        {{ props.loading ? "Kutilmoqda..." : props.submitLabel }}
        <CIcon v-if="!props.loading" name="arrow-right" class="h-4 w-4" />
      </button>
    </form>

    <button
      type="button"
      class="mt-3 flex h-12 w-full items-center justify-center gap-2.5 rounded-xl border border-[#E4E4EB] bg-white text-[14.5px] font-medium text-[#1A1A24] shadow-[0_1px_2px_rgba(16,17,26,0.05)] transition hover:border-[#C9C9D6] hover:bg-[#FAFAFC]"
      @click="requestCode('telegram')"
    >
      <CIcon name="telegram" class="h-5 w-5 text-[#29A9EA]" />
      Kodni Telegram orqali yuborish
    </button>

    <p class="mt-4 text-center text-sm text-[#6B6B78]">
      Manzil noto'g'rimi?
      <button
        type="button"
        class="ml-1 font-semibold text-[#6633EE] transition-colors hover:text-[#4B21C4]"
        @click="emit('changeEmail')"
      >
        Boshqa email kiriting
      </button>
    </p>
  </div>
</template>
