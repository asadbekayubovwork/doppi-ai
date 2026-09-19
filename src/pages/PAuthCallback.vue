<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useHead } from "@unhead/vue"
import {
  AuthShell,
  CAuthSteps,
  authApi,
  safeLocalPath,
  useAuthStore,
  type AuthStepState,
} from "@/features/auth"
import { HttpError } from "@/shared/api"
import { CGoogleMark, CIcon } from "@/shared/ui"

type Phase = "session" | "workspace" | "done"

interface Failure {
  /** The step that broke: Google's side of OAuth, or our session bootstrap. */
  step: "google" | "session"
  code: string
  traceId: string
  at: Date
}

const RETURN_PATH_KEY = "doppi_auth_return_path"

// The bar creeps towards the end of the running step and never claims it: the
// requests report no progress of their own, only when they finish.
const PROGRESS_CEILING: Record<Phase, number> = {
  session: 64,
  workspace: 94,
  done: 100,
}

// Spelled out rather than Intl "uz-UZ": Chrome's ICU has no Uzbek month
// abbreviations and prints "M09 19".
const MONTHS = [
  "yan",
  "fev",
  "mar",
  "apr",
  "may",
  "iyn",
  "iyl",
  "avg",
  "sen",
  "okt",
  "noy",
  "dek",
]
const pad = (value: number) => String(value).padStart(2, "0")
/** 19-sen, 14:32 */
const formatTime = (date: Date) =>
  `${date.getDate()}-${MONTHS[date.getMonth()]}, ${pad(date.getHours())}:${pad(date.getMinutes())}`

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const destination = safeLocalPath(sessionStorage.getItem(RETURN_PATH_KEY))
const phase = ref<Phase>("session")
const failure = ref<Failure | null>(null)
const progress = ref(33)
let progressTimer: ReturnType<typeof setInterval> | undefined
let active = true

const queryText = (value: unknown) => (typeof value === "string" ? value : "")

useHead({
  title: computed(() =>
    failure.value
      ? "Kirish amalga oshmadi — Do'ppi.ai"
      : "Kirish tasdiqlanmoqda — Do'ppi.ai"
  ),
})

// bootstrap() opens the session and then loads businesses in one call; the
// store turning "authenticated" in between is the hand-off to step three.
watch(
  () => auth.status,
  (status) => {
    if (status === "authenticated" && phase.value === "session") {
      phase.value = "workspace"
    }
  },
  { flush: "sync" }
)

const stopProgress = () => {
  if (progressTimer) clearInterval(progressTimer)
  progressTimer = undefined
}

const fail = (step: Failure["step"], code: string, traceId = "") => {
  stopProgress()
  failure.value = { step, code, traceId, at: new Date() }
}

onMounted(async () => {
  if (route.query.status !== "success") {
    fail(
      "google",
      queryText(route.query.error) || "oauth_failed",
      queryText(route.query.trace_id)
    )
    return
  }

  progressTimer = setInterval(() => {
    const ceiling = PROGRESS_CEILING[phase.value]
    progress.value += (ceiling - progress.value) * 0.08
  }, 120)

  const authenticated = await auth.bootstrap(true)
  if (!active) return
  if (!authenticated) {
    const error = auth.bootstrapError
    fail(
      "session",
      error instanceof HttpError
        ? error.problem?.code || `http_${error.status}`
        : "session_unavailable",
      error instanceof HttpError ? error.problem?.trace_id || "" : ""
    )
    return
  }

  stopProgress()
  phase.value = "done"
  progress.value = 100
  sessionStorage.removeItem(RETURN_PATH_KEY)
  await router.replace(destination)
})

onBeforeUnmount(() => {
  active = false
  stopProgress()
})

const steps = computed(() => {
  const broken = failure.value?.step
  const google: AuthStepState = broken === "google" ? "failed" : "done"
  const session: AuthStepState =
    broken === "google"
      ? "skipped"
      : broken === "session"
        ? "failed"
        : phase.value === "session"
          ? "active"
          : "done"
  const workspace: AuthStepState = broken
    ? "skipped"
    : phase.value === "workspace"
      ? "active"
      : phase.value === "done"
        ? "done"
        : "waiting"

  return [
    { label: "Google hisobini tasdiqlash", state: google },
    { label: "Sessiyani yaratish", state: session },
    { label: "Ish maydoni va bizneslarni yuklash", state: workspace },
  ]
})

const currentStep = computed(() => (phase.value === "session" ? 2 : 3))
const percent = computed(() => Math.round(progress.value))

const account = computed(() => {
  const user = auth.user
  if (!user) return null
  const initial = (user.first_name || user.email).trim().charAt(0)
  return { email: user.email, initial: initial.toUpperCase() }
})

const description = computed(() => {
  const current = failure.value
  if (!current) {
    return "Google hisobingizni tekshirib, ish maydoningizni tayyorlayapmiz. Iltimos, bu oynani yopmang."
  }
  if (current.step === "session") {
    return "Google hisobingiz tasdiqlandi, ammo sessiyani ochib bo'lmadi. Qayta urinib ko'ring."
  }
  if (current.code === "access_denied") {
    return "Google so'rovni sessiya yaratilishidan oldin bekor qildi. Hech qanday ma'lumot ulashilmadi va hisob yaratilmadi."
  }
  return "Google orqali kirish yakunlanmadi. Hech qanday hisob yaratilmadi — qayta urinib ko'ring."
})

// Kept as parts so a narrow screen wraps between them, not inside "19-sen".
const errorDetails = computed(() => {
  const current = failure.value
  if (!current) return []
  return [
    `Xato kodi: ${current.code}`,
    current.traceId && `so'rov ID ${current.traceId}`,
    formatTime(current.at),
  ].filter(Boolean)
})

