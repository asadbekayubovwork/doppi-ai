<script setup lang="ts">
import { onMounted, ref } from "vue"
import { messageForProblem } from "@/features/auth"
import {
  platformAdminApi,
  type AdminAnalytics,
  type AdminUser,
  type AdminUserDetail,
} from "../api/platformAdminApi"

defineProps<{ analytics?: AdminAnalytics | null }>()

const users = ref<AdminUser[]>([])
const selected = ref<AdminUserDetail | null>(null)
const search = ref("")
const statusFilter = ref("")
const page = ref(0)
const pageSize = 20
const reason = ref("")
const error = ref("")
const total = ref(0)
const saving = ref(false)
const loading = ref(false)
const date = (value: string) =>
  new Intl.DateTimeFormat("uz-UZ", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))

const findUsers = async (reset = false) => {
  if (reset) page.value = 0
  loading.value = true
  error.value = ""
  try {
    const result = await platformAdminApi.users(
      search.value,
      page.value * pageSize,
      statusFilter.value
    )
    users.value = result.items
    total.value = result.total
  } catch (cause) {
    error.value = messageForProblem(cause, "Qidiruv ishlamadi.")
  } finally {
    loading.value = false
  }
}
const openUser = async (id: string) => {
  error.value = ""
  try {
    selected.value = await platformAdminApi.user(id)
  } catch (cause) {
    error.value = messageForProblem(cause, "Foydalanuvchi yuklanmadi.")
  }
}
const statusLabel = (status: string) =>
  ({
    active: "Faol",
    suspended: "Bloklangan",
    pending_verification: "Tasdiqlanmagan",
  })[status] ?? status
const changePage = (next: number) => {
  page.value = next
  void findUsers()
}
const change = async (action: () => Promise<unknown>) => {
  if (reason.value.trim().length < 8) {
    error.value = "O‘zgarish sababini kamida 8 belgi bilan yozing."
    return
  }
  saving.value = true
  error.value = ""
  try {
    await action()
    await findUsers()
    if (selected.value) await openUser(selected.value.id)
  } catch (cause) {
    error.value = messageForProblem(
      cause,
      "Saqlanmadi. Qayta kiring va urinib ko‘ring."
    )
  } finally {
    saving.value = false
  }
}
const changeStatus = () => {
  if (!selected.value) return
  const status = selected.value.status === "active" ? "suspended" : "active"
  if (
    status === "suspended" &&
    !window.confirm("Foydalanuvchi sessiyalari bekor qilinadi. Davom etasizmi?")
  )
    return
  const id = selected.value.id
  void change(() => platformAdminApi.userStatus(id, status, reason.value))
}
onMounted(() => void findUsers())
</script>

