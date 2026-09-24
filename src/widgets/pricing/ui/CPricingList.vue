<script setup lang="ts">
import { ref } from "vue"
import {
  CBillingToggle,
  CPricingCards,
  type BillingPeriod,
} from "@/entities/pricing"
import { usePublicPricing } from "@/features/billing"

const period = ref<BillingPeriod>("monthly")
const pricing = usePublicPricing()
</script>

<template>
  <!-- No top padding: the toggle reads as the last line of the page hero. -->
  <section id="pricing" class="section-ground pb-[60px] sm:pb-[100px]">
    <div class="container relative z-10">
      <div
        class="flex justify-center"
        data-aos="fade-up"
        data-aos-duration="800"
      >
        <CBillingToggle v-model="period" />
      </div>

      <!-- Top margin leaves room for the badges that ride above the cards. -->
      <div class="mx-auto mt-12 max-w-[1080px]">
        <CPricingCards :period="period" animated />
      </div>

      <p
        class="mt-10 text-center text-sm text-sand-500"
        data-aos="fade-up"
        data-aos-duration="800"
      >
        {{
          pricing.intro.value
            ? $t("pricing.trialNote", { credits: pricing.intro.value.credits })
            : ""
        }}
      </p>
    </div>
  </section>
</template>
