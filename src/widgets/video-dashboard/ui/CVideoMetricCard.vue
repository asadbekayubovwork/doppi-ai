<script setup lang="ts">
import type { VideoMetric } from "@/entities/video"
import { CBadge, CIcon } from "@/shared/ui"

defineProps<{ metric: VideoMetric }>()
</script>

<template>
  <article
    class="rounded-2xl border border-[#E5E5E1] bg-white p-5 shadow-[0_12px_32px_rgba(22,22,27,0.04)]"
  >
    <div class="flex items-start justify-between gap-3">
      <p class="text-[13px] leading-5 text-[#73737D]">{{ metric.label }}</p>
      <span
        class="grid h-7 w-7 shrink-0 place-items-center rounded-[9px] bg-[#F2F2EF] text-[#84848E]"
      >
        <CIcon :name="metric.icon" class="h-4 w-4" />
      </span>
    </div>

    <div class="mt-3 flex flex-wrap items-center gap-2.5">
      <span
        class="text-[28px] font-bold leading-none tracking-tight text-[#15151B]"
      >
        {{ metric.value }}
      </span>
      <CBadge
        v-if="metric.change"
        size="sm"
        :tone="metric.changeTone === 'danger' ? 'danger' : metric.changeTone === 'neutral' ? 'neutral' : 'success'"
        :icon="metric.changeTone === 'danger' ? undefined : 'trending-up'"
      >
        {{ metric.change }}
      </CBadge>
    </div>

    <!-- Engagement-style bar -->
    <div v-if="metric.progress !== undefined" class="mt-4">
      <div class="h-2 overflow-hidden rounded-full bg-[#EEEEEA]">
        <div
          class="h-full rounded-full bg-gradient-to-r from-[#57C77E] to-[#2FA05E]"
          :style="{ width: `${Math.round(metric.progress * 100)}%` }"
        />
      </div>
      <p v-if="metric.hint" class="mt-2 text-[11.5px] text-[#9A9AA2]">
        {{ metric.hint }}
      </p>
    </div>

    <!-- Sparkline bars -->
    <div
      v-else-if="metric.spark"
      class="mt-4 flex h-10 items-end gap-1.5"
      aria-hidden="true"
    >
      <span
        v-for="(bar, index) in metric.spark"
        :key="index"
        class="flex-1 rounded-[3px] transition-all"
        :class="index === metric.spark.length - 1 ? 'bg-[#5B4BE8]' : 'bg-[#E9E7F8]'"
        :style="{ height: `${Math.max(14, bar * 100)}%` }"
      />
    </div>
  </article>
</template>
