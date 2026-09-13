<script setup lang="ts">
import { computed, ref } from "vue"
import { useHead } from "@unhead/vue"
import {
  AuthShell,
  CAuthFeatureSoon,
  CAuthVerifyStep,
  authApi,
  messageForProblem,
  retryAfterSeconds,
} from "@/features/auth"
import { usePasswordStrength } from "@/shared/lib"
import { CIcon } from "@/shared/ui"

type Step = "email" | "code" | "password" | "done"
const step = ref<Step>("email")
const email = ref("")
const code = ref("")
const challengeId = ref("")
const resetToken = ref("")
const newPassword = ref("")
const confirmation = ref("")
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref("")
const resendDelay = ref(60)
const emailAuthEnabled = import.meta.env.VITE_EMAIL_AUTH_ENABLED !== "false"
const { requirements, score, level } = usePasswordStrength(newPassword)
const passwordsMatch = computed(
  () =>
    confirmation.value.length > 0 && confirmation.value === newPassword.value
)
useHead({ title: "Parolni tiklash — Do'ppi.ai" })
const showError = (error: unknown, fallback: string) => {
  const retry = retryAfterSeconds(error)
  if (retry > 0) resendDelay.value = retry
  errorMessage.value = messageForProblem(error, fallback, {
    OTP_INVALID: "Kod noto'g'ri yoki muddati tugagan.",
    RESET_TOKEN_INVALID:
      "Tiklash sessiyasi muddati tugagan. Qaytadan boshlang.",
    PASSWORD_POLICY: "Yangi parol backend talablariga mos emas.",
    PASSWORD_REUSED: "Avval ishlatilmagan parol tanlang.",
    RATE_LIMITED: "Server ko'rsatgan vaqt tugagach qayta urinib ko'ring.",
  })
}
const requestCode = async () => {
  errorMessage.value = ""
  loading.value = true
  try {
    const response = await authApi.requestPasswordReset(email.value.trim())
    challengeId.value = response.challenge_id || ""
    step.value = "code"
    resendDelay.value = 60
  } catch (error) {
    showError(error, "Tasdiqlash kodi yuborilmadi.")
  } finally {
    loading.value = false
  }
}
const resendCode = async (channel: "email" | "telegram") => {
  if (channel !== "email") return
  errorMessage.value = ""
  loading.value = true
  try {
    const response = await authApi.requestPasswordReset(email.value.trim())
    if (response.challenge_id) challengeId.value = response.challenge_id
    code.value = ""
    resendDelay.value = 60
  } catch (error) {
    showError(error, "Yangi tasdiqlash kodi yuborilmadi.")
  } finally {
    loading.value = false
  }
}
const verifyCode = async () => {
  errorMessage.value = ""
  loading.value = true
  try {
    const response = await authApi.verifyPasswordReset({
      challenge_id: challengeId.value,
      code: code.value,
    })
    resetToken.value = response.reset_token
    code.value = ""
    step.value = "password"
  } catch (error) {
    showError(error, "Tiklash kodi tasdiqlanmadi.")
  } finally {
    loading.value = false
  }
}

