<script setup lang="ts">
import { ref } from "vue"
import { useHead } from "@unhead/vue"
import { useRoute, useRouter } from "vue-router"
import {
  AuthShell,
  CAuthVerifyStep,
  CRegisterForm,
  CTelegramLogin,
  authApi,
  messageForProblem,
  retryAfterSeconds,
  safeLocalPath,
  useAuthStore,
  type SignupPayload,
} from "@/features/auth"
import { useToast } from "@/shared/lib"
import { CGoogleMark } from "@/shared/ui"

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const toast = useToast()
const email = ref("")
const challengeId = ref("")
const code = ref("")
const isVerifyStep = ref(false)
const loading = ref(false)
const resendDelay = ref(60)
const emailAuthEnabled = import.meta.env.VITE_EMAIL_AUTH_ENABLED !== "false"

useHead({ title: "Ro'yxatdan o'tish — Do'ppi.ai" })

const destination = () => safeLocalPath(route.query.redirect)

const showError = (error: unknown, title: string, fallback: string) => {
  const retry = retryAfterSeconds(error)
  if (retry > 0) resendDelay.value = retry
  toast.error(
    title,
    messageForProblem(error, fallback, {
      EMAIL_ALREADY_REGISTERED: "Bu email bilan hisob allaqachon mavjud.",
      PASSWORD_POLICY: "Parol backend talablariga mos emas.",
      OTP_INVALID: "Tasdiqlash kodi noto'g'ri yoki muddati tugagan.",
      RATE_LIMITED: "Yangi kod so'rash uchun server ko'rsatgan vaqtni kuting.",
    })
  )
}

const startGoogle = () => {
  sessionStorage.setItem("doppi_auth_return_path", destination())
  window.location.assign(authApi.googleAuthorizeUrl())
}

const register = async (payload: SignupPayload) => {
  email.value = payload.email
  loading.value = true
  try {
    const response = await auth.signup(payload)
    challengeId.value = response.challenge_id
    isVerifyStep.value = true
    resendDelay.value = 60
  } catch (error) {
    showError(
      error,
      "Ro'yxatdan o'tish amalga oshmadi",
      "Ma'lumotlarni tekshirib, qayta urinib ko'ring."
    )
  } finally {
    loading.value = false
  }
}

const verifyEmail = async () => {
  loading.value = true
  try {
    await authApi.verifyEmail({
      challenge_id: challengeId.value,
      code: code.value,
    })
    await router.replace({ path: "/login", query: { redirect: destination() } })
  } catch (error) {
    showError(error, "Email tasdiqlanmadi", "Kodni qayta kiritib ko'ring.")
  } finally {
    loading.value = false
  }
}

const resendCode = async (channel: "email" | "telegram") => {
  if (channel !== "email") return
  loading.value = true
  try {
    const response = await authApi.requestEmailVerification({
      email: email.value,
    })
    if (response.challenge_id) challengeId.value = response.challenge_id
    resendDelay.value = 60
    code.value = ""
    toast.success("Yangi kod yuborildi", email.value)
  } catch (error) {
    showError(
      error,
      "Yangi tasdiqlash kodi yuborilmadi",
      "Biroz kutib, qayta urinib ko'ring."
    )
  } finally {
    loading.value = false
  }
}

const handleTelegram = async (data: Record<string, string | number>) => {
  const pending = toast.loading("Telegram tasdiqlanmoqda...")
  try {
    const response = await authApi.telegramLogin(data)
    if (response.status === "challenge_required") {
      await router.replace({
        name: "TelegramAuth",
        query: { challenge_id: response.challenge_id },
      })
      return
    }
    auth.setSession(response)
    await auth.loadBusinesses()
    await router.replace(destination())
  } catch (error) {
    toast.error(
      "Telegram orqali ro'yxatdan o'tish amalga oshmadi",
      messageForProblem(error, "Qayta urinib ko'ring.", {
        TELEGRAM_NOT_CONFIGURED: "Telegram orqali kirish hozircha mavjud emas.",
      })
    )
  } finally {
    toast.dismiss(pending)
  }
}
</script>

<template>
  <AuthShell>
    <template v-if="!isVerifyStep">
      <h1 class="text-[28px] font-semibold tracking-[-0.8px] text-[#15151B]">
        Hisob yarating
      </h1>
      <button
        type="button"
        class="mt-6 flex h-11 w-full items-center justify-center gap-2.5 rounded-[10px] border border-[#D6D6D1] bg-white text-[13.5px] font-medium text-[#15151B] hover:bg-[#FAFAF9]"
        @click="startGoogle"
      >
        <CGoogleMark class="h-[18px] w-[18px]" />Google orqali ro'yxatdan o'tish
      </button>
      <div
        v-if="emailAuthEnabled"
        class="my-5 flex items-center gap-3"
        aria-hidden="true"
      >
        <span class="h-px flex-1 bg-[#E5E5E1]" />
        <span class="text-xs text-[#84848E]">yoki email orqali</span>
        <span class="h-px flex-1 bg-[#E5E5E1]" />
      </div>
      <CRegisterForm
        v-if="emailAuthEnabled"
        :loading="loading"
        @submit="register"
      />
      <p
        v-else
        class="mt-5 rounded-[10px] border border-[#E5E5E1] bg-[#FAFAF9] px-4 py-3 text-center text-sm text-[#6A6A74]"
        role="status"
      >
        Email orqali ro'yxatdan o'tish tez orada
      </p>
      <div class="mt-4">
        <CTelegramLogin
          label="Telegram orqali ro'yxatdan o'tish"
          @auth="handleTelegram"
        />
      </div>
    </template>
    <template v-else>
      <CAuthVerifyStep
        v-model="code"
        :email="email"
        title="Emailni tasdiqlang"
        :description="`6 xonali tasdiqlash kodini emailingizga yubordik: ${email}. Kod 10 daqiqa amal qiladi.`"
        submit-label="Emailni tasdiqlash"
        step-name="Email"
        :loading="loading"
        :resend-delay="resendDelay"
        telegram-variant="none"
        @submit="verifyEmail"
        @resend="resendCode"
        @change-email="isVerifyStep = false"
      />
      <p class="mt-4 text-center text-sm text-[#6A6A74]">
        Kod kelmadimi? Server cooldown tugagach qayta yuboring.
      </p>
    </template>
  </AuthShell>
</template>
