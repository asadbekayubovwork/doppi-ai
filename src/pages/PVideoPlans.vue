<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useHead } from "@unhead/vue"
import { usePageHeading } from "@/shared/lib"
import {
  CALENDAR_DAYS,
  CALENDAR_WEEKDAYS,
  PLAN_HISTORY,
  SCRIPT_CONVERSATION,
  SCRIPT_CURRENT,
  SCRIPT_PROPOSED,
  WEEK_PLANS,
  type PlanStatus,
  type PlanVideo,
} from "@/entities/video"
import {
  CPlanApprovalBanner,
  CPlanCalendar,
  CPlanRail,
  CPlanSummaryCard,
  CPlanTabs,
  CPlanTimeline,
  CPlanVideoDetail,
  CScriptEditorModal,
  type RailEntry,
} from "@/widgets/video-plans"

useHead({ title: "Plans — Do'ppi AI" })
usePageHeading(() => ({ subtitle: "Haftalik kontent rejalari · Sentabr 2026" }))

// ── Tab state ──────────────────────────────────────────────────────────────
const status = ref<PlanStatus>("ongoing")
const TABS = computed(() =>
  (["done", "ongoing", "upcoming"] as PlanStatus[]).map((value) => ({
    value,
    label: value === "done" ? "Done" : value === "ongoing" ? "Ongoing" : "Upcoming",
    count: WEEK_PLANS.filter((plan) => plan.status === value).length,
  }))
)

const activePlan = computed(
  () => WEEK_PLANS.find((plan) => plan.status === status.value) ?? WEEK_PLANS[0]
)

// ── Selected video (right rail detail) ───────────────────────────────────────
const activeVideoId = ref("")
watch(
  activePlan,
  (plan) => {
    // Prefer the most recent published video, else the first one.
    const published = [...plan.videos].reverse().find((v) => v.state === "published")
    activeVideoId.value = (published ?? plan.videos[0]).id
  },
  { immediate: true }
)
const activeVideo = computed(
  () =>
    activePlan.value.videos.find((video) => video.id === activeVideoId.value) ??
    activePlan.value.videos[0]
)

// ── Left rail entries ────────────────────────────────────────────────────────
const toEntry = (plan: (typeof WEEK_PLANS)[number]): RailEntry => ({
  id: plan.id,
  title: plan.title,
  range: plan.range.split(" · ")[0] ?? plan.range,
  status: plan.status,
  progress: plan.progress,
  views: plan.views,
})

const railEntries = computed<RailEntry[]>(() => {
  if (status.value === "done") {
    return [
      ...WEEK_PLANS.filter((plan) => plan.status === "done").map(toEntry),
      ...PLAN_HISTORY,
    ]
  }
  // Ongoing / upcoming: active plan on top, then the rest for context.
  const active = activePlan.value
  const rest = WEEK_PLANS.filter((plan) => plan.id !== active.id)
  return [active, ...rest].map(toEntry)
})

// ── Script editor modal ──────────────────────────────────────────────────────
const scriptOpen = ref(false)
const scriptVideo = ref<PlanVideo | null>(null)
const openScript = (video: PlanVideo) => {
  scriptVideo.value = video
  scriptOpen.value = true
}

// ── Calendar legend varies by tab ────────────────────────────────────────────
const legend = computed(() => {
  if (status.value === "upcoming") {
    return [
      { label: "yangi reja", class: "bg-[#B45309]" },
      { label: "joriy hafta", class: "bg-[#5B4BE8]" },
      { label: "yakunlangan", class: "bg-[#B4B4BC]" },
    ]
  }
  if (status.value === "ongoing") {
    return [
      { label: "chiqarilgan", class: "bg-[#5B4BE8]" },
      { label: "rejada · faol emas", class: "bg-[#D97706]" },
      { label: "boshqa plan", class: "bg-[#B4B4BC]" },
    ]
  }
  return [
    { label: "chiqarilgan video", class: "bg-[#5B4BE8]" },
    { label: "boshqa plan", class: "bg-[#B4B4BC]" },
  ]
})

const septemberSummary = [
  { label: "Chiqarilgan video", value: "12" },
  { label: "Umumiy ko'rish", value: "2.4M" },
  { label: "O'rtacha ER", value: "8.4%", accent: true },
]

const researchInsights = [
  { icon: "trending-up", text: "Trend audio ishlatilgan videolar ↑ 42%" },
  { icon: "user-round", text: "UGC formatlari eng yuqori ER beryapti" },
  { icon: "clock", text: "Eng samarali vaqt: 18:00–20:00" },
]
</script>

<template>
  <div class="mx-auto grid max-w-[1500px] gap-5">
    <!-- Approval banner (upcoming only) -->
    <CPlanApprovalBanner
      v-if="status === 'upcoming'"
      title="Yangi haftalik plan tayyor — tasdiqlashingizni kutmoqda"
      subtitle="Agentlar 11-sentabr (juma) research asosida tuzdi · 15-sentabr dushanba 00:00 da avtomatik ishga tushadi"
    />

    <!-- Title row + tabs -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-[#15151B]">Plans</h1>
        <p class="mt-1 text-[13.5px] text-[#73737D]">
          Agentlar tizimi har hafta uchun kontent rejasini tuzadi
        </p>
      </div>
      <CPlanTabs v-model="status" :tabs="TABS" />
    </div>

    <!-- Three-column workspace -->
    <div
      class="grid items-start gap-5 xl:grid-cols-[300px_minmax(0,1fr)_340px]"
    >
      <CPlanRail
        :status="status"
        :active-id="activePlan.id"
        :entries="railEntries"
        :note="
          status === 'upcoming'
            ? '15-sentabr dushanbada avtomatik ishga tushadi'
            : status === 'ongoing'
              ? '14-sentabr yakunlanganda plan avtomatik Done bo\'ladi'
              : undefined
        "
        @select="() => {}"
      />

      <CPlanTimeline
        :plan="activePlan"
        :active-video-id="activeVideoId"
        @select="activeVideoId = $event"
        @edit="openScript"
      />

      <div class="grid gap-5">
        <CPlanCalendar
          title="Sentabr 2026"
          :weekdays="CALENDAR_WEEKDAYS"
          :days="CALENDAR_DAYS"
          :legend="legend"
        />
        <CPlanVideoDetail
          :video="activeVideo"
          :plan-title="activePlan.title"
          @edit-script="openScript(activeVideo)"
        />
        <CPlanSummaryCard
          v-if="status === 'upcoming'"
          title="Research xulosasi"
          :bullets="researchInsights"
        />
        <CPlanSummaryCard
          v-else
          title="Sentabr yakunlari"
          :rows="septemberSummary"
        />
      </div>
    </div>

    <CScriptEditorModal
      v-model:open="scriptOpen"
      :video="scriptVideo"
      :plan-title="activePlan.title"
      :conversation="SCRIPT_CONVERSATION"
      :current-script="SCRIPT_CURRENT"
      :proposed-script="SCRIPT_PROPOSED"
      @approve="scriptOpen = false"
    />
  </div>
</template>
