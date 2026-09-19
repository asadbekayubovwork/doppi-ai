<script setup lang="ts">
import { computed, ref, useId } from "vue"
import { useI18n } from "vue-i18n"
import { useI18nList, useCallTimer } from "@/shared/lib"
import { CIcon, CCountUp } from "@/shared/ui"
import { useVoiceSession } from "@/features/voice-agent"

interface Stat {
  value: string
  label: string
}

const stats = useI18nList<Stat>("hero.stats")

const grainId = `${useId()}-grain`

// --- Live voice agent behind the orb --------------------------------------
const { t } = useI18n()
const agentAudio = ref<HTMLAudioElement | null>(null)
const { phase, speaker, error, isActive, start, stop } = useVoiceSession({
  audioEl: agentAudio,
})

/** Live "MM:SS" call clock, running only while a call is active. */
const callTime = useCallTimer(isActive)

/** The line under the orb reflects the finest-grained thing happening. */
const statusText = computed(() => {
  if (phase.value === "error")
    return error.value || t("hero.agentStates.error")
  if (phase.value === "connecting") return t("hero.agentStates.connecting")
  if (phase.value === "live")
    return t(`hero.agentStates.${speaker.value === "idle" ? "live" : speaker.value}`)
  return t("hero.agentStates.idle")
})

/** The orb reacts while connected; connecting reads as "listening". */
const orbState = computed(() => {
  if (phase.value === "connecting") return "listening"
  if (phase.value === "live") return speaker.value
  return "idle"
})

const toggleCall = () => (isActive.value ? stop() : start())
</script>

<template>
  <section id="top" class="hero section-ground pt-[120px] pb-[60px] sm:pt-[160px] sm:pb-[100px] h-screen">
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
            <div class="voice-orb-shell relative h-[200px] w-[200px]" :data-state="orbState">
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

              <button
                type="button"
                :aria-label="isActive ? $t('hero.agentEndCall') : $t('hero.agentCall')"
                :aria-pressed="isActive"
                :disabled="phase === 'connecting'"
                class="absolute left-1/2 top-1/2 grid h-[60px] w-[60px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full shadow-[0_8px_24px_-8px_rgba(12,10,9,0.35)] transition-300 hover:scale-110 disabled:cursor-not-allowed disabled:opacity-70"
                :class="isActive ? 'bg-sand-950 text-white' : 'bg-white text-sand-950'"
                @click="toggleCall"
              >
                <CIcon
                  :name="
                    phase === 'connecting'
                      ? 'loader-circle'
                      : isActive
                        ? 'phone-off'
                        : 'phone'
                  "
                  class="h-5 w-5"
                  :class="{ 'animate-spin': phase === 'connecting' }"
                />
              </button>
            </div>

            <p
              v-if="isActive"
              class="mt-8 flex items-center gap-2 text-xl font-semibold tabular-nums text-sand-950"
              role="timer"
              :aria-label="$t('hero.agentCallTime', { time: callTime })"
            >
              <span class="h-2 w-2 rounded-full bg-signal" aria-hidden="true" />
              {{ callTime }}
            </p>

            <p
              class="max-w-[300px] text-center text-sm font-medium leading-relaxed sm:text-base"
              :class="[
                phase === 'error' ? 'text-signal' : 'text-sand-700',
                isActive ? 'mt-2' : 'mt-8 min-h-[1.5rem]',
              ]"
              role="status"
              aria-live="polite"
            >
              {{ statusText }}
            </p>

            <p
              v-if="!isActive && phase !== 'error'"
              class="mt-2 max-w-[300px] text-center text-xs leading-relaxed text-sand-500 sm:text-sm"
            >
              {{ $t("hero.agentPrompt") }}
            </p>

            <!-- The agent's returned voice. -->
            <audio ref="agentAudio" autoplay class="hidden" />
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

/* The orb comes alive with the call. Listening breathes gently; the agent
   speaking spins the mesh quicker and brighter, so the state is legible at a
   glance without reading the status line. */
.voice-orb-shell {
  transition: transform 300ms ease;
}
.voice-orb-shell[data-state="listening"] {
  transform: scale(1.03);
}
.voice-orb-shell[data-state="speaking"] {
  transform: scale(1.06);
}
.voice-orb-shell[data-state="listening"] .voice-orb__mesh {
  animation-duration: 9s;
}
.voice-orb-shell[data-state="speaking"] .voice-orb__mesh {
  animation-duration: 4s;
  filter: blur(12px) saturate(1.35);
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
  .voice-orb-shell {
    transform: none !important;
  }
}
</style>
