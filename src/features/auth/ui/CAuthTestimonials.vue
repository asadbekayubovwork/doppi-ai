<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from "vue"
import { usePrefersReducedMotion } from "@/shared/lib"
import { CIcon } from "@/shared/ui"

/** How long each quote stays on screen before the next one slides in. */
const ROTATE_MS = 6000

interface Testimonial {
  quote: string
  name: string
  role: string
  initials: string
}

const testimonials: Testimonial[] = [
  {
    quote:
      "Uchta vendorni Do'ppi bilan almashtirdik. Liniyamiz endi 4 soniyada, o'zbek tilida javob beradi.",
    name: "Dilnoza Saidova",
    role: "COO, Silk Road Logistics",
    initials: "DS",
  },
  {
    quote:
      "Buyurtma savollarining 70 foizini agent yopadi. Operatorlar faqat murakkab holatlar bilan ishlaydi.",
    name: "Sardor Rahimov",
    role: "Mijozlar xizmati rahbari, Anor Retail",
    initials: "SR",
  },
  {
    quote:
      "Agent har bir javobga ichki hujjatdan manba biriktiradi. Auditorlar uchun shu hal qiluvchi bo'ldi.",
    name: "Jasur Abdullayev",
    role: "IT rahbari, Zamin Agro",
    initials: "JA",
  },
  {
    quote:
      "Bir oyda 40 ta reklama roligi tayyorladik. Ilgari bittasi uchun butun bir hafta ketardi.",
    name: "Kamola Yusupova",
    role: "Marketing direktori, Navro Clinic",
    initials: "KY",
  },
  {
    quote:
      "Tungi qo'ng'iroqlar endi javobsiz qolmaydi. Uchala agentni bitta balansdan boshqaramiz.",
    name: "Nigora Tursunova",
    role: "Operatsiyalar boshlig'i, Bekat Telecom",
    initials: "NT",
  },
]

const reduced = usePrefersReducedMotion()
const index = ref(0)
const paused = ref(false)
const current = computed(() => testimonials[index.value])

let timer: ReturnType<typeof setInterval> | undefined

const stop = () => {
  if (timer) clearInterval(timer)
  timer = undefined
}

const start = () => {
  stop()
  // Pointer parked on the card, or the visitor asked for less motion — let them
  // read at their own pace and drive it with the dots instead.
  if (reduced.value || paused.value || testimonials.length < 2) return
  timer = setInterval(() => {
    index.value = (index.value + 1) % testimonials.length
  }, ROTATE_MS)
}

/** Manual pick restarts the dwell so the chosen quote gets a full interval. */
const show = (next: number) => {
  index.value = next
  start()
}

watch([reduced, paused], start, { immediate: true })
onUnmounted(stop)
</script>

<template>
  <figure class="relative rounded-[14px] border border-white/[0.08] bg-white/[0.03] px-[18px] py-3.5"
    @mouseenter="paused = true" @mouseleave="paused = false" @focusin="paused = true" @focusout="paused = false">
    <Transition name="step" mode="out-in">
      <blockquote :key="index" class="block">
        <!-- Two lines of headroom keeps the panel from jumping as quotes swap
             in; the right padding clears the pagination dots above. -->
        <p class="min-h-[44px] pr-16 text-[13.5px] leading-[1.6] text-white/85">
          &ldquo;{{ current.quote }}&rdquo;
        </p>
        <footer class="mt-4 flex items-center justify-between gap-4">
          <span class="flex items-center gap-3"><span
              class="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-[#5B4BE8]/25 text-xs font-semibold text-[#B6ABFF]"
              aria-hidden="true">{{ current.initials }}</span><span><span
                class="block text-[13.5px] font-semibold text-white">{{
                  current.name
                }}</span><span class="block text-xs text-white/40">{{
                  current.role
                }}</span></span></span><span class="flex shrink-0 gap-0.5 text-[#D3F26A]" role="img"
            aria-label="5 balldan 5">
            <CIcon v-for="star in 5" :key="star" name="star" class="h-3 w-3" />
          </span>
        </footer>
      </blockquote>
    </Transition>
  </figure>
</template>
