<script setup lang="ts">
import { onMounted, ref } from "vue"
import { useI18n } from "vue-i18n"
import { useRouter } from "vue-router"
import { messageForProblem, useAuthStore } from "@/features/auth"
import { formatDate, useAppLocale, useToast } from "@/shared/lib"
import { CSelect } from "@/shared/ui"

// Language names stay in their own language, whatever the interface speaks.
const LOCALE_OPTIONS = [
  { value: "uz", label: "O'zbekcha" },
  { value: "ru", label: "Русский" },
  { value: "en", label: "English" },
]
import { workspaceApi, type SessionItem } from "@/features/workspace"

const { t } = useI18n()
const auth = useAuthStore()
const router = useRouter()
const toast = useToast()
const { locale: appLocale, setLocale } = useAppLocale()
const firstName = ref(auth.user?.first_name || "")
const lastName = ref(auth.user?.last_name || "")
const locale = ref(auth.user?.locale || appLocale.value)
const timezone = ref(auth.user?.timezone || "Asia/Tashkent")
const currentPassword = ref("")
const newPassword = ref("")
const sessions = ref<SessionItem[]>([])
const loading = ref(false)
const sessionsLoading = ref(false)


const fail = (value: unknown, title: string, fallback: string) => {
  toast.error(title, messageForProblem(value, fallback))
}

const saveProfile = async () => {
  loading.value = true
  try {
    const user = await workspaceApi.updateProfile({
      first_name: firstName.value.trim(),
      last_name: lastName.value.trim(),
      locale: locale.value,
      timezone: timezone.value.trim(),
    })
    auth.user = user
    // The profile stores the language; the interface has to follow it too.
    // Switched first, so the confirmation below already speaks the new one.
    setLocale(user.locale || locale.value)
    toast.success(t("dashboard.settings.profile.saved"))
  } catch (value) {
    fail(
      value,
      t("dashboard.settings.profile.saveFailed"),
      t("dashboard.common.retry")
    )
  } finally {
    loading.value = false
  }
}

const changePassword = async () => {
  loading.value = true
  try {
    await workspaceApi.changePassword({
      current_password: currentPassword.value,
      new_password: newPassword.value,
    })
    currentPassword.value = ""
    newPassword.value = ""
    toast.success(t("dashboard.settings.security.updated"))
  } catch (value) {
    fail(
      value,
      t("dashboard.settings.security.updateFailed"),
      t("dashboard.settings.security.checkCurrent")
    )
  } finally {
    loading.value = false
  }
}

const loadSessions = async () => {
  sessionsLoading.value = true
  try {
    sessions.value = await workspaceApi.listSessions()
  } catch (value) {
    fail(
      value,
      t("dashboard.settings.sessions.loadFailed"),
      t("dashboard.settings.sessions.reload")
    )
  } finally {
    sessionsLoading.value = false
  }
}

const revokeSession = async (id: string) => {
  try {
    await workspaceApi.revokeSession(id)
    sessions.value = sessions.value.filter((item) => item.id !== id)
    toast.success(t("dashboard.settings.sessions.revoked"))
  } catch (value) {
    fail(
      value,
      t("dashboard.settings.sessions.revokeFailed"),
      t("dashboard.common.retry")
    )
  }
}

const logoutEverywhere = async () => {
  loading.value = true
  try {
    await workspaceApi.logoutAll()
    auth.clearSession()
    await router.replace("/login")
  } catch (value) {
    fail(
      value,
      t("dashboard.settings.sessions.signOutAllFailed"),
      t("dashboard.common.retry")
    )
  } finally {
    loading.value = false
  }
}

const formatSeen = (value: string) =>
  formatDate(value, appLocale.value, { withTime: true })

onMounted(loadSessions)
</script>