const updatePassword = async () => {
  errorMessage.value = ""
  if (!passwordsMatch.value) {
    errorMessage.value = "Parollar bir xil emas."
    return
  }
  loading.value = true
  try {
    await authApi.confirmPasswordReset({
      reset_token: resetToken.value,
      new_password: newPassword.value,
    })
    resetToken.value = ""
    step.value = "done"
  } catch (error) {
    showError(error, "Parolni yangilab bo'lmadi.")
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthShell
    switch-to="/register"
    switch-label="Ro'yxatdan o'tish"
    switch-text="Hisobingiz yo'qmi?"
    ><CAuthFeatureSoon
      v-if="!emailAuthEnabled"
      title="Parolni tiklash"
      message="Email orqali parolni tiklash tez orada"
    />
    <template v-else-if="step === 'email'"
      ><div class="flex gap-2" aria-label="1-qadam / 3">
        <span class="h-[3px] flex-1 rounded-full bg-[#5B4BE8]" /><span
          class="h-[3px] flex-1 rounded-full bg-[#E5E5E1]"
        /><span class="h-[3px] flex-1 rounded-full bg-[#E5E5E1]" />
      </div>
      <h1 class="mt-6 text-[28px] font-semibold tracking-[-0.8px]">
        Parolni tiklash
      </h1>
      <p class="mt-2 text-[13.5px] leading-6 text-[#6A6A74]">
        Email manzilingizni kiriting — tasdiqlash kodini yuboramiz.
      </p>
      <form class="mt-6 grid gap-4" @submit.prevent="requestCode">
        <div>
          <label for="reset-email" class="mb-1.5 block text-xs font-medium"
            >Email</label
          ><input
            id="reset-email"
            v-model="email"
            type="email"
            required
            autocomplete="email"
            placeholder="siz@kompaniya.uz"
            class="h-11 w-full rounded-[10px] border border-[#D6D6D1] px-3.5 text-base outline-none focus:border-[#5B4BE8]"
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
          class="flex h-11 items-center justify-center gap-2 rounded-[10px] bg-[#5B4BE8] text-[13.5px] font-semibold text-white disabled:opacity-70"
        >
          {{ loading ? "Kutilmoqda..." : "Tasdiqlash kodini yuborish"
          }}<CIcon v-if="!loading" name="arrow-right" class="h-4 w-4" />
        </button>
      </form>
      <p class="mt-4 text-center text-sm text-[#6A6A74]">
        Parolingiz esingizdami?
        <RouterLink to="/login" class="font-semibold text-[#5B4BE8]"
          >Kirish</RouterLink
        >
      </p></template
    ><CAuthVerifyStep
      v-else-if="step === 'code'"
      v-model="code"
      :email="email"
      :step="2"
      :steps="3"
      step-name="Kodni tasdiqlash"
      title="Tiklash kodini kiriting"
      :description="`6 xonali kodni emailingizga yubordik: ${email}.`"
      submit-label="Kodni tasdiqlash"
      :error-message="errorMessage"
      :loading="loading"
      :resend-delay="resendDelay"
      telegram-variant="none"
      @submit="verifyCode"
      @resend="resendCode"
    /><template v-else-if="step === 'password'"
      ><div class="flex gap-2" aria-label="3-qadam / 3">
        <span
          v-for="segment in 3"
          :key="segment"
          class="h-[3px] flex-1 rounded-full bg-[#5B4BE8]"
        />
      </div>
      <h1 class="mt-6 text-[28px] font-semibold tracking-[-0.8px]">
        Yangi parol o'rnating
      </h1>
      <p class="mt-2 text-[13.5px] leading-6 text-[#6A6A74]">
        Avval ishlatmagan parolni tanlang.
      </p>
      <form class="mt-6 grid gap-4" @submit.prevent="updatePassword">
        <div>
          <label for="reset-password" class="mb-1.5 block text-xs font-medium"
            >Yangi parol</label
          >
          <div class="relative">
            <input
              id="reset-password"
              v-model="newPassword"
              :type="showPassword ? 'text' : 'password'"
              required
              minlength="12"
              autocomplete="new-password"
              class="h-11 w-full rounded-[10px] border border-[#D6D6D1] px-3.5 pr-12 text-base outline-none focus:border-[#5B4BE8]"
            /><button
              type="button"
              class="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-[#6A6A74]"
              :aria-label="
                showPassword ? 'Parolni yashirish' : 'Parolni ko\'rsatish'
              "
              @click="showPassword = !showPassword"
            >
              <CIcon :name="showPassword ? 'eye-off' : 'eye'" class="h-5 w-5" />
            </button>
          </div>
          <div v-if="newPassword" class="mt-2 flex items-center gap-3">
            <span class="grid flex-1 grid-cols-4 gap-1.5"
              ><span
                v-for="segment in 4"
                :key="segment"
                class="h-1 rounded-full"
                :class="segment <= score ? level.bar : 'bg-[#E5E5E1]'" /></span
            ><span class="text-xs" :class="level.text">{{ level.label }}</span>
          </div>
          <ul class="mt-2 grid gap-1 sm:grid-cols-2">
            <li
              v-for="item in requirements"
              :key="item.label"
              class="text-xs"
              :class="item.met ? 'text-[#177A46]' : 'text-[#84848E]'"
            >
              {{ item.label }}
            </li>
          </ul>
        </div>
        <div>
          <label
            for="reset-confirmation"
            class="mb-1.5 block text-xs font-medium"
            >Parolni tasdiqlang</label
          ><input
            id="reset-confirmation"
            v-model="confirmation"
            type="password"
            required
            minlength="12"
            autocomplete="new-password"
            class="h-11 w-full rounded-[10px] border border-[#D6D6D1] px-3.5 text-base outline-none focus:border-[#5B4BE8]"
          />
          <p v-if="passwordsMatch" class="mt-1 text-xs text-[#177A46]">
            Parollar mos keladi
          </p>
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
          class="flex h-11 items-center justify-center gap-2 rounded-[10px] bg-[#5B4BE8] text-[13.5px] font-semibold text-white disabled:opacity-70"
        >
          {{ loading ? "Kutilmoqda..." : "Parolni yangilash"
          }}<CIcon v-if="!loading" name="arrow-right" class="h-4 w-4" />
        </button></form></template
    ><template v-else
      ><div class="text-center">
        <span
          class="mx-auto grid h-14 w-14 place-items-center rounded-[18px] bg-[#ECF8F0] text-[#177A46]"
          ><CIcon name="circle-check" class="h-7 w-7"
        /></span>
        <h1 class="mt-6 text-[28px] font-semibold">Parol yangilandi</h1>
        <p class="mt-2 text-[13.5px] leading-6 text-[#6A6A74]">
          Endi yangi parol bilan kirishingiz mumkin.
        </p>
        <RouterLink
          to="/login"
          class="mt-6 flex h-11 items-center justify-center rounded-[10px] bg-[#5B4BE8] text-sm font-semibold text-white"
          >Kirishga o'tish</RouterLink
        >
      </div></template
    ></AuthShell
  >
</template>
