<script setup lang="ts">
import { computed, ref } from "vue"
import { useHead } from "@vueuse/head"
import { useRoute, useRouter } from "vue-router"
import { authApi } from "@/features/auth"
import { CIcon, CLogo } from "@/shared/ui"
import { HttpError } from "@/shared/api/types"

const route = useRoute()
const router = useRouter()

const email = ref("")
const password = ref("")
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref("")
const isResetSent = ref(false)

const isForgotPassword = computed(() => route.path === "/forgot-password")
const title = computed(() =>
  isForgotPassword.value ? "Parolni tiklash" : "Hisobingizga kiring"
)
const subtitle = computed(() =>
  isForgotPassword.value
    ? "Email manzilingizni kiriting — parolni tiklash havolasini yuboramiz."
    : "Do'ppi.ai ish joyingizga kirish uchun ma'lumotlaringizni kiriting."
)

useHead({
  title: computed(() => `${title.value} — Do'ppi.ai`),
  meta: [
    {
      name: "description",
      content: computed(() =>
        isForgotPassword.value
          ? "Do'ppi.ai parolini tiklash"
          : "Do'ppi.ai hisobiga kirish"
      ),
    },
  ],
})

const getErrorMessage = async (error: unknown) => {
  if (error instanceof HttpError) {
    try {
      const body = (await error.response.clone().json()) as {
        message?: string
        detail?: string
      }
      return body.message || body.detail || "Email yoki parol noto'g'ri."
    } catch {
      return "Kirish amalga oshmadi. Ma'lumotlaringizni tekshirib, qayta urinib ko'ring."
    }
  }
  return "Tarmoq xatosi yuz berdi. Iltimos, qayta urinib ko'ring."
}

const signIn = async () => {
  errorMessage.value = ""
  loading.value = true

  try {
    const response = await authApi.signIn({
      email: email.value.trim(),
      password: password.value,
    })
    const token = response.token || response.accessToken

    if (token) localStorage.setItem("authToken", token)

    const redirect = route.query.redirect
    await router.push(typeof redirect === "string" && redirect.startsWith("/") ? redirect : "/")
  } catch (error) {
    errorMessage.value = await getErrorMessage(error)
  } finally {
    loading.value = false
  }
}

const requestPasswordReset = async () => {
  errorMessage.value = ""
  loading.value = true

  try {
    await authApi.requestPasswordReset(email.value.trim())
    isResetSent.value = true
  } catch (error) {
    errorMessage.value = await getErrorMessage(error)
  } finally {
    loading.value = false
  }
}

const signInWith = (provider: "google" | "telegram") => {
  const fallback = `/api/auth/${provider}`
  const configuredUrl =
    provider === "google"
      ? import.meta.env.VITE_GOOGLE_OAUTH_URL
      : import.meta.env.VITE_TELEGRAM_OAUTH_URL

  window.location.assign(configuredUrl || fallback)
}
</script>

