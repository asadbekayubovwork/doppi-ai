<script setup lang="ts">
import { useCountLabel } from "@/shared/lib"
import { CIcon } from "@/shared/ui"
import { PLANS, formatUsd, monthlyPrice, type BillingPeriod } from "../model/plans"

withDefaults(
  defineProps<{
    period?: BillingPeriod
    /** Fade the cards in on scroll, as on the landing; a dialog shows them at once. */
    animated?: boolean
  }>(),
  { period: "monthly" }
)

const count = useCountLabel()

const aos = (index: number) => ({
  "data-aos": "fade-up",
  "data-aos-duration": 800,
  "data-aos-delay": 100 + index * 90,
})
</script>

<template>
  <div class="grid grid-cols-1 items-stretch gap-5 md:grid-cols-3">
    <div
      v-for="(plan, i) in PLANS"
      :key="plan.id"
      class="relative"
      v-bind="animated ? aos(i) : {}"
    >
      <div v-if="plan.badge" class="absolute -top-3.5 left-1/2 z-20 -translate-x-1/2">
        <span
          class="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1 text-xs font-semibold"
          :class="
            plan.featured
              ? 'bg-sand-950 text-white shadow-[0_4px_16px_-4px_rgba(12,10,9,0.4)]'
              : 'border border-sand-200 bg-white text-sand-700'
          "
        >
          <CIcon
            :name="plan.featured ? 'sparkles' : 'gauge'"
            class="h-3 w-3"
            stroke-width="2.5"
          />
          {{ $t(`pricing.badges.${plan.badge}`) }}
        </span>
      </div>

      <div
        class="surface-card surface-card-lift flex h-full flex-col rounded-2xl p-6"
        :class="plan.featured ? 'surface-card-accent' : ''"
      >
        <h3 class="text-lg font-semibold text-sand-950">
          {{ $t(`pricing.plans.${plan.id}.name`) }}
        </h3>
        <p class="mt-2 min-h-[40px] text-sm text-sand-500">
          {{ $t(`pricing.plans.${plan.id}.tagline`) }}
        </p>

        <div class="mt-5 flex items-baseline gap-1">
          <Transition name="price" mode="out-in">
            <span :key="period" class="text-4xl font-bold tabular-nums text-sand-950">
              {{ formatUsd(monthlyPrice(plan, period)) }}
            </span>
          </Transition>
          <span class="text-sm text-sand-500">{{ $t("pricing.period.perMonth") }}</span>
        </div>
        <p class="mt-1 text-xs text-sand-500">
          {{
            period === "yearly"
              ? $t("pricing.period.billedYearly", {
                  total: formatUsd(monthlyPrice(plan, period) * 12),
                })
              : $t("pricing.period.billedMonthly")
          }}
        </p>

        <div class="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl bg-sand-50 px-4 py-3">
          <CIcon name="zap" class="h-4 w-4 shrink-0 text-cobalt" stroke-width="2.25" />
          <span class="text-sm font-semibold text-sand-950">
            {{
              $t("pricing.creditsPerMonth", { credits: count("pricing.credits", plan.credits) })
            }}
          </span>
          <span
            v-if="plan.bonusPercent"
            class="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-sand-700"
          >
            {{ $t("pricing.bonus", { percent: plan.bonusPercent }) }}
          </span>
        </div>

        <RouterLink
          :to="plan.to"
          class="mt-5 flex h-12 w-full items-center justify-center rounded-xl font-medium transition-300"
          :class="
            plan.featured
              ? 'bg-sand-950 text-white shadow-[0_10px_28px_-10px_rgba(12,10,9,0.55)] hover:bg-sand-800'
              : 'border border-sand-200 bg-white text-sand-950 hover:bg-sand-100'
          "
        >
          {{ $t(`pricing.plans.${plan.id}.cta`) }}
        </RouterLink>

        <div class="my-6 h-px bg-sand-200" />

        <ul class="flex-1 space-y-3">
          <li
            v-for="feature in plan.features"
            :key="feature.id"
            class="flex items-start gap-2.5 text-sm"
            :class="feature.included ? 'text-sand-700' : 'text-sand-500'"
          >
            <CIcon
              :name="feature.included ? 'check' : 'x'"
              class="mt-0.5 h-4 w-4 shrink-0"
              :class="feature.included ? 'text-sand-950' : 'text-sand-300'"
              stroke-width="2.25"
            />
            <span>
              <span v-if="!feature.included" class="sr-only">
                {{ $t("pricing.notIncluded") }}:
              </span>
              {{ $t(`pricing.plans.${plan.id}.features.${feature.id}`) }}
            </span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.price-enter-active,
.price-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.price-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.price-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (prefers-reduced-motion: reduce) {
  .price-enter-active,
  .price-leave-active {
    transition: none;
  }
}
</style>
