<script setup lang="ts">
import { ref } from "vue"
import { useI18nList } from "@/shared/lib"
import { CIcon, CSectionHeading, CDoppiMark } from "@/shared/ui"

interface Module {
  icon: string
  label: string
}

const modules = useI18nList<Module>("solution.modules")

// Fixed anchor points (percent of the square diagram box); each chip is centred
// on its point. Hovering a chip lights up its spoke back to the hub.
const ORBIT_POSITIONS = [
  { top: 2, left: 50 },
  { top: 27, left: 93 },
  { top: 73, left: 93 },
  { top: 98, left: 50 },
  { top: 73, left: 7 },
  { top: 27, left: 7 },
]

const hovered = ref<number | null>(null)

const spokeClass = (i: number) => {
  if (hovered.value === i) return "stroke-[#8F6BFF]"
  return hovered.value === null ? "stroke-[#6633EE]/30" : "stroke-[#6633EE]/10"
}
</script>

<template>
  <section id="solution" class="section-dark py-[60px] sm:py-[100px]">
    <div
      class="violet-glow left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2"
      aria-hidden="true"
    />

    <div class="container relative z-10">
      <CSectionHeading
        :eyebrow="$t('solution.eyebrow')"
        :title="$t('solution.title')"
        :subtitle="$t('solution.subtitle')"
      />

      <!-- Desktop: constellation of modules around the Do'ppi hub -->
      <div
        class="relative mx-auto mt-16 hidden h-[30rem] w-[30rem] lg:block"
        data-aos="zoom-in"
        data-aos-duration="1000"
      >
        <svg
          class="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <circle
            cx="50"
            cy="50"
            r="47"
            fill="none"
            stroke-width="0.25"
            stroke-dasharray="0.5 2"
            class="stroke-[#6633EE]/30"
          />
          <line
            v-for="(pos, i) in ORBIT_POSITIONS"
            :key="i"
            x1="50"
            y1="50"
            :x2="pos.left"
            :y2="pos.top"
            :stroke-width="hovered === i ? 0.7 : 0.3"
            stroke-dasharray="1 1.5"
            class="transition-all duration-200"
            :class="spokeClass(i)"
          />
        </svg>

        <ul>
          <li
            v-for="(module, i) in modules"
            :key="i"
            class="absolute -translate-x-1/2 -translate-y-1/2"
            :style="{
              top: `${ORBIT_POSITIONS[i % 6].top}%`,
              left: `${ORBIT_POSITIONS[i % 6].left}%`,
            }"
            @mouseenter="hovered = i"
            @mouseleave="hovered = null"
          >
            <div
              class="flex items-center gap-3 rounded-2xl border px-4 py-3 backdrop-blur-sm transition-colors duration-200"
              :class="
                hovered === i
                  ? 'border-[#6633EE]/70 bg-[#1C0F38] shadow-[0_16px_40px_-16px_rgba(102,51,238,0.8)]'
                  : 'border-white/10 bg-[#160A2E]/80'
              "
            >
              <span
                class="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#6633EE]/15"
              >
                <CIcon :name="module.icon" class="h-5 w-5 text-[#B9A2FF]" />
              </span>
              <span class="whitespace-nowrap text-sm font-medium text-white">{{
                module.label
              }}</span>
            </div>
          </li>
        </ul>

        <!-- Center hub -->
        <div
          class="absolute left-1/2 top-1/2 grid h-32 w-32 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-[#6633EE]/50 bg-[#160A2E] text-center shadow-[0_0_60px_-10px_rgba(102,51,238,0.8)]"
        >
          <span
            class="absolute inset-0 animate-pulse-ring rounded-full border border-[#6633EE]/50"
            aria-hidden="true"
          />
          <div class="relative z-10 flex flex-col items-center gap-1.5">
            <CDoppiMark class="h-10 w-10 text-[#8F6BFF]" />
            <span class="text-sm font-bold tracking-tight text-white">
              {{ $t("solution.centerLabel") }}
            </span>
          </div>
        </div>
      </div>

      <!-- Mobile / tablet: hub chip + module grid -->
      <div class="mt-12 lg:hidden">
        <div
          class="mx-auto flex w-fit items-center gap-3 rounded-2xl border border-[#6633EE]/50 bg-[#160A2E] px-5 py-3"
          data-aos="fade-up"
          data-aos-duration="800"
        >
          <CDoppiMark class="h-7 w-7 shrink-0 text-[#8F6BFF]" />
          <span class="text-sm font-bold tracking-tight text-white">
            {{ $t("solution.centerLabel") }}
          </span>
        </div>

        <ul class="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <!-- AOS owns the <li>; the card sits inside so its hover transition survives. -->
          <li
            v-for="(module, i) in modules"
            :key="i"
            data-aos="fade-up"
            data-aos-duration="800"
            :data-aos-delay="100 + i * 60"
          >
            <div
              class="surface-card flex h-full items-center gap-3 rounded-2xl px-4 py-3"
            >
              <span
                class="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#6633EE]/15"
              >
                <CIcon :name="module.icon" class="h-5 w-5 text-[#B9A2FF]" />
              </span>
              <span class="text-sm font-medium text-white">{{
                module.label
              }}</span>
            </div>
          </li>
        </ul>
      </div>

      <p
        class="mx-auto mt-14 max-w-[560px] text-center text-[#A3A3A3]"
        data-aos="fade-up"
        data-aos-duration="800"
      >
        {{ $t("solution.note") }}
      </p>
    </div>
  </section>
</template>
