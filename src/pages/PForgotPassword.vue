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
import { usePasswordStrength, useToast } from "@/shared/lib"
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
const resendDelay = ref(60)
const emailAuthEnabled = import.meta.env.VITE_EMAIL_AUTH_ENABLED !== "false"
const toast = useToast()
const { requirements, score, level } = usePasswordStrength(newPassword)
const passwordsMatch = computed(
  () =>
    confirmation.value.length > 0 && confirmation.value === newPassword.value
)
useHead({ title: "Parolni tiklaş — Do'ppi AI" })
const showError = (error: unknown, title: string, fallback: string) => {
  const retry = retryAfterSeconds(error)
  if (retry > 0) resendDelay.value = retry
  toast.error(
    title,
    messageForProblem(error, fallback, {
      OTP_INVALID: "Kod notöğri yoki muddati tugagan.",
      RESET_TOKEN_INVALID:
        "Tiklaş sessiyasi muddati tugagan. Qaytadan boşlang.",
      PASSWORD_POLICY: "Yangi parol backend talablariga mos emas.",
      PASSWORD_REUSED: "Avval işlatilmagan parol tanlang.",
      RATE_LIMITED: "Server körsatgan vaqt tugagaç qayta urinib köring.",
    })
  )
}
const requestCode = async () => {
  loading.value = true
  try {
    const response = await authApi.requestPasswordReset(email.value.trim())
    challengeId.value = response.challenge_id || ""
    step.value = "code"
    resendDelay.value = 60
    toast.success("Tasdiqlaş kodi yuborildi", email.value.trim())
  } catch (error) {
    showError(
      error,
      "Tasdiqlaş kodi yuborilmadi",
      "Email manzilni tekşirib, qayta urinib köring."
    )
  } finally {
    loading.value = false
  }
}
const resendCode = async (channel: "email" | "telegram") => {
  if (channel !== "email") return
  loading.value = true
  try {
    const response = await authApi.requestPasswordReset(email.value.trim())
    if (response.challenge_id) challengeId.value = response.challenge_id
    code.value = ""
    resendDelay.value = 60
    toast.success("Yangi kod yuborildi", email.value.trim())
  } catch (error) {
    showError(
      error,
      "Yangi tasdiqlaş kodi yuborilmadi",
      "Biroz kutib, qayta urinib köring."
    )
  } finally {
    loading.value = false
  }
}
const verifyCode = async () => {
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
    showError(error, "Tiklaş kodi tasdiqlanmadi", "Kodni qayta kiriting.")
  } finally {
    loading.value = false
  }
}

const updatePassword = async () => {
  if (!passwordsMatch.value) {
    toast.warning(
      "Parollar mos emas",
      "Ikkala maydonga bir xil parol kiriting."
    )
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
    toast.success(
      "Parol yangilandi",
      "Endi yangi parol bilan kirişingiz mumkin."
    )
  } catch (error) {
    showError(
      error,
      "Parolni yangilab bölmadi",
      "Yangi parolni tekşirib, qayta urinib köring."
    )
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthShell
    ><CAuthFeatureSoon
      v-if="!emailAuthEnabled"
      title="Parolni tiklaş"
      message="Email orqali parolni tiklaş tez orada"
    />
    <template v-else-if="step === 'email'"
      ><div class="flex gap-2" aria-label="1-qadam / 3">
        <span class="h-[3px] flex-1 rounded-full bg-[#5B4BE8]" /><span
          class="h-[3px] flex-1 rounded-full bg-[#E5E5E1]"
        /><span class="h-[3px] flex-1 rounded-full bg-[#E5E5E1]" />
      </div>
      <h1 class="mt-6 text-[28px] font-semibold tracking-[-0.8px]">
        Parolni tiklaş
      </h1>
      <p class="mt-2 text-[13.5px] leading-6 text-[#6A6A74]">
        Email manzilingizni kiriting — tasdiqlaş kodini yuboramiz.
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
        <button
          type="submit"
          :disabled="loading"
          class="flex h-11 items-center justify-center gap-2 rounded-[10px] bg-[#5B4BE8] text-[13.5px] font-semibold text-white disabled:opacity-70"
        >
          {{ loading ? "Kutilmoqda..." : "Tasdiqlaş kodini yuboriş"
          }}<CIcon v-if="!loading" name="arrow-right" class="h-4 w-4" />
        </button>
      </form>
      <p class="mt-4 text-center text-sm text-[#6A6A74]">
        Parolingiz esingizdami?
        <RouterLink to="/login" class="font-semibold text-[#5B4BE8]"
          >Kiriş</RouterLink
        >
      </p></template
    ><CAuthVerifyStep
      v-else-if="step === 'code'"
      v-model="code"
      :email="email"
      :step="2"
      :steps="3"
      step-name="Kodni tasdiqlaş"
      title="Tiklaş kodini kiriting"
      :description="`6 xonali kodni emailingizga yubordik: ${email}.`"
      submit-label="Kodni tasdiqlaş"
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
        Yangi parol örnating
      </h1>
      <p class="mt-2 text-[13.5px] leading-6 text-[#6A6A74]">
        Avval işlatmagan parolni tanlang.
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
                showPassword ? 'Parolni yaşiriş' : 'Parolni körsatiş'
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
        <button
          type="submit"
          :disabled="loading"
          class="flex h-11 items-center justify-center gap-2 rounded-[10px] bg-[#5B4BE8] text-[13.5px] font-semibold text-white disabled:opacity-70"
        >
          {{ loading ? "Kutilmoqda..." : "Parolni yangilaş"
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
          Endi yangi parol bilan kirişingiz mumkin.
        </p>
        <RouterLink
          to="/login"
          class="mt-6 flex h-11 items-center justify-center rounded-[10px] bg-[#5B4BE8] text-sm font-semibold text-white"
          >Kirişga ötiş</RouterLink
        >
      </div>
    </template>
  </AuthShell>
</template>
