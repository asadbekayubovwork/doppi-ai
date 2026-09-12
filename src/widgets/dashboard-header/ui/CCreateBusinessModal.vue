<script setup lang="ts">
import { ref, watch } from "vue"
import { CIcon } from "@/shared/ui"

const props = defineProps<{
  open: boolean
  /** Business the new one can inherit keys and billing from. */
  copyFrom: string
}>()

const emit = defineEmits<{
  "update:open": [value: boolean]
  create: [payload: { name: string; default_language: string; billing_region: string }]
}>()

const industries = [
  "Logistika va yetkazish",
  "Savdo va e-commerce",
  "Moliya va bank",
  "Ta'lim",
  "Sog'liqni saqlash",
  "Boshqa",
]
const teamSizes = [
  "1 kishi",
  "2–10 kishi",
  "11–50 kishi",
  "51–200 kishi",
  "200+",
]
const regions = [
  "O'zbekiston (UZS)",
  "Qozog'iston (KZT)",
  "Yevropa (EUR)",
  "AQSh (USD)",
]
const languages = ["O'zbekcha", "Русский", "English"]

const name = ref("")
const industry = ref(industries[0])
const teamSize = ref(teamSizes[1])
const region = ref(regions[0])
const language = ref(languages[0])
const copyDetails = ref(true)
const regionCodes: Record<string, string> = {
  "O'zbekiston (UZS)": "UZ",
  "Qozog'iston (KZT)": "KZ",
  "Yevropa (EUR)": "EU",
  "AQSh (USD)": "US",
}

const close = () => emit("update:open", false)

// A fresh dialog each time it opens, so a cancelled draft never leaks back.
watch(
  () => props.open,
  (open) => {
    if (!open) return
    name.value = ""
    industry.value = industries[0]
    teamSize.value = teamSizes[1]
    region.value = regions[0]
    language.value = languages[0]
    copyDetails.value = true
  }
)

const submit = () => {
  emit("create", {
    name: name.value.trim(),
    default_language: language.value === "Русский" ? "ru" : language.value === "English" ? "en" : "uz",
    billing_region: regionCodes[region.value] ?? "UZ",
  })
  close()
}

