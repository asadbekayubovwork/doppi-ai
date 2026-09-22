<script setup lang="ts">
import { useI18nList } from "@/shared/lib"
import { CIcon, CSectionHeading } from "@/shared/ui"

interface Step {
  icon: string
  title: string
  desc: string
}

const steps = useI18nList<Step>("how.steps")

// A chevron hints the left-to-right flow between cards inside a desktop row.
const showConnector = (index: number) => (index + 1) % 4 !== 0 && index !== steps.value.length - 1
</script>

<template>
  <section id="how" class="section-ground py-[60px] sm:py-[100px]">
    <div class="pointer-events-none absolute inset-0 bg-grid mask-fade-b opacity-40" aria-hidden="true" />

    <div class="container relative z-10">
      <CSectionHeading
        :eyebrow="$t('how.eyebrow')"
        :title="$t('how.title')"
        :subtitle="$t('how.subtitle')"
      />

      <ul class="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <li
          v-for="(step, i) in steps"
          :key="i"
          class="relative"
          data-aos="fade-up"
          data-aos-duration="800"
          :data-aos-delay="100 + i * 70"
        >
          <div class="surface-card surface-card-lift group relative h-full rounded-2xl p-6">
            <span
              class="absolute left-0 top-6 h-8 w-0.5 rounded bg-sand-300 transition-all duration-300 group-hover:h-12 group-hover:bg-cobalt"
              aria-hidden="true"
            />

            <div class="flex items-center">
              <span class="text-sm font-semibold tabular-nums text-sand-400">
                {{ String(i + 1).padStart(2, "0") }}
              </span>
              <span
                class="ml-auto grid h-10 w-10 place-items-center rounded-xl bg-sand-100 text-sand-950 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3"
              >
                <CIcon :name="step.icon" class="h-5 w-5" />
              </span>
            </div>

            <h3 class="mt-4 font-semibold text-sand-950">{{ step.title }}</h3>
            <p class="mt-1.5 text-sm leading-relaxed text-sand-500">{{ step.desc }}</p>
          </div>

          <span
            v-if="showConnector(i)"
            class="pointer-events-none absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 text-sand-300 lg:block"
            aria-hidden="true"
          >
            <CIcon name="chevron-right" class="h-5 w-5" />
          </span>
        </li>
      </ul>
    </div>
  </section>
</template>
