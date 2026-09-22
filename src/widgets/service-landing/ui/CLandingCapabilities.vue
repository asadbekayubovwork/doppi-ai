<script setup lang="ts">
import { useI18nList } from "@/shared/lib"
import { CIcon, CSectionHeading } from "@/shared/ui"

interface Capability {
  icon: string
  title: string
  desc: string
}

/** The "what else it handles" card grid, shared by the service landings. */
const props = defineProps<{
  /** i18n branch holding eyebrow, title and items. */
  base: string
}>()

const items = useI18nList<Capability>(`${props.base}.items`)
</script>

<template>
  <section class="section-ground pb-[60px] sm:pb-[100px]">
    <div class="container relative z-10">
      <CSectionHeading
        :eyebrow="$t(`${base}.eyebrow`)"
        :title="$t(`${base}.title`)"
      />

      <ul class="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <li
          v-for="(item, i) in items"
          :key="item.title"
          class="surface-card surface-card-lift group flex flex-col gap-3.5 rounded-[18px] p-6"
          data-aos="fade-up"
          data-aos-duration="800"
          :data-aos-delay="100 + (i % 3) * 70"
        >
          <span
            class="grid h-[42px] w-[42px] place-items-center rounded-xl bg-sand-100 text-sand-950 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3"
          >
            <CIcon :name="item.icon" class="h-5 w-5" />
          </span>
          <h3 class="text-lg font-semibold tracking-[-0.4px] text-sand-950">
            {{ item.title }}
          </h3>
          <p class="text-[14.5px] leading-[160%] text-sand-500">
            {{ item.desc }}
          </p>
        </li>
      </ul>
    </div>
  </section>
</template>
