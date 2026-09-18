<script setup lang="ts">
import { useI18nList } from "@/shared/lib"
import { CIcon, CSectionHeading } from "@/shared/ui"
import type { ServiceKey } from "@/shared/config/seoPages"

interface Feature {
  icon: string
  title: string
  desc: string
}

const props = defineProps<{ service: ServiceKey }>()

// PService re-keys its subtree per service, so the prop is read once.
const base = `services.${props.service}.features`
const items = useI18nList<Feature>(`${base}.items`)
</script>

<template>
  <section id="features" class="section-dark py-[60px] sm:py-[100px]">
    <div class="container relative z-10">
      <CSectionHeading
        :eyebrow="$t(`${base}.eyebrow`)"
        :title="$t(`${base}.title`)"
        :subtitle="$t(`${base}.subtitle`)"
      />

      <ul class="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <li
          v-for="(item, i) in items"
          :key="i"
          data-aos="fade-up"
          data-aos-duration="800"
          :data-aos-delay="100 + i * 80"
        >
          <div class="surface-card surface-card-lift group h-full rounded-2xl p-6">
            <span
              class="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#6633EE]/15 text-[#B9A2FF] transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-110"
            >
              <CIcon :name="item.icon" class="h-6 w-6" />
            </span>
            <h3 class="mt-5 text-lg font-semibold text-white">{{ item.title }}</h3>
            <p class="mt-2 text-sm leading-relaxed text-[#A3A3A3]">{{ item.desc }}</p>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>
