<script setup lang="ts">
import type { PlanStatus } from "@/entities/video"
import { CBadge, CIcon, CIconButton } from "@/shared/ui"
import { PLAN_RAIL_TITLE, PLAN_STATUS_META } from "../model/plan-state"

export interface RailEntry {
  id: string
  title: string
  range: string
  status: PlanStatus
  progress: string
  views?: string
}

defineProps<{
  status: PlanStatus
  activeId: string
  entries: RailEntry[]
  /** Optional footnote shown under the active entry (e.g. auto-transition). */
  note?: string
}>()

defineEmits<{ select: [id: string] }>()
</script>

<template>
  <aside
    class="flex flex-col rounded-2xl border border-[#E5E5E1] bg-white shadow-[0_12px_32px_rgba(22,22,27,0.04)]"
  >
    <header
      class="flex items-center justify-between border-b border-[#ECECE8] px-4 py-3.5"
    >
      <h2 class="text-[14px] font-semibold text-[#15151B]">
        {{ $t(PLAN_RAIL_TITLE[status]) }}
      </h2>
      <CIconButton
        icon="list-filter"
        :label="$t('dashboard.video.plans.filter')"
        variant="ghost"
        size="sm"
      />
    </header>

    <ul class="p-2">
      <li v-for="(entry, index) in entries" :key="entry.id">
        <button
          type="button"
          class="w-full rounded-xl px-3 py-3 text-left transition"
          :class="
            entry.id === activeId
              ? 'bg-[#F5F4FB] ring-1 ring-[#E0DCF6]'
              : 'hover:bg-[#FAFAF9]'
          "
          @click="$emit('select', entry.id)"
        >
          <div class="flex items-center justify-between gap-2">
            <span class="text-[13.5px] font-semibold text-[#24242A]">
              {{ entry.title }}
            </span>
            <CBadge
              :tone="PLAN_STATUS_META[entry.status].tone"
              :dot="PLAN_STATUS_META[entry.status].dot"
              size="sm"
            >
              {{ $t(PLAN_STATUS_META[entry.status].label) }}
            </CBadge>
          </div>
          <div
            class="mt-1.5 flex items-center justify-between text-[12px] text-[#8A8A94]"
          >
            <span>{{ entry.range }}</span>
            <span class="inline-flex items-center gap-3">
              <span class="inline-flex items-center gap-1 tabular-nums">
                <CIcon name="film" class="h-3.5 w-3.5" />
                {{ entry.progress }}
              </span>
              <span
                v-if="entry.views"
                class="inline-flex items-center gap-1 tabular-nums"
              >
                <CIcon name="eye" class="h-3.5 w-3.5" />
                {{ entry.views }}
              </span>
            </span>
          </div>
        </button>

        <p
          v-if="note && entry.id === activeId && index === 0"
          class="mx-3 mb-1 mt-1 flex items-start gap-2 rounded-lg bg-[#FEF6E9] px-2.5 py-2 text-[11.5px] leading-4 text-[#B45309]"
        >
          <CIcon name="refresh-cw" class="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {{ note }}
        </p>
      </li>
    </ul>
  </aside>
</template>
