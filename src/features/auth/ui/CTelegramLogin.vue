<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue"

export type TelegramLoginData = Record<string, string | number>

const props = withDefaults(
  defineProps<{ botUsername?: string; label?: string }>(),
  { label: "Telegram orqali kirish" }
)

const emit = defineEmits<{
  auth: [data: TelegramLoginData]
}>()

const container = ref<HTMLElement | null>(null)
const callbackName = `doppiTelegramAuth${Math.random().toString(36).slice(2)}`
const telegramEnabled = import.meta.env.VITE_TELEGRAM_AUTH_ENABLED === "true"
const configuredUsername = telegramEnabled
  ? props.botUsername || import.meta.env.VITE_TELEGRAM_BOT_USERNAME
  : ""

const callback = (data: TelegramLoginData) => emit("auth", data)

onMounted(() => {
  if (!configuredUsername || !container.value) return
  const globalWindow = window as Window & Record<string, unknown>
  globalWindow[callbackName] = callback
  const script = document.createElement("script")
  script.async = true
  script.src = "https://telegram.org/js/telegram-widget.js?22"
  script.dataset.telegramLogin = configuredUsername
  script.dataset.size = "large"
  script.dataset.onauth = `${callbackName}(user)`
  script.dataset.requestAccess = "write"
  container.value.appendChild(script)
})

onBeforeUnmount(() => {
  const globalWindow = window as Window & Record<string, unknown>
  delete globalWindow[callbackName]
})
</script>

<template>
  <div
    v-if="configuredUsername"
    ref="container"
    class="flex min-h-11 items-center justify-center"
    :aria-label="label"
  />
  <p
    v-else
    class="rounded-[10px] border border-[#E5E5E1] bg-[#FAFAF9] px-3 py-2.5 text-center text-xs text-[#6A6A74]"
    role="status"
  >
    Telegram orqali kirish tez orada
  </p>
</template>
