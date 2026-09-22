<script setup lang="ts">
import { useI18nList } from "@/shared/lib"
import { CIcon, CAppWindow } from "@/shared/ui"
import thumbMon from "@/shared/assets/png/vg-thumb-mon.jpg"
import thumbTue from "@/shared/assets/png/vg-thumb-tue.jpg"
import thumbWed from "@/shared/assets/png/vg-thumb-wed.jpg"

interface QueueVideo {
  day: string
  duration: string
  status: string
  tone: "success" | "accent" | "muted"
}

interface Stage {
  label: string
  state: "done" | "active" | "todo"
}

// Step 02: the week being produced — three done, one on the editing bench.
const base = "services.video.landing.demo.queue"
const videos = useI18nList<QueueVideo>(`${base}.videos`)
const stages = useI18nList<Stage>(`${base}.job.stages`)

// Only the finished videos have a frame to show; the rest are still renders.
const THUMBS = [thumbMon, thumbTue, thumbWed]

const STATUS_CLASS: Record<QueueVideo["tone"], string> = {
  success: "text-[#177A46]",
  accent: "text-[#5B4BE8]",
  muted: "text-[#84848E]",
}

const STAGE_CLASS: Record<Stage["state"], string> = {
  done: "bg-[#E6F4EC] text-[#177A46]",
  active: "bg-[#EFECFF] text-[#5B4BE8]",
  todo: "border border-[#E5E5E1] bg-white text-[#84848E]",
}

const STAGE_ICON: Record<Stage["state"], string> = {
  done: "check",
  active: "loader-circle",
  todo: "circle-dashed",
}

const DONE_PERCENT = 57
</script>

<template>
  <CAppWindow :title="$t(`${base}.window`)" :label="$t(`${base}.alt`)">
    <div
      class="flex flex-wrap items-center justify-between gap-3 px-[18px] py-4"
    >
      <span class="flex items-center gap-2.5">
        <span class="text-base font-semibold tracking-[-0.3px] text-[#15151B]">
          {{ $t(`${base}.title`) }}
        </span>
        <span
          class="flex items-center gap-1.5 rounded-full bg-[#EFECFF] px-2.5 py-1 text-[11.5px] font-semibold text-[#5B4BE8]"
        >
          <span class="h-1.5 w-1.5 rounded-full bg-[#5B4BE8]" />
          {{ $t(`${base}.live`) }}
        </span>
      </span>
      <span class="text-[12.5px] text-[#84848E]">{{ $t(`${base}.week`) }}</span>
    </div>

    <!-- How much of the week is done -->
    <div class="flex flex-col gap-2 px-[18px] pb-3.5">
      <span class="flex flex-wrap items-center justify-between gap-2">
        <span class="text-[13px] font-medium text-[#6A6A74]">
          {{ $t(`${base}.progressLabel`) }}
        </span>
        <span class="text-[13px] font-semibold text-[#15151B]">
          {{ $t(`${base}.progressValue`) }}
        </span>
      </span>
      <span class="h-[7px] w-full overflow-hidden rounded-full bg-[#E5E5E1]">
        <span
          class="block h-full rounded-full bg-[#5B4BE8]"
          :style="{ width: `${DONE_PERCENT}%` }"
        />
      </span>
    </div>

    <!-- One card per day of the plan -->
    <div class="overflow-x-auto px-[18px] pb-4">
      <div class="flex min-w-[500px] gap-[9px]">
        <span
          v-for="(video, i) in videos"
          :key="video.day"
          class="flex min-w-0 flex-1 flex-col gap-1.5"
        >
          <span
            class="relative flex aspect-[9/16] flex-col justify-between overflow-hidden rounded-[10px] p-[7px]"
            :class="THUMBS[i] ? '' : 'border border-[#E9E8E4] bg-[#F3F2EE]'"
          >
            <img
              v-if="THUMBS[i]"
              :src="THUMBS[i]"
              alt=""
              class="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
            <CIcon
              :name="THUMBS[i] ? 'instagram' : 'loader-circle'"
              class="relative h-[13px] w-[13px]"
              :class="THUMBS[i] ? 'text-white' : 'text-[#A8A8B0]'"
            />
            <span
              class="relative w-fit rounded-full bg-black/45 px-1.5 py-px text-[9px] font-semibold text-white"
            >
              {{ video.duration }}
            </span>
          </span>
          <span class="text-center text-[11.5px] font-semibold text-[#15151B]">
            {{ video.day }}
          </span>
          <span
            class="text-center text-[9.5px] font-medium leading-tight"
            :class="STATUS_CLASS[video.tone]"
          >
            {{ video.status }}
          </span>
        </span>
      </div>
    </div>

    <!-- The job on the bench right now -->
    <div class="flex flex-col gap-3 bg-[#FAFAF9] px-[18px] py-3.5">
      <span class="flex flex-wrap items-center justify-between gap-2">
        <span class="flex min-w-0 items-center gap-2">
          <CIcon
            name="wand-sparkles"
            class="h-[15px] w-[15px] shrink-0 text-[#5B4BE8]"
          />
          <span class="truncate text-[13.5px] font-semibold text-[#15151B]">
            {{ $t(`${base}.job.title`) }}
          </span>
        </span>
        <span class="whitespace-nowrap text-xs text-[#84848E]">{{
          $t(`${base}.job.eta`)
        }}</span>
      </span>

      <span class="flex flex-wrap items-center gap-2">
        <span
          v-for="stage in stages"
          :key="stage.label"
          class="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[11px] font-medium"
          :class="STAGE_CLASS[stage.state]"
        >
          <CIcon :name="STAGE_ICON[stage.state]" class="h-3 w-3" />
          {{ stage.label }}
        </span>
      </span>
    </div>

    <div
      class="flex flex-wrap items-center justify-between gap-2 border-t border-[#E5E5E1] px-[18px] py-3"
    >
      <span class="text-xs text-[#84848E]">{{ $t(`${base}.footer`) }}</span>
      <span
        class="flex items-center gap-1.5 text-xs font-medium text-[#6A6A74]"
      >
        <CIcon name="instagram" class="h-[13px] w-[13px]" />
        {{ $t(`${base}.account`) }}
      </span>
    </div>
  </CAppWindow>
</template>
