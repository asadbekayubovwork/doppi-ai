<script setup lang="ts">
import { useI18nList } from "@/shared/lib"
import { CIcon, CCountUp } from "@/shared/ui"

interface Tier {
  id: string
  name: string
  price: string
  period: string
  tagline: string
  popular: boolean
  cta: string
  features: string[]
}

defineProps<{
  /** Fade the cards in on scroll, as on the landing; a dialog shows them at once. */
  animated?: boolean
}>()

const tiers = useI18nList<Tier>("pricing.tiers")

const aos = (index: number) => ({
  "data-aos": "fade-up",
  "data-aos-duration": 800,
  "data-aos-delay": 100 + index * 90,
})
</script>

<template>
  <div class="grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 lg:grid-cols-4">
    <div
      v-for="(tier, i) in tiers"
      :key="tier.id"
      class="relative"
      v-bind="animated ? aos(i) : {}"
    >
      <div v-if="tier.popular" class="absolute -top-3.5 left-1/2 z-20 -translate-x-1/2">
        <span
          class="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-sand-950 px-3.5 py-1 text-xs font-semibold text-white shadow-[0_4px_16px_-4px_rgba(12,10,9,0.4)]"
        >
          <CIcon name="sparkles" class="h-3 w-3" stroke-width="2.5" />
          {{ $t("pricing.popularLabel") }}
        </span>
      </div>

      <div
        class="surface-card surface-card-lift flex h-full flex-col rounded-2xl p-6"
        :class="tier.popular ? 'surface-card-accent' : ''"
      >
        <h3 class="text-lg font-semibold text-sand-950">{{ tier.name }}</h3>

        <div class="mt-4 flex items-baseline gap-1">
          <span class="text-4xl font-bold text-sand-950">
            <CCountUp :value="tier.price" />
          </span>
          <span v-if="tier.period" class="text-sm text-sand-500">{{ tier.period }}</span>
        </div>

        <p class="mt-2 min-h-[40px] text-sm text-sand-500">{{ tier.tagline }}</p>

        <div class="my-6 h-px bg-sand-200" />

        <ul class="flex-1 space-y-3">
          <li
            v-for="feature in tier.features"
            :key="feature"
            class="flex items-start gap-2.5 text-sm text-sand-700"
          >
            <CIcon name="check" class="mt-0.5 h-4 w-4 shrink-0 text-sand-950" stroke-width="2.25" />
            <span>{{ feature }}</span>
          </li>
        </ul>

        <RouterLink
          to="/contact-us"
          class="mt-8 flex h-12 w-full items-center justify-center rounded-xl font-medium transition-300"
          :class="
            tier.popular
              ? 'bg-sand-950 text-white hover:bg-sand-800'
              : 'border border-sand-200 bg-white text-sand-950 hover:bg-sand-100'
          "
        >
          {{ tier.cta }}
        </RouterLink>
      </div>
    </div>
  </div>
</template>
