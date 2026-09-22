<script setup lang="ts">
import { useI18nList } from "@/shared/lib"
import { CIcon, CSectionHeading } from "@/shared/ui"

interface ProblemItem {
  icon: string
  title: string
  desc: string
}

const items = useI18nList<ProblemItem>("problem.items")
</script>

<template>
  <section id="problem" class="section-ground py-[60px] sm:py-[100px]">

    <div class="container relative z-10">
      <CSectionHeading
        align="left"
        :eyebrow="$t('problem.eyebrow')"
        :title="$t('problem.title')"
        :subtitle="$t('problem.subtitle')"
      />

      <ul class="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <!-- AOS owns the <li>; the card sits inside so its hover transition survives. -->
        <li
          v-for="(item, i) in items"
          :key="i"
          data-aos="fade-up"
          data-aos-duration="800"
          :data-aos-delay="100 + i * 80"
        >
          <div
            class="surface-card surface-card-lift group flex h-full items-start gap-4 rounded-2xl p-5"
          >
            <span
              class="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-600 transition-transform duration-300 group-hover:scale-110 group-hover:bg-red-500/15"
            >
              <CIcon :name="item.icon" class="h-5 w-5" />
            </span>

            <div class="min-w-0">
              <h3 class="text-lg font-semibold text-sand-950">{{ item.title }}</h3>
              <p class="mt-1.5 text-sm leading-relaxed text-sand-500">
                {{ item.desc }}
              </p>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>
