<script setup lang="ts">
import { CVideoThumb } from "@/entities/video"
import { CAppButton, CBadge, CIcon, CSelect, CSwitch } from "@/shared/ui"
import CStudioModelSettings from "./CStudioModelSettings.vue"
import type { VideoLanguage, VideoModel } from "@/features/video-generator"

defineProps<{
  isCreating: boolean
  canCreate: boolean
  models: VideoModel[]
  modelsLoading: boolean
  modelError: string | null
}>()

defineEmits<{ submit: []; retryModels: [] }>()

const prompt = defineModel<string>("prompt", { required: true })
const aspectRatio = defineModel<"9:16" | "16:9" | "1:1">("aspectRatio", {
  required: true,
})
const durationSec = defineModel<number>("durationSec", { required: true })
const videoModel = defineModel<string>("videoModel", { required: true })
const videoResolution = defineModel<string>("videoResolution", {
  required: true,
})
const researchMode = defineModel<"fast" | "deep">("researchMode", {
  required: true,
})
const subtitles = defineModel<boolean>("subtitles", { required: true })
const language = defineModel<VideoLanguage>("language", { required: true })
const previewOnly = defineModel<boolean>("previewOnly", { required: true })
const tone = defineModel<string>("tone", { required: true })
const cta = defineModel<string>("cta", { required: true })
const sourceText = defineModel<string>("sourceText", { required: true })
const referenceLinks = defineModel<string>("referenceLinks", { required: true })
const referenceImages = defineModel<string>("referenceImages", {
  required: true,
})

const ASPECT_OPTIONS = [
  { value: "9:16" as const, label: "9:16" },
  { value: "1:1" as const, label: "1:1" },
  { value: "16:9" as const, label: "16:9" },
]

const RESEARCH_MODES = [
  { value: "fast" as const, label: "Tez" },
  { value: "deep" as const, label: "Chuqur" },
]

const LANGUAGE_OPTIONS: { value: VideoLanguage; label: string }[] = [
  { value: "uz", label: "O'zbekcha" },
  { value: "ru", label: "Русский" },
  { value: "en", label: "English" },
]

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
      <h2 class="text-[15px] font-semibold text-[#15151B]">
        Prompt va kontekst
      </h2>
      <CBadge tone="accent" icon="wand-sparkles">AI yordam</CBadge>
    </header>

    <form
      class="flex flex-1 flex-col gap-5 p-5"
      @submit.prevent="$emit('submit')"
    >
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
          <CSelect
            v-model="aspectRatio"
            :options="ASPECT_OPTIONS"
            label="Format"
            icon="layout-grid"
            size="xl"
          />

          <CStudioModelSettings
            v-model:model="videoModel"
            v-model:resolution="videoResolution"
            v-model:duration-sec="durationSec"
            class="col-span-2"
            :models="models"
            :loading="modelsLoading"
            :error="modelError"
            @retry="$emit('retryModels')"
          />

          <CSelect
            v-model="language"
            :options="LANGUAGE_OPTIONS"
            label="Ovoz"
            icon="mic"
            size="xl"
          />
        </div>
      </div>

      <div class="grid gap-2">
        <span
          class="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#84848E]"
        >
          Research
        </span>
        <div
          class="grid grid-cols-2 gap-0.5 rounded-xl border border-[#DEDEE4] bg-[#F5F4FB] p-0.5"
          role="tablist"
        >
          <button
            v-for="mode in RESEARCH_MODES"
            :key="mode.value"
            type="button"
            role="tab"
            :aria-selected="researchMode === mode.value"
            class="h-8 rounded-[9px] text-[12px] font-semibold transition"
            :class="
              researchMode === mode.value
                ? 'bg-white text-[#15151B] shadow-[0_1px_2px_rgba(22,22,27,0.08)]'
                : 'text-[#73737D] hover:text-[#15151B]'
            "
            @click="researchMode = mode.value"
          >
            {{ mode.label }}
          </button>
        </div>
      </div>

      <div class="grid gap-2.5">
        <label
          class="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-[#DEDEE4] bg-white px-3 py-2.5"
        >
          <span class="flex items-center gap-2 text-[13px] text-[#42424B]">
            <CIcon name="message-square-text" class="h-4 w-4 text-[#84848E]" />
            Subtitrlarni yoqish
          </span>
          <CSwitch v-model="subtitles" label="Subtitrlarni yoqish" />
        </label>
        <label
          class="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-[#DEDEE4] bg-white px-3 py-2.5"
        >
          <span class="flex items-center gap-2 text-[13px] text-[#42424B]">
            <CIcon name="eye" class="h-4 w-4 text-[#84848E]" />
            Faqat prompt-preview
          </span>
          <CSwitch v-model="previewOnly" label="Faqat prompt-preview" />
        </label>
      </div>

      <details class="group rounded-xl border border-[#E7E7E3] bg-[#FAFAF8]">
        <summary
          class="flex cursor-pointer list-none items-center justify-between px-3.5 py-3 text-[13px] font-semibold text-[#3D3D45]"
        >
          Qo'shimcha yo'nalish va referenslar
          <CIcon
            name="chevron-down"
            class="h-4 w-4 transition group-open:rotate-180"
          />
        </summary>
        <div class="grid gap-3.5 border-t border-[#E7E7E3] p-3.5">
          <label class="grid gap-1.5">
            <span class="text-[11px] font-medium text-[#55555F]"
              >Ohang (tone)</span
            >
            <input
              v-model="tone"
              maxlength="500"
              placeholder="Masalan: samimiy, energiyali, ishonchli"
              class="h-9 rounded-lg border border-[#DEDEE4] bg-white px-3 text-[13px] outline-none focus:border-[#8175EA]"
            />
          </label>
          <label class="grid gap-1.5">
            <span class="text-[11px] font-medium text-[#55555F]"
              >Call to action</span
            >
            <input
              v-model="cta"
              maxlength="2000"
              placeholder="Masalan: Profildagi havola orqali buyurtma bering"
              class="h-9 rounded-lg border border-[#DEDEE4] bg-white px-3 text-[13px] outline-none focus:border-[#8175EA]"
            />
          </label>
          <label class="grid gap-1.5">
            <span class="text-[11px] font-medium text-[#55555F]"
              >Tayyor script yoki manba matn</span
            >
            <textarea
              v-model="sourceText"
              rows="3"
              maxlength="40000"
              placeholder="Tasdiqlangan matn bo'lsa, shu yerga qo'ying"
              class="resize-y rounded-lg border border-[#DEDEE4] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#8175EA]"
            />
          </label>
          <label class="grid gap-1.5">
            <span class="text-[11px] font-medium text-[#55555F]"
              >Referens havolalar · har qatorda bitta HTTPS URL</span
            >
            <textarea
              v-model="referenceLinks"
              rows="2"
              placeholder="https://..."
              class="resize-y rounded-lg border border-[#DEDEE4] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#8175EA]"
            />
          </label>
          <label class="grid gap-1.5">
            <span class="text-[11px] font-medium text-[#55555F]"
              >Referens rasm URL'lari · har qatorda bitta HTTPS URL</span
            >
            <textarea
              v-model="referenceImages"
              rows="2"
              placeholder="https://.../image.jpg"
              class="resize-y rounded-lg border border-[#DEDEE4] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#8175EA]"
            />
          </label>
        </div>
      </details>

      <div class="mt-auto border-t border-[#ECECE8] pt-4">
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
