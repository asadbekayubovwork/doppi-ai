<script setup lang="ts">
import type { BillingPeriod } from "../model/plans"

const period = defineModel<BillingPeriod>({ required: true })

const OPTIONS: BillingPeriod[] = ["monthly", "yearly"]
</script>

<template>
  <div
    role="group"
    :aria-label="$t('pricing.period.label')"
    class="inline-flex items-center rounded-full border border-sand-200 bg-white p-1 shadow-[0_1px_2px_rgba(12,10,9,0.04)]"
  >
    <button
      v-for="option in OPTIONS"
      :key="option"
      type="button"
      class="inline-flex h-10 items-center gap-2 rounded-full px-5 text-sm font-medium transition-200"
      :class="
        period === option ? 'bg-sand-950 text-white' : 'text-sand-500 hover:text-sand-950'
      "
      :aria-pressed="period === option"
      @click="period = option"
    >
      {{ $t(`pricing.period.${option}`) }}
      <span
        v-if="option === 'yearly'"
        class="rounded-full px-2 py-0.5 text-xs font-semibold"
        :class="period === option ? 'bg-white/15 text-white' : 'bg-cobalt/10 text-cobalt'"
      >
        {{ $t("pricing.period.yearlyBadge") }}
      </span>
    </button>
  </div>
</template>
