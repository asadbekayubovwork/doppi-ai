<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { CVideoPlayer, CVideoThumb } from "@/entities/video"
import type { VideoJob } from "@/features/video-generator"
import { CAppButton, CBadge, CIcon } from "@/shared/ui"
import { formatClockTime } from "@/shared/lib"

const props = defineProps<{
  /** Newest job, or null before anything has been generated. */
  job: VideoJob | null
  /** Same-origin playback URL for a completed job. */
  playbackUrl: string | null
  /** 0–100 pipeline progress for an active job. */
  progress: number | null
  /** True while the create request itself is in flight. */
  isSubmitting: boolean
}>()

defineEmits<{ publish: []; download: []; regenerate: [] }>()

const { t } = useI18n()
const text = (key: string) => t(`dashboard.video.studio.result.${key}`)

const ACTIVE = new Set(["submitting", "queued", "processing"])

const phase = computed<"idle" | "active" | "completed" | "failed">(() => {
  if (props.isSubmitting) return "active"
  const status = props.job?.status
  if (!status) return "idle"
  if (status === "completed") return "completed"
  if (ACTIVE.has(status)) return "active"
  return "failed"
})

// Status line shown under the spinner while the pipeline runs.
const LABELLED_STATUSES = new Set([
  "submitting",
  "queued",
  "processing",
  "submission_unknown",
])
const statusLabel = computed(() => {
  if (props.isSubmitting) return text("sending")
  const status = props.job?.status ?? ""
  return LABELLED_STATUSES.has(status)
    ? text(`status.${status}`)
    : text("preparing")
})

// The pipeline emits a step name with each event; the newest is the live one.
const currentStep = computed(() => {
  const events = props.job?.detail?.events
  if (!Array.isArray(events) || !events.length) return null
  const last = events[events.length - 1] as { label?: string; step?: string }
  return last.label || last.step || null
})

const meta = computed(() => {
  const brief = props.job?.brief
  const created = props.job?.created_at
  const parts: string[] = []
  if (created) parts.push(formatClockTime(created))
  if (brief?.duration_sec) parts.push(`${brief.duration_sec}s`)
  if (brief?.aspect_ratio) parts.push(brief.aspect_ratio)
  return parts.join(" · ")
})

const title = computed(() => props.job?.brief?.topic || text("untitled"))

const PIPELINE = ["script", "shots", "montage", "voice"] as const
</script>

