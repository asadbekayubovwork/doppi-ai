<script setup lang="ts">
import { onMounted, ref } from "vue"
import { useHead } from "@unhead/vue"
import { useRouter } from "vue-router"
import { messageForProblem, useAuthStore } from "@/features/auth"
import { workspaceApi, type SessionItem } from "@/features/workspace"

const auth = useAuthStore()
const router = useRouter()
const firstName = ref(auth.user?.first_name || "")
const lastName = ref(auth.user?.last_name || "")
const locale = ref(auth.user?.locale || "uz")
const timezone = ref(auth.user?.timezone || "Asia/Tashkent")
const currentPassword = ref("")
const newPassword = ref("")
const sessions = ref<SessionItem[]>([])
const loading = ref(false)
const sessionsLoading = ref(false)
const message = ref("")
const error = ref("")

useHead({ title: "Sozlamalar — Do'ppi AI" })

const fail = (value: unknown, fallback: string) => {
  error.value = messageForProblem(value, fallback)
  message.value = ""
}

const saveProfile = async () => {
  loading.value = true
  error.value = ""
  try {
    const user = await workspaceApi.updateProfile({
      first_name: firstName.value.trim(),
      last_name: lastName.value.trim(),
      locale: locale.value,
      timezone: timezone.value.trim(),
    })
    auth.user = user
    message.value = "Profil saqlandi."
  } catch (value) {
    fail(value, "Profilni saqlab bo'lmadi.")
  } finally {
    loading.value = false
  }
}

const changePassword = async () => {
  loading.value = true
  error.value = ""
  try {
    await workspaceApi.changePassword({
      current_password: currentPassword.value,
      new_password: newPassword.value,
    })
    currentPassword.value = ""
    newPassword.value = ""
    message.value = "Parol yangilandi."
  } catch (value) {
    fail(value, "Parolni yangilab bo'lmadi.")
  } finally {
    loading.value = false
  }
}

const loadSessions = async () => {
  sessionsLoading.value = true
  try {
    sessions.value = await workspaceApi.listSessions()
  } catch (value) {
    fail(value, "Sessiyalarni yuklab bo'lmadi.")
  } finally {
    sessionsLoading.value = false
  }
}

const revokeSession = async (id: string) => {
  try {
    await workspaceApi.revokeSession(id)
    sessions.value = sessions.value.filter((item) => item.id !== id)
    message.value = "Sessiya yakunlandi."
  } catch (value) {
    fail(value, "Sessiyani yakunlab bo'lmadi.")
  }
}

const logoutEverywhere = async () => {
  loading.value = true
  try {
    await workspaceApi.logoutAll()
    auth.clearSession()
    await router.replace("/login")
  } catch (value) {
    fail(value, "Barcha sessiyalarni yakunlab bo'lmadi.")
  } finally {
    loading.value = false
  }
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("uz-UZ", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))

onMounted(loadSessions)
</script>

