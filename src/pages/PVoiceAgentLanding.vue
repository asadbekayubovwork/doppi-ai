<script setup lang="ts">
import { useSeo } from "@/shared/lib"
import { SERVICE_PATHS } from "@/shared/config/seoPages"
import {
  CVoiceHero,
  CVoiceSteps,
  CVoiceCapabilities,
  CVoiceCta,
  CFaq,
  CServiceLinks,
} from "@/widgets"

/**
 * `/voice-agent` has its own landing rather than the shared PService layout:
 * the page walks one lead through the whole chain — Instagram form, CRM, SIP
 * call, booking back in the CRM — with a mockup per step.
 *
 * The FAQ and the cross-links stay: the build publishes FAQPage structured data
 * for every service page (build/seo.ts), and those answers have to be visible
 * on the page they are claimed for.
 */
useSeo(() => SERVICE_PATHS.voice)
</script>

<template>
  <div>
    <CVoiceHero />
    <CVoiceSteps />
    <CVoiceCapabilities />
    <CFaq i18n-key="services.voice.faq" />
    <CServiceLinks exclude="voice" />
    <CVoiceCta />
  </div>
</template>
