<script setup lang="ts">
import { computed, ref, watch, onUnmounted } from "vue"
import { useI18nList, useInView, usePrefersReducedMotion } from "@/shared/lib"
import { CIcon, CSectionHeading } from "@/shared/ui"
import CStreamingBubble from "./CStreamingBubble.vue"

interface Turn {
  role: "agent" | "user"
  text: string
}

const points = useI18nList<string>("voice.points")
const transcript = useI18nList<Turn>("voice.transcript")

const card = ref<HTMLElement | null>(null)
const inView = useInView(card, { threshold: 0.4 })
const reduced = usePrefersReducedMotion()

// The transcript plays turn by turn: a typing indicator, then the bubble
// streams in, then the next turn — looping for as long as the card is visible.
const revealed = ref(0)
const mode = ref<"indicator" | "stream" | "idle">("indicator")
const total = computed(() => transcript.value.length)
const showStatic = computed(() => reduced.value)

let timer = 0
const clearTimer = () => window.clearTimeout(timer)

const reset = () => {
  clearTimer()
  if (reduced.value) {
    revealed.value = total.value
    mode.value = "idle"
    return
  }
  revealed.value = 0
  mode.value = "indicator"
}

// Restart cleanly on a language switch (a shorter translated line must not be
// streamed against a stale index) and whenever the motion preference flips.
watch([transcript, reduced], reset, { immediate: true })

// Indicator → stream after a short beat; a finished transcript holds, then loops.
watch(
  [mode, revealed, inView, reduced],
  () => {
    clearTimer()
    if (!inView.value || reduced.value) return

    if (mode.value === "indicator" && revealed.value < total.value) {
      timer = window.setTimeout(() => (mode.value = "stream"), 750)
    } else if (mode.value === "idle" && revealed.value >= total.value) {
      timer = window.setTimeout(reset, 2800)
    }
  },
  { immediate: true }
)

const onTurnDone = () => {
  revealed.value += 1
  mode.value = revealed.value >= total.value ? "idle" : "indicator"
}

onUnmounted(clearTimer)

const bubbleClass = (role: Turn["role"]) =>
  role === "agent"
    ? "max-w-[80%] rounded-2xl rounded-tl-sm border border-sand-200 bg-sand-100 px-4 py-2.5 text-sm leading-relaxed text-sand-900"
    : "ml-auto max-w-[80%] rounded-2xl rounded-tr-sm border border-sand-200 bg-white px-4 py-2.5 text-sm leading-relaxed text-sand-700"

const miniBars = [0.5, 0.9, 0.6, 1, 0.7]
</script>

<template>
  <section id="voice" class="section-ground py-[60px] sm:py-[100px]">
    <div class="ambient-glow -right-16 top-1/3 h-72 w-[30rem]" aria-hidden="true" />

    <div class="container relative z-10">
      <div class="grid items-center gap-12 lg:grid-cols-2">
        <!-- Copy + qualified points -->
        <div>
          <CSectionHeading
            align="left"
            :eyebrow="$t('voice.eyebrow')"
            :title="$t('voice.title')"
            :subtitle="$t('voice.subtitle')"
          />

          <ul class="mt-8 space-y-3">
            <li
              v-for="(point, i) in points"
              :key="i"
              class="flex items-start gap-3"
              data-aos="fade-up"
              data-aos-duration="700"
              :data-aos-delay="100 + i * 70"
            >
              <span
                class="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sand-950 text-white"
              >
                <CIcon name="check" class="h-3.5 w-3.5" stroke-width="2.5" />
              </span>
              <span class="text-sm text-sand-700 sm:text-base">{{ point }}</span>
            </li>
          </ul>
        </div>

        <!-- Live transcript card -->
        <div
          class="relative mx-auto w-full max-w-[440px] lg:mx-0"
          data-aos="fade-up"
          data-aos-duration="1000"
          data-aos-delay="200"
        >
          <div class="ambient-glow -inset-6" aria-hidden="true" />

          <div ref="card" class="relative rounded-[28px] border border-sand-200 bg-white/90 p-6 shadow-[0_24px_60px_-28px_rgba(12,10,9,0.25)] backdrop-blur">
            <div class="flex items-center justify-between gap-4 border-b border-sand-200 pb-4">
              <span class="flex items-center gap-2 text-sm font-medium text-sand-950">
                <span class="relative flex h-2 w-2">
                  <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                  <span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                {{ $t("voice.callLabel") }}
              </span>

              <div class="flex h-5 items-center gap-[3px]" aria-hidden="true">
                <span
                  v-for="(bar, i) in miniBars"
                  :key="i"
                  class="wave-bar w-[3px] origin-center rounded-full bg-signal"
                  :style="{ height: `${bar * 100}%`, animation: `wave 1.1s ease-in-out ${i * 0.12}s infinite` }"
                />
              </div>
            </div>

            <div class="mt-5 flex flex-col gap-3">
              <template v-if="showStatic">
                <p v-for="(msg, i) in transcript" :key="i" :class="bubbleClass(msg.role)">
                  {{ msg.text }}
                </p>
              </template>

              <template v-else>
                <p
                  v-for="(msg, i) in transcript.slice(0, revealed)"
                  :key="i"
                  :class="bubbleClass(msg.role)"
                >
                  {{ msg.text }}
                </p>

                <CStreamingBubble
                  v-if="revealed < total && mode === 'stream'"
                  :key="`stream-${revealed}`"
                  :text="transcript[revealed].text"
                  :role="transcript[revealed].role"
                  @done="onTurnDone"
                />

                <div
                  v-else-if="revealed < total && mode === 'indicator'"
                  class="inline-flex w-fit items-center gap-1 rounded-2xl border px-4 py-3"
                  :class="
                    transcript[revealed].role === 'agent'
                      ? 'rounded-tl-sm border-sand-200 bg-sand-100'
                      : 'ml-auto rounded-tr-sm border-sand-200 bg-white'
                  "
                  aria-hidden="true"
                >
                  <span
                    v-for="i in 3"
                    :key="i"
                    class="wave-bar h-1.5 w-1.5 rounded-full bg-sand-400"
                    :style="{ animation: `wave 1s ease-in-out ${(i - 1) * 0.15}s infinite` }"
                  />
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
