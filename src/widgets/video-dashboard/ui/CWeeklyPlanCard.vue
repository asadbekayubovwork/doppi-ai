<script setup lang="ts">
import { computed } from "vue"
import type { WeekPlan } from "@/entities/video"
import { CAppButton, CBadge, CIcon } from "@/shared/ui"

const props = defineProps<{ plan: WeekPlan; nextPost?: string }>()

const ratio = computed(() =>
  props.plan.total ? props.plan.produced / props.plan.total : 0
)
</script>

<template>
  <section
    class="rounded-2xl border border-[#E5E5E1] bg-white p-5 shadow-[0_12px_32px_rgba(22,22,27,0.04)]"
  >
    <h2 class="text-[15px] font-semibold text-[#15151B]">Bu haftaning plani</h2>

    <div class="mt-4 flex items-start justify-between gap-3">
      <div class="flex items-start gap-2.5">
        <span
          class="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-[#EFECFF] text-[#5B4BE8]"
        >
          <CIcon name="calendar-days" class="h-[18px] w-[18px]" />
        </span>
        <div>
          <p class="text-[14px] font-semibold text-[#15151B]">
            {{ plan.title }}
          </p>
          <p class="mt-0.5 text-[12px] text-[#8A8A94]">{{ plan.range }}</p>
        </div>
      </div>
      <CBadge tone="accent" dot>Ongoing</CBadge>
    </div>

    <div class="mt-4">
      <div class="flex items-center justify-between text-[12.5px]">
        <span class="text-[#73737D]">Chiqarilgan videolar</span>
        <span class="font-semibold tabular-nums text-[#15151B]">
          {{ plan.progress }}
        </span>
      </div>
      <div class="mt-2 h-2 overflow-hidden rounded-full bg-[#EEEEEA]">
        <div
          class="h-full rounded-full bg-[#5B4BE8] transition-all"
          :style="{ width: `${Math.round(ratio * 100)}%` }"
        />
      </div>
    </div>

    <div
      v-if="nextPost"
      class="mt-4 flex items-center gap-2 rounded-xl border border-[#EEEEEA] bg-[#FAFAF9] px-3 py-2.5 text-[12.5px] text-[#55555F]"
    >
      <CIcon name="clock" class="h-4 w-4 text-[#84848E]" />
      Keyingi post · {{ nextPost }}
    </div>

    <CAppButton
      variant="primary"
      icon="calendar-days"
      class="mt-4 w-full"
      :to="{ name: 'VideoPlans' }"
    >
      Planni ochish
    </CAppButton>
  </section>
</template>
