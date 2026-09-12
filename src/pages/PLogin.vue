<script setup lang="ts">
import { ref } from "vue"
import { useHead } from "@vueuse/head"
import { useRoute, useRouter } from "vue-router"
import {
  AuthShell,
  CTelegramLogin,
  CAuthVerifyStep,
  useAuthStore,
  authApi,
  messageForProblem,
  safeLocalPath,
} from "@/features/auth"
import { CIcon } from "@/shared/ui"

type Step = "password" | "mfa"

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const email = ref("")
const password = ref("")
const code = ref("")
const showPassword = ref(false)
const rememberMe = ref(true)
const step = ref<Step>("password")
const loading = ref(false)
const telegramLoading = ref(false)
const errorMessage = ref(
  route.query.logout === "failed"
    ? "Server bilan bog'lanib chiqish amalga oshmadi, ammo bu qurilmadagi sessiya tozalandi."
    : ""
)
const telegramMessage = ref("")

useHead({ title: "Xush kelibsiz — Do'ppi.ai" })

const destination = () => safeLocalPath(route.query.redirect)

const showError = (error: unknown, fallback: string) => {
  errorMessage.value = messageForProblem(error, fallback, {
    AUTHENTICATION_REQUIRED: "Email yoki parol noto'g'ri.",
    EMAIL_NOT_VERIFIED: "Avval email manzilingizni tasdiqlang.",
    MFA_CODE_INVALID: "MFA kodi noto'g'ri yoki muddati tugagan.",
    RATE_LIMITED:
      "Juda ko'p urinish. Server ko'rsatgan vaqtdan so'ng qayta urinib ko'ring.",
  })
}

const signIn = async () => {
  errorMessage.value = ""
  loading.value = true
  try {
    const response = await auth.login({
      email: email.value.trim(),
      password: password.value,
      remember_me: rememberMe.value,
    })
    if (response.status === "mfa_required") {
      step.value = "mfa"
      code.value = ""
      return
    }
    await router.replace(destination())
  } catch (error) {
    showError(
      error,
      "Kirish amalga oshmadi. Ma'lumotlaringizni tekshirib, qayta urinib ko'ring."
    )
  } finally {
    loading.value = false
  }
}

const verifyMfa = async () => {
  errorMessage.value = ""
  loading.value = true
  try {
    await auth.verifyMfa(code.value)
    await router.replace(destination())
  } catch (error) {
    showError(error, "MFA tekshiruvi amalga oshmadi.")
  } finally {
    loading.value = false
  }
}

const backToPassword = () => {
  step.value = "password"
  errorMessage.value = ""
}

const startGoogle = () => {
  sessionStorage.setItem("doppi_auth_return_path", destination())
  window.location.assign(authApi.googleAuthorizeUrl())
}

const handleTelegram = async (data: Record<string, string | number>) => {
  telegramMessage.value = ""
  telegramLoading.value = true
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
    telegramMessage.value = messageForProblem(
      error,
      "Telegram orqali kirish amalga oshmadi.",
      {
        TELEGRAM_NOT_CONFIGURED: "Telegram orqali kirish hozircha mavjud emas.",
        AUTHENTICATION_REQUIRED: "Telegram tasdiqlovi yaroqsiz.",
      }
    )
  } finally {
    telegramLoading.value = false
  }
}
</script>

