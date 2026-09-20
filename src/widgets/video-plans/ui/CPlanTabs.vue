<script setup lang="ts">
import type { PlanStatus } from "@/entities/video"

defineProps<{
  tabs: ReadonlyArray<{ value: PlanStatus; label: string; count: number }>
}>()

const model = defineModel<PlanStatus>({ required: true })
</script>

<template>
  <div
    class="inline-flex items-center gap-0.5 rounded-[11px] border border-[#E7E5F3] bg-[#F5F4FB] p-0.5"
    role="tablist"
  >
    <button
      v-for="tab in tabs"
      :key="tab.value"
      type="button"
      role="tab"
      :aria-selected="model === tab.value"
      class="inline-flex h-8 items-center gap-2 rounded-[9px] px-3.5 text-[13px] font-semibold transition"
      :class="
        model === tab.value
          ? 'bg-white text-[#15151B] shadow-[0_1px_2px_rgba(22,22,27,0.08)]'
          : 'text-[#73737D] hover:text-[#15151B]'
      "
      @click="model = tab.value"
    >
      {{ tab.label }}
      <span
        class="grid h-5 min-w-5 place-items-center rounded-full px-1 text-[11px] font-bold tabular-nums"
        :class="
          model === tab.value
            ? 'bg-[#EFECFF] text-[#5B4BE8]'
            : 'bg-[#E7E5F3] text-[#8A8A94]'
        "
      >
        {{ tab.count }}
      </span>
    </button>
  </div>
</template>
