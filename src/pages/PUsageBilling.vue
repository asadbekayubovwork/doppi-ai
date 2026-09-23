<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useHead } from "@unhead/vue"
import { useAuthStore } from "@/features/auth"
import {
  billingApi,
  useBillingStore,
  type CreditLedgerEntry,
  type UsageEntry,
  type CreditRate,
} from "@/features/billing"

useHead({ title: "Kredit va sarf — Do'ppi AI" })
const auth = useAuthStore()
const billing = useBillingStore()
const businessId = computed(() => auth.activeBusiness?.id ?? "")
const ledger = ref<CreditLedgerEntry[]>([])
const usage = ref<UsageEntry[]>([])
const rates = ref<CreditRate[]>([])
const error = ref(false)
const loading = ref(false)
const formatDate = (value: string) =>
  new Intl.DateTimeFormat("uz-UZ", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
const serviceName = (value: string) =>
  ({
    rag: "Chatbot",
    rag_answer: "Chatbot",
    video: "Video",
    video_second: "Video",
    voice: "Ovozli agent",
    voice_second: "Ovozli agent",
  })[
    value as
      | "rag"
      | "rag_answer"
      | "video"
      | "video_second"
      | "voice"
      | "voice_second"
  ] ?? value

watch(
  businessId,
  async (id) => {
    ledger.value = []
    usage.value = []
    if (!id) return
    loading.value = true
    error.value = false
    try {
      const [entries, events, currentRates] = await Promise.all([
        billingApi.ledger(id),
        billingApi.usage(id),
        billingApi.rates(),
        billing.load(id),
      ])
      if (businessId.value !== id) return
      ledger.value = entries
      usage.value = events
      rates.value = currentRates
    } catch {
      error.value = true
    } finally {
      loading.value = false
    }
  },
  { immediate: true }
)
</script>

<template>
  <main class="space-y-6 pb-10">
    <header>
      <p class="text-xs font-bold uppercase tracking-[0.16em] text-[#81808D]">
        Hisob-kitob
      </p>
      <h1 class="mt-2 text-3xl font-bold tracking-tight text-[#20202A]">
        Kredit va sarf
      </h1>
      <p class="mt-2 text-sm text-[#757583]">
        Balansingiz, amaldagi narxlar va xizmatlardan foydalanish tarixi.
      </p>
    </header>
    <p
      v-if="error || billing.error"
      role="alert"
      class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
    >
      Ma'lumotlarni yuklab bo‘lmadi. Sahifani qayta ochib ko‘ring.
    </p>
    <section class="grid gap-4 md:grid-cols-3">
      <div class="rounded-2xl border border-[#E8E8EC] bg-white p-6">
        <p class="text-sm text-[#797986]">Mavjud balans</p>
        <p class="mt-3 text-4xl font-bold tracking-tight text-[#24242C]">
          {{ billing.wallet?.available?.toLocaleString("uz-UZ") ?? "—" }}
        </p>
        <p class="mt-1 text-xs text-[#92929F]">kredit</p>
      </div>
      <div class="rounded-2xl border border-[#E8E8EC] bg-white p-6">
        <p class="text-sm text-[#797986]">Band qilingan</p>
        <p class="mt-3 text-4xl font-bold tracking-tight text-[#24242C]">
          {{ billing.wallet?.held?.toLocaleString("uz-UZ") ?? "—" }}
        </p>
        <p class="mt-1 text-xs text-[#92929F]">jarayondagi so‘rovlar uchun</p>
      </div>
      <div class="rounded-2xl border border-[#E8E8EC] bg-white p-6">
        <p class="text-sm text-[#797986]">Bonus kredit</p>
        <p class="mt-3 text-4xl font-bold tracking-tight text-[#24242C]">
          {{ billing.wallet?.promo_remaining?.toLocaleString("uz-UZ") ?? "—" }}
        </p>
        <p class="mt-1 text-xs text-[#92929F]">
          {{
            billing.wallet?.promo_expires_at
              ? `Muddati: ${formatDate(billing.wallet.promo_expires_at)}`
              : "Amaldagi bonus yo‘q"
          }}
        </p>
      </div>
    </section>
    <section class="rounded-2xl border border-[#E8E8EC] bg-white p-6">
      <h2 class="text-lg font-bold text-[#24242C]">Xizmat narxlari</h2>
      <p class="mt-1 text-xs text-[#8A8A96]">
        Hisob-kitob kreditda yuritiladi. Amaldagi stavkalar admin tomonidan
        boshqariladi.
      </p>
      <div class="mt-4 grid gap-3 sm:grid-cols-3">
        <div
          v-for="rate in rates"
          :key="rate.code"
          class="rounded-xl bg-[#F7F7F9] px-4 py-3"
        >
          <p class="text-sm font-semibold text-[#24242C]">
            {{ serviceName(rate.code) }}
          </p>
          <p class="mt-1 text-sm text-[#696975]">
            {{ rate.credits_per_unit }} kredit /
            {{ rate.code === "rag_answer" ? "javob" : "sekund" }}
          </p>
        </div>
      </div>
    </section>
    <section class="grid gap-5 xl:grid-cols-2">
      <div class="rounded-2xl border border-[#E8E8EC] bg-white p-6">
        <h2 class="text-lg font-bold text-[#24242C]">Foydalanish tarixi</h2>
        <p v-if="!usage.length" class="mt-5 text-sm text-[#92929F]">
          {{ loading ? "Yuklanmoqda…" : "Hozircha sarf yo‘q." }}
        </p>
        <ul v-else class="mt-4 divide-y divide-[#EFEFF2]">
          <li
            v-for="entry in usage"
            :key="entry.id"
            class="flex justify-between gap-3 py-3 text-sm"
          >
            <div>
              <p class="font-semibold text-[#2B2B34]">
                {{ serviceName(entry.service) }}
              </p>
              <p class="mt-0.5 text-xs text-[#9797A1]">
                {{ formatDate(entry.occurred_at) }} · {{ entry.quantity }}
                {{ entry.unit }}
              </p>
            </div>
            <span class="font-bold text-[#3D3D47]"
              >−{{ entry.credits_charged }}</span
            >
          </li>
        </ul>
      </div>
      <div class="rounded-2xl border border-[#E8E8EC] bg-white p-6">
        <h2 class="text-lg font-bold text-[#24242C]">Balans tarixi</h2>
        <p v-if="!ledger.length" class="mt-5 text-sm text-[#92929F]">
          {{ loading ? "Yuklanmoqda…" : "Hozircha harakat yo‘q." }}
        </p>
        <ul v-else class="mt-4 divide-y divide-[#EFEFF2]">
          <li
            v-for="entry in ledger"
            :key="entry.id"
            class="flex justify-between gap-3 py-3 text-sm"
          >
            <div>
              <p class="font-semibold text-[#2B2B34]">{{ entry.reason }}</p>
              <p class="mt-0.5 text-xs text-[#9797A1]">
                {{ formatDate(entry.created_at) }}
              </p>
            </div>
            <span
              class="font-bold"
              :class="entry.amount >= 0 ? 'text-emerald-700' : 'text-[#3D3D47]'"
              >{{ entry.amount > 0 ? "+" : "" }}{{ entry.amount }}</span
            >
          </li>
        </ul>
      </div>
    </section>
  </main>
</template>
