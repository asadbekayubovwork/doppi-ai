<script setup lang="ts">
import { useI18nList } from "@/shared/lib"
import { CIcon, CSectionHeading, CDoppiMark } from "@/shared/ui"

interface FeatureItem {
  icon: string
  title: string
  desc: string
}

const items = useI18nList<FeatureItem>("features.items")

// Only the flagship tile (index 0 — the voice agent) grows to a 2x2 hero on
// desktop, which keeps the 3-column grid hole-free: 4 + 5x1 = 9 cells.
const spanFor = (index: number) => (index === 0 ? "lg:col-span-2 lg:row-span-2" : "")
</script>

<template>
  <section id="features" class="section-dark py-[60px] sm:py-[100px]">
    <div class="container relative z-10">
      <CSectionHeading
        :eyebrow="$t('features.eyebrow')"
        :title="$t('features.title')"
        :subtitle="$t('features.subtitle')"
      />

      <ul class="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:auto-rows-fr">
        <li
          v-for="(item, i) in items"
          :key="i"
          :class="spanFor(i)"
          data-aos="fade-up"
          data-aos-duration="800"
          :data-aos-delay="100 + i * 80"
        >
          <div
            class="surface-card surface-card-lift group relative h-full overflow-hidden rounded-2xl p-6"
            :class="i === 0 ? 'lg:p-8' : ''"
          >
            <CDoppiMark
              v-if="i === 0"
              class="pointer-events-none absolute -bottom-8 -right-4 hidden h-48 w-48 text-[#6633EE]/10 lg:block"
            />

            <div class="relative z-10">
              <span
                class="inline-flex items-center justify-center rounded-xl bg-[#6633EE]/15 text-[#B9A2FF] transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3"
                :class="i === 0 ? 'h-14 w-14' : 'h-12 w-12'"
              >
                <CIcon :name="item.icon" :class="i === 0 ? 'h-7 w-7' : 'h-6 w-6'" />
              </span>

              <h3
                class="mt-5 font-semibold text-white"
                :class="i === 0 ? 'text-xl lg:text-2xl' : 'text-lg'"
              >
                {{ item.title }}
              </h3>
              <p
                class="mt-2 leading-relaxed text-[#A3A3A3]"
                :class="i === 0 ? 'text-sm sm:text-base lg:max-w-md' : 'text-sm'"
              >
                {{ item.desc }}
              </p>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>
