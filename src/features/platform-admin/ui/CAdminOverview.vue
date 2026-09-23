<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { messageForProblem } from "@/features/auth"
import {
  platformAdminApi,
  type AdminActivity,
  type AdminOverview,
} from "../api/platformAdminApi"

const overview = ref<AdminOverview | null>(null)
const activity = ref<AdminActivity[]>([])
const error = ref("")
const loading = ref(true)
const stats = computed(() =>
  overview.value
    ? [
        ["Foydalanuvchilar", overview.value.users],
        ["Yangi · 7 kun", overview.value.new_users_7d],
        ["Bizneslar", overview.value.businesses],
        ["Berilgan bonuslar", overview.value.welcome_claims],
        ["Mavjud kredit", overview.value.credits_available],
        ["Sarflangan kredit", overview.value.credits_spent],
        ["RAG javoblari", overview.value.rag_answers],
        ["Video xatolari", overview.value.videos_failed],
      ]
    : []
)
const date = (value: string) =>
  new Intl.DateTimeFormat("uz-UZ", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
const load = async () => {
  loading.value = true
  error.value = ""
  try {
    ;[overview.value, activity.value] = await Promise.all([
      platformAdminApi.overview(),
      platformAdminApi.activity(),
    ])
  } catch (cause) {
    error.value = messageForProblem(cause, "Admin dashboard yuklanmadi.")
  } finally {
    loading.value = false
  }
}
onMounted(() => void load())
</script>

<template>
  <section class="space-y-5">
    <div class="flex justify-end">
      <button
        class="rounded-xl border border-[#DDDEE4] bg-white px-4 py-2 text-sm font-semibold hover:bg-[#F5F5F7]"
        @click="load"
      >
        Yangilash
      </button>
    </div>
    <p
      v-if="error"
      role="alert"
      class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
    >
      {{ error }}
    </p>
    <p v-if="loading && !overview" class="text-sm text-[#8A8A96]">
      Yuklanmoqda…
    </p>
    <div v-if="overview" class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div
        v-for="[label, value] in stats"
        :key="label"
        class="rounded-2xl border border-[#E8E8EC] bg-white p-5"
      >
        <p class="text-xs font-semibold text-[#878794]">{{ label }}</p>
        <p class="mt-3 text-2xl font-bold tracking-tight text-[#282832]">
          {{ Number(value).toLocaleString("uz-UZ") }}
        </p>
      </div>
    </div>
    <div class="rounded-2xl border border-[#E8E8EC] bg-white p-6">
      <h2 class="text-lg font-bold">So‘nggi harakatlar</h2>
      <p v-if="!activity.length" class="mt-4 text-sm text-[#90909A]">
        Hozircha yozuv yo‘q.
      </p>
      <ul v-else class="mt-3 divide-y divide-[#EFEFF2]">
        <li
          v-for="event in activity"
          :key="event.id"
          class="flex justify-between gap-4 py-3 text-sm"
        >
          <span>{{ event.action }}</span
          ><time class="text-[#9A9AA5]">{{ date(event.occurred_at) }}</time>
        </li>
      </ul>
    </div>
  </section>
</template>
