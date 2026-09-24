<script setup lang="ts">
import { useI18n } from "vue-i18n"
import { usePageHeading } from "@/shared/lib"
import {
  CHANNEL_SHARES,
  RECOMMENDATIONS,
  TOP_VIDEOS,
  VIDEO_METRICS,
  WEEK_PLANS,
} from "@/entities/video"
import {
  CChannelBreakdown,
  CRecommendations,
  CTopVideosTable,
  CVideoMetricCard,
  CWeeklyPlanCard,
} from "@/widgets/video-dashboard"

const { t } = useI18n()

usePageHeading(() => ({
  subtitle: t("dashboard.video.dashboard.subtitle", {
    videos: 186,
    published: 142,
    views: "2.4M",
  }),
}))

// The ongoing week drives the "Bu haftaning plani" card.
const ongoingPlan = WEEK_PLANS.find((plan) => plan.status === "ongoing")!
</script>

<template>
  <div class="mx-auto grid max-w-[1400px] gap-5">
    <!-- KPI cards -->
    <section class="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <CVideoMetricCard
        v-for="metric in VIDEO_METRICS"
        :key="metric.id"
        :metric="metric"
      />
    </section>

    <!-- Table + right rail -->
    <div class="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <CTopVideosTable :videos="TOP_VIDEOS" />
      <div class="grid gap-5">
        <CChannelBreakdown :channels="CHANNEL_SHARES" />
        <CWeeklyPlanCard
          :plan="ongoingPlan"
          :next-post="$t('dashboard.video.dashboard.tomorrowAt', { time: '18:00' })"
        />
      </div>
    </div>

    <!-- Recommendations -->
    <CRecommendations :items="RECOMMENDATIONS" />
  </div>
</template>
