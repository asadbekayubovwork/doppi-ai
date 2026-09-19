<script setup lang="ts">
import { useId } from "vue"
import { useI18nList } from "@/shared/lib"
import { CIcon, CCountUp } from "@/shared/ui"

interface Stat {
  value: string
  label: string
}

const stats = useI18nList<Stat>("hero.stats")

const grainId = `${useId()}-grain`
</script>

<template>
  <section id="top" class="hero section-ground pt-[120px] pb-[60px] sm:pt-[160px] sm:pb-[100px]">
    <div class="pointer-events-none absolute inset-0 bg-grid mask-fade-b opacity-70" aria-hidden="true" />
    <div class="ambient-glow animate-drift left-[6%] -top-40 h-72 w-[34rem]" aria-hidden="true" />
    <div
      class="ambient-glow animate-drift right-[4%] top-10 h-64 w-[28rem]"
      style="animation-delay: -13s"
      aria-hidden="true"
    />

    <div class="container relative z-10">
      <div class="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <!-- Copy -->
        <div class="flex flex-col items-start">
          <span
            class="inline-flex items-center gap-2 rounded-full border border-sand-200 bg-white px-4 py-2 text-xs sm:text-sm font-medium text-sand-700"
            data-aos="fade-up"
            data-aos-duration="800"
          >
            <span class="relative flex h-1.5 w-1.5">
              <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-75" />
              <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal" />
            </span>
            {{ $t("hero.badge") }}
          </span>

          <h1
            class="mt-6 text-[32px] sm:text-5xl lg:text-[56px] font-bold leading-[110%] tracking-tight text-sand-950"
            data-aos="fade-up"
            data-aos-duration="1000"
            data-aos-delay="100"
          >
            {{ $t("hero.titleTop") }}
            <span class="text-gradient-ink">{{ $t("hero.titleHighlight") }}</span>
            {{ $t("hero.titleBottom") }}
          </h1>

          <p
            class="mt-6 max-w-[600px] text-base sm:text-lg leading-[150%] text-sand-500"
            data-aos="fade-up"
            data-aos-duration="1000"
            data-aos-delay="200"
          >
            {{ $t("hero.subtitle") }}
          </p>

          <div
            class="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row"
            data-aos="fade-up"
            data-aos-duration="1000"
            data-aos-delay="300"
          >
            <RouterLink
              to="/contact-us"
              class="flex h-12 items-center justify-center gap-2 rounded-xl bg-sand-950 px-8 font-medium text-white transition-300 hover:bg-sand-800"
            >
              {{ $t("hero.ctaPrimary") }}
              <CIcon name="arrow-right" class="h-4 w-4" />
            </RouterLink>
          </div>

          <dl
            class="mt-12 grid w-full max-w-[520px] grid-cols-3 gap-6 border-t border-sand-200 pt-8"
            data-aos="fade-up"
            data-aos-duration="1000"
            data-aos-delay="400"
          >
            <div v-for="stat in stats" :key="stat.label">
              <dt class="text-2xl sm:text-3xl font-bold text-gradient-ink">
                <CCountUp :value="stat.value" />
              </dt>
              <dd class="mt-1 text-xs sm:text-sm leading-snug text-sand-500">
                {{ stat.label }}
              </dd>
            </div>
          </dl>
        </div>

        <!-- AI voice agent card: a living orb with a call button -->
        <div
          class="relative mx-auto w-full max-w-[400px]"
          data-aos="zoom-in"
          data-aos-duration="1000"
          data-aos-delay="300"
        >
          <div class="ambient-glow -inset-6" aria-hidden="true" />

          <div
            class="relative flex flex-col items-center rounded-[32px] border border-sand-200 bg-white px-8 py-14 shadow-[0_24px_60px_-28px_rgba(12,10,9,0.25)] sm:py-16"
          >
            <div class="relative h-[200px] w-[200px]">
              <div class="voice-orb absolute inset-0 overflow-hidden rounded-full" aria-hidden="true">
                <div class="voice-orb__mesh absolute -inset-[20%]" />
                <svg class="voice-orb__grain absolute inset-0 h-full w-full">
                  <filter :id="grainId">
                    <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
                    <feColorMatrix type="saturate" values="0" />
                  </filter>
                  <rect width="100%" height="100%" :filter="`url(#${grainId})`" />
                </svg>
              </div>

              <RouterLink
                :to="{ hash: '#voice' }"
                :aria-label="$t('hero.agentCall')"
                class="absolute left-1/2 top-1/2 grid h-[60px] w-[60px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-sand-950 shadow-[0_8px_24px_-8px_rgba(12,10,9,0.35)] transition-transform duration-300 hover:scale-110"
              >
                <CIcon name="phone" class="h-5 w-5" />
              </RouterLink>
            </div>

            <p class="mt-8 max-w-[300px] text-center text-sm leading-relaxed text-sand-500 sm:text-base">
              {{ $t("hero.agentPrompt") }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* The orb: soft blobs of sky, teal and lime drifting round inside a circle,
   under a film of grain — a calm "listening" state, like a voice assistant at
   rest. */
.voice-orb__mesh {
  background:
    radial-gradient(circle at 22% 28%, #d9d45e 0, transparent 26%),
    radial-gradient(circle at 30% 58%, #3d7d6c 0, transparent 38%),
    radial-gradient(circle at 48% 38%, #a8dccf 0, transparent 30%),
    radial-gradient(circle at 76% 24%, #8fd2f4 0, transparent 42%),
    radial-gradient(circle at 64% 62%, #2c6f8c 0, transparent 40%),
    radial-gradient(circle at 50% 92%, #1b86d2 0, transparent 44%),
    #63add0;
  filter: blur(14px) saturate(1.1);
  animation: orb-drift 18s linear infinite;
}

.voice-orb__grain {
  opacity: 0.45;
  mix-blend-mode: soft-light;
}

@keyframes orb-drift {
  from {
    transform: rotate(0deg) scale(1.05);
  }
  50% {
    transform: rotate(180deg) scale(1.15);
  }
  to {
    transform: rotate(360deg) scale(1.05);
  }
}

@media (prefers-reduced-motion: reduce) {
  .voice-orb__mesh {
    animation: none;
  }
}
</style>
