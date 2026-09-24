<script setup lang="ts">
import { computed } from "vue"
import { TOP_UP_DISPLAY, formatUsd } from "@/entities/pricing"
import { usePublicPricing } from "@/features/billing"
import { useCountLabel } from "@/shared/lib"
import { CIcon, CSectionHeading } from "@/shared/ui"

const count = useCountLabel()
const pricing = usePublicPricing()
const packs = computed(() =>
  pricing.packs.value
    .filter((pack) => ["mini", "medium", "pro"].includes(pack.code))
    .map((pack) => ({
      ...pack,
      ...TOP_UP_DISPLAY[pack.code],
      priceUsd: pack.price_cents / 100,
    }))
)
</script>

<template>
  <section id="top-up" class="section-ground py-[60px] sm:py-[100px]">
    <div class="container relative z-10">
      <CSectionHeading :title="$t('pricing.topUp.title')" />

      <p
        v-if="pricing.error.value"
        role="alert"
        class="mt-8 text-center text-sm text-red-700"
      >
        {{ $t("pricing.unavailable") }}
      </p>
      <div
        v-else-if="!pricing.loading.value"
        class="mx-auto mt-14 grid max-w-[960px] grid-cols-1 gap-5 md:grid-cols-3"
      >
        <div
          v-for="(pack, i) in packs"
          :key="pack.id"
          class="relative"
          data-aos="fade-up"
          data-aos-duration="800"
          :data-aos-delay="100 + i * 90"
        >
          <div
            v-if="pack.badge"
            class="absolute -top-3.5 left-1/2 z-20 -translate-x-1/2"
          >
            <span
              class="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1 text-xs font-semibold"
              :class="
                pack.featured
                  ? 'bg-sand-950 text-white shadow-[0_4px_16px_-4px_rgba(12,10,9,0.4)]'
                  : 'border border-sand-200 bg-white text-sand-700'
              "
            >
              {{ $t(`pricing.badges.${pack.badge}`) }}
            </span>
          </div>

          <div
            class="surface-card surface-card-lift flex h-full flex-col rounded-2xl p-6"
            :class="pack.featured ? 'surface-card-accent' : ''"
          >
            <h3 class="text-sm font-medium text-sand-500">
              {{ $t(`pricing.topUp.packs.${pack.code}`) }}
            </h3>
            <p
              class="mt-3 flex items-center gap-2 text-2xl font-bold text-sand-950"
            >
              <CIcon
                name="zap"
                class="h-5 w-5 text-cobalt"
                stroke-width="2.25"
              />
              {{ count("pricing.credits", pack.credits) }}
            </p>

            <div class="mt-5 flex items-baseline justify-between gap-3">
              <span class="text-3xl font-bold tabular-nums text-sand-950">
                {{ formatUsd(pack.priceUsd, { cents: true }) }}
              </span>
              <span class="text-xs tabular-nums text-sand-500">
                {{
                  $t("pricing.topUp.perCredit", {
                    price: formatUsd(pack.priceUsd / pack.credits),
                  })
                }}
              </span>
            </div>

            <RouterLink
              to="/contact-us"
              class="mt-6 flex h-11 w-full items-center justify-center rounded-xl text-sm font-medium transition-300"
              :class="
                pack.featured
                  ? 'bg-sand-950 text-white hover:bg-sand-800'
                  : 'border border-sand-200 bg-white text-sand-950 hover:bg-sand-100'
              "
            >
              {{ $t("pricing.topUp.cta") }}
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
