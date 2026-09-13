<script setup lang="ts">
import { ref } from "vue"
import CAuthVerifyStep from "./CAuthVerifyStep.vue"

defineProps<{
  email: string
  modelValue: string
  loading?: boolean
  errorMessage?: string
}>()

const emit = defineEmits<{
  "update:modelValue": [value: string]
  submit: []
  back: []
}>()

const recoveryMode = ref(false)

const changeMode = (recovery: boolean) => {
  recoveryMode.value = recovery
  emit("update:modelValue", "")
}
</script>

<template>
  <template v-if="!recoveryMode">
    <CAuthVerifyStep
      :model-value="modelValue"
      :email="email"
      :email-chip="false"
      :resend-enabled="false"
      :step="2"
      :steps="2"
      step-name="MFA"
      title="MFA kodini kiriting"
      description="Authenticator ilovangizdagi 6 xonali kodni kiriting."
      submit-label="Tasdiqlash"
      :error-message="errorMessage"
      :loading="loading"
      telegram-variant="none"
      @update:model-value="emit('update:modelValue', $event)"
      @submit="emit('submit')"
    />
    <button
      type="button"
      class="mt-3 min-h-11 w-full rounded-[10px] text-sm font-medium text-[#5B4BE8] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#5B4BE8]/20"
      @click="changeMode(true)"
    >
      Tiklash kodidan foydalanish
    </button>
  </template>
  <template v-else>
    <div class="flex gap-2" aria-label="2-qadam / 2">
      <span class="h-[3px] flex-1 rounded-full bg-[#5B4BE8]" />
      <span class="h-[3px] flex-1 rounded-full bg-[#5B4BE8]" />
    </div>
    <h1 class="mt-6 text-[28px] font-semibold tracking-[-0.8px] text-[#15151B]">
      Tiklash kodini kiriting
    </h1>
    <p class="mt-2 text-[13.5px] leading-6 text-[#6A6A74]">
      MFA yoqilganda saqlagan bir martalik tiklash kodingizni kiriting.
    </p>
    <form class="mt-6 grid gap-4" @submit.prevent="emit('submit')">
      <div>
        <label
          for="mfa-recovery"
          class="mb-1.5 block text-xs font-medium text-[#15151B]"
        >
          Tiklash kodi
        </label>
        <input
          id="mfa-recovery"
          :value="modelValue"
          type="text"
          required
          minlength="16"
          maxlength="32"
          autocomplete="one-time-code"
          spellcheck="false"
          class="h-11 w-full rounded-[10px] border border-[#D6D6D1] px-3.5 font-mono text-base text-[#15151B] outline-none focus:border-[#5B4BE8] focus:ring-4 focus:ring-[#5B4BE8]/10"
          @input="
            emit(
              'update:modelValue',
              ($event.target as HTMLInputElement).value.trim()
            )
          "
        />
      </div>
      <p
        v-if="errorMessage"
        class="rounded-[10px] border border-[#F3C5C5] bg-[#FFF0F0] px-3.5 py-2.5 text-sm text-[#C42B2B]"
        role="alert"
      >
        {{ errorMessage }}
      </p>
      <button
        type="submit"
        :disabled="loading"
        class="h-11 rounded-[10px] bg-[#5B4BE8] text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#5B4BE8]/30 disabled:opacity-70"
      >
        {{ loading ? "Kutilmoqda..." : "Tiklash kodi bilan kirish" }}
      </button>
    </form>
    <button
      type="button"
      class="mt-3 min-h-11 w-full rounded-[10px] text-sm font-medium text-[#5B4BE8] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#5B4BE8]/20"
      @click="changeMode(false)"
    >
      Authenticator kodiga qaytish
    </button>
  </template>
  <button
    type="button"
    class="mt-1 min-h-11 w-full rounded-[10px] text-sm font-medium text-[#5B4BE8] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#5B4BE8]/20"
    @click="emit('back')"
  >
    Boshqa hisob bilan kirish
  </button>
</template>
