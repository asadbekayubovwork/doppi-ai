<script setup lang="ts">
import { useI18nList } from "@/shared/lib"
import { CIcon, CSectionHeading } from "@/shared/ui"
import CDemoInstagram from "./demo/CDemoInstagram.vue"
import CDemoLeads from "./demo/CDemoLeads.vue"
import CDemoCall from "./demo/CDemoCall.vue"
import CDemoResult from "./demo/CDemoResult.vue"

interface Step {
  tag: string
  title: string
  desc: string
  bullets: string[]
}

const base = "services.voice.landing.steps"
const steps = useI18nList<Step>(`${base}.items`)

// One mockup per step, in the order the chain runs.
const VISUALS = [CDemoInstagram, CDemoLeads, CDemoCall, CDemoResult]

// Steps alternate sides: the two phone screens open on the left, the two CRM
// windows on the right. The copy column is fixed so both stages get the same
// width whichever side they land on.
const isPhoneStep = (index: number) => index % 2 === 0
</script>

<template>
  <section id="voice-flow" class="section-ground py-[60px] sm:py-[100px]">
    <div class="container relative z-10">
      <CSectionHeading
        :eyebrow="$t(`${base}.eyebrow`)"
        :title="$t(`${base}.title`)"
        :subtitle="$t(`${base}.subtitle`)"
      />

      <ol class="mt-16 flex flex-col gap-16 sm:gap-24">
        <li
          v-for="(step, i) in steps"
          :key="step.title"
          class="grid items-center gap-10 lg:gap-16"
          :class="
            isPhoneStep(i)
              ? 'lg:grid-cols-[minmax(0,1fr)_460px]'
              : 'lg:grid-cols-[460px_minmax(0,1fr)]'
          "
        >
          <!-- Mockup -->
          <div
            class="order-2 flex w-full min-w-0 justify-center rounded-[28px] border border-sand-200 bg-[radial-gradient(ellipse_70%_70%_at_50%_40%,#FFFFFF_0%,#F1EFEC_100%)] p-4 sm:p-8"
            :class="isPhoneStep(i) ? 'lg:order-1' : 'lg:order-2'"
            data-aos="fade-up"
            data-aos-duration="900"
          >
            <component :is="VISUALS[i]" />
          </div>

          <!-- Copy -->
          <div
            class="order-1 flex max-w-[460px] flex-col gap-4"
            :class="isPhoneStep(i) ? 'lg:order-2' : 'lg:order-1'"
            data-aos="fade-up"
            data-aos-duration="900"
            data-aos-delay="120"
          >
            <span class="flex items-center gap-3">
              <span
                class="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-sand-200 bg-white text-[13px] font-semibold tabular-nums text-signal"
              >
                {{ String(i + 1).padStart(2, "0") }}
              </span>
              <span
                class="text-xs font-semibold uppercase tracking-[0.14em] text-sand-500"
              >
                {{ step.tag }}
              </span>
            </span>

            <h3
              class="text-2xl font-bold leading-[120%] tracking-tight text-sand-950 sm:text-[34px]"
            >
              {{ step.title }}
            </h3>

            <p class="text-base leading-[165%] text-sand-500">
              {{ step.desc }}
            </p>

            <ul class="mt-1 flex flex-col gap-2.5">
              <li
                v-for="bullet in step.bullets"
                :key="bullet"
                class="flex items-start gap-2.5 text-[15px] text-sand-700"
              >
                <CIcon
                  name="check"
                  class="mt-1 h-4 w-4 shrink-0 text-signal"
                  stroke-width="2.5"
                  aria-hidden="true"
                />
                {{ bullet }}
              </li>
            </ul>
          </div>
        </li>
      </ol>
    </div>
  </section>
</template>
