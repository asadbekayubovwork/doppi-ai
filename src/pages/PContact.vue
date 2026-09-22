<script setup lang="ts">
import { useSeo } from "@/shared/lib"
import { CContact, CFaq } from "@/widgets"

useSeo("/contact-us")
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
          {{ $t("contact.pageTitle") }}
        </h1>
        <p
          class="mx-auto mt-5 max-w-[640px] text-base sm:text-lg leading-[150%] text-sand-500"
          data-aos="fade-up"
          data-aos-duration="1000"
          data-aos-delay="150"
        >
          {{ $t("contact.pageSubtitle") }}
        </p>
      </div>
    </section>

    <CContact />
    <CFaq />
  </div>
</template>
