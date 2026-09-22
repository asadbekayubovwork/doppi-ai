<script setup lang="ts">
import { useI18nList } from "@/shared/lib"
import { CIcon } from "@/shared/ui"
import CAppWindow from "./CAppWindow.vue"

interface Field {
  label: string
  value: string
}

// Step 04: what the manager finds in the CRM once the call has ended.
const base = "services.voice.landing.demo.result"
const fields = useI18nList<Field>(`${base}.fields`)

// A recording scrubbed to roughly a third: the played part carries the accent.
const BARS = [
  6, 11, 18, 9, 14, 22, 12, 7, 16, 20, 10, 24, 13, 8, 18, 11, 21, 15, 9, 12, 19,
  7, 14, 22, 10, 16, 8, 13, 20, 11, 17, 9, 12, 6, 15, 21, 8, 11, 18, 10,
]
const PLAYED = 16
</script>

<template>
  <CAppWindow :title="$t(`${base}.window`)" :label="$t(`${base}.alt`)">
    <div class="flex flex-col gap-3.5 p-[18px]">
      <!-- Contact -->
      <div class="flex flex-wrap items-center justify-between gap-3">
        <span class="flex items-center gap-2.5">
          <span
            class="h-10 w-10 rounded-full bg-gradient-to-br from-[#5B4BE8] to-[#B6ABFF]"
          />
          <span class="flex flex-col gap-0.5">
            <span
              class="text-base font-semibold tracking-[-0.3px] text-[#15151B]"
            >
              {{ $t(`${base}.name`) }}
            </span>
            <span class="text-[12.5px] text-[#6A6A74]">{{
              $t(`${base}.meta`)
            }}</span>
          </span>
        </span>

        <span
          class="flex items-center gap-1.5 rounded-full bg-[#E6F4EC] px-3 py-1.5 text-[12.5px] font-semibold text-[#177A46]"
        >
          <CIcon name="calendar-check" class="h-3.5 w-3.5" />
          {{ $t(`${base}.status`) }}
        </span>
      </div>

      <!-- What the agent booked -->
      <div
        class="flex flex-col gap-3.5 rounded-xl border border-[#BFE3CE] bg-[#E6F4EC] p-4"
      >
        <div class="flex flex-wrap items-center justify-between gap-3">
          <span class="flex items-center gap-2.5">
            <span
              class="grid h-9 w-9 place-items-center rounded-full bg-[#177A46] text-white"
            >
              <CIcon name="stethoscope" class="h-[18px] w-[18px]" />
            </span>
            <span class="flex flex-col gap-0.5">
              <span
                class="text-[15px] font-semibold tracking-[-0.2px] text-[#0E5A33]"
              >
                {{ $t(`${base}.apptTitle`) }}
              </span>
              <span class="text-xs text-[#3D7A58]">{{
                $t(`${base}.apptSub`)
              }}</span>
            </span>
          </span>

          <span class="flex flex-col items-end">
            <span
              class="text-[28px] font-bold leading-none tracking-[-1px] text-[#0E5A33]"
            >
              10:00
            </span>
            <span class="mt-1 text-[11.5px] text-[#3D7A58]">{{
              $t(`${base}.date`)
            }}</span>
          </span>
        </div>

        <span class="h-px w-full bg-[#C6E6D4]" />

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <span
            v-for="field in fields"
            :key="field.label"
            class="flex flex-col gap-1"
          >
            <span
              class="text-[10.5px] font-semibold tracking-[0.6px] text-[#4F8A69]"
            >
              {{ field.label }}
            </span>
            <span class="text-[13px] font-medium leading-[18px] text-[#0E5A33]">
              {{ field.value }}
            </span>
          </span>
        </div>
      </div>

      <!-- AI summary -->
      <div
        class="flex flex-col gap-1.5 rounded-xl border border-[#E5E5E1] bg-[#FAFAF9] p-3.5"
      >
        <span
          class="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[1px] text-[#5B4BE8]"
        >
          <CIcon name="sparkles" class="h-3.5 w-3.5" />
          {{ $t(`${base}.aiLabel`) }}
        </span>
        <span class="text-[13px] leading-5 text-[#6A6A74]">{{
          $t(`${base}.aiText`)
        }}</span>
      </div>

      <!-- Recording -->
      <div
        class="flex flex-wrap items-center gap-3 rounded-xl border border-[#E5E5E1] px-3.5 py-[11px]"
      >
        <span
          class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#15151B] text-white"
        >
          <CIcon name="play" class="h-3.5 w-3.5" />
        </span>

        <span class="flex h-[26px] flex-1 items-center gap-0.5 overflow-hidden">
          <span
            v-for="(height, i) in BARS"
            :key="i"
            class="w-[3px] shrink-0 rounded-full"
            :class="i < PLAYED ? 'bg-[#5B4BE8]' : 'bg-[#D6D6D1]'"
            :style="{ height: `${height}px` }"
          />
        </span>

        <span class="text-[12.5px] font-medium text-[#6A6A74]">01:12</span>
        <span
          class="flex items-center gap-1.5 rounded-lg border border-[#E5E5E1] bg-[#FAFAF9] px-[11px] py-[7px] text-[12.5px] text-[#6A6A74]"
        >
          <CIcon name="file-text" class="h-[13px] w-[13px]" />
          {{ $t(`${base}.transcript`) }}
        </span>
      </div>
    </div>
  </CAppWindow>
</template>