const retryGoogle = () => {
  sessionStorage.setItem(RETURN_PATH_KEY, destination)
  window.location.assign(authApi.googleAuthorizeUrl())
}
</script>

<template>
  <AuthShell>
    <template #header>
      <span class="hidden text-[13.5px] text-[#6A6A74] sm:inline">{{
        failure ? "Yordam kerakmi?" : "Jarayon cho'zildimi?"
      }}</span>
      <RouterLink
        to="/contact-us"
        class="inline-flex h-9 items-center rounded-[10px] border border-[#D6D6D1] bg-white px-3.5 text-[13.5px] font-semibold text-[#15151B] hover:bg-[#FAFAF9]"
        >Qo'llab-quvvatlash</RouterLink
      >
    </template>

    <div class="text-center">
      <div
        class="relative mx-auto grid h-[72px] w-[72px] place-items-center"
        aria-hidden="true"
      >
        <svg
          class="absolute inset-0 h-full w-full"
          :class="{
            'motion-safe:animate-spin motion-safe:[animation-duration:1.6s]':
              !failure,
          }"
          viewBox="0 0 72 72"
          fill="none"
        >
          <circle
            v-if="failure"
            cx="36"
            cy="36"
            r="34.5"
            stroke="#F4D3D3"
            stroke-width="3"
          />
          <circle
            v-else
            cx="36"
            cy="36"
            r="34.5"
            stroke="#5B4BE8"
            stroke-width="3"
            stroke-linecap="round"
            stroke-dasharray="163 217"
          />
        </svg>
        <span
          class="grid h-11 w-11 place-items-center rounded-full"
          :class="
            failure
              ? 'bg-[#FFF0F0] text-[#C42B2B]'
              : 'bg-[#EFECFF] text-[#5B4BE8]'
          "
          ><CIcon
            :name="failure ? 'triangle-alert' : 'shield-check'"
            class="h-5 w-5"
        /></span>
      </div>

      <div aria-live="polite">
        <h1
          class="mt-6 text-[28px] font-semibold tracking-[-0.8px] text-[#15151B]"
        >
          {{ failure ? "Tizimga kira olmadik" : "Tizimga kirilmoqda..." }}
        </h1>
        <p class="mt-2 text-[13.5px] leading-6 text-[#6A6A74]">
          {{ description }}
        </p>
      </div>

      <span
        class="mt-6 inline-flex max-w-full items-center gap-2.5 rounded-full border border-[#E5E5E1] bg-[#FAFAF9] py-1.5 pl-1.5 pr-4 text-[13.5px]"
      >
        <template v-if="account">
          <span
            class="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#5B4BE8] text-xs font-semibold text-white"
            aria-hidden="true"
            >{{ account.initial }}</span
          ><span class="truncate font-medium text-[#15151B]">{{
            account.email
          }}</span
          ><span class="h-4 w-px shrink-0 bg-[#E5E5E1]" aria-hidden="true" />
          <span class="shrink-0 text-[#84848E]">Google</span>
        </template>
        <template v-else>
          <span
            class="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white ring-1 ring-[#E5E5E1]"
            aria-hidden="true"
            ><CGoogleMark class="h-3.5 w-3.5"
          /></span>
          <span class="font-medium text-[#15151B]">Google hisobi orqali</span>
        </template>
      </span>
    </div>

    <CAuthSteps :steps="steps" />

    <template v-if="!failure">
      <div class="mt-6">
        <div
          class="h-1.5 overflow-hidden rounded-full bg-[#EDEDEA]"
          role="progressbar"
          aria-label="Kirish jarayoni"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-valuenow="percent"
        >
          <div
            class="h-full rounded-full bg-[#5B4BE8] transition-[width] duration-300 ease-out"
            :style="{ width: `${percent}%` }"
          />
        </div>
        <div
          class="mt-2.5 flex items-center justify-between gap-3 text-xs text-[#84848E]"
        >
          <span>{{ currentStep }}/3-qadam · odatda 3–5 soniya davom etadi</span>
          <span class="font-semibold tabular-nums text-[#6A6A74]"
            >{{ percent }}%</span
          >
        </div>
      </div>
      <RouterLink
        to="/login"
        class="mx-auto mt-5 flex w-fit items-center gap-2 text-[13.5px] font-medium text-[#6A6A74] hover:text-[#15151B]"
        ><CIcon name="arrow-left" class="h-4 w-4" />Bekor qilish va kirishga
        qaytish</RouterLink
      >
    </template>
    <template v-else>
      <button
        type="button"
        class="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-[#5B4BE8] text-[13.5px] font-semibold text-white hover:bg-[#4F40D4]"
        @click="retryGoogle"
      >
        <CIcon name="rotate-ccw" class="h-4 w-4" />Google orqali qayta urinish
      </button>
      <RouterLink
        to="/login"
        class="mx-auto mt-5 flex w-fit items-center gap-2 text-[13.5px] font-medium text-[#6A6A74] hover:text-[#15151B]"
        ><CIcon name="arrow-left" class="h-4 w-4" />Email va parol orqali
        kirish</RouterLink
      >
    </template>

    <template #footer>
      <p class="text-center text-xs leading-5 text-[#84848E]">
        <template v-if="failure"
          ><template v-for="(detail, i) in errorDetails" :key="detail"
            ><template v-if="i"> · </template
            ><span class="whitespace-nowrap">{{ detail }}</span></template
          ></template
        >
        <template v-else
          >Bu oynani yopmang — avtomatik ravishda {{ destination }} sahifasiga
          yo'naltirilasiz.</template
        >
      </p>
    </template>
  </AuthShell>
</template>
