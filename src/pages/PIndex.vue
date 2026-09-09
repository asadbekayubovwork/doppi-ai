<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { useHead } from "@vueuse/head"
import {
  CHero,
  CTrustBar,
  CProblem,
  CSolution,
  CFeatures,
  CHowItWorks,
  CVoiceAgent,
  CResults,
  CPricingList,
  CFaq,
  CAbout,
  CTeamCards,
  CContact,
} from "@/widgets"

const { t } = useI18n()

useHead({
  title: computed(() => t("seo.home.title")),
  meta: [
    { name: "description", content: computed(() => t("seo.home.description")) },
    { name: "keywords", content: computed(() => t("seo.home.keywords")) },
    { name: "robots", content: "index, follow" },
    { name: "author", content: "Do'ppi.ai" },
    { name: "theme-color", content: "#0E041F" },

    // Open Graph
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://doppi.ai/" },
    { property: "og:site_name", content: "Do'ppi.ai" },
    { property: "og:title", content: computed(() => t("seo.home.title")) },
    { property: "og:description", content: computed(() => t("seo.home.description")) },

    // Twitter
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: computed(() => t("seo.home.title")) },
    { name: "twitter:description", content: computed(() => t("seo.home.description")) },
  ],
  link: [{ rel: "canonical", href: "https://doppi.ai/" }],
})
</script>

<template>
  <div>
    <CHero />
    <CTrustBar />
    <CProblem />
    <CSolution />
    <CFeatures />
    <CHowItWorks />
    <CVoiceAgent />
    <CResults />
    <CPricingList />
    <CFaq />
    <CAbout />
    <CTeamCards />
    <CContact />
  </div>
</template>
