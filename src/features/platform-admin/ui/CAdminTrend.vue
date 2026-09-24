<script setup lang="ts">
import { computed, ref } from "vue"
import type { AdminAnalytics } from "../api/platformAdminApi"

const props = defineProps<{ daily: AdminAnalytics["daily"] }>()
type Metric = "credits_spent" | "new_users" | "usage_events" | "video_jobs"
const metric = ref<Metric>("credits_spent")
const metrics: Array<{ key: Metric; label: string }> = [
  { key: "credits_spent", label: "Kredit sarfi" },
  { key: "new_users", label: "Yangi foydalanuvchi" },
  { key: "usage_events", label: "Xizmat so‘rovlari" },
  { key: "video_jobs", label: "Video buyurtmalar" },
]
const selected = computed(
  () => metrics.find((item) => item.key === metric.value)!
)
const values = computed(() => props.daily.map((day) => day[metric.value]))
const total = computed(() =>
  values.value.reduce((sum, value) => sum + value, 0)
)
const maximum = computed(() => Math.max(1, ...values.value))
const points = computed(() =>
  values.value.map((value, index) => ({
    x: 34 + (index * 600) / Math.max(1, values.value.length - 1),
    y: 140 - (value / maximum.value) * 112,
    value,
    date: props.daily[index]?.date ?? "",
  }))
)
const polyline = computed(() =>
  points.value.map(({ x, y }) => `${x},${y}`).join(" ")
)
const shortDate = (value: string) =>
  new Intl.DateTimeFormat("uz-UZ", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`))
</script>

<template>
  <section class="rounded-[24px] border border-[#E8E8EC] bg-white p-5 sm:p-7">
    <div class="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
      <div>
        <p class="text-xs font-bold uppercase tracking-[0.14em] text-[#8D8D98]">
          Davr dinamikasi
        </p>
        <h2 class="mt-2 text-xl font-bold tracking-tight text-[#23232B]">
          {{ selected.label }}
        </h2>
        <p class="mt-1 text-sm text-[#777782]">
          Tanlangan davrda jami
          <strong class="text-[#282832]">{{
            total.toLocaleString("uz-UZ")
          }}</strong>
        </p>
      </div>
      <div
        class="flex flex-wrap gap-1 rounded-xl bg-[#F5F5F7] p-1"
        aria-label="Grafik ko‘rsatkichi"
      >
        <button
          v-for="option in metrics"
          :key="option.key"
          type="button"
          :aria-pressed="metric === option.key"
          class="min-h-10 rounded-lg px-3 text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5B50A8]"
          :class="
            metric === option.key
              ? 'bg-white text-[#23232B] shadow-sm'
              : 'text-[#777782] hover:text-[#23232B]'
          "
          @click="metric = option.key"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <div
      class="relative mt-6 overflow-hidden rounded-xl bg-[#FBFBFC] px-2 py-3"
    >
      <svg
        viewBox="0 0 668 164"
        class="h-44 w-full"
        role="img"
        :aria-label="`${selected.label}: ${total.toLocaleString('uz-UZ')} jami, ${daily.length} kun`"
        preserveAspectRatio="none"
      >
        <line
          x1="34"
          y1="28"
          x2="634"
          y2="28"
          stroke="#EDEDF0"
          stroke-dasharray="4 6"
        />
        <line
          x1="34"
          y1="84"
          x2="634"
          y2="84"
          stroke="#EDEDF0"
          stroke-dasharray="4 6"
        />
        <line x1="34" y1="140" x2="634" y2="140" stroke="#E2E2E8" />
        <polyline
          v-if="points.length > 1"
          :points="polyline"
          fill="none"
          stroke="#6156B6"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
          vector-effect="non-scaling-stroke"
        />
        <circle
          v-for="point in points.length <= 30 ? points : []"
          :key="point.date"
          :cx="point.x"
          :cy="point.y"
          r="3.5"
          fill="#6156B6"
        >
          <title>{{ shortDate(point.date) }}: {{ point.value }}</title>
        </circle>
      </svg>
      <p
        v-if="total === 0"
        class="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-[#777782]"
      >
        Bu davrda ma’lumot yo‘q
      </p>
    </div>
    <div
      v-if="daily.length"
      class="mt-2 flex justify-between px-3 text-xs font-medium text-[#888893]"
    >
      <span>{{ shortDate(daily[0].date) }}</span>
      <span>{{
        shortDate(daily[Math.floor((daily.length - 1) / 2)].date)
      }}</span>
      <span>{{ shortDate(daily[daily.length - 1].date) }}</span>
    </div>
    <details class="mt-5 border-t border-[#EFEFF2] pt-4 text-sm">
      <summary
        class="cursor-pointer font-semibold text-[#555565] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5B50A8]"
      >
        Kunlik ma’lumotlarni ko‘rish
      </summary>
      <div
        class="mt-3 max-h-56 overflow-auto rounded-xl border border-[#ECECF0]"
      >
        <table class="w-full text-left">
          <thead class="sticky top-0 bg-[#F8F8FA] text-[#777782]">
            <tr>
              <th scope="col" class="px-3 py-2">Sana</th>
              <th scope="col" class="px-3 py-2 text-right">
                {{ selected.label }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#F0F0F2]">
            <tr v-for="day in daily" :key="day.date">
              <th scope="row" class="px-3 py-2 font-medium">
                {{ shortDate(day.date) }}
              </th>
              <td class="px-3 py-2 text-right tabular-nums">
                {{ day[metric].toLocaleString("uz-UZ") }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </details>
  </section>
</template>
