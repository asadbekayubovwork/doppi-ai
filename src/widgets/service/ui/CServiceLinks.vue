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
  <section class="section-dark py-[60px] sm:py-[100px]">
    <div class="container relative z-10">
      <CSectionHeading :title="$t('services.othersTitle')" />

      <ul class="mx-auto mt-12 grid max-w-[900px] grid-cols-1 gap-5 sm:grid-cols-2">
        <li v-for="item in services" :key="item.key">
          <RouterLink
            :to="item.to"
            class="surface-card surface-card-lift group flex h-full items-start gap-4 rounded-2xl p-6"
          >
            <span
              class="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#6633EE]/15 text-[#B9A2FF]"
            >
              <CIcon :name="item.icon" class="h-6 w-6" />
            </span>
            <span class="flex flex-col">
              <span class="text-lg font-semibold text-white">
                {{ $t(`services.${item.key}.name`) }}
              </span>
              <span class="mt-1 text-sm leading-relaxed text-[#A3A3A3]">
                {{ $t(`services.${item.key}.navDesc`) }}
              </span>
              <span
                class="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#B9A2FF] transition-colors group-hover:text-white"
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
