<script setup lang="ts">
import type { ServiceKey } from "@/shared/config/seoPages"

const props = defineProps<{ service: ServiceKey }>()

// PService re-keys its subtree per service, so the prop is read once.
const base = `services.${props.service}.cta`
</script>

<template>
  <section class="section-dark pb-[80px] sm:pb-[120px]">
    <div class="container relative z-10">
      <div
        class="surface-card relative mx-auto max-w-[900px] overflow-hidden rounded-3xl px-6 py-12 text-center sm:px-12"
        data-aos="fade-up"
        data-aos-duration="900"
      >
        <div
          class="violet-glow left-1/2 -top-28 h-56 w-[30rem] -translate-x-1/2"
          aria-hidden="true"
        />
        <h2 class="relative text-2xl font-bold text-white sm:text-4xl">{{ $t(`${base}.title`) }}</h2>
        <p class="relative mx-auto mt-4 max-w-[560px] text-base text-[#A3A3A3]">
          {{ $t(`${base}.subtitle`) }}
        </p>
        <div class="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <RouterLink
            to="/login"
            class="flex h-12 w-full items-center justify-center rounded-xl bg-[#6633EE] px-8 font-medium text-white transition-300 hover:bg-[#6633EE]/80 sm:w-auto"
          >
            {{ $t("services.ctaPrimary") }}
          </RouterLink>
          <RouterLink
            to="/pricing"
            class="flex h-12 w-full items-center justify-center rounded-xl border border-white/10 bg-[#3D3D3D]/40 px-8 font-medium text-white transition-300 hover:bg-[#3D3D3D]/60 sm:w-auto"
          >
            {{ $t("nav.pricing") }}
          </RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>
