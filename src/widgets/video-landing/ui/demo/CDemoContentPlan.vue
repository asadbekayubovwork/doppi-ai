<script setup lang="ts">
import { useI18nList } from "@/shared/lib"
import { CIcon, CAppWindow } from "@/shared/ui"

interface Summary {
  icon: string
  value: string
  label: string
}

interface PlanRow {
  day: string
  date: string
  topic: string
  format: string
  time: string
  status: string
  tone: "success" | "accent" | "warning"
}

// Step 01: the week the agent proposed, waiting for one approval.
const base = "services.video.landing.demo.plan"
const summary = useI18nList<Summary>(`${base}.summary`)
const rows = useI18nList<PlanRow>(`${base}.rows`)

const STATUS_CLASS: Record<PlanRow["tone"], string> = {
  success: "bg-[#E6F4EC] text-[#177A46]",
  accent: "bg-[#EFECFF] text-[#5B4BE8]",
  warning: "bg-[#FCF1E0] text-[#B45309]",
}

const COLUMNS = "grid-cols-[84px_minmax(0,1fr)_70px_48px_90px]"
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
          class="flex items-center gap-1.5 rounded-full border border-[#E5E5E1] bg-[#FAFAF9] px-2.5 py-1 text-[11.5px] font-medium text-[#6A6A74]"
        >
          <CIcon name="calendar-days" class="h-3 w-3" />
          {{ $t(`${base}.week`) }}
        </span>
      </span>

      <span
        class="flex items-center gap-1.5 rounded-lg bg-[#15151B] px-3.5 py-2 text-[12.5px] font-medium text-white"
      >
        <CIcon name="check" class="h-3.5 w-3.5" stroke-width="2.5" />
        {{ $t(`${base}.approve`) }}
      </span>
    </div>

    <!-- What the week adds up to -->
    <div class="grid grid-cols-1 gap-2.5 px-[18px] pb-3.5 sm:grid-cols-3">
      <span
        v-for="item in summary"
        :key="item.label"
        class="flex items-center gap-2.5 rounded-xl border border-[#E5E5E1] bg-[#FAFAF9] px-3 py-2.5"
      >
        <CIcon :name="item.icon" class="h-4 w-4 shrink-0 text-[#6A6A74]" />
        <span class="flex min-w-0 flex-col">
          <span class="truncate text-[13px] font-semibold text-[#15151B]">{{
            item.value
          }}</span>
          <span class="text-[11px] text-[#84848E]">{{ item.label }}</span>
        </span>
      </span>
    </div>

    <div class="overflow-x-auto">
      <div class="min-w-[520px]">
        <div
          class="grid gap-3 border-y border-[#E5E5E1] bg-[#FAFAF9] px-[18px] py-[9px] text-[10.5px] font-semibold tracking-[0.6px] text-[#84848E]"
          :class="COLUMNS"
        >
          <span>{{ $t(`${base}.cols.day`) }}</span>
          <span>{{ $t(`${base}.cols.topic`) }}</span>
          <span>{{ $t(`${base}.cols.format`) }}</span>
          <span>{{ $t(`${base}.cols.time`) }}</span>
          <span>{{ $t(`${base}.cols.status`) }}</span>
        </div>

        <div
          v-for="row in rows"
          :key="row.day"
          class="grid items-center gap-3 border-b border-[#F0F0EC] px-[18px] py-2.5"
          :class="COLUMNS"
        >
          <span class="flex flex-col">
            <span class="text-[12.5px] font-semibold text-[#15151B]">{{
              row.day
            }}</span>
            <span class="text-[11px] text-[#84848E]">{{ row.date }}</span>
          </span>
          <span class="truncate text-[13px] text-[#15151B]">{{
            row.topic
          }}</span>
          <span class="whitespace-nowrap text-xs text-[#6A6A74]">{{
            row.format
          }}</span>
          <span class="whitespace-nowrap text-xs text-[#6A6A74]">{{
            row.time
          }}</span>
          <span>
            <span
              class="inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold"
              :class="STATUS_CLASS[row.tone]"
            >
              {{ row.status }}
            </span>
          </span>
        </div>
      </div>
    </div>

    <div
      class="flex flex-wrap items-center justify-between gap-2 bg-[#FAFAF9] px-[18px] py-3"
    >
      <span class="text-xs text-[#84848E]">{{ $t(`${base}.footer`) }}</span>
      <span
        class="flex items-center gap-1.5 text-xs font-medium text-[#177A46]"
      >
        <CIcon name="zap" class="h-[13px] w-[13px]" />
        {{ $t(`${base}.auto`) }}
      </span>
    </div>
  </CAppWindow>
</template>
