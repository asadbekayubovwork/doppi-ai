<script setup lang="ts">
import { computed } from "vue"
import { useSeo } from "@/shared/lib"
import { CIcon } from "@/shared/ui"
import { SERVICE_PATHS } from "@/shared/config/seoPages"
import { SOCIALS } from "@/shared/config/socials"
import {
  CLandingHero,
  CLandingSteps,
  CLandingCapabilities,
  CLandingCta,
  CDemoKnowledgeBase,
  CDemoTelegram,
  CDemoConversations,
  CFaq,
  CServiceLinks,
  HERO_PRIMARY,
  HERO_SECONDARY,
  BAND_PRIMARY,
  BAND_SECONDARY,
} from "@/widgets"

/**
 * `/rag-agent` has its own landing rather than the shared PService layout: the
 * page follows one question from the uploaded document through the Telegram
 * answer to the conversation waiting in the CRM, with a mockup per step.
 *
 * The FAQ and the cross-links stay: the build publishes FAQPage structured data
 * for every service page (build/seo.ts), and those answers have to be visible
 * on the page they are claimed for.
 */
useSeo(() => SERVICE_PATHS.rag)

const base = "services.rag.landing"
const visuals = [CDemoKnowledgeBase, CDemoTelegram, CDemoConversations]

// "Try it on Telegram" is a real door: the company bot, not a form.
const telegram = computed(() =>
  SOCIALS.find((social) => social.icon === "telegram")
)
</script>

<template>
  <div>
    <CLandingHero :base="base">
      <template #actions>
        <RouterLink to="/login" :class="HERO_PRIMARY">
          {{ $t(`${base}.ctaPrimary`) }}
          <CIcon name="arrow-right" class="h-4 w-4" />
        </RouterLink>
        <a
          v-if="telegram"
          :href="telegram.href"
          target="_blank"
          rel="noopener noreferrer"
          :class="HERO_SECONDARY"
        >
          <CIcon name="message-circle" class="h-4 w-4" />
          {{ $t(`${base}.ctaSecondary`) }}
        </a>
        <RouterLink v-else to="/contact-us" :class="HERO_SECONDARY">
          <CIcon name="message-circle" class="h-4 w-4" />
          {{ $t(`${base}.ctaSecondary`) }}
        </RouterLink>
      </template>
    </CLandingHero>

    <CLandingSteps id="rag-flow" :base="`${base}.steps`" :visuals="visuals" />

    <CLandingCapabilities :base="`${base}.capabilities`" />

    <CFaq i18n-key="services.rag.faq" />
    <CServiceLinks exclude="rag" />

    <CLandingCta :base="`${base}.cta`">
      <template #actions>
        <RouterLink to="/login" :class="BAND_PRIMARY">
          {{ $t(`${base}.cta.primary`) }}
          <CIcon name="cloud-upload" class="h-4 w-4" />
        </RouterLink>
        <a
          v-if="telegram"
          :href="telegram.href"
          target="_blank"
          rel="noopener noreferrer"
          :class="BAND_SECONDARY"
        >
          {{ $t(`${base}.cta.secondary`) }}
          <CIcon name="telegram" class="h-4 w-4" />
        </a>
        <RouterLink v-else to="/contact-us" :class="BAND_SECONDARY">
          {{ $t(`${base}.cta.secondary`) }}
        </RouterLink>
      </template>
    </CLandingCta>
  </div>
</template>
