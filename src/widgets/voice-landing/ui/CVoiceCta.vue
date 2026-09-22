<script setup lang="ts">
import { computed } from "vue"
import { CIcon } from "@/shared/ui"
import { SOCIALS } from "@/shared/config/socials"

const base = "services.voice.landing.cta"

// "Talk to a manager" goes to the company Telegram when there is one, so it
// stays a different door from the form the primary button opens.
const telegram = computed(() =>
  SOCIALS.find((social) => social.icon === "telegram")
)
</script>

<template>
  <section class="section-ground pb-[80px] sm:pb-[120px]">
    <div class="container relative z-10">
      <div
        class="flex flex-col items-start gap-8 rounded-[28px] bg-sand-950 p-8 sm:p-12 lg:flex-row lg:items-center lg:justify-between lg:gap-10 lg:p-[52px]"
        data-aos="fade-up"
        data-aos-duration="900"
      >
        <div class="flex max-w-[640px] flex-col gap-3.5">
          <h2
            class="text-[26px] font-bold leading-[115%] tracking-tight text-white sm:text-[38px]"
          >
            {{ $t(`${base}.title`) }}
          </h2>
          <p class="text-base leading-[165%] text-sand-300">
            {{ $t(`${base}.subtitle`) }}
          </p>
        </div>

        <div class="flex w-full shrink-0 flex-col gap-3 sm:w-auto lg:items-end">
          <RouterLink
            to="/contact-us"
            class="flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-7 font-semibold text-sand-950 transition-300 hover:bg-sand-100"
          >
            {{ $t(`${base}.primary`) }}
            <CIcon name="phone-call" class="h-4 w-4" />
          </RouterLink>

          <a
            v-if="telegram"
            :href="telegram.href"
            target="_blank"
            rel="noopener noreferrer"
            class="flex h-12 items-center justify-center gap-2 rounded-xl border border-white/30 px-7 font-semibold text-white transition-300 hover:bg-white/10"
          >
            {{ $t(`${base}.secondary`) }}
            <CIcon name="telegram" class="h-4 w-4" />
          </a>
          <RouterLink
            v-else
            to="/contact-us"
            class="flex h-12 items-center justify-center gap-2 rounded-xl border border-white/30 px-7 font-semibold text-white transition-300 hover:bg-white/10"
          >
            {{ $t(`${base}.secondary`) }}
          </RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>
