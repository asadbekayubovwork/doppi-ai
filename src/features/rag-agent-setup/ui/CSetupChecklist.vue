<script setup lang="ts">
import { computed } from "vue"
import { CIcon } from "@/shared/ui"
import type { ChecklistItem } from "../model/useAgentSetupForm"
import CSetupSection from "./CSetupSection.vue"

const props = defineProps<{ items: ChecklistItem[] }>()

const progress = computed(() => {
  const required = props.items.filter((item) => !item.optional)
  return `${required.filter((item) => item.done).length}/${required.length}`
})
</script>

<template>
  <CSetupSection :title="$t('dashboard.rag.checklist.title')">
    <template #aside>
      <span class="text-xs tabular-nums text-[#84848E]">
        {{ $t("dashboard.rag.checklist.required", { progress }) }}
      </span>
    </template>

    <ul class="space-y-2.5">
      <li
        v-for="item in items"
        :key="item.key"
        class="flex items-center gap-2.5 text-[13px]"
        :class="
          item.done || !item.optional ? 'text-[#15151B]' : 'text-[#84848E]'
        "
      >
        <span
          class="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full"
          :class="
            item.done
              ? 'bg-[#E7F6EC] text-[#177A46]'
              : 'border border-[#D6D6D1] bg-white'
          "
          aria-hidden="true"
        >
          <CIcon
            v-if="item.done"
            name="check"
            class="h-3 w-3"
            stroke-width="2.5"
          />
        </span>
        <span class="min-w-0 flex-1">
          {{ $t(item.label) }}
          <span class="sr-only">
            — {{ $t(item.done ? "dashboard.common.done" : "dashboard.common.notDone") }}
          </span>
        </span>
        <span
          v-if="!item.done && item.optional"
          class="text-[11px] text-[#A1A1AA]"
        >
          {{ $t("dashboard.common.optional") }}
        </span>
      </li>
    </ul>

    <div class="mt-4 flex gap-2.5 rounded-xl bg-[#F3F1FF] p-3.5">
      <CIcon name="info" class="mt-0.5 h-4 w-4 shrink-0 text-[#5B4BE8]" />
      <div>
        <p class="text-[13px] font-semibold text-[#5B4BE8]">
          {{ $t("dashboard.rag.checklist.noteTitle") }}
        </p>
        <p class="mt-1 text-xs leading-5 text-[#6A6A74]">
          {{ $t("dashboard.rag.checklist.noteText") }}
        </p>
      </div>
    </div>
  </CSetupSection>
</template>
