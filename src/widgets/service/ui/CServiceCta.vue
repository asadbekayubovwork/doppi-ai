<script setup lang="ts">
import type { ServiceKey } from "@/shared/config/seoPages"

const props = defineProps<{ service: ServiceKey }>()

// PService re-keys its subtree per service, so the prop is read once.
const base = `services.${props.service}.cta`
</script>

<template>
  <section class="section-ground pb-[80px] sm:pb-[120px]">
    <div class="container relative z-10">
      <div
        class="surface-card relative mx-auto max-w-[900px] overflow-hidden rounded-3xl px-6 py-12 text-center sm:px-12"
        data-aos="fade-up"
        data-aos-duration="900"
      >
        <div
          class="ambient-glow left-1/2 -top-28 h-56 w-[30rem] -translate-x-1/2"
          aria-hidden="true"
        />
        <h2 class="relative text-2xl font-bold text-sand-950 sm:text-4xl">{{ $t(`${base}.title`) }}</h2>
        <p class="relative mx-auto mt-4 max-w-[560px] text-base text-sand-500">
          {{ $t(`${base}.subtitle`) }}
        </p>
        <div class="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <RouterLink
            to="/login"
            class="flex h-12 w-full items-center justify-center rounded-xl bg-sand-950 px-8 font-medium text-white transition-300 hover:bg-sand-800 sm:w-auto"
          >
            {{ $t("services.ctaPrimary") }}
          </RouterLink>
          <RouterLink
            to="/pricing"
            class="flex h-12 w-full items-center justify-center rounded-xl border border-sand-200 bg-white px-8 font-medium text-sand-950 transition-300 hover:bg-sand-100 sm:w-auto"
          >
            {{ $t("nav.pricing") }}
          </RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>
