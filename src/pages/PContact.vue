<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { useHead } from "@vueuse/head"
import { CContact, CFaq } from "@/widgets"

const { t } = useI18n()

useHead({
  title: computed(() => t("seo.contact.title")),
  meta: [
    { name: "description", content: computed(() => t("seo.contact.description")) },
    { property: "og:title", content: computed(() => t("seo.contact.title")) },
    { property: "og:description", content: computed(() => t("seo.contact.description")) },
  ],
  link: [{ rel: "canonical", href: "https://doppi.ai/contact-us" }],
})
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
          {{ $t("contact.pageTitle") }}
        </h1>
        <p
          class="mx-auto mt-5 max-w-[640px] text-base sm:text-lg leading-[150%] text-[#A3A3A3]"
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
