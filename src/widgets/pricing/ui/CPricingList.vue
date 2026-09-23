<script setup lang="ts">
import { onMounted, ref } from "vue"
import { billingApi, type CreditPack } from "@/features/billing"
import { CIcon, CSectionHeading } from "@/shared/ui"

const props = withDefaults(defineProps<{ showHeading?: boolean }>(), {
  showHeading: true,
})

const packs = ref<CreditPack[]>([])
const intro = ref<{
  credits: number
  days: number
  free_video_model: string
} | null>(null)
const rates = ref<Record<string, number>>({})
const unavailable = ref(false)
onMounted(async () => {
  try {
    const [currentPacks, currentIntro, currentRates] = await Promise.all([
      billingApi.packs(),
      billingApi.intro(),
      billingApi.rates(),
    ])
    packs.value = currentPacks
    intro.value = currentIntro
    rates.value = Object.fromEntries(
      currentRates.map((rate) => [rate.code, rate.credits_per_unit])
    )
  } catch {
    unavailable.value = true
  }
})
</script>

<template>
  <section id="pricing" class="section-ground py-[60px] sm:py-[100px]">
    <div class="container relative z-10">
      <CSectionHeading
        v-if="props.showHeading"
        :eyebrow="$t('pricing.eyebrow')"
        :title="$t('pricing.title')"
        :subtitle="$t('pricing.subtitle')"
      />

      <div
        v-if="intro"
        class="mt-14 grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 lg:grid-cols-3"
      >
        <div
          v-for="(tier, i) in [
            {
              id: 'intro',
              title: 'Boshlang‘ich',
              credits: intro.credits,
              price_cents: 0,
            },
            ...packs,
          ]"
          :key="tier.id"
          class="relative"
          data-aos="fade-up"
          data-aos-duration="800"
          :data-aos-delay="100 + i * 90"
        >
          <div
            v-if="i === 0"
            class="absolute -top-3.5 left-1/2 z-20 -translate-x-1/2"
          >
            <span
              class="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-sand-950 px-3.5 py-1 text-xs font-semibold text-white shadow-[0_4px_16px_-4px_rgba(12,10,9,0.4)]"
            >
              <CIcon name="sparkles" class="h-3 w-3" stroke-width="2.5" />
              Yangi foydalanuvchilar uchun
            </span>
          </div>

          <div
            class="surface-card surface-card-lift flex h-full flex-col rounded-2xl p-6"
            :class="i === 0 ? 'surface-card-accent' : ''"
          >
            <h3 class="text-lg font-semibold text-sand-950">
              {{ tier.title }}
            </h3>

            <div class="mt-4 flex items-baseline gap-1">
              <span class="text-4xl font-bold text-sand-950">
                {{
                  tier.price_cents === 0
                    ? "Bepul"
                    : `$${(tier.price_cents / 100).toFixed(2)}`
                }}
              </span>
            </div>

            <p class="mt-2 min-h-[40px] text-sm text-sand-500">
              {{ tier.credits.toLocaleString("uz-UZ") }} kredit
              {{ i === 0 ? `· ${intro.days} kun amal qiladi` : "" }}
            </p>

            <div class="my-6 h-px bg-sand-200" />

            <ul class="flex-1 space-y-3">
              <li
                v-for="feature in i === 0
                  ? [
                      `Chatbot: ${rates.rag_answer ?? '—'} kredit / javob`,
                      `Video: ${rates.video_second ?? '—'} kredit / sekund`,
                      `${intro.free_video_model} video modeli`,
                    ]
                  : [
                      'Balansga kredit qo‘shish',
                      'Xizmatlar bo‘yicha sarf tarixi',
                      'Tarif shartlarini jamoa bilan kelishish',
                    ]"
                :key="feature"
                class="flex items-start gap-2.5 text-sm text-sand-700"
              >
                <CIcon
                  name="check"
                  class="mt-0.5 h-4 w-4 shrink-0 text-sand-950"
                  stroke-width="2.25"
                />
                <span>{{ feature }}</span>
              </li>
            </ul>

            <RouterLink
              :to="i === 0 ? '/register' : '/contact-us'"
              class="mt-8 flex h-12 w-full items-center justify-center rounded-xl font-medium transition-300"
              :class="
                i === 0
                  ? 'bg-sand-950 text-white hover:bg-sand-800'
                  : 'border border-sand-200 bg-white text-sand-950 hover:bg-sand-100'
              "
            >
              {{ i === 0 ? "Boshlash" : "Bog‘lanish" }}
            </RouterLink>
          </div>
        </div>
      </div>

      <p
        class="mt-10 text-center text-sm text-sand-500"
        data-aos="fade-up"
        data-aos-duration="800"
      >
        {{
          unavailable
            ? "Tariflar vaqtincha yuklanmadi."
            : intro
              ? `Yangi akkauntga ${intro.credits.toLocaleString("uz-UZ")} kredit bir marta beriladi va ${intro.days} kun amal qiladi. Kreditlar pul ekvivalenti emas.`
              : "Tariflar yuklanmoqda…"
        }}
      </p>
    </div>
  </section>
</template>
