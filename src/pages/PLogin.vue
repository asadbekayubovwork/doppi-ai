<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue"
import { useHead } from "@unhead/vue"
import { useRoute, useRouter } from "vue-router"
import {
  AuthShell,
  CTelegramLogin,
  CMfaChallenge,
  useAuthStore,
  authApi,
  messageForProblem,
  retryAfterSeconds,
  safeLocalPath,
} from "@/features/auth"
import { useToast } from "@/shared/lib"
import { CGoogleMark, CIcon } from "@/shared/ui"

type Step = "password" | "mfa"
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const toast = useToast()
const email = ref("")
const password = ref("")
const code = ref("")
const showPassword = ref(false)
const step = ref<Step>("password")
const loading = ref(false)
const cooldown = ref(0)
let cooldownTimer: ReturnType<typeof setInterval> | undefined

useHead({ title: "Xush kelibsiz — Do'ppi AI" })

onMounted(() => {
  if (route.query.logout === "failed") {
    toast.warning(
      "Chiqish to'liq yakunlanmadi",
      "Server bilan bog'lanib chiqish amalga oshmadi, ammo bu qurilmadagi sessiya tozalandi."
    )
  }
})

const destination = () => safeLocalPath(route.query.redirect)
const startCooldown = (seconds: number) => {
  if (cooldownTimer) clearInterval(cooldownTimer)
  cooldown.value = Math.max(0, seconds)
  if (!cooldown.value) return
  cooldownTimer = setInterval(() => {
    cooldown.value = Math.max(0, cooldown.value - 1)
    if (!cooldown.value && cooldownTimer) clearInterval(cooldownTimer)
  }, 1000)
}
onBeforeUnmount(() => {
  if (cooldownTimer) clearInterval(cooldownTimer)
})
const showLoginError = (error: unknown, fallback: string) => {
  startCooldown(retryAfterSeconds(error))
  toast.error(
    "Kirish amalga oshmadi",
    messageForProblem(error, fallback, {
      AUTHENTICATION_REQUIRED: "Email yoki parol noto'g'ri.",
      EMAIL_NOT_VERIFIED: "Avval email manzilingizni tasdiqlang.",
      RATE_LIMITED:
        "Juda ko'p urinish. Server ko'rsatgan vaqtdan so'ng qayta urinib ko'ring.",
    })
  )
}

const showMfaError = (error: unknown) => {
  toast.error(
    "MFA tekshiruvi amalga oshmadi",
    messageForProblem(error, "Kodni qayta kiritib ko'ring.", {
      AUTHENTICATION_REQUIRED:
        "MFA yoki tiklash kodi noto'g'ri yoxud muddati tugagan.",
      RATE_LIMITED:
        "MFA urinishlari vaqtincha cheklangan. Keyinroq urinib ko'ring.",
    })
  )
}

const signIn = async () => {
  loading.value = true
  try {
    const response = await auth.login({
      email: email.value.trim(),
      password: password.value,
      // The 30-day checkbox is gone from the form; a long-lived session stays
      // the default the backend is asked for.
      remember_me: true,
    })
    if (response.status === "mfa_required") {
      step.value = "mfa"
      code.value = ""
      return
    }
    await router.replace(destination())
  } catch (error) {
    showLoginError(error, "Ma'lumotlaringizni tekshirib, qayta urinib ko'ring.")
  } finally {
    loading.value = false
  }
}

const verifyMfa = async () => {
  loading.value = true
  try {
    await auth.verifyMfa(code.value)
    await router.replace(destination())
  } catch (error) {
    showMfaError(error)
  } finally {
    loading.value = false
  }
}

const backToPassword = () => {
  step.value = "password"
  code.value = ""
}

const startGoogle = () => {
  sessionStorage.setItem("doppi_auth_return_path", destination())
  window.location.assign(authApi.googleAuthorizeUrl())
}

const handleTelegram = async (data: Record<string, string | number>) => {
  const pending = toast.loading("Telegram tasdiqlanmoqda...")
  try {
    const response = await auth.telegramLogin(data)
    if (response.status === "challenge_required") {
      await router.replace({
        name: "TelegramAuth",
        query: { challenge_id: response.challenge_id },
      })
      return
    }
    await router.replace(destination())
  } catch (error) {
    toast.error(
      "Telegram orqali kirish amalga oshmadi",
      messageForProblem(error, "Qayta urinib ko'ring.", {
        TELEGRAM_NOT_CONFIGURED: "Telegram orqali kirish hozircha mavjud emas.",
        AUTHENTICATION_REQUIRED: "Telegram tasdiqlovi yaroqsiz.",
      })
    )
  } finally {
    toast.dismiss(pending)
  }
}
</script>

<template>
  <AuthShell>
    <template v-if="step === 'password'"
      ><h1 class="text-[28px] font-semibold tracking-[-0.8px] text-[#15151B]">
        Xush kelibsiz
      </h1>
      <p class="mt-2 text-[13.5px] leading-6 text-[#6A6A74]">
        Agentlar, balans va bizneslarni boshqarish uchun Do'ppi AI ish
        maydoningizga kiring.
      </p>
      <button
        type="button"
        class="mt-6 flex h-11 w-full items-center justify-center gap-2.5 rounded-[10px] border border-[#D6D6D1] bg-white text-[13.5px] font-medium text-[#15151B] hover:bg-[#FAFAF9]"
        @click="startGoogle"
      >
        <CGoogleMark class="h-[18px] w-[18px]" />Google orqali kirish
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
            class="h-11 w-full rounded-[10px] border border-[#D6D6D1] px-3.5 text-base text-[#15151B] outline-none focus:border-[#5B4BE8]"
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
              class="h-11 w-full rounded-[10px] border border-[#D6D6D1] px-3.5 pr-12 text-base text-[#15151B] outline-none focus:border-[#5B4BE8]"
            /><button
              type="button"
              class="absolute right-0 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-[10px] text-[#6A6A74] outline-none"
              :aria-label="
                showPassword ? 'Parolni yashirish' : 'Parolni ko\'rsatish'
              "
              @click="showPassword = !showPassword"
            >
              <CIcon :name="showPassword ? 'eye-off' : 'eye'" class="h-5 w-5" />
            </button>
          </div>
        </div>
        <button
          type="submit"
          :disabled="loading || cooldown > 0"
          class="mt-1 flex h-11 items-center justify-center gap-2 rounded-[10px] bg-[#5B4BE8] text-[13.5px] font-semibold text-white hover:bg-[#4F40D4] disabled:cursor-wait disabled:opacity-70"
        >
          {{
            loading
              ? "Kutilmoqda..."
              : cooldown > 0
                ? `${cooldown} soniyadan so'ng qayta urining`
                : "Kirish"
          }}
          <CIcon
            v-if="!loading && cooldown === 0"
            name="arrow-right"
            class="h-4 w-4"
          />
        </button>
      </form>
      <div class="mt-4"><CTelegramLogin @auth="handleTelegram" /></div>
      <p class="mt-4 text-center text-[13.5px] text-[#6A6A74]">
        Do'ppi AI'da yangimisiz?
        <RouterLink to="/register" class="font-semibold text-[#5B4BE8]"
          >Hisob yarating</RouterLink
        >
      </p>
    </template>
    <CMfaChallenge
      v-else
      v-model="code"
      :email="email"
      :loading="loading"
      @submit="verifyMfa"
      @back="backToPassword"
    />
  </AuthShell>
</template>