<template>
  <div class="grid gap-5 xl:grid-cols-2">
    <section class="rounded-2xl border border-[#E5E5E1] bg-white p-5">
      <h2 class="text-lg font-semibold text-[#15151B]">
        {{ $t("dashboard.settings.profile.title") }}
      </h2>
      <p class="mt-1 text-sm text-[#6A6A74]">
        {{ $t("dashboard.settings.profile.description") }}
      </p>
      <form
        class="mt-5 grid gap-4 sm:grid-cols-2"
        @submit.prevent="saveProfile"
      >
        <label class="grid gap-1.5 text-sm"
          >{{ $t("dashboard.settings.profile.firstName") }}<input
            v-model="firstName"
            maxlength="100"
            class="h-11 rounded-[10px] border border-[#D6D6D1] px-3 outline-none focus:border-[#5B4BE8]"
        /></label>
        <label class="grid gap-1.5 text-sm"
          >{{ $t("dashboard.settings.profile.lastName") }}<input
            v-model="lastName"
            maxlength="100"
            class="h-11 rounded-[10px] border border-[#D6D6D1] px-3 outline-none focus:border-[#5B4BE8]"
        /></label>
        <label class="grid gap-1.5 text-sm"
          >{{ $t("dashboard.settings.profile.language") }}<CSelect
            v-model="locale"
            :options="LOCALE_OPTIONS"
            icon="languages"
            size="lg"
        /></label>
        <label class="grid gap-1.5 text-sm"
          >{{ $t("dashboard.settings.profile.timezone") }}<input
            v-model="timezone"
            maxlength="64"
            class="h-11 rounded-[10px] border border-[#D6D6D1] px-3 outline-none focus:border-[#5B4BE8]"
        /></label>
        <button
          :disabled="loading"
          class="h-11 rounded-[10px] bg-[#5B4BE8] px-5 text-sm font-semibold text-white disabled:opacity-60 sm:col-span-2"
        >
          {{
            loading
              ? $t("dashboard.common.saving")
              : $t("dashboard.settings.profile.save")
          }}
        </button>
      </form>
    </section>

    <section class="rounded-2xl border border-[#E5E5E1] bg-white p-5">
      <h2 class="text-lg font-semibold text-[#15151B]">
        {{ $t("dashboard.settings.security.title") }}
      </h2>
      <p class="mt-1 text-sm text-[#6A6A74]">
        {{ $t("dashboard.settings.security.description") }}
      </p>
      <a
        :href="workspaceApi.googleLinkUrl()"
        class="mt-5 flex h-11 items-center justify-center rounded-[10px] border border-[#D6D6D1] text-sm font-semibold text-[#15151B] hover:bg-[#FAFAF9]"
        >{{ $t("dashboard.settings.security.linkGoogle") }}</a
      >
      <form class="mt-4 grid gap-3" @submit.prevent="changePassword">
        <input
          v-model="currentPassword"
          required
          type="password"
          autocomplete="current-password"
          :placeholder="$t('dashboard.settings.security.currentPassword')"
          class="h-11 rounded-[10px] border border-[#D6D6D1] px-3 outline-none focus:border-[#5B4BE8]"
        />
        <input
          v-model="newPassword"
          required
          minlength="12"
          type="password"
          autocomplete="new-password"
          :placeholder="$t('dashboard.settings.security.newPassword')"
          class="h-11 rounded-[10px] border border-[#D6D6D1] px-3 outline-none focus:border-[#5B4BE8]"
        />
        <button
          :disabled="loading"
          class="h-11 rounded-[10px] border border-[#5B4BE8] text-sm font-semibold text-[#5B4BE8] disabled:opacity-60"
        >
          {{ $t("dashboard.settings.security.submit") }}
        </button>
      </form>
    </section>

    <section
      class="rounded-2xl border border-[#E5E5E1] bg-white p-5 xl:col-span-2"
    >
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-lg font-semibold text-[#15151B]">
            {{ $t("dashboard.settings.sessions.title") }}
          </h2>
          <p class="mt-1 text-sm text-[#6A6A74]">
            {{ $t("dashboard.settings.sessions.description") }}
          </p>
        </div>
        <button
          :disabled="loading"
          class="h-10 rounded-[10px] border border-[#E7B8B8] px-4 text-sm font-semibold text-[#C42B2B]"
          @click="logoutEverywhere"
        >
          {{ $t("dashboard.settings.sessions.signOutAll") }}
        </button>
      </div>
      <p v-if="sessionsLoading" class="mt-5 text-sm text-[#6A6A74]">
        {{ $t("dashboard.common.loading") }}
      </p>
      <div v-else class="mt-5 divide-y divide-[#E5E5E1]">
        <div
          v-for="session in sessions"
          :key="session.id"
          class="flex flex-wrap items-center justify-between gap-3 py-3"
        >
          <div>
            <p class="text-sm font-medium text-[#15151B]">
              {{
                session.device_name ||
                $t("dashboard.settings.sessions.unknownDevice")
              }}
            </p>
            <p class="mt-1 text-xs text-[#84848E]">
              {{
                session.ip_address ||
                $t("dashboard.settings.sessions.unknownIp")
              }}
              ·
              {{ formatSeen(session.last_seen_at) }}
            </p>
          </div>
          <button
            class="h-10 rounded-[10px] border border-[#D6D6D1] px-4 text-sm"
            @click="revokeSession(session.id)"
          >
            {{ $t("dashboard.settings.sessions.revoke") }}
          </button>
        </div>
        <p v-if="!sessions.length" class="py-5 text-sm text-[#84848E]">
          {{ $t("dashboard.settings.sessions.none") }}
        </p>
      </div>
    </section>
  </div>
</template>
