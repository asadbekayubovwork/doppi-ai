<script setup lang="ts">
import type { CalendarDay } from "@/entities/video"
import { CIconButton } from "@/shared/ui"

defineProps<{
  title: string
  weekdays: string[]
  days: CalendarDay[]
  /** Legend entries shown under the grid. */
  legend: ReadonlyArray<{ label: string; class: string }>
}>()

const MARKER_CLASS: Record<NonNullable<CalendarDay["marker"]>, string> = {
  published: "bg-[#5B4BE8]",
  plan: "bg-[#B45309]",
  scheduled: "bg-[#D97706]",
  other: "bg-[#B4B4BC]",
}
</script>

<template>
  <section
    class="rounded-2xl border border-[#E5E5E1] bg-white p-5 shadow-[0_12px_32px_rgba(22,22,27,0.04)]"
  >
    <header class="flex items-center justify-between">
      <h2 class="text-[15px] font-semibold text-[#15151B]">{{ title }}</h2>
      <div class="flex items-center gap-1">
        <CIconButton
          icon="chevron-left"
          :label="$t('dashboard.video.plans.calendar.previous')"
          variant="ghost"
          size="sm"
        />
        <CIconButton
          icon="chevron-right"
          :label="$t('dashboard.video.plans.calendar.next')"
          variant="ghost"
          size="sm"
        />
      </div>
    </header>

    <div class="mt-4 grid grid-cols-7 gap-1 text-center">
      <span
        v-for="weekday in weekdays"
        :key="weekday"
        class="pb-1 text-[11px] font-semibold text-[#9A9AA2]"
      >
        {{ weekday }}
      </span>

      <template v-for="(cell, index) in days" :key="index">
        <span v-if="cell.day === 0" aria-hidden="true" />
        <span
          v-else
          class="relative mx-auto flex h-9 w-9 flex-col items-center justify-center rounded-[10px] text-[13px] transition"
          :class="[
            cell.today
              ? 'bg-[#5B4BE8] font-bold text-white'
              : cell.inRange
                ? 'bg-[#EFECFF] font-semibold text-[#5B4BE8]'
                : 'font-medium text-[#42424B] hover:bg-[#FAFAF9]',
          ]"
        >
          {{ cell.day }}
          <span
            v-if="cell.marker && !cell.today"
            class="absolute bottom-1 h-1 w-1 rounded-full"
            :class="MARKER_CLASS[cell.marker]"
            aria-hidden="true"
          />
        </span>
      </template>
    </div>

    <ul class="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-[#ECECE8] pt-3">
      <li
        v-for="item in legend"
        :key="item.label"
        class="inline-flex items-center gap-1.5 text-[11.5px] text-[#73737D]"
      >
        <span class="h-1.5 w-1.5 rounded-full" :class="item.class" />
        {{ item.label }}
      </li>
    </ul>
  </section>
</template>