<template>
  <section class="space-y-5">
    <div v-if="analytics" class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div
        v-for="item in [
          { label: 'Jami foydalanuvchi', value: analytics.users.total },
          { label: 'Yangi ro‘yxatdan o‘tgan', value: analytics.users.new },
          { label: 'Davrda kirganlar', value: analytics.users.active },
          { label: 'Bloklangan', value: analytics.users.suspended },
        ]"
        :key="item.label"
        class="rounded-2xl border border-[#E8E8EC] bg-white p-5"
      >
        <p class="text-sm text-[#71717D]">{{ item.label }}</p>
        <strong class="mt-2 block text-2xl tabular-nums text-[#24242C]">{{
          item.value.toLocaleString("uz-UZ")
        }}</strong>
      </div>
    </div>
    <p
      v-if="error"
      role="alert"
      class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
    >
      {{ error }}
    </p>
    <div class="rounded-2xl border border-[#E8E8EC] bg-white p-6">
      <form
        class="flex flex-col gap-2 sm:flex-row"
        @submit.prevent="findUsers(true)"
      >
        <input
          v-model="search"
          type="search"
          placeholder="Email bo‘yicha qidirish"
          class="min-h-11 min-w-0 flex-1 rounded-xl border border-[#DEDEE5] px-4 py-2.5 text-sm outline-none focus:border-[#808080]"
        />
        <select
          v-model="statusFilter"
          aria-label="Foydalanuvchi holati"
          class="min-h-11 rounded-xl border border-[#DEDEE5] bg-white px-3 text-sm text-[#555560] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5B50A8]"
        >
          <option value="">Barcha holatlar</option>
          <option value="active">Faol</option>
          <option value="suspended">Bloklangan</option>
          <option value="pending_verification">Tasdiqlanmagan</option>
        </select>
        <button
          class="min-h-11 rounded-xl bg-[#202026] px-5 py-2 text-sm font-semibold text-white"
        >
          Qidirish
        </button>
      </form>
      <p class="mt-3 text-xs text-[#91919B]">
        {{ loading ? "Yuklanmoqda…" : `${total} ta foydalanuvchi` }}
      </p>
      <p v-if="!loading && !users.length" class="py-6 text-sm text-[#858590]">
        Foydalanuvchi topilmadi.
      </p>
      <div class="mt-2 divide-y divide-[#EFEFF2]">
        <button
          v-for="user in users"
          :key="user.id"
          class="flex min-h-14 w-full flex-col justify-between gap-2 py-3 text-left text-sm hover:text-[#6558B4] sm:flex-row sm:items-center"
          @click="openUser(user.id)"
        >
          <span class="min-w-0"
            ><strong class="block truncate">{{ user.email }}</strong>
            <small class="text-[#858590]"
              >Ro‘yxatdan: {{ date(user.created_at) }} · Oxirgi kirish:
              {{
                user.last_login_at ? date(user.last_login_at) : "Hali yo‘q"
              }}</small
            >
          </span>
          <span
            class="shrink-0 font-semibold"
            :class="
              user.status === 'active' ? 'text-emerald-700' : 'text-red-700'
            "
            >{{ statusLabel(user.status) }}</span
          >
        </button>
      </div>
      <div
        v-if="total > pageSize"
        class="mt-4 flex items-center justify-between border-t border-[#EFEFF2] pt-4 text-sm"
      >
        <button
          type="button"
          :disabled="page === 0 || loading"
          class="min-h-11 rounded-lg border border-[#DEDEE5] px-4 font-semibold disabled:opacity-40"
          @click="changePage(page - 1)"
        >
          Oldingi
        </button>
        <span class="text-[#858590]"
          >{{ page + 1 }} / {{ Math.ceil(total / pageSize) }}</span
        >
        <button
          type="button"
          :disabled="(page + 1) * pageSize >= total || loading"
          class="min-h-11 rounded-lg border border-[#DEDEE5] px-4 font-semibold disabled:opacity-40"
          @click="changePage(page + 1)"
        >
          Keyingi
        </button>
      </div>
    </div>
    <div
      v-if="selected"
      class="rounded-2xl border border-[#E8E8EC] bg-white p-6"
    >
      <h2 class="text-lg font-bold">{{ selected.email }}</h2>
      <p class="mt-1 text-sm text-[#858591]">
        Oxirgi kirish:
        {{
          selected.last_login_at
            ? date(selected.last_login_at)
            : "Hali kirmagan"
        }}
        · Sessiyalar: {{ selected.active_sessions }}
      </p>
      <label class="mt-5 block text-sm font-semibold" for="admin-user-reason"
        >O‘zgarish sababi</label
      >
      <input
        id="admin-user-reason"
        v-model="reason"
        class="mt-2 w-full rounded-xl border border-[#DEDEE5] px-4 py-2.5 text-sm outline-none focus:border-[#808080]"
        placeholder="Kamida 8 belgi; audit jurnalida saqlanadi"
      />
      <div class="mt-4 space-y-3">
        <div
          v-for="business in selected.businesses"
          :key="business.id"
          class="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#F7F7F9] p-4 text-sm"
        >
          <div>
            <strong>{{ business.name }}</strong>
            <p class="text-[#858591]">
              {{ business.role }} · {{ business.credits }} kredit ·
              {{ business.tier }}
            </p>
          </div>
          <button
            :disabled="saving"
            class="rounded-lg border border-[#D8D8DE] bg-white px-3 py-1.5 font-semibold disabled:opacity-50"
            @click="
              change(() =>
                platformAdminApi.entitlement(
                  business.id,
                  business.tier === 'pro' ? 'free' : 'pro',
                  reason
                )
              )
            "
          >
            {{ business.tier === "pro" ? "Free qilish" : "Pro qilish" }}
          </button>
        </div>
      </div>
      <div class="mt-4 flex items-center justify-between">
        <span class="text-sm text-[#858591]">Holat: {{ selected.status }}</span
        ><button
          :disabled="saving"
          class="rounded-lg border border-[#D8D8DE] px-3 py-1.5 text-sm font-semibold disabled:opacity-50"
          @click="changeStatus"
        >
          {{ selected.status === "active" ? "Bloklash" : "Faollashtirish" }}
        </button>
      </div>
    </div>
  </section>
</template>
