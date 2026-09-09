<script setup lang="ts">
import { computed, ref } from "vue"
import { useI18n } from "vue-i18n"
import { useI18nList, useInView, useCallTimer, useTypewriter } from "@/shared/lib"
import { CIcon, CCountUp } from "@/shared/ui"

interface Stat {
  value: string
  label: string
}

const { t } = useI18n()
const stats = useI18nList<Stat>("hero.stats")

// The live-call card only animates while it is on screen.
const callCard = ref<HTMLElement | null>(null)
const inView = useInView(callCard, { threshold: 0.35 })
const clock = useCallTimer(inView)

const caption = computed(() => t("hero.agentCaption"))
const { typed, done } = useTypewriter(caption, {
  active: inView,
  loop: true,
  holdMs: 2600,
})

// Per-bar heights + durations so the crest travels — reads as live audio.
const bars = [0.4, 0.7, 1, 0.6, 0.85, 0.5, 0.9, 0.65, 1, 0.55, 0.8, 0.45, 0.7, 0.95, 0.5]
const barStyle = (height: number, index: number) => ({
  height: `${height * 100}%`,
  animation: `wave ${0.8 + (index % 5) * 0.12}s ease-in-out ${index * 0.06}s infinite`,
})
</script>

<template>
  <section id="top" class="hero section-dark pt-[120px] pb-[60px] sm:pt-[160px] sm:pb-[100px]">
    <div class="pointer-events-none absolute inset-0 bg-grid mask-fade-b opacity-70" aria-hidden="true" />
    <div class="violet-glow animate-drift left-[6%] -top-40 h-72 w-[34rem]" aria-hidden="true" />
    <div
      class="violet-glow animate-drift right-[4%] top-10 h-64 w-[28rem]"
      style="animation-delay: -13s"
      aria-hidden="true"
    />

    <div class="container relative z-10">
      <div class="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <!-- Copy -->
        <div class="flex flex-col items-start">
          <span
            class="inline-flex items-center gap-2 rounded-full border border-[#6633EE]/40 bg-[#6633EE]/10 px-4 py-2 text-xs sm:text-sm font-medium text-[#C9B8FF]"
            data-aos="fade-up"
            data-aos-duration="800"
          >
            <span class="relative flex h-1.5 w-1.5">
              <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#8F6BFF] opacity-75" />
              <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#8F6BFF]" />
            </span>
            {{ $t("hero.badge") }}
          </span>

          <h1
            class="mt-6 text-[32px] sm:text-5xl lg:text-[56px] font-bold leading-[110%] tracking-tight text-white"
            data-aos="fade-up"
            data-aos-duration="1000"
            data-aos-delay="100"
          >
            {{ $t("hero.titleTop") }}
            <span class="text-gradient-violet">{{ $t("hero.titleHighlight") }}</span>
            {{ $t("hero.titleBottom") }}
          </h1>

          <p
            class="mt-6 max-w-[600px] text-base sm:text-lg leading-[150%] text-[#A3A3A3]"
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
              class="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#6633EE] px-8 font-medium text-white transition-300 hover:bg-[#6633EE]/80"
            >
              {{ $t("hero.ctaPrimary") }}
              <CIcon name="arrow-right" class="h-4 w-4" />
            </RouterLink>

            <a
              href="#voice"
              class="flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#3D3D3D]/40 px-8 font-medium text-white transition-300 hover:bg-[#3D3D3D]/60"
            >
              <CIcon name="play" class="h-4 w-4" />
              {{ $t("hero.ctaSecondary") }}
            </a>
          </div>

          <dl
            class="mt-12 grid w-full max-w-[520px] grid-cols-3 gap-6 border-t border-white/10 pt-8"
            data-aos="fade-up"
            data-aos-duration="1000"
            data-aos-delay="400"
          >
            <div v-for="stat in stats" :key="stat.label">
              <dt class="text-2xl sm:text-3xl font-bold text-gradient-violet">
                <CCountUp :value="stat.value" />
              </dt>
              <dd class="mt-1 text-xs sm:text-sm leading-snug text-[#A3A3A3]">
                {{ stat.label }}
              </dd>
            </div>
          </dl>
        </div>

        <!-- Live AI voice-call card -->
        <div
          class="relative mx-auto w-full max-w-[400px]"
          data-aos="zoom-in"
          data-aos-duration="1000"
          data-aos-delay="300"
        >
          <div class="absolute -inset-6 rounded-[2rem] bg-[#6633EE]/20 blur-3xl" aria-hidden="true" />

          <div
            ref="callCard"
            class="relative rounded-[28px] border border-white/10 bg-[#160A2E]/80 p-6 backdrop-blur"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span
                  class="relative inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#6633EE]/15 text-[#B9A2FF]"
                >
                  <span
                    class="absolute inset-0 animate-pulse-ring rounded-full border border-[#6633EE]/50"
                    aria-hidden="true"
                  />
                  <CIcon name="phone" class="h-5 w-5" />
                </span>
                <div>
                  <p class="text-sm font-semibold text-white">{{ $t("hero.agentName") }}</p>
                  <p class="flex items-center gap-1.5 text-xs text-[#A3A3A3]">
                    <span class="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {{ $t("hero.agentStatus") }}
                  </p>
                </div>
              </div>
              <span class="text-xs tabular-nums text-[#A3A3A3]">{{ clock }}</span>
            </div>

            <div class="my-6 rounded-2xl border border-white/10 bg-ground/70 p-4">
              <div class="flex h-14 items-center justify-center gap-[3px]" aria-hidden="true">
                <span
                  v-for="(bar, i) in bars"
                  :key="i"
                  class="wave-bar w-[3px] origin-center rounded-full bg-[#8F6BFF]"
                  :style="barStyle(bar, i)"
                />
              </div>
            </div>

            <p class="min-h-[44px] text-center text-sm leading-relaxed text-[#A3A3A3]">
              {{ typed }}
              <span
                v-if="!done"
                class="ml-0.5 inline-block h-4 w-px translate-y-0.5 animate-pulse bg-[#8F6BFF] align-middle"
                aria-hidden="true"
              />
            </p>

            <div class="mt-6 flex items-center justify-center gap-4">
              <button
                type="button"
                disabled
                :aria-label="$t('a11y.mute')"
                class="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70"
              >
                <CIcon name="mic" class="h-5 w-5" />
              </button>
              <button
                type="button"
                disabled
                :aria-label="$t('a11y.endCall')"
                class="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-500/90 text-white shadow-lg"
              >
                <CIcon name="phone-off" class="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
