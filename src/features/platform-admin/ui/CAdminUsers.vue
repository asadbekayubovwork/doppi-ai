<script setup lang="ts">
import { onMounted, ref } from "vue"
import { messageForProblem } from "@/features/auth"
import {
  platformAdminApi,
  type AdminUser,
  type AdminUserDetail,
} from "../api/platformAdminApi"

const users = ref<AdminUser[]>([])
const selected = ref<AdminUserDetail | null>(null)
const search = ref("")
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

const findUsers = async () => {
  loading.value = true
  error.value = ""
  try {
    const result = await platformAdminApi.users(search.value)
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
    <p
      v-if="error"
      role="alert"
      class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
    >
      {{ error }}
    </p>
    <div class="rounded-2xl border border-[#E8E8EC] bg-white p-6">
      <form class="flex gap-2" @submit.prevent="findUsers">
        <input
          v-model="search"
          type="search"
          placeholder="Email bo‘yicha qidirish"
          class="min-w-0 flex-1 rounded-xl border border-[#DEDEE5] px-4 py-2.5 text-sm outline-none focus:border-[#808080]"
        />
        <button
          class="rounded-xl bg-[#202026] px-5 py-2 text-sm font-semibold text-white"
        >
          Qidirish
        </button>
      </form>
      <p class="mt-3 text-xs text-[#91919B]">
        {{ loading ? "Yuklanmoqda…" : `${total} ta foydalanuvchi` }}
      </p>
      <div class="mt-2 divide-y divide-[#EFEFF2]">
        <button
          v-for="user in users"
          :key="user.id"
          class="flex w-full items-center justify-between gap-4 py-3 text-left text-sm hover:text-[#746D22]"
          @click="openUser(user.id)"
        >
          <span
            ><strong>{{ user.email }}</strong
            ><small class="ml-2 text-[#9999A4]">{{
              date(user.created_at)
            }}</small></span
          >
          <span
            :class="
              user.status === 'active' ? 'text-emerald-700' : 'text-red-700'
            "
            >{{ user.status }}</span
          >
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