<template>
  <AuthShell
    switch-to="/register"
    switch-label="Ro'yxatdan o'tish"
    switch-text="Hisobingiz yo'qmi?"
    ><template v-if="step === 'password'"
      ><h1 class="text-[28px] font-semibold tracking-[-0.8px] text-[#15151B]">
        Xush kelibsiz
      </h1>
      <p class="mt-2 text-[13.5px] leading-6 text-[#6A6A74]">
        Agentlar, balans va bizneslarni boshqarish uchun Do'ppi AI ish
        maydoningizga kiring.
      </p>
      <button
        type="button"
        class="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-[10px] border border-[#D6D6D1] bg-white text-[13.5px] font-medium text-[#15151B] hover:bg-[#FAFAF9]"
        @click="startGoogle"
      >
        <span
          class="grid h-5 w-5 place-items-center text-[#5B4BE8]"
          aria-hidden="true"
          >G</span
        >Google orqali kirish
      </button>
      <div class="my-5 flex items-center gap-3" aria-hidden="true">
        <span class="h-px flex-1 bg-[#E5E5E1]" /><span
          class="text-xs text-[#84848E]"
          >yoki email orqali</span
        ><span class="h-px flex-1 bg-[#E5E5E1]" />
      </div>
      <form class="grid gap-4" @submit.prevent="signIn">
        <div>
          <label
            for="login-email"
            class="mb-1.5 block text-xs font-medium text-[#15151B]"
            >Email</label
          ><input
            id="login-email"
            v-model="email"
            type="email"
            required
            autocomplete="email"
            placeholder="siz@kompaniya.uz"
            class="h-11 w-full rounded-[10px] border border-[#D6D6D1] px-3.5 text-base text-[#15151B] outline-none focus:border-[#5B4BE8] focus:ring-4 focus:ring-[#5B4BE8]/10"
          />
        </div>
        <div>
          <div class="mb-1.5 flex items-center justify-between gap-3">
            <label
              for="login-password"
              class="text-xs font-medium text-[#15151B]"
              >Parol</label
            ><RouterLink
              to="/forgot-password"
              class="text-xs font-medium text-[#5B4BE8]"
              >Parolni unutdingizmi?</RouterLink
            >
          </div>
          <div class="relative">
            <input
              id="login-password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              minlength="8"
              autocomplete="current-password"
              placeholder="Parolingizni kiriting"
              class="h-11 w-full rounded-[10px] border border-[#D6D6D1] px-3.5 pr-12 text-base text-[#15151B] outline-none focus:border-[#5B4BE8] focus:ring-4 focus:ring-[#5B4BE8]/10"
            /><button
              type="button"
              class="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 rounded-lg text-[#6A6A74]"
              :aria-label="
                showPassword ? 'Parolni yashirish' : 'Parolni ko\'rsatish'
              "
              @click="showPassword = !showPassword"
            >
              <CIcon :name="showPassword ? 'eye-off' : 'eye'" class="h-5 w-5" />
            </button>
          </div>
        </div>
        <label
          class="flex min-h-11 cursor-pointer items-center gap-3 text-[13.5px] text-[#6A6A74]"
          ><input
            v-model="rememberMe"
            type="checkbox"
            class="h-4 w-4 accent-[#5B4BE8]"
          />Meni 30 kun davomida eslab qol</label
        >
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
          class="flex h-11 items-center justify-center gap-2 rounded-[10px] bg-[#5B4BE8] text-[13.5px] font-semibold text-white hover:bg-[#4F40D4] disabled:cursor-wait disabled:opacity-70"
        >
          {{ loading ? "Kutilmoqda..." : "Kirish"
          }}<CIcon v-if="!loading" name="arrow-right" class="h-4 w-4" />
        </button>
      </form>
      <div class="mt-4"><CTelegramLogin @auth="handleTelegram" /></div>
      <p
        v-if="telegramLoading"
        class="mt-2 text-center text-xs text-[#6A6A74]"
        aria-live="polite"
      >
        Telegram tasdiqlanmoqda...
      </p>
      <p
        v-if="telegramMessage"
        class="mt-2 text-center text-xs text-[#C42B2B]"
        role="alert"
      >
        {{ telegramMessage }}
      </p>
      <p class="mt-4 text-center text-[13.5px] text-[#6A6A74]">
        Do'ppi AI'da yangimisiz?
        <RouterLink to="/register" class="font-semibold text-[#5B4BE8]"
          >Hisob yarating</RouterLink
        >
      </p></template
    ><template v-else
      ><CAuthVerifyStep
        v-model="code"
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
        @submit="verifyMfa"
      /><button
        type="button"
        class="mt-4 w-full text-center text-sm font-medium text-[#5B4BE8]"
        @click="backToPassword"
      >
        Boshqa hisob bilan kirish
      </button></template
    ></AuthShell
  >
</template>
