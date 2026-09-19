<script setup lang="ts">
import { useI18nList } from "@/shared/lib"
import { CSectionHeading, CCountUp } from "@/shared/ui"

interface Stat {
  value: string
  label: string
}

const stats = useI18nList<Stat>("results.stats")
</script>

<template>
  <section id="results" class="section-ground py-[60px] sm:py-[100px]">
    <div
      class="ambient-glow -right-24 top-1/3 h-72 w-[32rem]"
      aria-hidden="true"
    />
    <div
      class="ambient-glow -left-24 bottom-0 h-64 w-[26rem] opacity-60"
      aria-hidden="true"
    />

    <div class="container relative z-10">
      <CSectionHeading
        :eyebrow="$t('results.eyebrow')"
        :title="$t('results.title')"
        :subtitle="$t('results.subtitle')"
      />

      <ul class="mt-14 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3">
        <!-- AOS owns the <li>; the card sits inside so its hover transition survives. -->
        <li
          v-for="(stat, i) in stats"
          :key="i"
          data-aos="fade-up"
          data-aos-duration="800"
          :data-aos-delay="100 + i * 80"
        >
          <div
            class="surface-card surface-card-lift h-full rounded-2xl p-6 text-center sm:p-8 sm:text-left"
          >
            <p
              class="text-4xl sm:text-5xl font-bold leading-none tracking-tight text-gradient-ink"
            >
              <CCountUp :value="stat.value" />
            </p>
            <p class="mt-2 text-sm leading-snug text-sand-500">
              {{ stat.label }}
            </p>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>
