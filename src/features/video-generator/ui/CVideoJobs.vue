<script setup lang="ts">
import { useI18n } from "vue-i18n"
import { formatTimeAgo, useCountLabel } from "@/shared/lib"
import { CAppButton, CBadge, CEmptyState, CIcon, CSkeleton } from "@/shared/ui"
import type { BadgeTone } from "@/shared/ui/types"
import type { VideoJob, VideoJobStatus } from "../api/types"

defineProps<{
  jobs: VideoJob[]
  isLoading: boolean
  isSyncing: boolean
}>()

defineEmits<{
  sync: []
  download: [job: VideoJob]
  preview: [job: VideoJob]
}>()

const { t, locale } = useI18n()
const count = useCountLabel()
const text = (key: string) => t(`dashboard.video.studio.jobs.${key}`)

const STATUS: Record<VideoJobStatus, { tone: BadgeTone; icon: string }> = {
  submitting: { tone: "accent", icon: "upload" },
  submission_failed: { tone: "danger", icon: "triangle-alert" },
  submission_unknown: { tone: "warning", icon: "clock-alert" },
  queued: { tone: "neutral", icon: "timer" },
  processing: { tone: "accent", icon: "sparkles" },
  completed: { tone: "success", icon: "circle-check" },
  failed: { tone: "danger", icon: "triangle-alert" },
}

const eventCount = (job: VideoJob) => {
  const events = job.detail?.events
  return Array.isArray(events) ? events.length : 0
}

const progress = (job: VideoJob) => {
  const value = job.detail?.progress_pct
  return typeof value === "number" && value >= 0 && value <= 100 ? value : null
}
</script>

<template>
  <section
    id="plans"
    class="rounded-2xl border border-[#E5E5E1] bg-white shadow-[0_12px_32px_rgba(22,22,27,0.04)]"
  >
    <header
      class="flex flex-col gap-3 border-b border-[#ECECE8] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
    >
      <div>
        <h2 class="text-[17px] font-semibold text-[#15151B]">
          {{ text("title") }}
        </h2>
        <p class="mt-1 text-[13px] text-[#73737D]">
          {{ text("description") }}
        </p>
      </div>
      <CAppButton
        size="sm"
        icon="refresh-cw"
        :loading="isSyncing"
        @click="$emit('sync')"
      >
        {{ text("sync") }}
      </CAppButton>
    </header>

    <div v-if="isLoading" class="grid gap-3 p-5 sm:p-6">
      <CSkeleton v-for="index in 3" :key="index" class="h-28 rounded-xl" />
    </div>

    <CEmptyState
      v-else-if="!jobs.length"
      class="m-5 sm:m-6"
      icon="clapperboard"
      :title="text('empty')"
      :description="text('emptyDescription')"
    />

    <div v-else class="divide-y divide-[#ECECE8]">
      <article
        v-for="job in jobs"
        :key="job.id"
        class="grid gap-4 px-5 py-5 transition hover:bg-[#FCFCFA] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-6"
      >
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <CBadge
              :tone="STATUS[job.status].tone"
              :icon="STATUS[job.status].icon"
            >
              {{ text(`status.${job.status}`) }}
            </CBadge>
            <span class="text-xs text-[#8A8A94]">
              {{ formatTimeAgo(new Date(job.created_at), Date.now(), locale) }}
            </span>
          </div>
          <h3 class="mt-2 truncate text-[15px] font-semibold text-[#24242A]">
            {{ job.brief.topic }}
          </h3>
          <div
            class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#73737D]"
          >
            <span>{{ job.brief.aspect_ratio || text("autoFormat") }}</span>
            <span>{{
              job.brief.duration_sec
                ? `${job.brief.duration_sec}s`
                : text("autoDuration")
            }}</span>
            <span>{{
              job.brief.language?.toUpperCase() || text("autoLanguage")
            }}</span>
            <span v-if="eventCount(job)">{{
              count("dashboard.plural.updates", eventCount(job))
            }}</span>
          </div>
          <div
            v-if="progress(job) !== null && job.status === 'processing'"
            class="mt-3 h-1.5 max-w-md overflow-hidden rounded-full bg-[#E9E7F8]"
          >
            <div
              class="h-full rounded-full bg-[#5B4BE8] transition-all duration-500"
              :style="{ width: `${progress(job)}%` }"
            />
          </div>
          <p
            v-if="job.error_message"
            class="mt-2 text-xs leading-5 text-[#B42318]"
          >
            {{ job.error_message }}
          </p>
        </div>

        <div class="flex items-center gap-2 sm:justify-end">
          <span
            v-if="job.status === 'processing' || job.status === 'queued'"
            class="inline-flex items-center gap-2 text-xs font-medium text-[#5B4BE8]"
          >
            <CIcon name="refresh-cw" class="h-3.5 w-3.5 animate-spin" />
            {{ text("live") }}
          </span>
          <CAppButton
            v-if="job.status === 'completed'"
            size="sm"
            icon="download"
            @click="$emit('download', job)"
          >
            {{ text("download") }}
          </CAppButton>
          <button
            v-if="job.status === 'completed'"
            type="button"
            :aria-label="text('watchInApp')"
            class="inline-flex h-8 items-center gap-1.5 rounded-[10px] border border-[#E5E5E1] bg-white px-3 text-[13px] font-semibold text-[#15151B] transition hover:border-[#D6D6D1] hover:bg-[#FAFAF9]"
            @click="$emit('preview', job)"
          >
            <CIcon name="play" class="h-3.5 w-3.5" />
            {{ text("watch") }}
          </button>
        </div>
      </article>
    </div>
  </section>
</template>
