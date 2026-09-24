<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { useVideoLabels, type PlanVideo, type WeekPlan } from "@/entities/video"
import { CBadge, CIcon, CIconButton } from "@/shared/ui"
import { PLAN_STATUS_META } from "../model/plan-state"
import CPlanTimelineItem from "./CPlanTimelineItem.vue"

const props = defineProps<{
  plan: WeekPlan
  activeVideoId: string
}>()

defineEmits<{ select: [id: string]; edit: [video: PlanVideo] }>()

const { t } = useI18n()
const { period } = useVideoLabels()
const meta = computed(() => PLAN_STATUS_META[props.plan.status])
// Ongoing plans lock past videos and only allow editing not-yet-due ones;
// upcoming plans are fully editable drafts; done plans are locked.
const editable = computed(() =>
  props.plan.status === "ongoing" || props.plan.status === "upcoming"
)

const editHint = computed(() => {
  const hint = {
    done: "locked",
    ongoing: "upcomingEditable",
    upcoming: "editable",
  }[props.plan.status]
  return t(`dashboard.video.plans.timeline.${hint}`)
})
</script>

<template>
  <section
    class="flex flex-col rounded-2xl border border-[#E5E5E1] bg-white shadow-[0_12px_32px_rgba(22,22,27,0.04)]"
  >
    <header
      class="flex flex-wrap items-start justify-between gap-3 border-b border-[#ECECE8] px-5 py-4 sm:px-6"
    >
      <div>
        <div class="flex flex-wrap items-center gap-2">
          <h2 class="text-[16px] font-semibold text-[#15151B]">
            {{ period(plan.start, plan.week) }}
          </h2>
          <CBadge :tone="meta.tone" :dot="meta.dot">{{ $t(meta.label) }}</CBadge>
          <CBadge
            tone="outline"
            :icon="plan.status === 'done' ? 'lock' : plan.status === 'upcoming' ? 'wand-sparkles' : 'pencil'"
          >
            {{ editHint }}
          </CBadge>
        </div>
        <p class="mt-1.5 text-[12.5px] text-[#8A8A94]">{{ $t(plan.range) }}</p>
      </div>
      <CIconButton
        icon="download"
        :label="$t('dashboard.video.plans.timeline.download')"
        size="sm"
      />
    </header>

    <div class="px-5 py-5 sm:px-6">
      <CPlanTimelineItem
        v-for="(video, index) in plan.videos"
        :key="video.id"
        :video="video"
        :active="video.id === activeVideoId"
        :editable="editable"
        :last="index === plan.videos.length - 1"
        @select="$emit('select', video.id)"
        @edit="$emit('edit', video)"
      />
    </div>

    <footer
      v-if="plan.note"
      class="flex items-center gap-2 rounded-b-2xl border-t border-[#ECECE8] px-5 py-3.5 text-[12.5px] sm:px-6"
      :class="
        plan.status === 'done'
          ? 'bg-[#F0FAF3] text-[#177A46]'
          : 'bg-[#F5F4FB] text-[#5B4BE8]'
      "
    >
      <CIcon
        :name="plan.status === 'done' ? 'circle-check' : 'info'"
        class="h-4 w-4 shrink-0"
      />
      {{ $t(plan.note) }}
    </footer>
  </section>
</template>
