<script setup lang="ts">
import { useI18nList } from "@/shared/lib"
import { CSectionHeading } from "@/shared/ui"
import type { ServiceKey } from "@/shared/config/seoPages"

interface Step {
  title: string
  desc: string
}

const props = defineProps<{ service: ServiceKey }>()

// PService re-keys its subtree per service, so the prop is read once.
const base = `services.${props.service}.steps`
const items = useI18nList<Step>(`${base}.items`)
</script>

<template>
  <section id="how" class="section-ground py-[60px] sm:py-[100px]">
    <div class="container relative z-10">
      <CSectionHeading :eyebrow="$t(`${base}.eyebrow`)" :title="$t(`${base}.title`)" />

      <ol class="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <li
          v-for="(item, i) in items"
          :key="i"
          class="surface-card rounded-2xl p-6"
          data-aos="fade-up"
          data-aos-duration="800"
          :data-aos-delay="100 + i * 100"
        >
          <span class="text-sm font-semibold tabular-nums text-sand-400">
            {{ String(i + 1).padStart(2, "0") }}
          </span>
          <h3 class="mt-3 text-lg font-semibold text-sand-950">{{ item.title }}</h3>
          <p class="mt-2 text-sm leading-relaxed text-sand-500">{{ item.desc }}</p>
        </li>
      </ol>
    </div>
  </section>
</template>
