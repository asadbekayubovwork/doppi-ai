<script setup lang="ts">
import { computed } from "vue"
import { CIcon } from "@/shared/ui"
import CAdminTrend from "./CAdminTrend.vue"
import type { AdminActivity, AdminAnalytics } from "../api/platformAdminApi"

const props = defineProps<{
  analytics: AdminAnalytics
  activity: AdminActivity[]
}>()
const number = (value: number) => value.toLocaleString("uz-UZ")
const date = (value: string) =>
  new Intl.DateTimeFormat("uz-UZ", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
const cards = computed(() => [
  {
    label: "Foydalanuvchilar",
    value: props.analytics.users.total,
    detail: `+${number(props.analytics.users.new)} yangi`,
    icon: "user-round",
  },
  {
    label: "Davrda kirganlar",
    value: props.analytics.users.active,
    detail: "Unikal foydalanuvchi",
    icon: "trending-up",
  },
  {
    label: "Bizneslar",
    value: props.analytics.businesses.total,
    detail: `${number(props.analytics.businesses.pro)} ta Pro`,
    icon: "building-2",
  },
  {
    label: "Kredit sarfi",
    value: props.analytics.billing.spent_period,
    detail: "Tanlangan davr",
    icon: "credit-card",
  },
])
const secondary = computed(() => [
  { label: "Balanslardagi kredit", value: props.analytics.billing.available },
  { label: "Band qilingan kredit", value: props.analytics.billing.held },
  { label: "7 kunda tugaydigan", value: props.analytics.billing.expiring_7d },
  {
    label: "Berilgan kirish bonusi",
    value: props.analytics.billing.welcome_claims,
  },
])
const actionLabel = (action: string) =>
  ({
    "admin.user_status_changed": "Foydalanuvchi holati o‘zgardi",
    "admin.entitlement_changed": "Biznes tarifi o‘zgardi",
    "admin.billing.setting_changed": "Kredit sozlamasi o‘zgardi",
    "admin.billing.rate_changed": "Xizmat narxi o‘zgardi",
  })[action] ?? action.replaceAll("_", " ")
</script>

<template>
  <div class="space-y-5">
    <section
      class="relative overflow-hidden rounded-[24px] bg-[#202026] px-6 py-7 text-white sm:px-8"
    >
      <div
        class="absolute -right-12 -top-16 h-52 w-52 rounded-full bg-[#7366CA]/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        class="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-end"
      >
        <div>
          <p
            class="text-xs font-bold uppercase tracking-[0.16em] text-[#C9C4EF]"
          >
            Platforma nazorati
          </p>
          <h2 class="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Bir qarashda butun Do‘ppi AI
          </h2>
          <p class="mt-2 max-w-xl text-sm leading-6 text-[#D1D0D8]">
            Foydalanuvchilar, kreditlar va xizmatlar holati — bazadagi real
            ko‘rsatkichlar.
          </p>
        </div>
        <div
          class="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm"
        >
          <span class="block text-[#D1D0D8]">Jami sarflangan kredit</span>
          <strong class="mt-1 block text-2xl tabular-nums">{{
            number(analytics.billing.spent_all_time)
          }}</strong>
        </div>
      </div>
    </section>

    <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <article
        v-for="card in cards"
        :key="card.label"
        class="rounded-[20px] border border-[#E8E8EC] bg-white p-5"
      >
        <div class="flex items-center justify-between gap-3">
          <p class="text-sm font-semibold text-[#6F6F7B]">{{ card.label }}</p>
          <span
            class="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3F1FB] text-[#6558B4]"
            ><CIcon :name="card.icon" class="h-5 w-5"
          /></span>
        </div>
        <strong
          class="mt-3 block text-3xl font-bold tracking-tight tabular-nums text-[#23232B]"
          >{{ number(card.value) }}</strong
        >
        <p class="mt-2 text-xs text-[#858590]">{{ card.detail }}</p>
      </article>
    </div>

    <div class="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)]">
      <CAdminTrend :daily="analytics.daily" />
      <section
        class="rounded-[24px] border border-[#E8E8EC] bg-white p-5 sm:p-7"
      >
        <p class="text-xs font-bold uppercase tracking-[0.14em] text-[#8D8D98]">
          Kredit nazorati
        </p>
        <h2 class="mt-2 text-xl font-bold text-[#23232B]">
          Balans va bonuslar
        </h2>
        <dl class="mt-5 divide-y divide-[#EFEFF2]">
          <div
            v-for="item in secondary"
            :key="item.label"
            class="flex items-center justify-between gap-3 py-4 first:pt-0"
          >
            <dt class="text-sm text-[#6F6F7B]">{{ item.label }}</dt>
            <dd class="font-bold tabular-nums text-[#23232B]">
              {{ number(item.value) }}
            </dd>
          </div>
        </dl>
        <p class="mt-3 text-xs leading-5 text-[#858590]">
          Balans va band qilingan kreditlar joriy hisob holati, bonuslar esa
          tanlangan davr bo‘yicha.
        </p>
      </section>
    </div>

    <section class="rounded-[24px] border border-[#E8E8EC] bg-white p-5 sm:p-7">
      <div class="flex items-center justify-between gap-3">
        <div>
          <p
            class="text-xs font-bold uppercase tracking-[0.14em] text-[#8D8D98]"
          >
            Audit
          </p>
          <h2 class="mt-2 text-xl font-bold text-[#23232B]">
            So‘nggi harakatlar
          </h2>
        </div>
        <CIcon name="shield-check" class="h-5 w-5 text-[#6558B4]" />
      </div>
      <p v-if="!activity.length" class="mt-5 text-sm text-[#858590]">
        Hozircha yozuv yo‘q.
      </p>
      <ol v-else class="mt-3 divide-y divide-[#EFEFF2]">
        <li
          v-for="event in activity.slice(0, 8)"
          :key="event.id"
          class="flex flex-col justify-between gap-1 py-3 text-sm sm:flex-row sm:items-center sm:gap-4"
        >
          <span class="font-medium text-[#33333D]">{{
            actionLabel(event.action)
          }}</span>
          <time
            :datetime="event.occurred_at"
            class="shrink-0 text-xs text-[#858590]"
            >{{ date(event.occurred_at) }}</time
          >
        </li>
      </ol>
    </section>
  </div>
</template>
