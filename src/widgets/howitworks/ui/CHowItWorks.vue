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
  <section id="how" class="section-dark py-[60px] sm:py-[100px]">
    <div class="pointer-events-none absolute inset-0 bg-grid mask-fade-b opacity-40" aria-hidden="true" />
    <div class="violet-glow left-1/2 top-8 h-64 w-[40rem] -translate-x-1/2 opacity-70" aria-hidden="true" />

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
              class="absolute left-0 top-6 h-8 w-0.5 rounded bg-[#6633EE]/50 transition-all duration-300 group-hover:h-12 group-hover:bg-[#8F6BFF]"
              aria-hidden="true"
            />

            <div class="flex items-center">
              <span class="text-sm font-semibold tabular-nums text-[#8F6BFF]/80">
                {{ String(i + 1).padStart(2, "0") }}
              </span>
              <span
                class="ml-auto grid h-10 w-10 place-items-center rounded-xl bg-[#6633EE]/15 text-[#B9A2FF] transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3"
              >
                <CIcon :name="step.icon" class="h-5 w-5" />
              </span>
            </div>

            <h3 class="mt-4 font-semibold text-white">{{ step.title }}</h3>
            <p class="mt-1.5 text-sm leading-relaxed text-[#A3A3A3]">{{ step.desc }}</p>
          </div>

          <span
            v-if="showConnector(i)"
            class="pointer-events-none absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 text-[#6633EE]/60 lg:block"
            aria-hidden="true"
          >
            <CIcon name="chevron-right" class="h-5 w-5" />
          </span>
        </li>
      </ul>
    </div>
  </section>
</template>
