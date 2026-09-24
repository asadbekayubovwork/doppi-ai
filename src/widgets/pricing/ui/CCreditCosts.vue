<script setup lang="ts">
import { computed } from "vue"
import { CREDIT_COST_DISPLAY, formatUsd } from "@/entities/pricing"
import { usePublicPricing } from "@/features/billing"
import { useCountLabel } from "@/shared/lib"
import { CIcon, CSectionHeading } from "@/shared/ui"

const count = useCountLabel()
const pricing = usePublicPricing()
const costs = computed(() =>
  CREDIT_COST_DISPLAY.flatMap((display) => {
    const rate = pricing.rates.value.find(
      (entry) => entry.code === display.rateCode
    )
    return rate
      ? [
          {
            ...display,
            credits: rate.credits_per_unit,
            denominator: rate.units_per_charge,
          },
        ]
      : []
  })
)
const starter = computed(() =>
  pricing.plans.value.find((plan) => plan.code === "starter")
)
const creditPrice = computed(() =>
  starter.value
    ? starter.value.monthly_price_cents / 100 / starter.value.credits_per_month
    : null
)
</script>

<template>
  <section id="credits" class="section-ground py-[60px] sm:py-[100px]">
    <div class="container relative z-10">
      <CSectionHeading :title="$t('pricing.costs.title')" />

      <div
        v-if="creditPrice !== null"
        class="mt-6 flex justify-center"
        data-aos="fade-up"
        data-aos-duration="800"
      >
        <span
          class="inline-flex items-center gap-2 rounded-full border border-sand-200 bg-white px-4 py-1.5 text-sm font-medium text-sand-950"
        >
          <CIcon name="zap" class="h-4 w-4 text-cobalt" stroke-width="2.25" />
          {{ $t("pricing.costs.rate", { price: formatUsd(creditPrice) }) }}
        </span>
      </div>

      <p
        v-if="pricing.error.value"
        role="alert"
        class="mt-8 text-center text-sm text-red-700"
      >
        {{ $t("pricing.unavailable") }}
      </p>
      <div
        v-else-if="!pricing.loading.value"
        class="surface-card mx-auto mt-10 max-w-[960px] overflow-hidden rounded-2xl"
        data-aos="fade-up"
        data-aos-duration="800"
        data-aos-delay="100"
      >
        <table class="w-full text-left text-sm">
          <thead
            class="border-b border-sand-200 bg-sand-50 text-xs font-medium text-sand-500"
          >
            <tr>
              <th scope="col" class="px-4 py-3 sm:px-6">
                {{ $t("pricing.costs.columns.service") }}
              </th>
              <th scope="col" class="px-4 py-3 sm:px-6">
                {{ $t("pricing.costs.columns.credits") }}
              </th>
              <th scope="col" class="hidden px-6 py-3 sm:table-cell">
                {{ $t("pricing.costs.columns.price") }}
              </th>
              <th scope="col" class="hidden px-6 py-3 md:table-cell">
                {{ $t("pricing.costs.columns.note") }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-sand-200">
            <tr
              v-for="cost in costs"
              :key="cost.id"
              class="transition-colors duration-200 hover:bg-sand-50"
            >
              <th scope="row" class="px-4 py-4 font-normal sm:px-6">
                <div class="flex items-center gap-3">
                  <span
                    class="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sand-100 text-sand-950"
                  >
                    <CIcon :name="cost.icon" class="h-4 w-4" />
                  </span>
                  <div class="min-w-0">
                    <p class="font-medium text-sand-950">
                      {{ $t(`pricing.costs.items.${cost.id}.name`) }}
                    </p>
                    <!-- The note column only fits from md up. -->
                    <p class="mt-0.5 text-xs text-sand-500 md:hidden">
                      {{ $t(`pricing.costs.items.${cost.id}.note`) }}
                    </p>
                  </div>
                </div>
              </th>
              <td class="px-4 py-4 sm:px-6">
                <span class="whitespace-nowrap font-semibold text-sand-950">
                  {{ count("pricing.credits", cost.credits) }}
                </span>
                <span class="whitespace-nowrap text-sand-500">
                  / {{ cost.denominator > 1 ? `${cost.denominator} ` : ""
                  }}{{ $t(`pricing.costs.items.${cost.id}.unit`) }}
                </span>
              </td>
              <td
                class="hidden whitespace-nowrap px-6 py-4 tabular-nums text-sand-500 sm:table-cell"
              >
                <template v-if="creditPrice !== null">
                  ≈ {{ formatUsd(cost.credits * creditPrice, { cents: true }) }}
                </template>
                <template v-else>—</template>
              </td>
              <td class="hidden px-6 py-4 text-sand-500 md:table-cell">
                {{ $t(`pricing.costs.items.${cost.id}.note`) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
