<script setup lang="ts">
import { computed } from "vue"
import { useSeo, useI18nList } from "@/shared/lib"
import { CIcon } from "@/shared/ui"
import { SERVICE_PATHS } from "@/shared/config/seoPages"
import { SOCIALS } from "@/shared/config/socials"
import {
  CLandingHero,
  CLandingSteps,
  CLandingCapabilities,
  CLandingCta,
  CDemoContentPlan,
  CDemoQueue,
  CDemoPostStats,
  CDemoWeekResult,
  CFaq,
  CServiceLinks,
  HERO_PRIMARY,
  HERO_SECONDARY,
  BAND_PRIMARY,
  BAND_SECONDARY,
} from "@/widgets"

interface Platform {
  icon: string
  label: string
}

/**
 * `/video-generator` has its own landing rather than the shared PService
 * layout: the page follows one week of content from the plan through the
 * render queue to the published post and its numbers, with a mockup per step.
 *
 * The FAQ and the cross-links stay: the build publishes FAQPage structured data
 * for every service page (build/seo.ts), and those answers have to be visible
 * on the page they are claimed for.
 */
useSeo(() => SERVICE_PATHS.video)

const base = "services.video.landing"
const visuals = [CDemoContentPlan, CDemoQueue, CDemoPostStats, CDemoWeekResult]
const platforms = useI18nList<Platform>(`${base}.capabilities.platforms`)

// "Watch sample videos" points at the account the agent actually posts to.
const instagram = computed(() =>
  SOCIALS.find((social) => social.icon === "instagram")
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
          v-if="instagram"
          :href="instagram.href"
          target="_blank"
          rel="noopener noreferrer"
          :class="HERO_SECONDARY"
        >
          <CIcon name="clapperboard" class="h-4 w-4" />
          {{ $t(`${base}.ctaSecondary`) }}
        </a>
        <RouterLink v-else to="/contact-us" :class="HERO_SECONDARY">
          <CIcon name="clapperboard" class="h-4 w-4" />
          {{ $t(`${base}.ctaSecondary`) }}
        </RouterLink>
      </template>
    </CLandingHero>

    <CLandingSteps id="video-flow" :base="`${base}.steps`" :visuals="visuals" />

    <CLandingCapabilities :base="`${base}.capabilities`">
      <template #footer>
        <span class="text-[13px] text-sand-400">
          {{ $t(`${base}.capabilities.platformsLabel`) }}
        </span>
        <span
          v-for="platform in platforms"
          :key="platform.label"
          class="flex items-center gap-2 rounded-full border border-sand-200 bg-white px-3 py-[7px] text-[12.5px] font-medium text-sand-700"
        >
          <CIcon :name="platform.icon" class="h-3.5 w-3.5 text-sand-500" />
          {{ platform.label }}
        </span>
      </template>
    </CLandingCapabilities>

    <CFaq i18n-key="services.video.faq" />
    <CServiceLinks exclude="video" />

    <CLandingCta :base="`${base}.cta`">
      <template #actions>
        <RouterLink to="/login" :class="BAND_PRIMARY">
          {{ $t(`${base}.cta.primary`) }}
          <CIcon name="calendar-days" class="h-4 w-4" />
        </RouterLink>
        <a
          v-if="instagram"
          :href="instagram.href"
          target="_blank"
          rel="noopener noreferrer"
          :class="BAND_SECONDARY"
        >
          {{ $t(`${base}.cta.secondary`) }}
          <CIcon name="instagram" class="h-4 w-4" />
        </a>
        <RouterLink v-else to="/contact-us" :class="BAND_SECONDARY">
          {{ $t(`${base}.cta.secondary`) }}
        </RouterLink>
      </template>
    </CLandingCta>
  </div>
</template>
