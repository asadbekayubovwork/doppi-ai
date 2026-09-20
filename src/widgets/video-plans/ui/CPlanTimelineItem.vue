<script setup lang="ts">
import { computed } from "vue"
import { CPlatformPill, CVideoThumb, type PlanVideo } from "@/entities/video"
import { CBadge, CIcon } from "@/shared/ui"
import { VIDEO_STATE_META } from "../model/plan-state"

const props = defineProps<{
  video: PlanVideo
  active?: boolean
  /** Whether this plan allows editing not-yet-due videos. */
  editable?: boolean
  last?: boolean
}>()

defineEmits<{ select: []; edit: [] }>()

const meta = computed(() => VIDEO_STATE_META[props.video.state])
const canEdit = computed(
  () => props.editable && props.video.state !== "published"
)
</script>

<template>
  <div class="relative flex gap-4">
    <!-- Timeline rail -->
    <div class="flex flex-col items-center">
      <span
        class="grid h-7 w-7 shrink-0 place-items-center rounded-full"
        :class="meta.nodeClass"
      >
        <CIcon
          v-if="meta.node === 'check'"
          name="check"
          class="h-4 w-4"
          stroke-width="2.5"
        />
        <CIcon
          v-else-if="meta.node === 'loader'"
          name="loader-circle"
          class="h-4 w-4 animate-spin"
        />
        <CIcon
          v-else-if="meta.node === 'pencil'"
          name="pencil"
          class="h-3.5 w-3.5"
        />
        <CIcon v-else name="sparkles" class="h-4 w-4" />
      </span>
      <span
        v-if="!last"
        class="mt-1 w-px flex-1 bg-[#E7E5E1]"
        aria-hidden="true"
      />
    </div>

    <!-- Card -->
    <button
      type="button"
      class="mb-3 flex-1 rounded-xl border px-4 py-3.5 text-left transition"
      :class="
        active
          ? 'border-[#C9C0F5] bg-[#F7F6FE] ring-1 ring-[#E0DCF6]'
          : 'border-[#ECECE8] bg-white hover:border-[#DEDEE4] hover:bg-[#FCFCFA]'
      "
      @click="$emit('select')"
    >
      <div class="flex items-start gap-3">
        <CVideoThumb
          v-if="video.state === 'published'"
          :color="video.thumbnail || '#C9A98C'"
          rounded="rounded-lg"
          class="h-11 w-14 shrink-0"
        />
        <span
          v-else
          class="grid h-11 w-14 shrink-0 place-items-center rounded-lg border border-dashed border-[#DEDEE4] bg-[#FAFAF9] text-[#B4B4BC]"
        >
          <CIcon name="film" class="h-5 w-5" />
        </span>

        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-start justify-between gap-2">
            <h3 class="text-[14px] font-semibold text-[#24242A]">
              {{ video.order }}. {{ video.title }}
            </h3>
            <CBadge
              v-if="meta.pill"
              :tone="meta.pill.tone"
              :icon="meta.pill.icon"
              size="sm"
            >
              {{ meta.pill.label }}
            </CBadge>
          </div>
          <p class="mt-1 line-clamp-2 text-[12.5px] leading-5 text-[#73737D]">
            {{ video.brief }}
          </p>

          <div
            class="mt-2.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2"
          >
            <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
              <CPlatformPill :platform="video.platform" />
              <span class="text-[12px] text-[#9A9AA2]">
                {{ video.date }} · {{ video.time }}
              </span>
              <span
                v-if="video.views"
                class="inline-flex items-center gap-1 text-[12px] text-[#9A9AA2]"
              >
                <CIcon name="eye" class="h-3.5 w-3.5" />
                {{ video.views }}
              </span>
            </div>

            <span
              v-if="canEdit"
              class="inline-flex items-center gap-1.5 rounded-lg bg-[#EFECFF] px-2.5 py-1 text-[12px] font-semibold text-[#5B4BE8] transition hover:bg-[#E5E0FF]"
              @click.stop="$emit('edit')"
            >
              <CIcon name="wand-sparkles" class="h-3.5 w-3.5" />
              {{ video.state === "draft" ? "Tahrirlash" : "AI bilan tahrirlash" }}
            </span>
            <span
              v-else-if="video.locked || video.state === 'published'"
              class="inline-flex items-center gap-1 text-[12px] text-[#B4B4BC]"
            >
              <CIcon name="lock" class="h-3.5 w-3.5" />
              Edit yo'q
            </span>
          </div>
        </div>
      </div>
    </button>
  </div>
</template>
