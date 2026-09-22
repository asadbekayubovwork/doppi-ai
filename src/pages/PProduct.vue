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
    <section class="section-ground pt-[130px] pb-[40px] sm:pt-[180px] sm:pb-[60px]">
      <div class="pointer-events-none absolute inset-0 bg-grid mask-fade-b opacity-60" aria-hidden="true" />

      <div class="container relative z-10 text-center">
        <h1
          class="mx-auto max-w-[820px] text-[32px] sm:text-5xl font-bold leading-[120%] tracking-tight text-sand-950"
          data-aos="fade-up"
          data-aos-duration="1000"
        >
          {{ $t("product.pageTitle") }}
        </h1>
        <p
          class="mx-auto mt-5 max-w-[640px] text-base sm:text-lg leading-[150%] text-sand-500"
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
            class="flex h-12 w-full items-center justify-center rounded-xl bg-sand-950 px-8 font-medium text-white transition-300 hover:bg-sand-800 sm:w-auto"
          >
            {{ $t("hero.ctaPrimary") }}
          </RouterLink>
          <RouterLink
            to="/pricing"
            class="flex h-12 w-full items-center justify-center rounded-xl border border-sand-200 bg-white px-8 font-medium text-sand-950 transition-300 hover:bg-sand-100 sm:w-auto"
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
