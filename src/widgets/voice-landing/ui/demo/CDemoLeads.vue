<script setup lang="ts">
import { useI18nList } from "@/shared/lib"
import { CIcon } from "@/shared/ui"
import CAppWindow from "./CAppWindow.vue"

interface Lead {
  name: string
  phone: string
  source: string
  time: string
  status: string
  tone: "accent" | "warning" | "success"
}

// Step 02: the same lead, a second later, sitting at the top of the CRM queue.
const base = "services.voice.landing.demo.leads"
const rows = useI18nList<Lead>(`${base}.rows`)

const STATUS_CLASS: Record<Lead["tone"], string> = {
  accent: "bg-[#EFECFF] text-[#5B4BE8]",
  warning: "bg-[#FCF1E0] text-[#B45309]",
  success: "bg-[#E6F4EC] text-[#177A46]",
}
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
          {{ $t(`${base}.badge`) }}
        </span>
      </span>

      <span class="flex items-center gap-2">
        <span
          v-for="tool in [
            { icon: 'search', label: $t(`${base}.search`) },
            { icon: 'list-filter', label: $t(`${base}.filter`) },
          ]"
          :key="tool.icon"
          class="flex items-center gap-1.5 rounded-lg border border-[#E5E5E1] px-[11px] py-[7px] text-[12.5px] text-[#6A6A74]"
        >
          <CIcon :name="tool.icon" class="h-3.5 w-3.5 text-[#84848E]" />
          {{ tool.label }}
        </span>
      </span>
    </div>

    <div class="overflow-x-auto">
      <div class="min-w-[540px]">
        <div
          class="grid grid-cols-[1.5fr_1.2fr_0.9fr_0.9fr_0.9fr] gap-3 border-y border-[#E5E5E1] bg-[#FAFAF9] px-[18px] py-[9px] text-[11px] font-semibold tracking-[0.6px] text-[#84848E]"
        >
          <span>{{ $t(`${base}.cols.name`) }}</span>
          <span>{{ $t(`${base}.cols.phone`) }}</span>
          <span>{{ $t(`${base}.cols.source`) }}</span>
          <span>{{ $t(`${base}.cols.time`) }}</span>
          <span>{{ $t(`${base}.cols.status`) }}</span>
        </div>

        <div
          v-for="(row, i) in rows"
          :key="row.phone"
          class="grid grid-cols-[1.5fr_1.2fr_0.9fr_0.9fr_0.9fr] items-center gap-3 border-b border-[#F0F0EC] px-[18px] py-3"
          :class="i === 0 ? 'bg-[#EFECFF]' : 'bg-white'"
        >
          <span class="flex items-center gap-2.5">
            <span
              class="h-[26px] w-[26px] shrink-0 rounded-full"
              :class="i === 0 ? 'bg-[#5B4BE8]' : 'bg-[#D8D8D3]'"
            />
            <span
              class="truncate text-[13px] text-[#15151B]"
              :class="i === 0 ? 'font-semibold' : 'font-medium'"
            >
              {{ row.name }}
            </span>
          </span>
          <span class="whitespace-nowrap text-[13px] text-[#6A6A74]">{{
            row.phone
          }}</span>
          <span class="truncate text-[13px] text-[#6A6A74]">{{
            row.source
          }}</span>
          <span class="whitespace-nowrap text-[13px] text-[#84848E]">{{
            row.time
          }}</span>
          <span>
            <span
              class="inline-flex rounded-full px-2.5 py-1 text-[11.5px] font-semibold"
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
        {{ $t(`${base}.webhook`) }}
      </span>
    </div>
  </CAppWindow>
</template>
