<script setup lang="ts">
import { useHead } from "@unhead/vue"
import { CDoppiMark, CIcon } from "@/shared/ui"
import CAuthTestimonials from "./CAuthTestimonials.vue"

withDefaults(
  defineProps<{
    title?: string
    description?: string
  }>(),
  {
    title: "Do'ppi.ai",
    description: "Do'ppi.ai autentifikatsiyasi",
  }
)

useHead({
  title: "Do'ppi.ai",
  meta: [{ name: "description", content: "Do'ppi.ai autentifikatsiyasi" }],
})

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
  <main class="flex min-h-screen bg-white text-[#15151B]">
    <aside
      class="relative hidden w-[560px] shrink-0 flex-col overflow-hidden bg-[#121216] p-11 lg:flex"
    >
      <div
        class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(91,75,232,.18),transparent_45%)]"
        aria-hidden="true"
      />
      <div class="relative flex items-center gap-4">
        <RouterLink
          to="/"
          class="inline-flex items-center gap-3"
          aria-label="Do'ppi AI bosh sahifasi"
        >
          <span
            class="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#5B4BE8]"
            ><CDoppiMark class="h-5 w-6 text-white"
          /></span>
          <span class="text-base font-semibold tracking-tight text-white"
            >Do'ppi AI</span
          >
        </RouterLink>
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

    <section class="flex min-w-0 flex-1 flex-col px-8 py-[26px] sm:px-8">
      <header class="flex items-center gap-4 lg:hidden">
        <RouterLink
          to="/"
          class="inline-flex items-center gap-3"
          aria-label="Do'ppi AI bosh sahifasi"
          ><span
            class="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#5B4BE8]"
            ><CDoppiMark class="h-5 w-6 text-white" /></span
          ><span class="text-base font-semibold tracking-tight"
            >Do'ppi AI</span
          ></RouterLink
        >
      </header>
      <div class="flex flex-1 items-center justify-center py-6 sm:py-10">
        <div class="w-full max-w-[400px]"><slot /></div>
      </div>
      <p class="text-center text-xs leading-5 text-[#84848E]">
        Davom etish orqali siz
        <RouterLink to="/terms" class="hover:underline"
          >foydalanish shartlari</RouterLink
        >
        va
        <RouterLink to="/privacy" class="hover:underline"
          >maxfiylik siyosatiga</RouterLink
        >
        rozilik bildirasiz.
      </p>
    </section>
  </main>
</template>