const selectClass =
  "h-12 w-full appearance-none rounded-xl border border-[#E1E1E9] bg-white pl-4 pr-10 text-[14.5px] text-[#12121C] outline-none transition focus:border-[#6633EE] focus:ring-4 focus:ring-[#6633EE]/12"
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#0F0F17]/45 p-4 backdrop-blur-[2px]"
        @click.self="close"
        @keydown.esc="close"
      >
        <div
          class="modal-panel w-full max-w-[520px] overflow-hidden rounded-2xl bg-white shadow-[0_24px_64px_rgba(16,17,26,0.24)]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-business-title"
        >
          <div class="flex items-start gap-4 border-b border-[#E9E9EF] p-5">
            <span
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#EFEAFE] text-[#6633EE]"
            >
              <CIcon name="building-2" class="h-5 w-5" />
            </span>
            <div class="min-w-0 flex-1">
              <h2
                id="create-business-title"
                class="text-[19px] font-bold tracking-tight text-[#0F0F17]"
              >
                Yangi biznes yaratish
              </h2>
              <p class="mt-1 text-[13.5px] leading-5 text-[#6B6B78]">
                Har bir biznesning o'z balansi, agentlari va jamoasi bo'ladi.
              </p>
            </div>
            <button
              type="button"
              class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E4E4EB] text-[#8E8E9C] transition hover:bg-[#F7F7F9] hover:text-[#12121C]"
              aria-label="Yopish"
              @click="close"
            >
              <CIcon name="x" class="h-4 w-4" />
            </button>
          </div>

          <form id="create-business-form" class="p-5" @submit.prevent="submit">
            <label
              for="business-name"
              class="mb-1.5 block text-[13.5px] font-medium text-[#3D3D4A]"
            >
              Biznes nomi
            </label>
            <input
              id="business-name"
              v-model="name"
              type="text"
              required
              autofocus
              placeholder="Karimov Group"
              class="h-12 w-full rounded-xl border border-[#E1E1E9] bg-white px-4 text-[14.5px] text-[#12121C] outline-none transition placeholder:text-[#A8A8B4] focus:border-[#6633EE] focus:ring-4 focus:ring-[#6633EE]/12"
            />

            <div class="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  for="business-industry"
                  class="mb-1.5 block text-[13.5px] font-medium text-[#3D3D4A]"
                >
                  Soha
                </label>
                <div class="relative">
                  <select
                    id="business-industry"
                    v-model="industry"
                    :class="selectClass"
                  >
                    <option v-for="item in industries" :key="item">
                      {{ item }}
                    </option>
                  </select>
                  <CIcon
                    name="chevron-down"
                    class="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8E8E9C]"
                  />
                </div>
              </div>

              <div>
                <label
                  for="business-team"
                  class="mb-1.5 block text-[13.5px] font-medium text-[#3D3D4A]"
                >
                  Jamoa hajmi
                </label>
                <div class="relative">
                  <select
                    id="business-team"
                    v-model="teamSize"
                    :class="selectClass"
                  >
                    <option v-for="item in teamSizes" :key="item">
                      {{ item }}
                    </option>
                  </select>
                  <CIcon
                    name="chevron-down"
                    class="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8E8E9C]"
                  />
                </div>
              </div>

              <div>
                <label
                  for="business-region"
                  class="mb-1.5 block text-[13.5px] font-medium text-[#3D3D4A]"
                >
                  To'lov hududi
                </label>
                <div class="relative">
                  <select
                    id="business-region"
                    v-model="region"
                    :class="selectClass"
                  >
                    <option v-for="item in regions" :key="item">
                      {{ item }}
                    </option>
                  </select>
                  <CIcon
                    name="chevron-down"
                    class="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8E8E9C]"
                  />
                </div>
              </div>

              <div>
                <label
                  for="business-language"
                  class="mb-1.5 block text-[13.5px] font-medium text-[#3D3D4A]"
                >
                  Asosiy til
                </label>
                <div class="relative">
                  <select
                    id="business-language"
                    v-model="language"
                    :class="selectClass"
                  >
                    <option v-for="item in languages" :key="item">
                      {{ item }}
                    </option>
                  </select>
                  <CIcon
                    name="chevron-down"
                    class="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8E8E9C]"
                  />
                </div>
              </div>
            </div>

            <label
              class="mt-5 flex w-fit cursor-pointer select-none items-center gap-3"
            >
              <input
                v-model="copyDetails"
                type="checkbox"
                class="peer sr-only"
              />
              <span
                class="grid h-5 w-5 shrink-0 place-items-center rounded-md border border-[#D5D5DE] bg-white text-transparent transition peer-checked:border-[#6633EE] peer-checked:bg-[#6633EE] peer-checked:text-white peer-focus-visible:ring-4 peer-focus-visible:ring-[#6633EE]/20"
                aria-hidden="true"
              >
                <CIcon name="check" class="h-3.5 w-3.5" stroke-width="3" />
              </span>
              <span class="text-[13.5px] text-[#4A4A57]">
                API kalitlar va to'lov ma'lumotlarini {{ copyFrom }}dan
                nusxalash
              </span>
            </label>

            <p
              class="mt-4 flex items-start gap-2.5 rounded-xl bg-[#F3F0FE] px-3.5 py-3 text-[13.5px] leading-5 text-[#4B21C4]"
            >
              <CIcon name="gift" class="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Yangi bizneslar 500 ta bepul kredit va umumiy Pro tarif o'rni
                bilan boshlanadi.
              </span>
            </p>
          </form>

          <div
            class="flex flex-wrap items-center justify-between gap-3 border-t border-[#E9E9EF] bg-[#FBFBFC] px-5 py-4"
          >
            <p class="text-[13px] text-[#8E8E9C]">
              Jamoani keyinroq taklif qilasiz
            </p>
            <div class="flex items-center gap-3">
              <button
                type="button"
                class="h-11 rounded-xl border border-[#E3E3EB] bg-white px-4 text-[14px] font-semibold text-[#12121A] transition hover:border-[#C9C9D6] hover:bg-[#FAFAFC]"
                @click="close"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                form="create-business-form"
                class="inline-flex h-11 items-center gap-2 rounded-xl bg-[#6633EE] px-4 text-[14px] font-semibold text-white transition hover:bg-[#5A2CE0]"
              >
                <CIcon name="plus" class="h-4 w-4" />
                Biznes yaratish
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
