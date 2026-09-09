<script setup lang="ts">
import { ref } from "vue"
import { useHead } from "@vueuse/head"
import { useRoute, useRouter } from "vue-router"
import { authApi } from "@/features/auth"
import { CDoppiMark, CIcon } from "@/shared/ui"
import { HttpError } from "@/shared/api/types"

const route = useRoute()
const router = useRouter()

const email = ref("")
const password = ref("")
const showPassword = ref(false)
const rememberMe = ref(true)
const loading = ref(false)
const errorMessage = ref("")

// The dark brand column: the same three modules the landing sells, kept here so
// the login screen repeats the pitch instead of showing an empty panel.
const highlights = [
  {
    icon: "library",
    title: "Universal RAG agent",
    text: "O'z ma'lumotlaringizga asoslangan, manbasi ko'rsatilgan javoblar.",
  },
  {
    icon: "audio-lines",
    title: "Ovozli agent",
    text: "Qo'ng'iroqlarni o'zbek, rus va ingliz tilida 24/7 qabul qiladi.",
  },
  {
    icon: "clapperboard",
    title: "Video generator",
    text: "Bitta promptni bir necha daqiqada tayyor videoga aylantiradi.",
  },
]

useHead({
  title: "Xush kelibsiz — Do'ppi.ai",
  meta: [{ name: "description", content: "Do'ppi.ai hisobiga kirish" }],
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

    // "Meni eslab qol" is the difference between a persistent session and one
    // that dies with the tab — `shared/api/http.ts` reads either store.
    if (token) {
      const store = rememberMe.value ? localStorage : sessionStorage
      const other = rememberMe.value ? sessionStorage : localStorage
      other.removeItem("authToken")
      store.setItem("authToken", token)
    }

    const redirect = route.query.redirect
    await router.push(
      typeof redirect === "string" && redirect.startsWith("/") ? redirect : "/"
    )
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
  <main class="flex min-h-screen bg-white">
    <!-- Brand column. Dropped below `lg`, where the form takes the full width. -->
    <aside
      class="relative hidden shrink-0 flex-col overflow-hidden bg-[#0A0A0D] p-10 lg:flex lg:w-[42%] xl:w-[38%] xl:p-12"
    >
      <div
        class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(102,51,238,.18),transparent_45%)]"
        aria-hidden="true"
      />

      <div class="relative flex items-center justify-between gap-4">
        <RouterLink
          to="/"
          class="inline-flex items-center gap-3"
          aria-label="Do'ppi AI bosh sahifasi"
        >
          <span
            class="flex h-9 w-9 items-center justify-center rounded-[11px] bg-[#6633EE]"
          >
            <CDoppiMark class="h-5 w-6 text-white" />
          </span>
          <span class="text-[17px] font-bold tracking-tight text-white">
            Do'ppi AI
          </span>
        </RouterLink>

        <RouterLink
          to="/"
          class="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-1.5 text-xs font-medium text-white/60 transition hover:border-white/20 hover:text-white"
        >
          doppi.ai
          <CIcon name="arrow-up-right" class="h-3.5 w-3.5" />
        </RouterLink>
      </div>

      <div class="relative flex flex-1 flex-col justify-center py-14">
        <h2
          class="max-w-[460px] text-[34px] font-bold leading-[1.15] tracking-[-0.02em] text-white xl:text-[40px]"
        >
          Har bir AI agent uchun yagona ish maydoni.
        </h2>
        <p class="mt-5 max-w-[420px] text-[15px] leading-[1.65] text-white/45">
          RAG agentlar, ovozli agentlar va video generatsiya — bitta balans,
          bitta jamoa, ko'plab bizneslar.
        </p>

        <ul class="mt-12 space-y-6">
          <li
            v-for="item in highlights"
            :key="item.title"
            class="flex items-start gap-4"
          >
            <span
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border border-white/[0.08] bg-white/[0.06] text-[#a98cff]"
            >
              <CIcon :name="item.icon" class="h-5 w-5" />
            </span>
            <span class="block">
              <span class="block text-[15px] font-semibold text-white">
                {{ item.title }}
              </span>
              <span
                class="mt-1 block max-w-[330px] text-[13.5px] leading-[1.5] text-white/40"
              >
                {{ item.text }}
              </span>
            </span>
          </li>
        </ul>
      </div>

      <figure
        class="relative rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6"
      >
        <blockquote class="text-[15px] leading-[1.6] text-white/85">
          &ldquo;Uchta vendorni Do'ppi bilan almashtirdik. Qo'llab-quvvatlash
          liniyamiz endi 4 soniyada, o'zbek tilida javob beradi.&rdquo;
        </blockquote>
        <figcaption class="mt-5 flex items-center justify-between gap-4">
          <span class="flex items-center gap-3">
            <span
              class="flex h-9 w-9 items-center justify-center rounded-full bg-[#6633EE]/25 text-xs font-semibold text-[#c3aaff]"
              aria-hidden="true"
            >
              DS
            </span>
            <span class="block">
              <span class="block text-[13.5px] font-semibold text-white">
                Dilnoza Saidova
              </span>
              <span class="block text-xs text-white/40">
                COO, Silk Road Logistics
              </span>
            </span>
          </span>
          <span
            class="flex gap-0.5 text-[#C0F04A]"
            role="img"
            aria-label="5 balldan 5"
          >
            <CIcon v-for="star in 5" :key="star" name="star" class="h-4 w-4" />
          </span>
        </figcaption>
      </figure>
    </aside>

    <!-- Form column. -->
    <section class="flex min-w-0 flex-1 flex-col px-5 py-4 sm:px-10 sm:py-6">
      <header class="flex items-center justify-between gap-4">
        <RouterLink
          to="/"
          class="inline-flex items-center gap-3 lg:invisible"
          aria-label="Do'ppi AI bosh sahifasi"
        >
          <span
            class="flex h-9 w-9 items-center justify-center rounded-[11px] bg-[#6633EE]"
          >
            <CDoppiMark class="h-5 w-6 text-white" />
          </span>
          <span class="text-[17px] font-bold tracking-tight text-[#0F0F17]">
            Do'ppi AI
          </span>
        </RouterLink>

        <div class="flex items-center gap-4">
          <span class="hidden text-sm text-[#6B6B78] sm:inline">
            Hisobingiz yo'qmi?
          </span>
          <RouterLink
            to="/register"
            class="rounded-[10px] border border-[#E3E3EB] bg-white px-4 py-2 text-sm font-semibold text-[#12121A] shadow-[0_1px_2px_rgba(16,17,26,0.05)] transition hover:border-[#C9C9D6] hover:bg-[#FAFAFC]"
          >
            Ro'yxatdan o'tish
          </RouterLink>
        </div>
      </header>

      <div
        class="flex flex-1 items-center justify-center py-3 [@media(min-height:860px)]:py-6 [@media(min-height:960px)]:py-12"
      >
        <div class="w-full max-w-[400px]">
          <h1
            class="text-[28px] font-bold tracking-[-0.02em] text-[#0F0F17] sm:text-[32px]"
          >
            Xush kelibsiz
          </h1>
          <p class="mt-2 text-[15px] leading-[1.6] text-[#6B6B78]">
            Agentlar, balans va bizneslarni boshqarish uchun Do'ppi AI ish
            maydoningizga kiring.
          </p>

          <div class="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              class="flex h-11 items-center justify-center gap-2.5 rounded-xl border border-[#E4E4EB] bg-white text-[14.5px] font-medium text-[#1A1A24] shadow-[0_1px_2px_rgba(16,17,26,0.05)] transition hover:border-[#C9C9D6] hover:bg-[#FAFAFC]"
              @click="signInWith('google')"
            >
              <svg class="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M21.8 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.5a4.7 4.7 0 0 1-2 3.1v2.5h3.2c1.9-1.7 3.1-4.3 3.1-7.4Z"
                />
                <path
                  fill="#34A853"
                  d="M12 22c2.7 0 5-.9 6.7-2.4l-3.2-2.5c-.9.6-2 .9-3.5.9-2.7 0-5-1.8-5.8-4.3H2.9v2.6A10 10 0 0 0 12 22Z"
                />
                <path
                  fill="#FBBC05"
                  d="M6.2 13.7a6 6 0 0 1 0-3.4V7.7H2.9a10 10 0 0 0 0 8.6l3.3-2.6Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 6c1.6 0 3 .6 4.1 1.6l3.1-3A10 10 0 0 0 2.9 7.7l3.3 2.6C7 7.8 9.3 6 12 6Z"
                />
              </svg>
              Google
            </button>
            <button
              type="button"
              class="flex h-11 items-center justify-center gap-2.5 rounded-xl border border-[#E4E4EB] bg-white text-[14.5px] font-medium text-[#1A1A24] shadow-[0_1px_2px_rgba(16,17,26,0.05)] transition hover:border-[#C9C9D6] hover:bg-[#FAFAFC]"
              @click="signInWith('telegram')"
            >
              <CIcon name="telegram" class="h-5 w-5 text-[#29A9EA]" />
              Telegram
            </button>
          </div>

          <div class="my-5 flex items-center gap-3" aria-hidden="true">
            <span class="h-px flex-1 bg-[#E9E9EF]" />
            <span class="text-xs text-[#9A9AA5]">yoki email orqali</span>
            <span class="h-px flex-1 bg-[#E9E9EF]" />
          </div>

          <form @submit.prevent="signIn">
            <div>
              <label
                for="login-email"
                class="mb-1.5 block text-[13.5px] font-medium text-[#3D3D4A]"
              >
                Email
              </label>
              <div class="relative">
                <CIcon
                  name="mail"
                  class="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#A2A2AE]"
                />
                <input
                  id="login-email"
                  v-model="email"
                  type="email"
                  autocomplete="email"
                  required
                  placeholder="siz@kompaniya.uz"
                  class="h-12 w-full rounded-xl border border-[#E1E1E9] bg-white pl-11 pr-4 text-[15px] text-[#12121C] outline-none transition placeholder:text-[#A8A8B4] focus:border-[#6633EE] focus:ring-4 focus:ring-[#6633EE]/12"
                />
              </div>
            </div>

            <div class="mt-4">
              <div class="mb-2 flex items-center justify-between gap-4">
                <label
                  for="login-password"
                  class="text-[13.5px] font-medium text-[#3D3D4A]"
                >
                  Parol
                </label>
                <RouterLink
                  to="/forgot-password"
                  class="text-[13px] font-medium text-[#6633EE] transition-colors hover:text-[#4B21C4]"
                >
                  Parolni unutdingizmi?
                </RouterLink>
              </div>
              <div class="relative">
                <CIcon
                  name="lock-keyhole"
                  class="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#A2A2AE]"
                />
                <input
                  id="login-password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  required
                  minlength="8"
                  placeholder="Parolingizni kiriting"
                  class="h-12 w-full rounded-xl border border-[#E1E1E9] bg-white pl-11 pr-12 text-[15px] text-[#12121C] outline-none transition placeholder:text-[#A8A8B4] focus:border-[#6633EE] focus:ring-4 focus:ring-[#6633EE]/12"
                />
                <button
                  type="button"
                  class="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#8E8E9C] transition hover:bg-[#F2F2F6] hover:text-[#12121C]"
                  :aria-label="
                    showPassword ? 'Parolni yashirish' : 'Parolni korsatish'
                  "
                  @click="showPassword = !showPassword"
                >
                  <CIcon
                    :name="showPassword ? 'eye-off' : 'eye'"
                    class="h-5 w-5"
                  />
                </button>
              </div>
            </div>

            <label
              class="mt-4 flex w-fit cursor-pointer select-none items-center gap-3"
            >
              <input
                v-model="rememberMe"
                type="checkbox"
                class="peer sr-only"
              />
              <span
                class="grid h-5 w-5 shrink-0 place-items-center rounded-md border border-[#D5D5DE] bg-white text-transparent transition peer-checked:border-[#6633EE] peer-checked:bg-[#6633EE] peer-checked:text-white peer-focus-visible:ring-4 peer-focus-visible:ring-[#6633EE]/20"
                aria-hidden="true"
              >
                <CIcon name="check" class="h-3.5 w-3.5" stroke-width="3" />
              </span>
              <span class="text-sm text-[#4A4A57]">
                Meni 30 kun davomida eslab qol
              </span>
            </label>

            <p
              v-if="errorMessage"
              class="mt-4 rounded-xl border border-[#FFD5D5] bg-[#FFF3F3] px-3.5 py-2.5 text-sm text-[#C42121]"
              role="alert"
            >
              {{ errorMessage }}
            </p>

            <button
              type="submit"
              :disabled="loading"
              class="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#6633EE] text-[15px] font-semibold text-white transition-colors hover:bg-[#5A2CE0] disabled:cursor-wait disabled:opacity-70"
            >
              <span
                v-if="loading"
                class="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white"
                aria-hidden="true"
              />
              {{ loading ? "Kutilmoqda..." : "Kirish" }}
              <CIcon v-if="!loading" name="arrow-right" class="h-4 w-4" />
            </button>
          </form>

          <p
            class="mt-4 text-center text-sm text-[#6B6B78] [@media(max-height:880px)]:hidden"
          >
            Do'ppi AI'da yangimisiz?
            <RouterLink
              to="/register"
              class="ml-1 font-semibold text-[#6633EE] transition-colors hover:text-[#4B21C4]"
            >
              Hisob yarating
            </RouterLink>
          </p>
        </div>
      </div>

      <p class="text-center text-xs leading-5 text-[#9A9AA5]">
        Davom etish orqali siz
        <RouterLink
          to="/terms"
          class="transition-colors hover:text-[#4A4A57] hover:underline"
        >
          foydalanish shartlari
        </RouterLink>
        va
        <RouterLink
          to="/privacy"
          class="transition-colors hover:text-[#4A4A57] hover:underline"
        >
          maxfiylik siyosatiga
        </RouterLink>
        rozilik bildirasiz.
      </p>
    </section>
  </main>
</template>
