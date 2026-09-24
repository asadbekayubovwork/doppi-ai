<script setup lang="ts">
import { computed } from "vue"
import {
  CPlatformPill,
  CVideoThumb,
  useVideoLabels,
  type PlanVideo,
} from "@/entities/video"
import { CAppButton, CIcon } from "@/shared/ui"

const props = defineProps<{ video: PlanVideo; planTitle: string }>()

defineEmits<{ editScript: [] }>()

const { day } = useVideoLabels()
const isPublished = computed(() => props.video.state === "published")
const kind = computed(() =>
  isPublished.value ? "video" : props.video.state === "draft" ? "draft" : "scheduled"
)
const isProcessing = computed(() => props.video.state === "processing")

// Static engagement figures for the published preview.
const STATS = [
  { icon: "eye", label: "views", value: "480K" },
  { icon: "heart", label: "likes", value: "38K" },
  { icon: "message-circle", label: "comments", value: "1.2K" },
  { icon: "share-2", label: "shares", value: "4.1K" },
]
</script>

<template>
  <section
    class="rounded-2xl border border-[#E5E5E1] bg-white p-5 shadow-[0_12px_32px_rgba(22,22,27,0.04)]"
  >
    <header class="flex items-center justify-between gap-2">
      <h2 class="text-[14px] font-semibold text-[#15151B]">
        {{ day(video.date) }} ·
        {{ $t(`dashboard.video.plans.detail.kind.${kind}`) }}
      </h2>
      <CPlatformPill :platform="video.platform" :channel="true" />
    </header>

    <!-- Preview -->
    <CVideoThumb
      v-if="isPublished"
      :color="video.thumbnail || '#2B3A67'"
      play
      duration="0:18"
      class="mt-3 aspect-video w-full"
    />
    <div
      v-else
      class="mt-3 flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#DEDEE4] bg-[#FAFAF9] text-center"
    >
      <CIcon
        :name="isProcessing ? 'loader-circle' : 'clock'"
        class="h-7 w-7 text-[#B4B4BC]"
        :class="isProcessing ? 'animate-spin' : ''"
      />
      <p class="px-4 text-[12.5px] text-[#9A9AA2]">
        {{
          $t(
            isProcessing
              ? "dashboard.video.plans.detail.generating"
              : "dashboard.video.plans.detail.notGenerated"
          )
        }}
      </p>
    </div>

    <h3 class="mt-3 text-[15px] font-semibold text-[#15151B]">
      {{ video.title }}
    </h3>
    <p class="mt-0.5 text-[12px] text-[#8A8A94]">
      {{
        $t("dashboard.video.plans.detail.meta", {
          date: day(video.date),
          time: video.time,
          plan: planTitle,
          order: video.order,
        })
      }}
    </p>

    <!-- Published stats -->
    <dl v-if="isPublished" class="mt-4 grid grid-cols-4 gap-2">
      <div
        v-for="stat in STATS"
        :key="stat.label"
        class="rounded-xl border border-[#EEEEEA] bg-[#FCFCFB] px-2 py-2.5 text-center"
      >
        <dt class="flex justify-center text-[#9A9AA2]">
          <CIcon :name="stat.icon" class="h-4 w-4" />
        </dt>
        <dd class="mt-1 text-[14px] font-bold tabular-nums text-[#15151B]">
          {{ stat.value }}
        </dd>
        <dd class="text-[10.5px] text-[#9A9AA2]">
          {{ $t(`dashboard.video.plans.detail.stats.${stat.label}`) }}
        </dd>
      </div>
    </dl>

    <!-- Locked notice for not-yet-due videos -->
    <p
      v-else
      class="mt-4 flex items-start gap-2 rounded-xl bg-[#FEF6E9] px-3 py-2.5 text-[12px] leading-4 text-[#B45309]"
    >
      <CIcon name="lock" class="mt-0.5 h-3.5 w-3.5 shrink-0" />
      {{
        $t(
          video.state === "draft"
            ? "dashboard.video.plans.detail.lockedDraft"
            : "dashboard.video.plans.detail.lockedScheduled"
        )
      }}
    </p>

    <!-- Actions -->
    <div class="mt-4 grid grid-cols-2 gap-2">
      <CAppButton icon="external-link" :disabled="!isPublished">
        {{ $t("dashboard.video.plans.detail.openReels") }}
      </CAppButton>
      <CAppButton icon="download" :disabled="!isPublished">
        {{ $t("dashboard.video.plans.detail.download") }}
      </CAppButton>
    </div>
    <CAppButton
      v-if="!isPublished"
      variant="primary"
      icon="wand-sparkles"
      class="mt-2 w-full"
      @click="$emit('editScript')"
    >
      {{ $t("dashboard.video.plans.detail.editScript") }}
    </CAppButton>
  </section>
</template>
