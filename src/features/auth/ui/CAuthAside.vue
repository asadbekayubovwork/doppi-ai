<script setup lang="ts">
import { CIcon, CLogo } from "@/shared/ui"
import CAuthTestimonials from "./CAuthTestimonials.vue"

const highlights = [
  {
    icon: "library",
    title: "Universal RAG agent",
    text: "O'z ma'lumotlaringizga asoslangan, manbasi ko'rsatilgan javoblar.",
  },
  {
    icon: "audio-lines",
    title: "Ovozli agent",
    text: "Qo'ng'iroqlarni o'zbek, rus va ingliz tilida 24/7 qabul qiladi.",
  },
  {
    icon: "clapperboard",
    title: "Video generator",
    text: "Bitta promptni bir necha daqiqada tayyor videoga aylantiradi.",
  },
]
</script>

<template>
  <!-- Pinned to the viewport so a taller form on the right (register) doesn't
       stretch the panel and re-centre its copy between auth steps. -->
  <aside
    class="sticky top-0 hidden h-dvh min-h-[680px] w-[560px] shrink-0 flex-col self-start overflow-hidden bg-[#121216] p-11 lg:flex"
  >
    <div
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(91,75,232,.18),transparent_45%)]"
      aria-hidden="true"
    />
    <div class="relative flex items-center justify-between gap-4">
      <RouterLink
        to="/"
        class="inline-flex items-center"
        aria-label="Do'ppi AI bosh sahifasi"
      >
        <CLogo />
      </RouterLink>
      <RouterLink
        to="/"
        class="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 text-xs font-medium text-white/55 transition-colors hover:bg-white/[0.08] hover:text-white/80"
        >doppi.ai<CIcon name="arrow-up-right" class="h-3.5 w-3.5"
      /></RouterLink>
    </div>

    <div class="relative flex flex-1 flex-col justify-center py-12">
      <h2
        class="max-w-[460px] text-[34px] font-semibold leading-[1.15] tracking-[-0.02em] text-white"
      >
        Har bir AI agent uchun yagona ish maydoni.
      </h2>
      <p class="mt-5 max-w-[420px] text-sm leading-[1.65] text-white/45">
        RAG agentlar, ovozli agentlar va video generatsiya — bitta balans,
        bitta jamoa, ko'plab bizneslar.
      </p>
      <ul class="mt-9 space-y-4">
        <li
          v-for="item in highlights"
          :key="item.title"
          class="flex items-start gap-4"
        >
          <span
            class="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.06] text-[#B6ABFF]"
            ><CIcon :name="item.icon" class="h-5 w-5"
          /></span>
          <span
            ><span class="block text-[15px] font-semibold text-white">{{
              item.title
            }}</span
            ><span
              class="mt-1 block max-w-[330px] text-[13.5px] leading-[1.5] text-white/40"
              >{{ item.text }}</span
            ></span
          >
        </li>
      </ul>
    </div>

    <CAuthTestimonials />
  </aside>
</template>
