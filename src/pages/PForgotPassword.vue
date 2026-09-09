<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue"
import { useHead } from "@vueuse/head"
import { useRouter } from "vue-router"
import { authApi, CAuthVerifyStep } from "@/features/auth"
import { HttpError } from "@/shared/api/types"
import { usePasswordStrength } from "@/shared/lib"
import { CDoppiMark, CIcon } from "@/shared/ui"

type Step = "email" | "code" | "password" | "done"

const router = useRouter()

const step = ref<Step>("email")
const email = ref("")
const code = ref("")
const newPassword = ref("")
const passwordConfirmation = ref("")
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref("")
const codeChannel = ref<"email" | "telegram">("email")

// Three tries before the backend locks the address for 15 minutes.
const MAX_ATTEMPTS = 3
const attemptsLeft = ref(MAX_ATTEMPTS)
const isLocked = computed(() => attemptsLeft.value <= 0)

const signedOutSessions = ref(0)
const signedOutDevices = ref<string[]>([])

const usesAuthApi = import.meta.env.VITE_AUTH_API_ENABLED === "true"

const { requirements, score, level } = usePasswordStrength(newPassword)
const passwordsMatch = computed(
  () =>
    passwordConfirmation.value.length > 0 &&
    newPassword.value === passwordConfirmation.value
)

const stepNumber = computed(() =>
  step.value === "email" ? 1 : step.value === "code" ? 2 : 3
)
const codeSentVia = computed(() =>
  codeChannel.value === "telegram" ? "Telegram orqali" : "emailingizga"
)

useHead({
  title: "Parolni tiklash — Do'ppi.ai",
  meta: [{ name: "description", content: "Do'ppi.ai parolini tiklash" }],
})

const getErrorMessage = async (error: unknown) => {
  if (error instanceof HttpError) {
    try {
      const body = (await error.response.clone().json()) as {
        message?: string
        detail?: string
      }
      return body.message || body.detail || "Amal bajarilmadi."
    } catch {
      return "Amal bajarilmadi. Ma'lumotlaringizni tekshirib, qayta urinib ko'ring."
    }
  }
  return "Tarmoq xatosi yuz berdi. Iltimos, qayta urinib ko'ring."
}

const requestCode = async () => {
  errorMessage.value = ""
  loading.value = true

  try {
    // Without a connected API, keep the temporary OTP flow testable locally.
    if (usesAuthApi) await authApi.requestPasswordReset(email.value.trim())
    attemptsLeft.value = MAX_ATTEMPTS
    step.value = "code"
  } catch (error) {
    errorMessage.value = await getErrorMessage(error)
  } finally {
    loading.value = false
  }
}

const resendCode = async (channel: "email" | "telegram") => {
  errorMessage.value = ""
  code.value = ""
  codeChannel.value = channel
  attemptsLeft.value = MAX_ATTEMPTS

  // Telegram delivery has no endpoint yet, so only the email code is re-sent.
  if (usesAuthApi && channel === "email") {
    try {
      await authApi.requestPasswordReset(email.value.trim())
    } catch (error) {
      errorMessage.value = await getErrorMessage(error)
    }
  }
}

// Retyping clears the rejection, so the boxes stop reading as red mid-entry.
watch(code, () => {
  if (!isLocked.value) errorMessage.value = ""
})

const verifyCode = () => {
  if (isLocked.value) return
  errorMessage.value = ""

  if (code.value !== "111111") {
    attemptsLeft.value -= 1
    errorMessage.value = isLocked.value
      ? "Juda ko'p urinish. 15 daqiqadan keyin qayta urinib ko'ring."
      : `Kod noto'g'ri. Bloklanishgacha ${attemptsLeft.value} ta urinish qoldi.`
    return
  }

  step.value = "password"
}

let redirectTimerId: ReturnType<typeof setInterval> | undefined
const redirectSeconds = ref(5)

const stopRedirect = () => {
  if (redirectTimerId) clearInterval(redirectTimerId)
  redirectTimerId = undefined
}
onBeforeUnmount(stopRedirect)

const startRedirect = () => {
  stopRedirect()
  redirectSeconds.value = 5
  redirectTimerId = setInterval(() => {
    redirectSeconds.value -= 1
    if (redirectSeconds.value <= 0) {
      stopRedirect()
      router.push("/login")
    }
  }, 1000)
}