<template>
  <section
    class="flex flex-col rounded-2xl border border-[#E5E5E1] bg-white shadow-[0_12px_32px_rgba(22,22,27,0.04)]"
  >
    <header
      class="flex items-center justify-between border-b border-[#ECECE8] px-5 py-4"
    >
      <div class="flex items-center gap-2">
        <h2 class="text-[15px] font-semibold text-[#15151B]">
          {{ text("title") }}
        </h2>
        <CBadge v-if="phase === 'completed'" tone="success" icon="circle-check">
          {{ text("ready") }}
        </CBadge>
        <CBadge
          v-else-if="phase === 'active'"
          tone="accent"
          icon="loader-circle"
        >
          {{ text("creating") }}
        </CBadge>
        <CBadge
          v-else-if="phase === 'failed'"
          tone="danger"
          icon="triangle-alert"
        >
          {{ text("error") }}
        </CBadge>
      </div>
      <span v-if="meta" class="text-[12px] text-[#9A9AA2]">{{ meta }}</span>
    </header>

    <div class="flex flex-1 flex-col items-center px-5 py-6">
      <div class="w-full max-w-[300px]">
        <!-- Completed: real player -->
        <CVideoPlayer
          v-if="phase === 'completed' && playbackUrl"
          :src="playbackUrl"
          class="aspect-[9/16] w-full border-4 border-[#15151B]/5 shadow-[0_20px_50px_-20px_rgba(21,21,27,0.5)]"
        />

        <!-- Active: animated progress placeholder -->
        <CVideoThumb
          v-else-if="phase === 'active'"
          color="#5B4BE8"
          rounded="rounded-[24px]"
          class="aspect-[9/16] w-full border-4 border-[#15151B]/5"
        >
          <div class="flex w-full flex-col items-center gap-3 px-6 text-white">
            <CIcon name="loader-circle" class="h-9 w-9 animate-spin" />
            <span class="text-[13px] font-medium">{{ statusLabel }}</span>
            <span
              v-if="currentStep"
              class="rounded-full bg-white/15 px-2.5 py-1 text-[11px]"
            >
              {{ currentStep }}
            </span>
            <!-- Progress bar (falls back to indeterminate shimmer) -->
            <div
              class="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/20"
            >
              <div
                v-if="progress !== null"
                class="h-full rounded-full bg-white transition-all duration-500"
                :style="{ width: `${progress}%` }"
              />
              <div
                v-else
                class="h-full w-1/3 animate-pulse rounded-full bg-white/70"
              />
            </div>
            <span v-if="progress !== null" class="text-[11px] text-white/80">
              {{ progress }}%
            </span>
          </div>
        </CVideoThumb>

        <!-- Failed -->
        <CVideoThumb
          v-else-if="phase === 'failed'"
          color="#C42B2B"
          rounded="rounded-[24px]"
          class="aspect-[9/16] w-full border-4 border-[#15151B]/5"
        >
          <div
            class="flex flex-col items-center gap-2 px-6 text-center text-white"
          >
            <CIcon name="triangle-alert" class="h-8 w-8" />
            <span class="text-[12.5px]">
              {{ job?.error_message || text("failed") }}
            </span>
          </div>
        </CVideoThumb>

        <!-- Idle -->
        <div
          v-else
          class="flex aspect-[9/16] w-full flex-col items-center justify-center gap-3 rounded-[24px] border border-dashed border-[#DEDEE4] bg-[#FAFAF9] px-6 text-center"
        >
          <span
            class="grid h-12 w-12 place-items-center rounded-2xl bg-[#EFECFF] text-[#5B4BE8]"
          >
            <CIcon name="wand-sparkles" class="h-6 w-6" />
          </span>
          <p class="text-[13px] text-[#73737D]">
            {{ text("idle") }}
          </p>
        </div>

        <div v-if="phase !== 'idle'" class="mt-4 text-center">
          <h3 class="text-[15px] font-semibold text-[#15151B]">{{ title }}</h3>
          <p v-if="meta" class="mt-0.5 text-[12px] text-[#8A8A94]">
            {{ meta }}
          </p>
        </div>
      </div>

      <!-- Actions (only once something has been generated this session) -->
      <div
        v-if="phase !== 'idle'"
        class="mt-5 w-full max-w-[340px] space-y-2.5"
      >
        <CAppButton
          v-if="phase !== 'failed'"
          variant="primary"
          icon="send"
          class="w-full"
          :disabled="phase !== 'completed'"
          @click="$emit('publish')"
        >
          {{ text("publish") }}
        </CAppButton>
        <div class="grid grid-cols-2 gap-2.5">
          <CAppButton
            v-if="phase !== 'failed'"
            icon="download"
            :disabled="phase !== 'completed'"
            @click="$emit('download')"
          >
            {{ text("download") }}
          </CAppButton>
          <CAppButton
            icon="refresh-cw"
            :class="phase === 'failed' ? 'col-span-2' : 'col-span-1'"
            :disabled="phase === 'active'"
            @click="$emit('regenerate')"
          >
            {{ text(phase === "failed" ? "retry" : "regenerate") }}
          </CAppButton>
        </div>
      </div>
    </div>

    <!-- Pipeline checklist -->
    <footer
      class="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-[#ECECE8] px-5 py-3.5"
    >
      <span
        v-for="step in PIPELINE"
        :key="step"
        class="inline-flex items-center gap-1.5 text-[12.5px] font-medium"
        :class="phase === 'completed' ? 'text-[#177A46]' : 'text-[#9A9AA2]'"
      >
        <CIcon
          :name="phase === 'completed' ? 'circle-check' : 'circle-dot'"
          class="h-4 w-4"
          :class="phase === 'active' ? 'animate-pulse text-[#5B4BE8]' : ''"
        />
        {{ text(`pipeline.${step}`) }}
      </span>
    </footer>
  </section>
</template>
