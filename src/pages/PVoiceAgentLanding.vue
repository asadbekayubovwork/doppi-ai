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
  CDemoInstagram,
  CDemoLeads,
  CDemoCall,
  CDemoResult,
  HERO_PRIMARY,
  HERO_SECONDARY,
  BAND_PRIMARY,
  BAND_SECONDARY,
} from "@/widgets"

/**
 * `/voice-agent` has its own landing rather than the shared PService layout:
 * the page walks one lead through the whole chain — Instagram form, CRM, SIP
 * call, booking back in the CRM — with a mockup per step.
 */
useSeo(() => SERVICE_PATHS.voice)

const base = "services.voice.landing"
const visuals = [CDemoInstagram, CDemoLeads, CDemoCall, CDemoResult]

// The hero's second button drops the visitor at the step that plays the call
// back; "talk to a manager" goes to Telegram, a different door from the form.
const flowAnchor = { path: SERVICE_PATHS.voice, hash: "#voice-flow" }
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
        <RouterLink :to="flowAnchor" :class="HERO_SECONDARY">
          <CIcon name="circle-play" class="h-4 w-4" />
          {{ $t(`${base}.ctaSecondary`) }}
        </RouterLink>
      </template>
    </CLandingHero>

    <CLandingSteps id="voice-flow" :base="`${base}.steps`" :visuals="visuals" />

    <CLandingCapabilities :base="`${base}.capabilities`" />

    <CLandingCta :base="`${base}.cta`">
      <template #actions>
        <RouterLink to="/contact-us" :class="BAND_PRIMARY">
          {{ $t(`${base}.cta.primary`) }}
          <CIcon name="phone-call" class="h-4 w-4" />
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
