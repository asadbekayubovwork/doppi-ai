<script setup lang="ts">
import { useI18nList } from "@/shared/lib"
import { CIcon, CSectionHeading, CDoppiMark } from "@/shared/ui"
import { SERVICE_PATHS } from "@/shared/config/seoPages"

interface FeatureItem {
  icon: string
  title: string
  desc: string
}

const items = useI18nList<FeatureItem>("features.items")

// Only the flagship tile (index 0 — the voice agent) grows to a 2x2 hero on
// desktop, which keeps the 3-column grid hole-free: 4 + 5x1 = 9 cells.
const spanFor = (index: number) => (index === 0 ? "lg:col-span-2 lg:row-span-2" : "")

// Modules with their own landing page link through to it, keyed by icon since
// the locale files carry no routes.
const pageFor: Record<string, string> = {
  phone: SERVICE_PATHS.voice,
  clapperboard: SERVICE_PATHS.video,
  bot: SERVICE_PATHS.rag,
}
</script>

<template>
  <section id="features" class="section-ground py-[60px] sm:py-[100px]">
    <div class="container relative z-10">
      <CSectionHeading
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
              class="pointer-events-none absolute -bottom-8 -right-4 hidden h-48 w-48 text-sand-100 lg:block"
            />

            <div class="relative z-10">
              <span
                class="inline-flex items-center justify-center rounded-xl bg-sand-100 text-sand-950 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3"
                :class="i === 0 ? 'h-14 w-14' : 'h-12 w-12'"
              >
                <CIcon :name="item.icon" :class="i === 0 ? 'h-7 w-7' : 'h-6 w-6'" />
              </span>

              <h3
                class="mt-5 font-semibold text-sand-950"
                :class="i === 0 ? 'text-xl lg:text-2xl' : 'text-lg'"
              >
                <!-- The stretched ::after makes the whole card the link target. -->
                <RouterLink
                  v-if="pageFor[item.icon]"
                  :to="pageFor[item.icon]"
                  class="transition-colors after:absolute after:inset-0 hover:text-sand-600"
                >
                  {{ item.title }}
                </RouterLink>
                <template v-else>{{ item.title }}</template>
              </h3>
              <p
                class="mt-2 leading-relaxed text-sand-500"
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
