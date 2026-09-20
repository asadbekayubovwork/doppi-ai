<script setup lang="ts">
import { CVideoThumb } from "@/entities/video"
import { CAppButton, CBadge, CIcon } from "@/shared/ui"

defineProps<{
  isCreating: boolean
  canCreate: boolean
}>()

defineEmits<{ submit: [] }>()

const prompt = defineModel<string>("prompt", { required: true })
const aspectRatio = defineModel<"9:16" | "16:9" | "1:1">("aspectRatio", {
  required: true,
})
const durationSec = defineModel<number>("durationSec", { required: true })

// Static context chips + references while the catalog endpoints are stubbed.
const CONTEXT = [
  { icon: "building-2", label: "Aura Store brendi" },
  { icon: "globe", label: "UZ" },
  { icon: "tag", label: "Brend ranglari" },
]
const REFERENCES = ["#C9A98C", "#2B3A67", "#D6D2CC"]
</script>

<template>
  <section
    class="flex flex-col rounded-2xl border border-[#E5E5E1] bg-white shadow-[0_12px_32px_rgba(22,22,27,0.04)]"
  >
    <header
      class="flex items-center justify-between border-b border-[#ECECE8] px-5 py-4"
    >
      <h2 class="text-[15px] font-semibold text-[#15151B]">Prompt va kontekst</h2>
      <CBadge tone="accent" icon="wand-sparkles">AI yordam</CBadge>
    </header>

    <form class="flex flex-1 flex-col gap-5 p-5" @submit.prevent="$emit('submit')">
      <label class="grid gap-2">
        <span
          class="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#84848E]"
        >
          Video prompti
        </span>
        <textarea
          v-model="prompt"
          rows="4"
          maxlength="8000"
          placeholder="Video nimani ko'rsatsin? Kadrlar, ohang va yakuniy matnni yozing."
          class="min-h-28 resize-y rounded-xl border border-[#DEDEE4] bg-[#FCFCFB] px-3.5 py-3 text-[13px] leading-6 text-[#1D1D22] outline-none transition placeholder:text-[#AAAAB3] focus:border-[#8175EA] focus:bg-white focus:ring-4 focus:ring-[#5B4BE8]/10"
        />
      </label>

      <div class="grid gap-2">
        <span
          class="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#84848E]"
        >
          Kontekst
        </span>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="chip in CONTEXT"
            :key="chip.label"
            class="inline-flex items-center gap-1.5 rounded-lg bg-[#F2F0FC] px-2.5 py-1.5 text-[12px] font-medium text-[#5B4BE8]"
          >
            <CIcon :name="chip.icon" class="h-3.5 w-3.5" />
            {{ chip.label }}
          </span>
        </div>
      </div>

      <div class="grid gap-2">
        <span
          class="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#84848E]"
        >
          Referens rasmlar
        </span>
        <div class="flex flex-wrap gap-2.5">
          <CVideoThumb
            v-for="(image, index) in REFERENCES"
            :key="index"
            :color="image"
            rounded="rounded-lg"
            class="h-14 w-16"
          />
          <button
            type="button"
            class="flex h-14 w-16 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-[#DEDEE4] text-[#9A9AA2] transition hover:border-[#C9C0F5] hover:text-[#5B4BE8]"
          >
            <CIcon name="cloud-upload" class="h-4 w-4" />
            <span class="text-[10px] font-medium">Yuklash</span>
          </button>
        </div>
      </div>

      <div class="grid gap-2">
        <span
          class="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#84848E]"
        >
          Sozlamalar
        </span>
        <div class="grid grid-cols-2 gap-2.5">
          <label class="relative">
            <span
              class="pointer-events-none absolute left-9 top-1.5 text-[10px] text-[#9A9AA2]"
            >
              Format
            </span>
            <CIcon
              name="layout-grid"
              class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#84848E]"
            />
            <select
              v-model="aspectRatio"
              class="h-12 w-full rounded-xl border border-[#DEDEE4] bg-white pl-9 pr-3 pt-3.5 text-[13px] font-medium text-[#202027] outline-none focus:border-[#8175EA]"
            >
              <option value="9:16">9:16</option>
              <option value="1:1">1:1</option>
              <option value="16:9">16:9</option>
            </select>
          </label>

          <label class="relative">
            <span
              class="pointer-events-none absolute left-9 top-1.5 text-[10px] text-[#9A9AA2]"
            >
              Davomiylik
            </span>
            <CIcon
              name="clock"
              class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#84848E]"
            />
            <select
              v-model.number="durationSec"
              class="h-12 w-full rounded-xl border border-[#DEDEE4] bg-white pl-9 pr-3 pt-3.5 text-[13px] font-medium text-[#202027] outline-none focus:border-[#8175EA]"
            >
              <option :value="10">10s</option>
              <option :value="15">15s</option>
              <option :value="30">30s</option>
            </select>
          </label>

          <div
            class="flex h-12 items-center gap-2.5 rounded-xl border border-[#DEDEE4] bg-white px-3"
          >
            <CIcon name="cpu" class="h-4 w-4 text-[#84848E]" />
            <span class="flex flex-col leading-tight">
              <span class="text-[10px] text-[#9A9AA2]">Model</span>
              <span class="text-[13px] font-medium text-[#202027]">
                Veo 3 · fal.ai
              </span>
            </span>
          </div>

          <div
            class="flex h-12 items-center gap-2.5 rounded-xl border border-[#DEDEE4] bg-white px-3"
          >
            <CIcon name="mic" class="h-4 w-4 text-[#84848E]" />
            <span class="flex flex-col leading-tight">
              <span class="text-[10px] text-[#9A9AA2]">Ovoz</span>
              <span class="text-[13px] font-medium text-[#202027]">UZ ayol</span>
            </span>
          </div>
        </div>
      </div>

      <div class="mt-auto border-t border-[#ECECE8] pt-4">
        <div class="mb-3 flex items-center justify-between text-[12.5px]">
          <span class="text-[#73737D]">Taxminiy narx</span>
          <span class="font-semibold text-[#15151B]">120 kredit · ~90 s</span>
        </div>
        <CAppButton
          type="submit"
          variant="primary"
          icon="wand-sparkles"
          class="w-full"
          :disabled="!canCreate"
          :loading="isCreating"
        >
          Video yaratish
        </CAppButton>
      </div>
    </form>
  </section>
</template>
