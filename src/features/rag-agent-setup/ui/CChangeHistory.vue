<script setup lang="ts">
import { CIcon } from "@/shared/ui"
import type { ChangeHistoryEntry } from "../model/change-history"
import CSetupSection from "./CSetupSection.vue"

defineProps<{
  entries: ChangeHistoryEntry[]
  /** Warning shown under the list, e.g. while documents are embedding. */
  notice?: string | null
}>()

const TONES: Record<ChangeHistoryEntry["tone"], string> = {
  warning: "bg-[#FFF1E0] text-[#B45309]",
  accent: "bg-[#EFECFF] text-[#5B4BE8]",
  neutral: "bg-[#F2F2EF] text-[#6A6A74]",
}
</script>

<template>
  <CSetupSection
    title="Change history"
    hint="Unsaved edits, this visit's actions and the live version"
  >
    <ul class="space-y-3.5">
      <li
        v-for="entry in entries"
        :key="entry.key"
        class="flex items-start gap-3"
      >
        <span
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px]"
          :class="TONES[entry.tone]"
          aria-hidden="true"
        >
          <CIcon :name="entry.icon" class="h-4 w-4" />
        </span>
        <div class="min-w-0 flex-1">
          <p class="truncate text-[13.5px] font-medium text-[#15151B]">
            {{ entry.title }}
          </p>
          <p v-if="entry.detail" class="truncate text-xs text-[#84848E]">
            {{ entry.detail }}
          </p>
        </div>
        <span class="shrink-0 pt-0.5 text-xs tabular-nums text-[#84848E]">
          {{ entry.time }}
        </span>
      </li>
    </ul>

    <p
      v-if="notice"
      class="mt-4 flex gap-2.5 rounded-xl bg-[#FFF1E0] p-3.5 text-xs leading-5 text-[#B45309]"
    >
      <CIcon name="refresh-cw" class="mt-0.5 h-4 w-4 shrink-0" />
      {{ notice }}
    </p>
  </CSetupSection>
</template>