<template>
  <div class="grid gap-5 xl:grid-cols-2">
    <section class="rounded-2xl border border-[#E5E5E1] bg-white p-5">
      <h2 class="text-lg font-semibold text-[#15151B]">Profil</h2>
      <p class="mt-1 text-sm text-[#6A6A74]">
        Shaxsiy ma'lumotlaringiz va interfeys sozlamalari.
      </p>
      <form
        class="mt-5 grid gap-4 sm:grid-cols-2"
        @submit.prevent="saveProfile"
      >
        <label class="grid gap-1.5 text-sm"
          >Ism<input
            v-model="firstName"
            maxlength="100"
            class="h-11 rounded-[10px] border border-[#D6D6D1] px-3 outline-none focus:border-[#5B4BE8]"
        /></label>
        <label class="grid gap-1.5 text-sm"
          >Familiya<input
            v-model="lastName"
            maxlength="100"
            class="h-11 rounded-[10px] border border-[#D6D6D1] px-3 outline-none focus:border-[#5B4BE8]"
        /></label>
        <label class="grid gap-1.5 text-sm"
          >Til<select
            v-model="locale"
            class="h-11 rounded-[10px] border border-[#D6D6D1] px-3"
          >
            <option value="uz">O'zbekcha</option>
            <option value="ru">Русский</option>
            <option value="en">English</option>
          </select></label
        >
        <label class="grid gap-1.5 text-sm"
          >Vaqt mintaqasi<input
            v-model="timezone"
            maxlength="64"
            class="h-11 rounded-[10px] border border-[#D6D6D1] px-3 outline-none focus:border-[#5B4BE8]"
        /></label>
        <button
          :disabled="loading"
          class="h-11 rounded-[10px] bg-[#5B4BE8] px-5 text-sm font-semibold text-white disabled:opacity-60 sm:col-span-2"
        >
          {{ loading ? "Saqlanmoqda..." : "Profilni saqlash" }}
        </button>
      </form>
    </section>

    <section class="rounded-2xl border border-[#E5E5E1] bg-white p-5">
      <h2 class="text-lg font-semibold text-[#15151B]">Kirish xavfsizligi</h2>
      <p class="mt-1 text-sm text-[#6A6A74]">
        Google hisobini ulang yoki mavjud parolni yangilang.
      </p>
      <a
        :href="workspaceApi.googleLinkUrl()"
        class="mt-5 flex h-11 items-center justify-center rounded-[10px] border border-[#D6D6D1] text-sm font-semibold text-[#15151B] hover:bg-[#FAFAF9]"
        >Google hisobini ulash</a
      >
      <form class="mt-4 grid gap-3" @submit.prevent="changePassword">
        <input
          v-model="currentPassword"
          required
          type="password"
          autocomplete="current-password"
          placeholder="Joriy parol"
          class="h-11 rounded-[10px] border border-[#D6D6D1] px-3 outline-none focus:border-[#5B4BE8]"
        />
        <input
          v-model="newPassword"
          required
          minlength="12"
          type="password"
          autocomplete="new-password"
          placeholder="Yangi parol — kamida 12 belgi"
          class="h-11 rounded-[10px] border border-[#D6D6D1] px-3 outline-none focus:border-[#5B4BE8]"
        />
        <button
          :disabled="loading"
          class="h-11 rounded-[10px] border border-[#5B4BE8] text-sm font-semibold text-[#5B4BE8] disabled:opacity-60"
        >
          Parolni yangilash
        </button>
      </form>
    </section>

    <p
      v-if="message"
      class="rounded-xl bg-[#EAF8F0] px-4 py-3 text-sm text-[#177A46] xl:col-span-2"
      role="status"
    >
      {{ message }}
    </p>
    <p
      v-if="error"
      class="rounded-xl bg-[#FFF0F0] px-4 py-3 text-sm text-[#C42B2B] xl:col-span-2"
      role="alert"
    >
      {{ error }}
    </p>

    <section
      class="rounded-2xl border border-[#E5E5E1] bg-white p-5 xl:col-span-2"
    >
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-lg font-semibold text-[#15151B]">Faol sessiyalar</h2>
          <p class="mt-1 text-sm text-[#6A6A74]">
            Hisobingiz ochiq turgan qurilmalarni boshqaring.
          </p>
        </div>
        <button
          :disabled="loading"
          class="h-10 rounded-[10px] border border-[#E7B8B8] px-4 text-sm font-semibold text-[#C42B2B]"
          @click="logoutEverywhere"
        >
          Barchasidan chiqish
        </button>
      </div>
      <p v-if="sessionsLoading" class="mt-5 text-sm text-[#6A6A74]">
        Yuklanmoqda...
      </p>
      <div v-else class="mt-5 divide-y divide-[#E5E5E1]">
        <div
          v-for="session in sessions"
          :key="session.id"
          class="flex flex-wrap items-center justify-between gap-3 py-3"
        >
          <div>
            <p class="text-sm font-medium text-[#15151B]">
              {{ session.device_name || "Noma'lum qurilma" }}
            </p>
            <p class="mt-1 text-xs text-[#84848E]">
              {{ session.ip_address || "IP noma'lum" }} ·
              {{ formatDate(session.last_seen_at) }}
            </p>
          </div>
          <button
            class="h-10 rounded-[10px] border border-[#D6D6D1] px-4 text-sm"
            @click="revokeSession(session.id)"
          >
            Yakunlash
          </button>
        </div>
        <p v-if="!sessions.length" class="py-5 text-sm text-[#84848E]">
          Boshqa faol sessiya yo'q.
        </p>
      </div>
    </section>
  </div>
</template>
