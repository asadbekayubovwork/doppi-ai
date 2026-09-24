<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useHead } from "@unhead/vue"
import { useRoute } from "vue-router"
import { messageForProblem } from "@/features/auth"
import { CIcon } from "@/shared/ui"
import {
  adminTabDetails,
  adminTabFromQuery,
} from "@/features/platform-admin/model/navigation"
import {
  platformAdminApi,
  type AdminActivity,
  type AdminAnalytics,
} from "@/features/platform-admin/api/platformAdminApi"
import CAdminOverview from "@/features/platform-admin/ui/CAdminOverview.vue"
import CAdminServices from "@/features/platform-admin/ui/CAdminServices.vue"
import CAdminUsers from "@/features/platform-admin/ui/CAdminUsers.vue"
import CAdminCatalog from "@/features/platform-admin/ui/CAdminCatalog.vue"
import PRagAdmin from "./PRagAdmin.vue"

const route = useRoute()
const tab = computed(() => adminTabFromQuery(route.query.tab))
const page = computed(() => adminTabDetails(tab.value))
useHead({
  title: computed(() => `${page.value.title} — Super Admin | Do'ppi AI`),
})
const days = ref<7 | 30 | 90>(30)
const analytics = ref<AdminAnalytics | null>(null)
const activity = ref<AdminActivity[]>([])
const loading = ref(false)
const error = ref("")
let requestNumber = 0
const load = async () => {
  if (
    tab.value !== "overview" &&
    tab.value !== "services" &&
    tab.value !== "users"
  ) {
    requestNumber++
    loading.value = false
    error.value = ""
    return
  }
  const current = ++requestNumber
  loading.value = true
  error.value = ""
  analytics.value = null
  try {
    const [data, events] = await Promise.all([
      platformAdminApi.analytics(days.value),
      tab.value === "overview"
        ? platformAdminApi.activity()
        : Promise.resolve(activity.value),
    ])
    if (current !== requestNumber) return
    analytics.value = data
    activity.value = events
  } catch (cause) {
    if (current === requestNumber)
      error.value = messageForProblem(cause, "Admin dashboard yuklanmadi.")
  } finally {
    if (current === requestNumber) loading.value = false
  }
}
watch([tab, days], () => void load(), { immediate: true })
</script>

<template>
  <div class="space-y-6 pb-10">
    <header
      class="flex flex-col justify-between gap-4 lg:flex-row lg:items-end"
    >
      <div>
        <p
          class="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#6558B4]"
        >
          <CIcon name="shield-check" class="h-4 w-4" /> Do‘ppi AI · Boshqaruv
        </p>
        <h1
          class="mt-2 text-3xl font-bold tracking-tight text-[#23232B] sm:text-4xl"
        >
          {{ page.title }}
        </h1>
        <p class="mt-2 text-sm text-[#72727E]">
          {{ page.description }}
        </p>
      </div>
      <div
        v-if="tab === 'overview' || tab === 'services' || tab === 'users'"
        class="flex flex-wrap items-center gap-2"
      >
        <div
          class="flex rounded-xl border border-[#E4E4E9] bg-white p-1"
          aria-label="Hisobot davri"
        >
          <button
            v-for="period in [7, 30, 90] as const"
            :key="period"
            type="button"
            :aria-pressed="days === period"
            class="min-h-10 rounded-lg px-3 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5B50A8]"
            :class="
              days === period
                ? 'bg-[#24242B] text-white'
                : 'text-[#6F6F7B] hover:bg-[#F5F5F7]'
            "
            @click="days = period"
          >
            {{ period }} kun
          </button>
        </div>
        <button
          type="button"
          :disabled="loading"
          class="flex min-h-12 items-center gap-2 rounded-xl border border-[#E4E4E9] bg-white px-4 text-sm font-semibold text-[#393943] transition-colors hover:bg-[#F5F5F7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5B50A8] disabled:opacity-50"
          @click="load"
        >
          <CIcon name="refresh-cw" class="h-4 w-4" /> Yangilash
        </button>
      </div>
    </header>
    <p
      v-if="error"
      role="alert"
      class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
    >
      {{ error }}
    </p>
    <p
      v-if="loading"
      role="status"
      class="rounded-xl border border-[#E8E8EC] bg-white p-6 text-sm text-[#777782]"
    >
      Ko‘rsatkichlar yuklanmoqda…
    </p>
    <template v-if="analytics && !loading">
      <CAdminOverview
        v-if="tab === 'overview'"
        :analytics="analytics"
        :activity="activity"
      />
      <CAdminServices v-else-if="tab === 'services'" :analytics="analytics" />
    </template>
    <CAdminUsers v-if="tab === 'users'" :analytics="analytics" />
    <CAdminCatalog v-if="tab === 'pricing'" />
    <PRagAdmin v-if="tab === 'rag'" />
  </div>
</template>
