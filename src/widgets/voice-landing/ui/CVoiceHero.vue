<script setup lang="ts">
import { useI18nList } from "@/shared/lib"
import { CIcon } from "@/shared/ui"
import { SERVICE_PATHS } from "@/shared/config/seoPages"

interface FlowStep {
  icon: string
  label: string
}

const base = "services.voice.landing"
const flow = useI18nList<FlowStep>(`${base}.flow`)

// The secondary CTA drops the visitor at the step that plays the call back.
const flowAnchor = { path: SERVICE_PATHS.voice, hash: "#voice-flow" }
</script>

<template>
  <section class="section-ground pb-10 pt-[130px] sm:pb-16 sm:pt-[180px]">
    <div
      class="pointer-events-none absolute inset-0 bg-grid mask-fade-b opacity-60"
      aria-hidden="true"
    />

    <div class="container relative z-10 flex flex-col items-center text-center">
      <span
        class="inline-flex items-center gap-2 rounded-full border border-sand-200 bg-white px-3.5 py-[7px] text-[13px] text-sand-500"
        data-aos="fade-up"
        data-aos-duration="800"
      >
        <span
          class="h-[7px] w-[7px] rounded-full bg-signal"
          aria-hidden="true"
        />
        {{ $t(`${base}.badge`) }}
      </span>

      <h1
        class="mt-6 max-w-[920px] text-[32px] font-bold leading-[110%] tracking-tight text-sand-950 sm:text-5xl lg:text-[62px]"
        data-aos="fade-up"
        data-aos-duration="1000"
      >
        {{ $t(`${base}.title`) }}
      </h1>

      <p
        class="mt-6 max-w-[660px] text-base leading-[160%] text-sand-500 sm:text-[17px]"
        data-aos="fade-up"
        data-aos-duration="1000"
        data-aos-delay="150"
      >
        {{ $t(`${base}.subtitle`) }}
      </p>

      <div
        class="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row"
        data-aos="fade-up"
        data-aos-duration="1000"
        data-aos-delay="250"
      >
        <RouterLink
          to="/login"
          class="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-sand-950 px-7 font-medium text-white transition-300 hover:bg-sand-800 sm:w-auto"
        >
          {{ $t(`${base}.ctaPrimary`) }}
          <CIcon name="arrow-right" class="h-4 w-4" />
        </RouterLink>
        <RouterLink
          :to="flowAnchor"
          class="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-sand-200 bg-white px-6 font-medium text-sand-950 transition-300 hover:bg-sand-100 sm:w-auto"
        >
          <CIcon name="circle-play" class="h-4 w-4" />
          {{ $t(`${base}.ctaSecondary`) }}
        </RouterLink>
      </div>

      <!-- The chain the page then walks through, step by step. -->
      <ol
        class="flow-strip mt-10 flex w-full items-center gap-2.5 overflow-x-auto pb-1 sm:w-auto sm:flex-wrap sm:justify-center sm:overflow-visible"
        data-aos="fade-up"
        data-aos-duration="1000"
        data-aos-delay="350"
      >
        <template v-for="(step, i) in flow" :key="step.label">
          <li
            class="flex shrink-0 items-center gap-2 rounded-full border border-sand-200 bg-white px-3.5 py-2 text-[13px] font-medium text-sand-700"
          >
            <CIcon :name="step.icon" class="h-[15px] w-[15px] text-signal" />
            {{ step.label }}
          </li>
          <li
            v-if="i < flow.length - 1"
            class="shrink-0 text-sand-300"
            aria-hidden="true"
          >
            <CIcon name="arrow-right" class="h-[15px] w-[15px]" />
          </li>
        </template>
      </ol>
    </div>
  </section>
</template>

<style scoped>
/* The chain scrolls sideways on a phone; the fade says there is more of it. */
@media (max-width: 639px) {
  .flow-strip {
    -webkit-mask-image: linear-gradient(to right, black 82%, transparent);
    mask-image: linear-gradient(to right, black 82%, transparent);
  }
}
</style>
