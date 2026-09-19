<script setup lang="ts">
import { useI18nList } from "@/shared/lib"
import { CIcon, CSectionHeading } from "@/shared/ui"

interface AudienceItem {
  icon: string
  title: string
  desc: string
  points: string[]
}

const items = useI18nList<AudienceItem>("audience.items")
</script>

<template>
  <section id="audience" class="section-ground py-[60px] sm:py-[100px]">
    <div
      class="ambient-glow left-1/4 top-10 h-64 w-[30rem] opacity-70"
      aria-hidden="true"
    />

    <div class="container relative z-10">
      <CSectionHeading
        :eyebrow="$t('audience.eyebrow')"
        :title="$t('audience.title')"
        :subtitle="$t('audience.subtitle')"
      />

      <ul class="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2">
        <!-- AOS owns the <li>; the card sits inside so its hover transition survives. -->
        <li
          v-for="(item, i) in items"
          :key="i"
          data-aos="fade-up"
          data-aos-duration="800"
          :data-aos-delay="100 + i * 90"
        >
          <div
            class="surface-card surface-card-lift group flex h-full flex-col rounded-2xl p-6 sm:p-7"
          >
            <span
              class="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-sand-100 text-sand-950 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3"
            >
              <CIcon :name="item.icon" class="h-6 w-6" />
            </span>

            <h3 class="mt-5 text-lg font-semibold text-sand-950 sm:text-xl">
              {{ item.title }}
            </h3>
            <p class="mt-2 text-sm leading-relaxed text-sand-500">
              {{ item.desc }}
            </p>

            <ul class="mt-5 space-y-2.5 border-t border-sand-200 pt-5">
              <li
                v-for="(point, pi) in item.points"
                :key="pi"
                class="flex items-start gap-2.5 text-sm text-sand-700"
              >
                <CIcon
                  name="check"
                  class="mt-0.5 h-4 w-4 shrink-0 text-sand-950"
                  stroke-width="2.25"
                />
                <span>{{ point }}</span>
              </li>
            </ul>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>
