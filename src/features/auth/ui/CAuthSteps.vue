<script setup lang="ts">
import { CIcon } from "@/shared/ui"

export type AuthStepState = "done" | "active" | "waiting" | "failed" | "skipped"

defineProps<{ steps: { label: string; state: AuthStepState }[] }>()

const STEP_STATES: Record<
  AuthStepState,
  { status: string; badge: string; label: string; tone: string }
> = {
  done: {
    status: "Tayyor",
    badge: "bg-[#ECF8F0] text-[#177A46]",
    label: "text-[#15151B]",
    tone: "font-semibold text-[#177A46]",
  },
  active: {
    status: "Jarayonda",
    badge: "bg-[#EFECFF] text-[#5B4BE8]",
    label: "font-semibold text-[#15151B]",
    tone: "font-semibold text-[#5B4BE8]",
  },
  failed: {
    status: "Xatolik",
    badge: "bg-[#FFF0F0] text-[#C42B2B]",
    label: "font-semibold text-[#15151B]",
    tone: "font-semibold text-[#C42B2B]",
  },
  waiting: {
    status: "Kutilmoqda",
    badge: "bg-[#F2F2EF]",
    label: "text-[#84848E]",
    tone: "text-[#84848E]",
  },
  skipped: {
    status: "Bajarilmadi",
    badge: "bg-[#F2F2EF]",
    label: "text-[#84848E]",
    tone: "text-[#84848E]",
  },
}
</script>

<template>
  <ol
    class="mt-6 rounded-xl border border-[#E5E5E1] bg-white px-3.5 py-2"
    aria-label="Kirish bosqichlari"
  >
    <li
      v-for="step in steps"
      :key="step.label"
      class="flex items-center gap-3 py-[9px]"
    >
      <span
        class="grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full"
        :class="STEP_STATES[step.state].badge"
        aria-hidden="true"
      >
        <CIcon
          v-if="step.state === 'done'"
          name="check"
          :stroke-width="2.5"
          class="h-3 w-3"
        />
        <CIcon
          v-else-if="step.state === 'failed'"
          name="x"
          :stroke-width="2.5"
          class="h-3 w-3"
        />
        <CIcon
          v-else-if="step.state === 'active'"
          name="loader-circle"
          :stroke-width="2.5"
          class="h-3 w-3 motion-safe:animate-spin"
        />
        <span v-else class="h-1.5 w-1.5 rounded-full bg-[#C9C9C4]" />
      </span>
      <span
        class="min-w-0 flex-1 text-[13.5px]"
        :class="STEP_STATES[step.state].label"
        >{{ step.label }}</span
      >
      <span class="shrink-0 text-xs" :class="STEP_STATES[step.state].tone">{{
        STEP_STATES[step.state].status
      }}</span>
    </li>
  </ol>
</template>
