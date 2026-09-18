<script setup lang="ts">
import { useSeo } from "@/shared/lib"
import {
  CSolution,
  CFeatures,
  CAudience,
  CHowItWorks,
  CVoiceAgent,
  CResults,
} from "@/widgets"

useSeo("/product")
</script>

<template>
  <div>
    <section class="section-dark pt-[130px] pb-[40px] sm:pt-[180px] sm:pb-[60px]">
      <div class="pointer-events-none absolute inset-0 bg-grid mask-fade-b opacity-60" aria-hidden="true" />
      <div class="violet-glow left-1/2 -top-24 h-64 w-[38rem] -translate-x-1/2" aria-hidden="true" />

      <div class="container relative z-10 text-center">
        <h1
          class="mx-auto max-w-[820px] text-[32px] sm:text-5xl font-bold leading-[120%] tracking-tight text-white"
          data-aos="fade-up"
          data-aos-duration="1000"
        >
          {{ $t("product.pageTitle") }}
        </h1>
        <p
          class="mx-auto mt-5 max-w-[640px] text-base sm:text-lg leading-[150%] text-[#A3A3A3]"
          data-aos="fade-up"
          data-aos-duration="1000"
          data-aos-delay="150"
        >
          {{ $t("product.pageSubtitle") }}
        </p>

        <div
          class="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          data-aos="fade-up"
          data-aos-duration="1000"
          data-aos-delay="250"
        >
          <RouterLink
            to="/contact-us"
            class="flex h-12 w-full items-center justify-center rounded-xl bg-[#6633EE] px-8 font-medium text-white transition-300 hover:bg-[#6633EE]/80 sm:w-auto"
          >
            {{ $t("hero.ctaPrimary") }}
          </RouterLink>
          <RouterLink
            to="/pricing"
            class="flex h-12 w-full items-center justify-center rounded-xl border border-white/10 bg-[#3D3D3D]/40 px-8 font-medium text-white transition-300 hover:bg-[#3D3D3D]/60 sm:w-auto"
          >
            {{ $t("nav.pricing") }}
          </RouterLink>
        </div>
      </div>
    </section>

    <CSolution />
    <CFeatures />
    <CAudience />
    <CHowItWorks />
    <CVoiceAgent />
    <CResults />
  </div>
</template>
