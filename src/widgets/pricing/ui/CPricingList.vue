<script setup lang="ts">
import { CPricingCards } from "@/entities/pricing"

// Lives only on /pricing, under that page's own title — so no heading here.
</script>

<template>
  <section id="pricing" class="section-ground py-[60px] sm:py-[100px]">
    <div class="container relative z-10">
      <CPricingCards class="mt-14" animated />

      <p class="mt-10 text-center text-sm text-sand-500" data-aos="fade-up" data-aos-duration="800">
        {{ $t("pricing.trialNote") }}
      </p>
    </div>
  </section>
</template>
