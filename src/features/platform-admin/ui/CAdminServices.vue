<script setup lang="ts">
import { computed } from "vue"
import { CIcon } from "@/shared/ui"
import type { AdminAnalytics } from "../api/platformAdminApi"

const props = defineProps<{ analytics: AdminAnalytics }>()
const number = (value: number) => value.toLocaleString("uz-UZ")
const serviceName = (service: string) =>
  ({
    rag: "RAG suhbat",
    rag_index: "RAG indeksatsiya",
    video: "Video generator",
    voice: "Ovozli agent",
  })[service] ?? service
const statusName = (status: string) =>
  ({
    completed: "Tayyor",
    failed: "Xato",
    submission_failed: "Yuborish xatosi",
    processing: "Jarayonda",
    queued: "Navbatda",
    submitting: "Yuborilmoqda",
  })[status] ?? status
const orderedStatuses = computed(() =>
  Object.entries(props.analytics.video.statuses).sort((a, b) => b[1] - a[1])
)
const maxEvents = computed(() =>
  Math.max(1, ...props.analytics.services.map((item) => item.events))
)
const usageCount = computed(() =>
  props.analytics.services.reduce((sum, item) => sum + item.events, 0)
)
const completed = computed(() => props.analytics.video.statuses.completed ?? 0)
const failed = computed(
  () =>
    (props.analytics.video.statuses.failed ?? 0) +
    (props.analytics.video.statuses.submission_failed ?? 0)
)
const date = (value: string) =>
  new Intl.DateTimeFormat("uz-UZ", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
</script>

<template>
  <div class="space-y-5">
    <div class="grid gap-3 sm:grid-cols-3">
      <article class="rounded-[20px] border border-[#E8E8EC] bg-white p-5">
        <CIcon name="chart-line" class="h-5 w-5 text-[#6558B4]" />
        <p class="mt-4 text-sm text-[#71717D]">
          Hisoblangan xizmat ishlatishlari
        </p>
        <strong class="mt-1 block text-3xl tabular-nums text-[#24242C]">{{
          number(usageCount)
        }}</strong>
      </article>
      <article class="rounded-[20px] border border-[#E8E8EC] bg-white p-5">
        <CIcon name="circle-play" class="h-5 w-5 text-[#6558B4]" />
        <p class="mt-4 text-sm text-[#71717D]">Video buyurtmalar</p>
        <strong class="mt-1 block text-3xl tabular-nums text-[#24242C]">{{
          number(analytics.video.total)
        }}</strong>
      </article>
      <article class="rounded-[20px] border border-[#E8E8EC] bg-white p-5">
        <CIcon name="circle-check" class="h-5 w-5 text-[#34775F]" />
        <p class="mt-4 text-sm text-[#71717D]">Tayyor videolar</p>
        <strong class="mt-1 block text-3xl tabular-nums text-[#24242C]">{{
          number(completed)
        }}</strong>
        <span class="mt-1 block text-xs text-[#858590]"
          >{{ number(failed) }} ta xato</span
        >
      </article>
    </div>

    <div class="grid gap-5 xl:grid-cols-2">
      <section
        class="rounded-[24px] border border-[#E8E8EC] bg-white p-5 sm:p-7"
      >
        <p class="text-xs font-bold uppercase tracking-[0.14em] text-[#8D8D98]">
          Servislar kesimida
        </p>
        <h2 class="mt-2 text-xl font-bold text-[#24242C]">
          Ishlatish va kredit sarfi
        </h2>
        <p class="mt-1 text-sm text-[#858590]">
          Faqat yakunlangan, hisoblangan ishlatishlar.
        </p>
        <p
          v-if="!analytics.services.length"
          class="mt-6 text-sm text-[#858590]"
        >
          Bu davrda xizmat ishlatilmagan.
        </p>
        <ul v-else class="mt-6 space-y-6">
          <li v-for="service in analytics.services" :key="service.service">
            <div class="flex items-center justify-between gap-3 text-sm">
              <span class="font-semibold text-[#34343E]">{{
                serviceName(service.service)
              }}</span>
              <span class="shrink-0 tabular-nums text-[#71717D]"
                >{{ number(service.events) }} marta ·
                {{ number(service.credits) }} kredit</span
              >
            </div>
            <div
              class="mt-2 h-2.5 overflow-hidden rounded-full bg-[#F0EFF7]"
              role="meter"
              :aria-label="`${serviceName(service.service)} ishlatishlar`"
              :aria-valuenow="service.events"
              aria-valuemin="0"
              :aria-valuemax="maxEvents"
            >
              <div
                class="h-full rounded-full bg-[#7163BD]"
                :style="{ width: `${(service.events / maxEvents) * 100}%` }"
              />
            </div>
          </li>
        </ul>
      </section>
      <section
        class="rounded-[24px] border border-[#E8E8EC] bg-white p-5 sm:p-7"
      >
        <p class="text-xs font-bold uppercase tracking-[0.14em] text-[#8D8D98]">
          Video generator
        </p>
        <h2 class="mt-2 text-xl font-bold text-[#24242C]">
          Buyurtmalar holati
        </h2>
        <p class="mt-1 text-sm text-[#858590]">
          Buyurtma yaratilgan sanasi bo‘yicha.
        </p>
        <p v-if="!orderedStatuses.length" class="mt-6 text-sm text-[#858590]">
          Bu davrda video buyurtma yo‘q.
        </p>
        <dl v-else class="mt-5 divide-y divide-[#EFEFF2]">
          <div
            v-for="[status, count] in orderedStatuses"
            :key="status"
            class="flex items-center justify-between gap-4 py-3"
          >
            <dt class="flex items-center gap-2 text-sm text-[#555560]">
              <span
                class="h-2 w-2 rounded-full"
                :class="
                  status === 'completed'
                    ? 'bg-emerald-600'
                    : status.includes('failed')
                      ? 'bg-red-600'
                      : 'bg-amber-500'
                "
              />
              {{ statusName(status) }}
            </dt>
            <dd class="font-bold tabular-nums text-[#24242C]">
              {{ number(count) }}
            </dd>
          </div>
        </dl>
      </section>
    </div>

    <div class="grid gap-5 xl:grid-cols-2">
      <section
        class="rounded-[24px] border border-[#E8E8EC] bg-white p-5 sm:p-7"
      >
        <p class="text-xs font-bold uppercase tracking-[0.14em] text-[#8D8D98]">
          Faol bizneslar
        </p>
        <h2 class="mt-2 text-xl font-bold text-[#24242C]">
          Eng ko‘p kredit sarflaganlar
        </h2>
        <p
          v-if="!analytics.top_businesses.length"
          class="mt-5 text-sm text-[#858590]"
        >
          Hozircha sarf qayd etilmagan.
        </p>
        <div v-else class="mt-4 overflow-x-auto">
          <table class="w-full min-w-[340px] text-left text-sm">
            <thead class="text-xs text-[#858590]">
              <tr>
                <th scope="col" class="pb-3 font-semibold">Biznes</th>
                <th scope="col" class="pb-3 text-right font-semibold">
                  So‘rov
                </th>
                <th scope="col" class="pb-3 text-right font-semibold">
                  Kredit
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#EFEFF2]">
              <tr
                v-for="business in analytics.top_businesses"
                :key="business.id"
              >
                <th
                  scope="row"
                  class="max-w-[190px] truncate py-3 font-semibold text-[#34343E]"
                >
                  {{ business.name }}
                </th>
                <td class="py-3 text-right tabular-nums text-[#71717D]">
                  {{ number(business.events) }}
                </td>
                <td
                  class="py-3 text-right font-bold tabular-nums text-[#24242C]"
                >
                  {{ number(business.credits) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <section
        class="rounded-[24px] border border-[#E8E8EC] bg-white p-5 sm:p-7"
      >
        <p class="text-xs font-bold uppercase tracking-[0.14em] text-[#8D8D98]">
          Muammolar
        </p>
        <h2 class="mt-2 text-xl font-bold text-[#24242C]">
          Oxirgi video xatolari
        </h2>
        <p
          v-if="!analytics.video.recent_failures.length"
          class="mt-5 text-sm text-[#858590]"
        >
          Bu davrda xato qayd etilmagan.
        </p>
        <ol v-else class="mt-3 divide-y divide-[#EFEFF2]">
          <li
            v-for="job in analytics.video.recent_failures"
            :key="job.id"
            class="flex justify-between gap-4 py-3 text-sm"
          >
            <div class="min-w-0">
              <p class="truncate font-semibold text-[#34343E]">
                {{ job.business_name }}
              </p>
              <p class="mt-1 text-xs text-red-700">
                {{ statusName(job.status) }}
              </p>
            </div>
            <time
              :datetime="job.updated_at"
              class="shrink-0 text-xs text-[#858590]"
              >{{ date(job.updated_at) }}</time
            >
          </li>
        </ol>
      </section>
    </div>
  </div>
</template>
