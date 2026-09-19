<script setup lang="ts">
import { computed } from "vue"
import { CIcon, CSectionHeading } from "@/shared/ui"
import { SERVICE_NAV } from "@/shared/config/services"
import type { ServiceKey } from "@/shared/config/seoPages"

const props = defineProps<{ exclude?: ServiceKey }>()

// Service pages link to each other; search engines read these links when they
// work out which pages make up the site's main sections.
const services = computed(() => SERVICE_NAV.filter((item) => item.key !== props.exclude))
</script>

<template>
  <section class="section-ground py-[60px] sm:py-[100px]">
    <div class="container relative z-10">
      <CSectionHeading :title="$t('services.othersTitle')" />

      <ul class="mx-auto mt-12 grid max-w-[900px] grid-cols-1 gap-5 sm:grid-cols-2">
        <li v-for="item in services" :key="item.key">
          <RouterLink
            :to="item.to"
            class="surface-card surface-card-lift group flex h-full items-start gap-4 rounded-2xl p-6"
          >
            <span
              class="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-sand-100 text-sand-950"
            >
              <CIcon :name="item.icon" class="h-6 w-6" />
            </span>
            <span class="flex flex-col">
              <span class="text-lg font-semibold text-sand-950">
                {{ $t(`services.${item.key}.name`) }}
              </span>
              <span class="mt-1 text-sm leading-relaxed text-sand-500">
                {{ $t(`services.${item.key}.navDesc`) }}
              </span>
              <span
                class="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-sand-950 transition-colors group-hover:text-sand-600"
              >
                {{ $t("services.learnMore") }}
                <CIcon name="arrow-right" class="h-4 w-4" />
              </span>
            </span>
          </RouterLink>
        </li>
      </ul>
    </div>
  </section>
</template>
