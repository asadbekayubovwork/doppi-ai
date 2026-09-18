<script setup lang="ts">
import { CIcon } from "@/shared/ui"
import type { ServiceKey } from "@/shared/config/seoPages"

const props = defineProps<{ service: ServiceKey }>()

// PService re-keys its subtree per service, so the prop is read once.
const base = `services.${props.service}`
</script>

<template>
  <section class="section-dark pt-[130px] pb-[40px] sm:pt-[180px] sm:pb-[60px]">
    <div
      class="pointer-events-none absolute inset-0 bg-grid mask-fade-b opacity-60"
      aria-hidden="true"
    />
    <div class="violet-glow left-1/2 -top-24 h-64 w-[38rem] -translate-x-1/2" aria-hidden="true" />

    <div class="container relative z-10 text-center">
      <nav :aria-label="$t('services.breadcrumbLabel')" class="flex justify-center">
        <ol class="flex items-center gap-2 text-xs text-[#8F8E8A]">
          <li>
            <RouterLink to="/" class="transition-colors hover:text-white">
              {{ $t("services.breadcrumbHome") }}
            </RouterLink>
          </li>
          <li aria-hidden="true">
            <CIcon name="chevron-right" class="h-3.5 w-3.5" />
          </li>
          <li aria-current="page" class="text-[#B9A2FF]">{{ $t(`${base}.name`) }}</li>
        </ol>
      </nav>

      <span
        class="mt-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8F6BFF]"
        data-aos="fade-up"
        data-aos-duration="800"
      >
        <span class="h-px w-6 bg-[#6633EE]/60" aria-hidden="true" />
        {{ $t(`${base}.eyebrow`) }}
      </span>

      <h1
        class="mx-auto mt-5 max-w-[860px] text-[32px] font-bold leading-[120%] tracking-tight text-white sm:text-5xl"
        data-aos="fade-up"
        data-aos-duration="1000"
      >
        {{ $t(`${base}.title`) }}
      </h1>
      <p
        class="mx-auto mt-5 max-w-[680px] text-base leading-[150%] text-[#A3A3A3] sm:text-lg"
        data-aos="fade-up"
        data-aos-duration="1000"
        data-aos-delay="150"
      >
        {{ $t(`${base}.subtitle`) }}
      </p>

      <div
        class="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
        data-aos="fade-up"
        data-aos-duration="1000"
        data-aos-delay="250"
      >
        <RouterLink
          to="/login"
          class="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#6633EE] px-8 font-medium text-white transition-300 hover:bg-[#6633EE]/80 sm:w-auto"
        >
          {{ $t("services.ctaPrimary") }}
          <CIcon name="arrow-right" class="h-4 w-4" />
        </RouterLink>
        <RouterLink
          to="/contact-us"
          class="flex h-12 w-full items-center justify-center rounded-xl border border-white/10 bg-[#3D3D3D]/40 px-8 font-medium text-white transition-300 hover:bg-[#3D3D3D]/60 sm:w-auto"
        >
          {{ $t("services.ctaSecondary") }}
        </RouterLink>
      </div>
    </div>
  </section>
</template>