const updatePassword = async () => {
  errorMessage.value = ""

  if (!passwordsMatch.value) {
    errorMessage.value = "Parollar bir xil emas."
    return
  }

  loading.value = true
  try {
    if (usesAuthApi) {
      const response = await authApi.resetPassword({
        email: email.value.trim(),
        code: code.value,
        password: newPassword.value,
      })
      signedOutSessions.value = response.signedOutSessions ?? 0
      signedOutDevices.value = response.devices ?? []
    }
    step.value = "done"
    startRedirect()
  } catch (error) {
    errorMessage.value = await getErrorMessage(error)
  } finally {
    loading.value = false
  }
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
            {{ stepNumber >= 3 ? "Yordam kerakmi?" : "Hisobingiz yo'qmi?" }}
          </span>
          <RouterLink
            :to="stepNumber >= 3 ? '/contact-us' : '/register'"
            class="rounded-[10px] border border-[#E3E3EB] bg-white px-4 py-2 text-sm font-semibold text-[#12121A] shadow-[0_1px_2px_rgba(16,17,26,0.05)] transition hover:border-[#C9C9D6] hover:bg-[#FAFAFC]"
          >
            {{ stepNumber >= 3 ? "Qo'llab-quvvatlash" : "Ro'yxatdan o'tish" }}
          </RouterLink>
        </div>
      </header>

      <div
        class="flex flex-1 items-center justify-center py-3 [@media(min-height:860px)]:py-6 [@media(min-height:960px)]:py-12"
      >
        <div class="w-full max-w-[400px]">
          <Transition name="step" mode="out-in">
            <div :key="step">
              <!-- Step 1 — the address the code goes to. -->
              <template v-if="step === 'email'">
                <div class="flex gap-2" aria-hidden="true">
                  <span
                    v-for="segment in 3"
                    :key="segment"
                    class="h-1 flex-1 rounded-full"
                    :class="segment <= 1 ? 'bg-[#6633EE]' : 'bg-[#E9E9EF]'"
                  />
                </div>
                <p
                  class="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8E8E9C]"
                >
                  1-qadam / 3 · Email
                </p>

                <span
                  class="mt-6 flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#EFEAFE] text-[#6633EE]"
                >
                  <CIcon name="key-round" class="h-6 w-6" />
                </span>

                <h1
                  class="mt-6 text-[28px] font-bold tracking-[-0.02em] text-[#0F0F17] sm:text-[32px]"
                >
                  Parolni tiklash
                </h1>
                <p class="mt-2 text-[15px] leading-[1.6] text-[#6B6B78]">
                  Email manzilingizni kiriting — tasdiqlash kodini yuboramiz.
                </p>

                <form class="mt-6" @submit.prevent="requestCode">
                  <label
                    for="reset-email"
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
                      id="reset-email"
                      v-model="email"
                      type="email"
                      autocomplete="email"
                      required
                      placeholder="siz@kompaniya.uz"
                      class="h-12 w-full rounded-xl border border-[#E1E1E9] bg-white pl-11 pr-4 text-[15px] text-[#12121C] outline-none transition placeholder:text-[#A8A8B4] focus:border-[#6633EE] focus:ring-4 focus:ring-[#6633EE]/12"
                    />
                  </div>

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
                    {{
                      loading ? "Kutilmoqda..." : "Tasdiqlash kodini yuborish"
                    }}
                    <CIcon v-if="!loading" name="arrow-right" class="h-4 w-4" />
                  </button>
                </form>

                <p class="mt-4 text-center text-sm text-[#6B6B78]">
                  Parolingiz esingizdami?
                  <RouterLink
                    to="/login"
                    class="ml-1 font-semibold text-[#6633EE] transition-colors hover:text-[#4B21C4]"
                  >
                    Kirish
                  </RouterLink>
                </p>
              </template>

              <!-- Step 2 — the emailed code. -->
              <CAuthVerifyStep
                v-else-if="step === 'code'"
                v-model="code"
                :email="email"
                :step="2"
                :steps="3"
                step-name="Kodni tasdiqlash"
                title="Tiklash kodini kiriting"
                :description="`6 xonali kodni ${codeSentVia} yubordik: ${email}.`"
                submit-label="Kodni tasdiqlash"
                :variant="errorMessage ? 'danger' : 'default'"
                :icon="errorMessage ? 'shield-alert' : 'mail-check'"
                :email-chip="false"
                telegram-variant="link"
                :error-message="errorMessage"
                :loading="loading"
                @submit="verifyCode"
                @resend="resendCode"
              />

              <!-- Step 3 — the replacement password. -->
              <template v-else-if="step === 'password'">
                <div class="flex gap-2" aria-hidden="true">
                  <span
                    v-for="segment in 3"
                    :key="segment"
                    class="h-1 flex-1 rounded-full bg-[#6633EE]"
                  />
                </div>
                <p
                  class="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8E8E9C]"
                >
                  3-qadam / 3 · Yangi parol
                </p>

                <span
                  class="mt-6 flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#EFEAFE] text-[#6633EE]"
                >
                  <CIcon name="lock" class="h-6 w-6" />
                </span>

                <h1
                  class="mt-6 text-[28px] font-bold tracking-[-0.02em] text-[#0F0F17] sm:text-[32px]"
                >
                  Yangi parol o'rnating
                </h1>
                <p class="mt-2 text-[15px] leading-[1.6] text-[#6B6B78]">
                  Avval ishlatmagan parolni tanlang. Qolgan barcha sessiyalar
                  tizimdan chiqariladi.
                </p>

                <form class="mt-6" @submit.prevent="updatePassword">
                  <label
                    for="reset-password"
                    class="mb-1.5 block text-[13.5px] font-medium text-[#3D3D4A]"
                  >
                    Yangi parol
                  </label>
                  <div class="relative">
                    <CIcon
                      name="lock-keyhole"
                      class="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#A2A2AE]"
                    />
                    <input
                      id="reset-password"
                      v-model="newPassword"
                      :type="showPassword ? 'text' : 'password'"
                      autocomplete="new-password"
                      required
                      minlength="8"
                      placeholder="Kamida 12 ta belgi"
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

                  <div v-if="newPassword" class="mt-2 flex items-center gap-3">
                    <span
                      class="grid flex-1 grid-cols-4 gap-1.5"
                      role="img"
                      :aria-label="`Parol kuchi: ${level.label}`"
                    >
                      <span
                        v-for="segment in 4"
                        :key="segment"
                        class="h-1 rounded-full transition-colors"
                        :class="segment <= score ? level.bar : 'bg-[#E9E9EF]'"
                      />
                    </span>
                    <span
                      class="shrink-0 text-[13px] font-medium"
                      :class="level.text"
                    >
                      {{ level.label }}
                    </span>
                  </div>

                  <ul class="mt-3 grid gap-2 sm:grid-cols-2">
                    <li
                      v-for="item in requirements"
                      :key="item.label"
                      class="flex items-center gap-2 text-[13px]"
                      :class="item.met ? 'text-[#15803D]' : 'text-[#8E8E9C]'"
                    >
                      <CIcon
                        :name="item.met ? 'circle-check' : 'circle'"
                        class="h-4 w-4 shrink-0"
                      />
                      {{ item.label }}
                    </li>
                  </ul>

                  <label
                    for="reset-password-confirmation"
                    class="mb-1.5 mt-5 block text-[13.5px] font-medium text-[#3D3D4A]"
                  >
                    Yangi parolni tasdiqlang
                  </label>
                  <div class="relative">
                    <CIcon
                      name="lock-keyhole"
                      class="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#A2A2AE]"
                    />
                    <input
                      id="reset-password-confirmation"
                      v-model="passwordConfirmation"
                      :type="showPassword ? 'text' : 'password'"
                      autocomplete="new-password"
                      required
                      minlength="8"
                      placeholder="Parolni qayta kiriting"
                      class="h-12 w-full rounded-xl border bg-white pl-11 pr-12 text-[15px] text-[#12121C] outline-none transition placeholder:text-[#A8A8B4] focus:ring-4"
                      :class="
                        passwordsMatch
                          ? 'border-[#15803D] focus:border-[#15803D] focus:ring-[#15803D]/12'
                          : 'border-[#E1E1E9] focus:border-[#6633EE] focus:ring-[#6633EE]/12'
                      "
                    />
                    <CIcon
                      v-if="passwordsMatch"
                      name="check"
                      class="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#15803D]"
                    />
                  </div>
                  <p
                    v-if="passwordsMatch"
                    class="mt-2 flex items-center gap-1.5 text-[13px] text-[#15803D]"
                  >
                    <CIcon name="circle-check" class="h-4 w-4" />
                    Parollar mos keladi
                  </p>

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
                    {{ loading ? "Kutilmoqda..." : "Parolni yangilash" }}
                    <CIcon v-if="!loading" name="arrow-right" class="h-4 w-4" />
                  </button>
                </form>

                <p class="mt-4 text-center text-sm text-[#6B6B78]">
                  Fikringiz o'zgardimi?
                  <RouterLink
                    to="/login"
                    class="ml-1 font-semibold text-[#6633EE] transition-colors hover:text-[#4B21C4]"
                  >
                    Kirishga qaytish
                  </RouterLink>
                </p>
              </template>

              <!-- Done. -->
              <template v-else>
                <div class="text-center">
                  <span
                    class="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#E8F6EC] text-[#15803D]"
                  >
                    <CIcon name="circle-check" class="h-7 w-7" />
                  </span>
                  <h1
                    class="mt-6 text-[28px] font-bold tracking-[-0.02em] text-[#0F0F17] sm:text-[32px]"
                  >
                    Parol yangilandi
                  </h1>
                  <p class="mt-2 text-[15px] leading-[1.6] text-[#6B6B78]">
                    Endi yangi parol bilan kirishingiz mumkin.
                    <template v-if="signedOutSessions > 0">
                      Boshqa {{ signedOutSessions }} ta faol sessiya tizimdan
                      chiqarildi.
                    </template>
                  </p>
                </div>

                <div
                  v-if="signedOutSessions > 0"
                  class="mt-6 flex items-start gap-3 rounded-xl border border-[#E9E9EF] bg-[#FBFBFC] p-4 text-left"
                >
                  <CIcon
                    name="shield-check"
                    class="mt-0.5 h-5 w-5 shrink-0 text-[#15803D]"
                  />
                  <span class="block min-w-0">
                    <span class="block text-sm font-semibold text-[#0F0F17]">
                      {{ signedOutSessions }} ta sessiya chiqarildi
                    </span>
                    <span
                      v-if="signedOutDevices.length"
                      class="mt-0.5 block text-[13px] text-[#8E8E9C]"
                    >
                      {{ signedOutDevices.join(" · ") }}
                    </span>
                  </span>
                </div>

                <RouterLink
                  to="/login"
                  class="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#6633EE] text-[15px] font-semibold text-white transition-colors hover:bg-[#5A2CE0]"
                >
                  Kirishga o'tish
                  <CIcon name="arrow-right" class="h-4 w-4" />
                </RouterLink>

                <p
                  class="mt-4 flex items-center justify-center gap-1.5 text-sm text-[#8E8E9C]"
                >
                  <CIcon name="timer" class="h-4 w-4" />
                  {{ redirectSeconds }} soniyadan keyin avtomatik yo'naltiriladi
                </p>
              </template>
            </div>
          </Transition>
        </div>
      </div>

      <p class="text-center text-xs leading-5 text-[#9A9AA5]">
        <template v-if="step === 'code'">
          Bu kodni hech kimga bermang. Do'ppi AI xodimlari uni hech qachon
          so'ramaydi.
        </template>
        <template v-else-if="step === 'password'">
          Xavfsizligingiz uchun parol o'zgarganda emailingizga xabar yuboramiz.
        </template>
        <template v-else-if="step === 'done'">
          Bu siz emasmisiz? Darhol
          <a
            href="mailto:support@doppi.ai"
            class="transition-colors hover:text-[#4A4A57] hover:underline"
          >
            support@doppi.ai
          </a>
          ga murojaat qiling.
        </template>
        <template v-else>
          Kodni faqat siz kiritishingiz kerak — uni hech kimga yubormang.
        </template>
      </p>
    </section>
  </main>
</template>
