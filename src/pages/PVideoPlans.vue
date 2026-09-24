<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import { formatDayRange, formatMonthName, formatWeekdays, usePageHeading } from "@/shared/lib"
import {
  CALENDAR_DAYS,
  PLAN_HISTORY,
  SCRIPT_CONVERSATION,
  SCRIPT_CURRENT,
  SCRIPT_PROPOSED,
  WEEK_PLANS,
  useVideoLabels,
  type PlanHistoryEntry,
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

const { t, locale } = useI18n()
const { period } = useVideoLabels()

// The demo plans cover September 2026; the calendar and headings follow them.
const MONTH = "2026-09-01"
const monthYear = computed(() =>
  formatMonthName(MONTH, locale.value, { withYear: true })
)
const weekdays = computed(() => formatWeekdays(locale.value))

usePageHeading(() => ({
  subtitle: t("dashboard.video.plans.subtitle", { month: monthYear.value }),
}))

// ── Tab state ──────────────────────────────────────────────────────────────
const status = ref<PlanStatus>("ongoing")
const TABS = computed(() =>
  (["done", "ongoing", "upcoming"] as PlanStatus[]).map((value) => ({
    value,
    label: t(`dashboard.video.planStatus.${value}`),
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
const toEntry = (plan: PlanHistoryEntry): RailEntry => ({
  id: plan.id,
  title: period(plan.start, plan.week),
  range: formatDayRange(plan.start, plan.end, locale.value),
  status: plan.status,
  progress: plan.progress,
  views: plan.views,
})

const activeTitle = computed(() =>
  period(activePlan.value.start, activePlan.value.week)
)

const railEntries = computed<RailEntry[]>(() => {
  if (status.value === "done") {
    return [
      ...WEEK_PLANS.filter((plan) => plan.status === "done").map(toEntry),
      ...PLAN_HISTORY.map(toEntry),
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
  const entry = (key: string, color: string) => ({
    label: t(`dashboard.video.plans.legend.${key}`),
    class: color,
  })
  if (status.value === "upcoming") {
    return [
      entry("newPlan", "bg-[#B45309]"),
      entry("currentWeek", "bg-[#5B4BE8]"),
      entry("completed", "bg-[#B4B4BC]"),
    ]
  }
  if (status.value === "ongoing") {
    return [
      entry("published", "bg-[#5B4BE8]"),
      entry("plannedInactive", "bg-[#D97706]"),
      entry("otherPlan", "bg-[#B4B4BC]"),
    ]
  }
  return [
    entry("publishedVideo", "bg-[#5B4BE8]"),
    entry("otherPlan", "bg-[#B4B4BC]"),
  ]
})

const monthSummary = computed(() => [
  { label: t("dashboard.video.plans.summary.published"), value: "12" },
  { label: t("dashboard.video.plans.summary.views"), value: "2.4M" },
  { label: t("dashboard.video.plans.summary.er"), value: "8.4%", accent: true },
])

const researchInsights = computed(() =>
  [
    { icon: "trending-up", key: "trendAudio" },
    { icon: "user-round", key: "ugc" },
    { icon: "clock", key: "bestTime" },
  ].map(({ icon, key }) => ({
    icon,
    text: t(`dashboard.video.demo.insights.${key}`),
  }))
)

const railNote = computed(() =>
  status.value === "done"
    ? undefined
    : t(`dashboard.video.demo.railNote.${status.value}`)
)
</script>

<template>
  <div class="mx-auto grid max-w-[1500px] gap-5">
    <!-- Approval banner (upcoming only) -->
    <CPlanApprovalBanner
      v-if="status === 'upcoming'"
      :title="$t('dashboard.video.demo.approvalTitle')"
      :subtitle="$t('dashboard.video.demo.approvalSubtitle')"
    />

    <!-- Title row + tabs -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-[#15151B]">
          {{ $t("dashboard.video.plans.title") }}
        </h1>
        <p class="mt-1 text-[13.5px] text-[#73737D]">
          {{ $t("dashboard.video.plans.description") }}
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
        :note="railNote"
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
          :title="monthYear"
          :weekdays="weekdays"
          :days="CALENDAR_DAYS"
          :legend="legend"
        />
        <CPlanVideoDetail
          :video="activeVideo"
          :plan-title="activeTitle"
          @edit-script="openScript(activeVideo)"
        />
        <CPlanSummaryCard
          v-if="status === 'upcoming'"
          :title="$t('dashboard.video.plans.summary.research')"
          :bullets="researchInsights"
        />
        <CPlanSummaryCard
          v-else
          :title="
            $t('dashboard.video.plans.summary.monthResults', {
              month: formatMonthName(MONTH, locale),
            })
          "
          :rows="monthSummary"
        />
      </div>
    </div>

    <CScriptEditorModal
      v-model:open="scriptOpen"
      :video="scriptVideo"
      :plan-title="activeTitle"
      :conversation="SCRIPT_CONVERSATION"
      :current-script="SCRIPT_CURRENT"
      :proposed-script="SCRIPT_PROPOSED"
      @approve="scriptOpen = false"
    />
  </div>
</template>