<template>
  <main class="relative isolate flex min-h-screen overflow-hidden bg-[#0e041f] px-4 py-5 sm:p-8">
    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(102,51,238,.25),transparent_28%),radial-gradient(circle_at_12%_90%,rgba(67,27,152,.22),transparent_32%)]" aria-hidden="true" />
    <div class="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)] [background-size:32px_32px]" aria-hidden="true" />

    <div class="relative mx-auto flex w-full max-w-6xl flex-col">
      <header class="flex items-center justify-between">
        <RouterLink to="/" aria-label="Do'ppi.ai bosh sahifasi">
          <CLogo />
        </RouterLink>
        <RouterLink
          v-if="!isForgotPassword"
          to="/"
          class="text-sm text-white/65 transition-colors hover:text-white"
        >
          Bosh sahifaga qaytish
        </RouterLink>
        <RouterLink
          v-else
          to="/login"
          class="inline-flex items-center gap-2 text-sm font-medium text-white/75 transition-colors hover:text-white"
        >
          <CIcon name="arrow-left" class="h-4 w-4" />
          Kirishga qaytish
        </RouterLink>
      </header>

      <div class="flex flex-1 items-center justify-center py-10 sm:py-16">
        <section class="w-full max-w-[460px] rounded-[28px] border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-black/25 backdrop-blur-xl sm:p-9">
          <template v-if="isResetSent">
            <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6633EE]/20 text-[#a98cff]">
              <CIcon name="mail" class="h-7 w-7" />
            </div>
            <h1 class="mt-6 text-center text-2xl font-bold tracking-tight text-white">Emailingizni tekshiring</h1>
            <p class="mt-3 text-center text-sm leading-6 text-white/60">
              Agar <span class="text-white">{{ email }}</span> manzilida hisob mavjud bo'lsa, unga parolni tiklash havolasi yuborildi.
            </p>
            <RouterLink to="/login" class="mt-7 flex h-12 items-center justify-center rounded-xl bg-[#6633EE] text-sm font-semibold text-white transition-colors hover:bg-[#7650f0]">
              Kirish sahifasiga qaytish
            </RouterLink>
          </template>

          <template v-else>
            <div class="text-center">
              <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[#8F6BFF]/30 bg-[#6633EE]/15 text-[#a98cff]">
                <CIcon :name="isForgotPassword ? 'key-round' : 'user-round'" class="h-6 w-6" />
              </div>
              <h1 class="mt-5 text-2xl font-bold tracking-tight text-white sm:text-[28px]">{{ title }}</h1>
              <p class="mt-2 text-sm leading-6 text-white/60">{{ subtitle }}</p>
            </div>

            <form class="mt-7" @submit.prevent="isForgotPassword ? requestPasswordReset() : signIn()">
              <div>
                <label for="login-email" class="mb-2 block text-sm font-medium text-white/85">Email manzil</label>
                <div class="relative">
                  <CIcon name="mail" class="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/35" />
                  <input
                    id="login-email"
                    v-model="email"
                    type="email"
                    autocomplete="email"
                    required
                    placeholder="siz@kompaniya.uz"
                    class="h-12 w-full rounded-xl border border-white/10 bg-black/20 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#8F6BFF] focus:ring-4 focus:ring-[#6633EE]/15"
                  />
                </div>
              </div>

              <div v-if="!isForgotPassword" class="mt-5">
                <div class="mb-2 flex items-center justify-between gap-4">
                  <label for="login-password" class="text-sm font-medium text-white/85">Parol</label>
                  <RouterLink to="/forgot-password" class="text-xs font-medium text-[#a98cff] transition-colors hover:text-white">Parolni unutdingizmi?</RouterLink>
                </div>
                <div class="relative">
                  <CIcon name="lock-keyhole" class="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/35" />
                  <input
                    id="login-password"
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    autocomplete="current-password"
                    required
                    minlength="8"
                    placeholder="Parolingizni kiriting"
                    class="h-12 w-full rounded-xl border border-white/10 bg-black/20 pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#8F6BFF] focus:ring-4 focus:ring-[#6633EE]/15"
                  />
                  <button
                    type="button"
                    class="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-white/45 transition hover:bg-white/10 hover:text-white"
                    :aria-label="showPassword ? 'Parolni yashirish' : 'Parolni ko\'rsatish'"
                    @click="showPassword = !showPassword"
                  >
                    <CIcon :name="showPassword ? 'eye-off' : 'eye'" class="h-5 w-5" />
                  </button>
                </div>
              </div>

              <p v-if="errorMessage" class="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2.5 text-sm text-red-200" role="alert">{{ errorMessage }}</p>

              <button type="submit" :disabled="loading" class="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-[#6633EE] text-sm font-semibold text-white transition-colors hover:bg-[#7650f0] disabled:cursor-wait disabled:opacity-70">
                <span v-if="loading" class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" aria-hidden="true" />
                {{ loading ? 'Kutilmoqda...' : isForgotPassword ? 'Tiklash havolasini yuborish' : 'Kirish' }}
              </button>
            </form>

            <template v-if="!isForgotPassword">
              <div class="my-6 flex items-center gap-3" aria-hidden="true">
                <span class="h-px flex-1 bg-white/10" />
                <span class="text-xs text-white/40">yoki davom eting</span>
                <span class="h-px flex-1 bg-white/10" />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <button type="button" class="flex h-12 items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] text-sm font-medium text-white transition hover:border-white/25 hover:bg-white/[0.08]" @click="signInWith('google')">
                  <svg class="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.8 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.5a4.7 4.7 0 0 1-2 3.1v2.5h3.2c1.9-1.7 3.1-4.3 3.1-7.4Z" /><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.4l-3.2-2.5c-.9.6-2 .9-3.5.9-2.7 0-5-1.8-5.8-4.3H2.9v2.6A10 10 0 0 0 12 22Z" /><path fill="#FBBC05" d="M6.2 13.7a6 6 0 0 1 0-3.4V7.7H2.9a10 10 0 0 0 0 8.6l3.3-2.6Z" /><path fill="#EA4335" d="M12 6c1.6 0 3 .6 4.1 1.6l3.1-3A10 10 0 0 0 2.9 7.7l3.3 2.6C7 7.8 9.3 6 12 6Z" /></svg>
                  Google
                </button>
                <button type="button" class="flex h-12 items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] text-sm font-medium text-white transition hover:border-white/25 hover:bg-white/[0.08]" @click="signInWith('telegram')">
                  <CIcon name="telegram" class="h-5 w-5 text-[#29a9ea]" />
                  Telegram
                </button>
              </div>
            </template>

            <p class="mt-7 text-center text-xs leading-5 text-white/40">
              Kirish orqali siz <RouterLink to="/terms" class="underline transition hover:text-white/75">foydalanish shartlari</RouterLink> va <RouterLink to="/privacy" class="underline transition hover:text-white/75">maxfiylik siyosati</RouterLink>ga rozilik bildirasiz.
            </p>
          </template>
        </section>
      </div>
    </div>
  </main>
</template>
